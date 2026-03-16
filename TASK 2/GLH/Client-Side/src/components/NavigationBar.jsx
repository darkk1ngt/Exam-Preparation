import { Link , useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect , useMemo , useState } from 'react';
import config from '../config.js';

export default function NavigationBar(){
    const { user , logout } = useAuth();
    const navigate = useNavigate();
    const [ unread_count , setUnreadCount ] = useState(0);

    const my_orders_link = useMemo(() => {
        const last_order_id = localStorage.getItem('last_order_id');
        return last_order_id ? `/orders/${last_order_id}` : '/products';
    }, []);

    useEffect(() => {
        let interval_id;

        async function fetchUnreadCount(){
            if( !user ){
                setUnreadCount(0);
                return;
            }

            try{
                const countResponse = await fetch(`${config.apiUrl}/api/notifications?unread_only=true`, {
                    credentials : 'include'
                });

                if( !countResponse.ok ){
                    return;
                }

                const countData = await countResponse.json();

                setUnreadCount(countData.unread_count ?? 0);
            }catch{
                setUnreadCount(0);
            }
        }

        fetchUnreadCount();
        interval_id = setInterval(fetchUnreadCount, 10000);

        return () => {
            clearInterval(interval_id);
        };
    }, [user]);

    const initials = (user?.email?.trim()?.charAt(0) || 'U').toUpperCase();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return(
        <nav className='glh-nav'>
            <div className='glh-nav-inner'>
                <Link to='/' className='glh-logo'>GLH</Link>

                <div className='glh-nav-links'>
                    <Link to='/'>Home</Link>
                    <Link to='/about'>About</Link>
                    <Link to='/contact'>Contact</Link>
                    <Link to='/products'>Shop</Link>
                    <Link to={my_orders_link}>My Orders</Link>
                    <Link to='/loyalty'>Loyalty</Link>

                    {user?.role === 'producer' && (
                        <Link to='/dashboard'>Dashboard</Link>
                    )}

                    {user?.role === 'admin' && (
                        <Link to='/admin'>Admin</Link>
                    )}
                </div>

                <div className='glh-nav-right'>
                    {user ? (
                        <>
                            <Link to='/notifications' className='notification-bell' aria-label='Notifications'>
                                    <span aria-hidden='true'>🔔</span>
                                    {unread_count > 0 && (
                                        <span className='notification-count'>{unread_count}</span>
                                    )}
                            </Link>
                            <Link to='/account' className='avatar-chip' aria-label='User account'>
                                {initials}
                            </Link>
                            <button className='btn-secondary' type='button' onClick={handleLogout}>Logout</button>
                        </>
                    ):(
                        <>
                            <Link to='/login'>Login</Link>
                            <Link to='/register'>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}