import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ProtectedRoute from "./components/ProtectedRoute";
import Appointments from "./pages/Appointments";
import ClientDetail from "./pages/ClientDetail";
import Staff from "./pages/Staff";
import OwnerRoute from "./components/OwnerRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Inventory from "./pages/Inventory";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        }
      />
      <Route
      path ="/appointments"
      element ={
        <ProtectedRoute>
          <Appointments />
          </ProtectedRoute>
      }
      />
      <Route
      path="/clients/:id"
      element={
        <ProtectedRoute>
          <ClientDetail />
        </ProtectedRoute>
  }
/>

<Route
  path="/staff"
  element={
    <ProtectedRoute>
      <OwnerRoute>
        <Staff />
      </OwnerRoute>
    </ProtectedRoute>
  }
/>
<Route
  path="/inventory"
  element={
    <ProtectedRoute>
      
        <Inventory />
      
    </ProtectedRoute>
  }
/>
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;