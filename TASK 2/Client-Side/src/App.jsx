import './App.css';
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx';
import { AuthProvider , useAuth } from './context/AuthContext.jsx';

function AppContent(){
  const { user , loading , logout } = useAuth();

  if( loading ){
    return<div>Loading...</div>
  }

  return(
    <div className='content'>
      <h1>London Zoo</h1>
      {user ? (
        <div>
          <p>Welcome {user.email}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <Login/>
          <Register/>
        </div>
      )}
    </div>
  )
}
export default function App(){
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};


