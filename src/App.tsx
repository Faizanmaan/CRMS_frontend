import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Login from './app/Login';
import Signup from './app/Signup';
import Dashboard from './app/Dashboard';
import Customers from './app/Customers';
import OrderOverview from './app/OrderOverview';
import Analytics from './app/Analytics';
import Documents from './app/Documents';
import Products from './app/Products';
import Notifications from './app/Notifications';
import CustomerDashboard from './app/CustomerDashboard';
import CustomerProducts from './app/CustomerProducts';
import CustomerDocuments from './app/CustomerDocuments';
import CompleteProfile from './app/CompleteProfile';
import Help from './app/Help';
import Settings from './app/Settings';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<Login />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/orders" element={<OrderOverview />} />
                <Route path="/products" element={<Products />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/accounting" element={<Dashboard />} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['CUSTOMER']} />}>
                <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                <Route path="/customer/products" element={<CustomerProducts />} />
                <Route path="/customer/documents" element={<CustomerDocuments />} />
              </Route>

              <Route path="/notifications" element={<Notifications />} />
              <Route path="/help" element={<Help />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
