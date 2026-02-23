import { useAuth } from "../context/AuthContext.jsx";

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
                    <li>View Attractions</li>
                    <li>Join Queue</li>
                    <li>My Profile</li>
                    <li>Notifications</li>
                </ul>
            </div>
        </div>
    )
}