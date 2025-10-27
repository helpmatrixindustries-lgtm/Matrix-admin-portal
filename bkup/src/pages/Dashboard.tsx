import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Award, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    certificates: 0,
    offerLetters: 0,
    lors: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        loadStats();
      }
    };
    checkAuth();
  }, [navigate]);

  const loadStats = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('type', { count: 'exact' });

    if (data && !error) {
      const certificates = data.filter(d => d.type === 'certificate').length;
      const offerLetters = data.filter(d => d.type === 'offer_letter').length;
      const lors = data.filter(d => d.type === 'lor').length;

      setStats({
        total: data.length,
        certificates,
        offerLetters,
        lors,
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Admin</h1>
          <p className="text-muted-foreground">Manage your documents and verify student credentials</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-elegant hover:shadow-hover transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-hover transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Certificates</CardTitle>
              <Award className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.certificates}</div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-hover transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Offer Letters</CardTitle>
              <Mail className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.offerLetters}</div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-hover transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">LoRs</CardTitle>
              <AlertCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.lors}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/create-document">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Document
                </Button>
              </Link>
              <Link to="/documents">
                <Button className="w-full justify-start" variant="outline">
                  <Award className="mr-2 h-4 w-4" />
                  View All Documents
                </Button>
              </Link>
              <Link to="/bulk-upload">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Bulk Upload
                </Button>
              </Link>
              <Link to="/audit-logs">
                <Button className="w-full justify-start" variant="outline">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Audit Logs
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent activity to display</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
