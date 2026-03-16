import './App.css';
import { AuthProvider , useAuth } from './context/AuthContext.jsx';
import { BrowserRouter , Route , Routes , Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import NavigationBar from './components/NavigationBar.jsx';
import Footer from './components/Footer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { useEffect } from 'react';
import Products from './pages/Products.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderTracking from './pages/OrderTracking.jsx';
import Admin from './pages/Admin.jsx';
import Orders from './pages/Orders.jsx';
import Notifications from './pages/Notifications.jsx';
import Loyalty from './pages/Loyalty.jsx';
import Account from './pages/Account.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';


function AppContent(){
  const { loading, checkAuth } = useAuth();

  if( loading ){
    return <LoadingSpinner message="Loading..." />
  }

  const location = useLocation()

  useEffect(() => {
    checkAuth()
  }, [location, checkAuth])

  return(
    <div className='app-wrapper'>
    <NavigationBar/>
    <main className='main-content'>
    <ErrorBoundary>
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/home' element={<LandingPage/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/products' element={<Products/>}/>
        <Route path='/checkout' element={
          <ProtectedRoute>
            <Checkout/>
          </ProtectedRoute>
        }/>
        <Route path='/orders' element={
          <ProtectedRoute>
            <Orders/>
          </ProtectedRoute>
        }/>
        <Route path='/orders/:id' element={
          <ProtectedRoute>
            <OrderTracking/>
          </ProtectedRoute>
        }/>
        <Route path='/notifications' element={
          <ProtectedRoute>
            <Notifications/>
          </ProtectedRoute>
        }/>
        <Route path='/loyalty' element={
          <ProtectedRoute>
            <Loyalty/>
          </ProtectedRoute>
        }/>
        <Route path='/account' element={
          <ProtectedRoute>
            <Account/>
          </ProtectedRoute>
        }/>
        <Route path='/dashboard' element={
          <ProtectedRoute allowed_roles={['producer']} require_producer_approval={true}>
            <Dashboard/>
          </ProtectedRoute>
        }/>
        <Route path='/admin' element={
          <ProtectedRoute allowed_roles={['admin']}>
            <Admin/>
          </ProtectedRoute>
        }/>
        <Route path='*' element={<Navigate to='/' replace />}/>
      </Routes>
    </ErrorBoundary>
    </main>
    <Footer/>
    </div>
  )
}
export default function App(){
  return (
      <AuthProvider>
      <BrowserRouter>
      <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};


