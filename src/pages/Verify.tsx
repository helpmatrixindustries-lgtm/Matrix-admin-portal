import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, Document } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Calendar, Mail, User, Briefcase, Download, ArrowLeft } from 'lucide-react';
import matrixLogo from '@/assets/matrix-logo.png';

const Verify = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    if (!id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      setDocument(data);
    }
    setLoading(false);
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'certificate':
        return 'Internship Certificate';
      case 'offer_letter':
        return 'Offer Letter';
      case 'lor':
        return 'Letter of Recommendation';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <img src={matrixLogo} alt="Matrix Industries" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-semibold text-foreground">Matrix Industries</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-elegant">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                {loading ? (
                  <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                ) : document?.status === 'valid' ? (
                  <CheckCircle2 className="h-16 w-16 text-accent" />
                ) : (
                  <XCircle className="h-16 w-16 text-destructive" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {loading ? 'Verifying...' : document ? 'Document Verification' : 'Document Not Found'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                </div>
              ) : document ? (
                <>
                  <div className="flex justify-center">
                    <Badge variant={document.status === 'valid' ? 'default' : 'destructive'} className="text-lg px-4 py-2">
                      {document.status === 'valid' ? 'Valid Document' : 'Revoked'}
                    </Badge>
                  </div>

                  <div className="grid gap-4">
                    <div className="border-l-4 border-primary pl-4">
                      <p className="text-sm text-muted-foreground">Document Type</p>
                      <p className="text-lg font-medium">{getDocumentTypeLabel(document.type)}</p>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <p className="text-sm text-muted-foreground">Student Name</p>
                      <p className="text-lg font-medium">{document.student_name}</p>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <p className="text-sm text-muted-foreground">Internship Domain</p>
                      <p className="text-lg font-medium">{document.internship_domain}</p>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <p className="text-sm text-muted-foreground">Issue Date</p>
                      <p className="text-lg font-medium">
                        {new Date(document.issue_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {document.qr_code_url && (
                      <div className="flex justify-center pt-4">
                        <img
                          src={document.qr_code_url}
                          alt="QR Code"
                          className="w-48 h-48 border-4 border-muted rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 text-center text-sm text-muted-foreground">
                    <p>Document ID: {document.id.slice(0, 8)}...</p>
                    <p className="mt-1">Issued by Matrix Industries</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">The document you're looking for could not be found.</p>
                  <p className="text-sm text-muted-foreground mt-2">Please verify the ID and try again.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Verify;
