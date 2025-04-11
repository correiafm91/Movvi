
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Index from "@/pages/Index";
import PropertyDetails from "@/pages/PropertyDetails";
import Auth from "@/pages/Auth";
import CreateListing from "@/pages/CreateListing";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import EditProperty from "@/pages/EditProperty";
import MyProperties from "@/components/MyProperties";
import RealtorProfile from "@/pages/RealtorProfile";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/hooks/use-user";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-properties" element={<MyProperties />} />
          <Route path="/edit-property/:id" element={<EditProperty />} />
          <Route path="/realtor/:id" element={<RealtorProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </UserProvider>
  );
}

export default App;
