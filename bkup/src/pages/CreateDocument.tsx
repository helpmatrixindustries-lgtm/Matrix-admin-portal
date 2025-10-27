import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, DocumentType } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import { generateCertificatePDF, generateOfferLetterPDF, generateLoRPDF, loadLogoAsDataUrl } from '@/lib/pdfGenerator';
import { uploadPDF, uploadQRCode } from '@/lib/storage';
import matrixLogo from '@/assets/matrix-logo.jpeg';

const CreateDocument = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'certificate' as DocumentType,
    student_name: '',
    student_email: '',
    internship_domain: '',
    issue_date: new Date().toISOString().split('T')[0],
    duration: '',
    performance: 'Good',
    position: '',
    start_date: '',
    stipend: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create document record
      const { data: document, error: insertError } = await supabase
        .from('documents')
        .insert({
          type: formData.type,
          student_name: formData.student_name,
          student_email: formData.student_email,
          internship_domain: formData.internship_domain,
          issue_date: formData.issue_date,
          status: 'valid',
          additional_fields: {
            duration: formData.duration,
            performance: formData.performance,
            position: formData.position,
            start_date: formData.start_date,
            stipend: formData.stipend,
          },
          created_by: 'admin',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Generate QR code
      const qrCodeUrl = `${window.location.origin}/verify/${document.id}`;
      const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, { width: 500 });
      const qrUrl = await uploadQRCode(qrDataUrl, `${document.id}.png`);

      // Load logo and generate PDF
      const logoDataUrl = await loadLogoAsDataUrl(matrixLogo);
      let pdfBlob: Blob;

      if (formData.type === 'certificate') {
        pdfBlob = await generateCertificatePDF(document, logoDataUrl);
      } else if (formData.type === 'offer_letter') {
        pdfBlob = await generateOfferLetterPDF(document, logoDataUrl);
      } else {
        pdfBlob = await generateLoRPDF(document, logoDataUrl);
      }

      const pdfUrl = await uploadPDF(pdfBlob, `${document.id}.pdf`);

      // Update document with PDF and QR URLs
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          pdf_url: pdfUrl,
          qr_code_url: qrUrl 
        })
        .eq('id', document.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Document created successfully with PDF!',
      });

      navigate('/documents');
    } catch (error: any) {
      console.error('Create error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create document',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Document</CardTitle>
            <CardDescription>Generate certificates, offer letters, or letters of recommendation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type">Document Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: DocumentType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="certificate">Internship Certificate</SelectItem>
                    <SelectItem value="offer_letter">Offer Letter</SelectItem>
                    <SelectItem value="lor">Letter of Recommendation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_name">Student Name</Label>
                <Input
                  id="student_name"
                  placeholder="John Doe"
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_email">Student Email</Label>
                <Input
                  id="student_email"
                  type="email"
                  placeholder="student@example.com"
                  value={formData.student_email}
                  onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="internship_domain">Internship Domain</Label>
                <Input
                  id="internship_domain"
                  placeholder="e.g., Web Development, Data Science, Marketing"
                  value={formData.internship_domain}
                  onChange={(e) => setFormData({ ...formData, internship_domain: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  required
                />
              </div>

              {formData.type === 'certificate' && (
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Optional)</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 3 months"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              )}

              {formData.type === 'lor' && (
                <div className="space-y-2">
                  <Label htmlFor="performance">Performance</Label>
                  <Select
                    value={formData.performance}
                    onValueChange={(value) => setFormData({ ...formData, performance: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.type === 'offer_letter' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      placeholder="e.g., Software Development Intern"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stipend">Stipend (Optional)</Label>
                    <Input
                      id="stipend"
                      placeholder="e.g., ₹5,000/month"
                      value={formData.stipend}
                      onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Document & PDF...' : 'Create Document'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateDocument;
