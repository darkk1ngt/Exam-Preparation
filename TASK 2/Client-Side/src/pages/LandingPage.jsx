import { useAuth } from "../context/AuthContext.jsx";
import { Link } from 'react-router-dom';

export default function LandingPage(){
    const { user } = useAuth();

    return(
        <div>
            <h1>Welcome to London Zoo</h1>
            <p>Your digital zoo experience.</p>
            { user ? (
                <div>
                    <p>You are logged in as {user.email}</p>
                    <Link to='/dashboard'>
                    <button>Go to Dashboard</button>
                    </Link>
                </div>
            ):(
                <div>
                    <Link to='/login'>
                    <button>Login</button>
                    </Link>
                    <Link to='/register'>
                    <button>Register</button>
                    </Link>
                </div>
            )}
        </div>
    );
}