import { useNavigation } from './context/NavigationContext.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import CartPage from './pages/CartPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import OrderTrackingPage from './pages/OrderTrackingPage.jsx';
import LoyaltyPage from './pages/LoyaltyPage.jsx';
import ProducerDashboardPage from './pages/ProducerDashboardPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  const { page } = useNavigation();

  switch (page) {
    case 'home':             return <HomePage />;
    case 'login':            return <LoginPage />;
    case 'register':         return <RegisterPage />;
    case 'verify-email':     return <VerifyEmailPage />;
    case 'forgot-password':  return <ForgotPasswordPage />;
    case 'reset-password':   return <ResetPasswordPage />;
    case 'cart':             return <CartPage />;
    case 'product':          return <ProductPage />;
    case 'tracking':         return <OrderTrackingPage />;
    case 'loyalty':          return <LoyaltyPage />;
    case 'producer':         return <ProducerDashboardPage />;
    case 'notifications':    return <NotificationsPage />;
    case 'admin':            return <AdminPage />;

    default:                 return null;
  }
}
