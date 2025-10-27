import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { supabase, Document } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AuditLogs = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        loadLogs();
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
            doc.type.toLowerCase().includes(query) ||
            doc.id.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, documents]);

  const loadLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data);
      setFilteredDocs(data);
    }
    setLoading(false);
  };

  const getActionBadge = (status: string) => {
    return status === 'valid' ? 'Created' : 'Revoked';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Audit Logs</h1>
          <p className="text-muted-foreground">Complete history of all document operations</p>
        </div>

        <Card className="p-6 shadow-elegant">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, type, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading audit logs...</p>
          ) : filteredDocs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No logs found</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Document ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        {new Date(doc.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getActionBadge(doc.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {doc.type.replace('_', ' ')}
                      </TableCell>
                      <TableCell>{doc.student_name}</TableCell>
                      <TableCell>{doc.internship_domain}</TableCell>
                      <TableCell>
                        <Badge variant={doc.status === 'valid' ? 'default' : 'destructive'}>
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {doc.id.slice(0, 8)}...
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

export default AuditLogs;
