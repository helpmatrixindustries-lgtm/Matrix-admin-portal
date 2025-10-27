import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import CreateDocument from "./pages/CreateDocument";
import Documents from "./pages/Documents";
import BulkUpload from "./pages/BulkUpload";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";
import Verify from "./pages/Verify";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create-document" element={<CreateDocument />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/bulk-upload" element={<BulkUpload />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/verify/:id" element={<Verify />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
