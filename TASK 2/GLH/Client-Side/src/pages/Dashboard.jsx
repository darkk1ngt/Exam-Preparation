import { useAuth } from "../context/AuthContext.jsx";
import {Link} from "react-router-dom";

export default function Dashboard(){

    const { user , logout } = useAuth();

    return(
        <div>
            <h1>London Zoo Dashboard</h1>
            <p>Welcome, {user?.email}!</p>
            <button onClick={logout}>Logout</button>
            
            <div style={{ marginTop : '20px'}}>
                <h2>Quick Access</h2>
                <ul>
                    <li><Link to ='/attractions' style={{color:"grey"}}>View Attractions</Link></li>
                    <li><Link to ='/queues' style={{color:"grey"}}>Join Queues</Link></li>
                    <li><Link to='/profile' style={{color : 'grey'}}>User Profile</Link></li>
                    <li>Notifications</li>
                </ul>
            </div>
        </div>
    )
}