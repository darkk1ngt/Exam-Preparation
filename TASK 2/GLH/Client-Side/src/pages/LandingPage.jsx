import { useAuth } from "../context/AuthContext.jsx";
import { Link } from 'react-router-dom';

export default function LandingPage(){
    const { user } = useAuth();

    return(
        <section className='card-grid'>
            <header className='home-hero card'>
                <div className='home-hero-content'>
                    <p className='home-kicker'>Greenfield Local Hub</p>
                    <h1>Farm-fresh produce, directly from local growers.</h1>
                    <p>
                        GLH is a professional farm cooperative platform where customers shop trusted
                        local food, producers manage stock efficiently, and communities receive fresh
                        products with transparent fulfilment.
                    </p>
                    { user ? (
                        <div className='home-cta-row'>
                            <Link to='/products' className='btn'>Browse Produce</Link>
                            <Link to='/orders' className='btn-outline'>Track Orders</Link>
                            <Link to='/loyalty' className='btn-secondary'>View Loyalty</Link>
                            {user.role === 'producer' && <Link to='/dashboard' className='btn-secondary'>Producer Dashboard</Link>}
                            {user.role === 'admin' && <Link to='/admin' className='btn-secondary'>Admin Panel</Link>}
                        </div>
                    ) : (
                        <div className='home-cta-row'>
                            <Link to='/products' className='btn'>Shop now</Link>
                            <Link to='/register' className='btn-outline'>Join GLH</Link>
                            <Link to='/about' className='btn-secondary'>About GLH</Link>
                        </div>
                    )}
                </div>
                <div className='home-hero-panel'>
                    <h3>What you get</h3>
                    <ul>
                        <li>Seasonal produce from verified local farms</li>
                        <li>Real-time order tracking and collection slots</li>
                        <li>Loyalty rewards on completed orders</li>
                        <li>Reliable producer and admin operations</li>
                    </ul>
                </div>
            </header>

            <section className='split-layout'>
                <article className='card'>
                    <h2>For Customers</h2>
                    <p>Discover dairy, vegetables, fruit, eggs and meat with clear availability and direct farm attribution.</p>
                    <Link to='/products' className='btn-outline'>Explore products</Link>
                </article>
                <article className='card'>
                    <h2>For Producers</h2>
                    <p>Manage product availability, monitor low stock, review incoming orders, and keep customers informed.</p>
                    <Link to='/register' className='btn-outline'>Apply as producer</Link>
                </article>
            </section>

            <section className='card'>
                <h2>Trusted local food network</h2>
                <p>
                    Built for efficient farm-to-community operations: secure sessions, modular data-driven pages,
                    and resilient workflows for checkout, tracking, loyalty, and notifications.
                </p>
            </section>
        </section>
    );
}
