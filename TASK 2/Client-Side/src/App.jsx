import './App.css';
import { AuthProvider , useAuth } from './context/AuthContext.jsx';
import { BrowserRouter , Route , Routes , Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Attractions from './pages/Attractions.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import NavigationBar from './components/NavigationBar.jsx';
import Footer from './components/Footer.jsx';
import { useEffect } from 'react';


function AppContent(){
  const { loading, checkAuth } = useAuth();

  if( loading ){
    return<div>Loading...</div>
  }

  const location = useLocation()

  useEffect(() => {
    checkAuth()
  }, [location, checkAuth])

  return(
    <>
    <NavigationBar/>
    <Routes>
      <Route path='/Attractions' element={<Attractions/>}/>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route
      path='/dashboard'
      element={
        <ProtectedRoute>
          <Dashboard/>
        </ProtectedRoute>
      }/>
    </Routes>
    <Footer/>
    </>
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


