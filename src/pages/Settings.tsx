import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState('https://matrixindustries.in/verify');
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
    loadSettings();
  }, [navigate]);

  const loadSettings = () => {
    // Load from localStorage
    const savedUrl = localStorage.getItem('verification_base_url');
    if (savedUrl) {
      setVerificationUrl(savedUrl);
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      // Validate URL format
      try {
        const url = new URL(verificationUrl);
        if (!url.protocol.startsWith('http')) {
          throw new Error('Invalid protocol');
        }
      } catch (err) {
        toast({
          title: 'Invalid URL',
          description: 'Please enter a valid URL starting with http:// or https://',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Remove trailing slash if present
      const cleanUrl = verificationUrl.replace(/\/$/, '');

      // Save to localStorage
      localStorage.setItem('verification_base_url', cleanUrl);

      toast({
        title: 'Settings Saved',
        description: 'Verification URL has been updated successfully.',
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const defaultUrl = 'https://matrixindustries.in/verify';
    setVerificationUrl(defaultUrl);
    localStorage.setItem('verification_base_url', defaultUrl);
    
    toast({
      title: 'Reset Successful',
      description: 'Verification URL has been reset to default.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Configure your application settings</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Verification URL Configuration</CardTitle>
              <CardDescription>
                Set the base URL where certificates will be verified. This URL will be embedded in QR codes on all generated documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="verification-url">Verification Base URL</Label>
                <Input
                  id="verification-url"
                  type="url"
                  placeholder="https://matrixindustries.in/verify"
                  value={verificationUrl}
                  onChange={(e) => setVerificationUrl(e.target.value)}
                  className="font-mono"
                />
                <p className="text-sm text-gray-500">
                  QR codes will point to: <span className="font-mono text-blue-600">{verificationUrl}?code=&lt;UUID&gt;</span>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Example URLs:</h4>
                <ul className="text-sm text-blue-800 space-y-1 font-mono">
                  <li>• https://matrixindustries.in/verify</li>
                  <li>• https://verify.matrixindustries.in</li>
                  <li>• https://yourcompany.com/certificates/verify</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-2">⚠️ Important Notes:</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• URL must start with https:// (or http:// for testing)</li>
                  <li>• Do not include trailing slash</li>
                  <li>• This affects all newly generated documents</li>
                  <li>• Existing documents will still use their original QR codes</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
                <Button 
                  onClick={handleReset} 
                  variant="outline"
                  disabled={loading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Current Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Verification URL:</span>
                  <span className="font-mono text-blue-600">{verificationUrl}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Full QR Code URL:</span>
                  <span className="font-mono text-blue-600 text-xs">{verificationUrl}?code=&lt;document-id&gt;</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Storage:</span>
                  <span className="text-gray-900">Browser LocalStorage</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
