import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function NavigationBar(){
    const { user , logout } = useAuth();
    return(
        <nav style={{
            padding : '15px',
            backgroundColor : '#305e3a',
            color : 'white',
            marginBottom : '20px'
        }}>
            <div style={{ display : 'flex' , justifyContent : 'space-between' , alignItems : 'center'}}>
                <div>
                    <Link to='/' style={{ color : 'white' , marginRight : '20px'}}>Home</Link>
                    {user && (
                        <>
                            <Link to='/dashboard' style={{ color : 'white' , marginRight : '20px'}}>Dashboard</Link>
                            <Link to='/attractions' style={{ color : 'white' , marginRight : '20px'}}>Attractions</Link>
                        </>
                    )}
                </div>
                <div>
                    {user ? (
                        <>
                            <span style={{ marginRight : '15px'}}>{user.email}</span>
                            <button onClick={logout}>Logout</button>
                        </>
                    ):(
                        <>
                            <Link to="/login" style={{color : 'white' , marginRight : '15px'}}>Login</Link>
                            <Link to="/register" style={{color : 'white'}}>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}