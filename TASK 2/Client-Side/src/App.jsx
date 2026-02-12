import './App.css';
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx';
export default function App(){
  return (
    <div className="content">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
      <Login/>
      <Register/>
    </div>
  );
};


