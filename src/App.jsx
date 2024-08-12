import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { AuthProvider } from "./context/auth";
import ProtectedRoute from '@/components/ProtectedComponent';

function App() {
  return (
    <AuthProvider>
      <Routes>
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        <Route path="/auth/*" element={<Auth />} />
        <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
