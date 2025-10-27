import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Document } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Ban, Eye, Download, Mail } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const Documents = () => {
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        loadDocuments();
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDocs(documents);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredDocs(
        documents.filter(
          (doc) =>
            doc.student_name.toLowerCase().includes(query) ||
            doc.student_email.toLowerCase().includes(query) ||
            doc.internship_domain.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, documents]);

  const loadDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } else {
      setDocuments(data || []);
      setFilteredDocs(data || []);
    }
    setLoading(false);
  };

  const handleRevoke = async (id: string) => {
    const { error } = await supabase
      .from('documents')
      .update({ status: 'revoked' })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke document',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Document revoked successfully',
      });
      loadDocuments();
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'certificate':
        return 'Certificate';
      case 'offer_letter':
        return 'Offer Letter';
      case 'lor':
        return 'LoR';
      default:
        return type;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Documents</h1>
          <p className="text-muted-foreground">View and manage all issued documents</p>
        </div>

        <Card className="p-6 shadow-elegant">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading documents...</p>
          ) : filteredDocs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No documents found</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        {getDocumentTypeLabel(doc.type)}
                      </TableCell>
                      <TableCell>{doc.student_name}</TableCell>
                      <TableCell>{doc.student_email}</TableCell>
                      <TableCell>{doc.internship_domain}</TableCell>
                      <TableCell>{new Date(doc.issue_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={doc.status === 'valid' ? 'default' : 'destructive'}>
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/verify/${doc.id}`)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {doc.pdf_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.pdf_url, '_blank')}
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {doc.status === 'valid' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(doc.id)}
                            title="Revoke"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Documents;
