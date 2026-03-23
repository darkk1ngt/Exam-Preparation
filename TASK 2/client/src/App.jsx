import { useNavigation } from './context/NavigationContext.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import OrderTrackingPage from './pages/OrderTrackingPage.jsx';
import LoyaltyPage from './pages/LoyaltyPage.jsx';
import ProducerDashboardPage from './pages/ProducerDashboardPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

const PAGES = {
  home: HomePage,
  login: LoginPage,
  register: RegisterPage,
  'verify-email': VerifyEmailPage,
  'forgot-password': ForgotPasswordPage,
  'reset-password': ResetPasswordPage,
  cart: CartPage,
  checkout: CheckoutPage,
  product: ProductPage,
  tracking: OrderTrackingPage,
  loyalty: LoyaltyPage,
  producer: ProducerDashboardPage,
  notifications: NotificationsPage,
  admin: AdminPage,
};

export default function App() {
  const { page } = useNavigation();
  const CurrentPage = PAGES[page];
  return CurrentPage ? <CurrentPage /> : null;
}
