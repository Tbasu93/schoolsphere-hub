import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import StaffPage from "./pages/StaffPage";
import Classes from "./pages/Classes";
import Fees from "./pages/Fees";
import FeeCollection from "./pages/FeeCollection";
import Events from "./pages/Events";
import Notices from "./pages/Notices";
import Promotion from "./pages/Promotion";
import Attendance from "./pages/Attendance";
import Exams from "./pages/Exams";
import Routine from "./pages/Routine";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/routine" element={<Routine />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/fee-collection" element={<FeeCollection />} />
            <Route path="/events" element={<Events />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/promotion" element={<Promotion />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
