import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import VoiceChat from './pages/patient/VoiceChat'
import AuthPage from "./pages/auth/AuthPage";
import PatientHome from "./pages/patient/PatientHome";
import DocumentUpload from "./pages/patient/DocumentUpload";
import MedicalHistory from './pages/patient/MedicalHistory'
import Layout from './components/layout/Layout'
import DoctorSchedule from './pages/doctor/DoctorSchedule'
import GoldenRecord from './pages/doctor/GoldenRecord'
import DocReview from './pages/doctor/DocReview'
import PriorAuth from './pages/doctor/PriorAuth'
import VoiceAgent from "./pages/patient/VoiceAgent";

function App() {
  const { auth } = useAuth();

  if (!auth) return <AuthPage />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
      <Layout>
      <Routes>
        {auth.role === 'patient' ? (
          <>
            <Route path="/"          element={<PatientHome />} />
            <Route path="/booking"   element={<VoiceAgent/>} />
            <Route path="/chat"     element={<VoiceChat />} />
            <Route path="/documents" element={<DocumentUpload />} />
            <Route path="/history"   element={<MedicalHistory />} />
            {/* <Route path="*"          element={<Navigate to="/" replace />} /> */}
          </>
        ) : (
          <>
            <Route path="/"          element={<DoctorSchedule />} />
            <Route path="/golden"    element={<GoldenRecord />} />
            <Route path="/docreview" element={<DocReview />} />
            <Route path="/priorauth" element={<PriorAuth />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
      </Layout>
    </div>
  );
}

export default App;