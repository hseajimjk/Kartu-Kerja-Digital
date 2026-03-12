import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import FormKartuKerja from "./pages/FormKartuKerja";
import DaftarPekerjaan from "./pages/DaftarPekerjaan";
import DataMaster from "./pages/DataMaster";
import Pengaturan from "./pages/Pengaturan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/form-kartu-kerja" element={<FormKartuKerja />} />
            <Route path="/dashboard/daftar-pekerjaan" element={<DaftarPekerjaan />} />
            <Route path="/dashboard/data-master" element={<DataMaster />} />
            <Route path="/dashboard/pengaturan" element={<Pengaturan />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
