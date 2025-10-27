import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateCertificatePDF, generateOfferLetterPDF, generateLoRPDF, loadLogoAsDataUrl } from '@/lib/pdfGenerator';
import { uploadPDF, uploadQRCode } from '@/lib/storage';
import QRCode from 'qrcode';
import matrixLogo from '@/assets/matrix-logo.jpeg';

interface CSVRow {
  type: 'certificate' | 'offer_letter' | 'lor';
  student_name: string;
  student_email: string;
  internship_domain: string;
  issue_date: string;
  duration?: string;
  performance?: string;
  position?: string;
  start_date?: string;
  stipend?: string;
}

const BulkUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  const downloadTemplate = () => {
    const csvContent = `type,student_name,student_email,internship_domain,issue_date,duration,performance,position,start_date,stipend
certificate,John Doe,john@example.com,Web Development,2024-01-15,3 months,Excellent,,,
offer_letter,Jane Smith,jane@example.com,Data Science,2024-02-01,,,,2024-02-15,5000
lor,Bob Johnson,bob@example.com,Machine Learning,2024-01-20,2 months,Good,,,`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        if (values[index]) {
          row[header] = values[index];
        }
      });
      return row as CSVRow;
    });
  };

  const processDocument = async (row: CSVRow, logoDataUrl: string) => {
    // Create document record
    const { data: doc, error: insertError } = await supabase
      .from('documents')
      .insert({
        type: row.type,
        student_name: row.student_name,
        student_email: row.student_email,
        internship_domain: row.internship_domain,
        issue_date: row.issue_date,
        status: 'valid',
        additional_fields: {
          duration: row.duration,
          performance: row.performance,
          position: row.position,
          start_date: row.start_date,
          stipend: row.stipend,
        },
        created_by: 'admin',
      })
      .select()
      .single();

    if (insertError || !doc) throw insertError;

    // Generate QR code
    const qrCodeUrl = `${window.location.origin}/verify/${doc.id}`;
    const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, { width: 500 });
    const qrUrl = await uploadQRCode(qrDataUrl, `${doc.id}.png`);

    // Generate PDF
    let pdfBlob: Blob;
    if (row.type === 'certificate') {
      pdfBlob = await generateCertificatePDF(doc, logoDataUrl);
    } else if (row.type === 'offer_letter') {
      pdfBlob = await generateOfferLetterPDF(doc, logoDataUrl);
    } else {
      pdfBlob = await generateLoRPDF(doc, logoDataUrl);
    }

    const pdfUrl = await uploadPDF(pdfBlob, `${doc.id}.pdf`);

    // Update document with URLs
    await supabase
      .from('documents')
      .update({ pdf_url: pdfUrl, qr_code_url: qrUrl })
      .eq('id', doc.id);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a CSV file',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length === 0) {
        throw new Error('No valid rows found in CSV');
      }

      const logoDataUrl = await loadLogoAsDataUrl(matrixLogo);
      
      for (let i = 0; i < rows.length; i++) {
        await processDocument(rows[i], logoDataUrl);
        setProgress(((i + 1) / rows.length) * 100);
      }

      toast({
        title: 'Success',
        description: `Successfully processed ${rows.length} documents`,
      });

      navigate('/documents');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process bulk upload',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Bulk Upload</h1>
          <p className="text-muted-foreground">Upload CSV file to create multiple documents at once</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Download Template</CardTitle>
              <CardDescription>Get the CSV template with required format</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download CSV Template
              </Button>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Required Columns:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• type (certificate/offer_letter/lor)</li>
                  <li>• student_name</li>
                  <li>• student_email</li>
                  <li>• internship_domain</li>
                  <li>• issue_date (YYYY-MM-DD)</li>
                  <li>• duration (optional)</li>
                  <li>• performance (optional - Excellent/Good)</li>
                  <li>• position (optional)</li>
                  <li>• start_date (optional)</li>
                  <li>• stipend (optional)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>Select your prepared CSV file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file">CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={processing}
                />
              </div>

              {file && (
                <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                  <span className="text-sm">{file.name}</span>
                </div>
              )}

              {processing && (
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Processing... {Math.round(progress)}%
                  </p>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!file || processing}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {processing ? 'Processing...' : 'Upload and Process'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BulkUpload;
