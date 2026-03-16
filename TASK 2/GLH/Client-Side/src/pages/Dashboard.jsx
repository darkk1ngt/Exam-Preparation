import { useAuth } from "../context/AuthContext.jsx";
import { useEffect , useMemo , useState } from 'react';
import config from '../config.js';

export default function Dashboard(){
    const { user } = useAuth();
    const [ dashboard_data , setDashboardData ] = useState(null);
    const [ my_products , setMyProducts ] = useState([]);
    const [ active_tab , setActiveTab ] = useState('my_products');
    const [ loading , setLoading ] = useState(true);
    const [ error , setError ] = useState('');

    async function fetchDashboardData(){
        setLoading(true);
        setError('');
        try{
            const [dashboard_response, products_response] = await Promise.all([
                fetch(`${config.apiUrl}/api/dashboard`, { credentials : 'include' }),
                fetch(`${config.apiUrl}/api/products?producer_id=${user?.id ?? ''}`, { credentials : 'include' })
            ]);

            if( !dashboard_response.ok || !products_response.ok ){
                throw new Error('Unable to load producer dashboard data.');
            }

            const dashboard_payload = await dashboard_response.json();
            const products_payload = await products_response.json();

            setDashboardData(dashboard_payload);
            setMyProducts(products_payload.products ?? dashboard_payload.my_products ?? []);
        }catch ( fetch_error ){
            setError(fetch_error.message);
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const products_listed = dashboard_data?.product_stats?.total_products ?? my_products.length;
    const pending_orders = dashboard_data?.pending_orders ?? 0;
    const weekly_revenue = useMemo(() => {
        if( dashboard_data?.weekly_revenue !== undefined ){
            return Number(dashboard_data.weekly_revenue);
        }
        const fallback = (dashboard_data?.top_sales ?? []).reduce(
            (sum, sale) => sum + Number(sale.revenue || 0),
            0
        );
        return fallback;
    }, [dashboard_data]);

    const low_stock_alerts = my_products.filter(product => Number(product.stock_quantity) < 5).length;

    const toggleAvailability = async (product) => {
        setError('');
        try{
            const response = await fetch(`${config.apiUrl}/api/products/${product.id}`, {
                method : 'PATCH',
                headers : { 'Content-Type' : 'application/json' },
                credentials : 'include',
                body : JSON.stringify({ is_available : !Boolean(product.is_available) })
            });

            if( !response.ok ){
                const payload = await response.json();
                throw new Error(payload.error || 'Unable to update product status.');
            }

            await fetchDashboardData();
        }catch ( update_error ){
            setError(update_error.message);
        }
    };

    if( loading ){
        return <p>Loading producer dashboard...</p>;
    }

    return(
        <section className='card-grid'>
            <header className='card producer-banner'>
                <h1>Producer Dashboard</h1>
                <p>{user?.farm_name || 'Unnamed farm'}</p>
                <p>Status: <span className='pill pill-green'>Approved</span></p>
            </header>

            {error && <p className='pill status-red'>{error}</p>}

            <div className='card-grid' style={{ gridTemplateColumns : 'repeat(4, minmax(0, 1fr))' }}>
                <article className='card'>
                    <h3>Products listed</h3>
                    <p><strong>{products_listed}</strong></p>
                </article>
                <article className='card'>
                    <h3>Pending orders</h3>
                    <p><strong>{pending_orders}</strong></p>
                </article>
                <article className='card'>
                    <h3>Weekly revenue</h3>
                    <p><strong>£{Number(weekly_revenue).toFixed(2)}</strong></p>
                </article>
                <article className='card'>
                    <h3>Low stock alerts</h3>
                    <p><strong>{low_stock_alerts}</strong></p>
                </article>
            </div>

            <div className='tabs'>
                <button type='button' className={`tab ${active_tab === 'my_products' ? 'active' : ''}`} onClick={() => setActiveTab('my_products')}>My Products</button>
                <button type='button' className={`tab ${active_tab === 'incoming_orders' ? 'active' : ''}`} onClick={() => setActiveTab('incoming_orders')}>Incoming Orders</button>
                <button type='button' className={`tab ${active_tab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
            </div>

            {active_tab === 'my_products' && (
                <section className='card'>
                    <div className='table-wrap'>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Available</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {my_products.map((product) => {
                                    const stock_ok = Number(product.stock_quantity) >= 5;
                                    return (
                                        <tr key={product.id}>
                                            <td>{product.name}</td>
                                            <td>£{Number(product.price).toFixed(2)}</td>
                                            <td>
                                                <span className={`pill ${stock_ok ? 'pill-green' : 'pill-amber'}`}>
                                                    {product.stock_quantity} {stock_ok ? '(stock-ok)' : '(stock-low)'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    type='button'
                                                    className={Boolean(product.is_available) ? 'btn-secondary' : 'btn-outline'}
                                                    onClick={() => toggleAvailability(product)}
                                                >
                                                    {Boolean(product.is_available) ? 'TRUE' : 'FALSE'}
                                                </button>
                                            </td>
                                            <td>
                                                <button type='button' className='btn-outline'>Edit</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <button type='button' className='btn' style={{ marginTop : '1rem' }}>Add product</button>
                </section>
            )}

            {active_tab === 'incoming_orders' && (
                <section className='card'>
                    <h2>Incoming Orders</h2>
                    <p>This tab is reserved for producer-filtered incoming order queue.</p>
                </section>
            )}

            {active_tab === 'analytics' && (
                <section className='card'>
                    <h2>Analytics</h2>
                    <p>Top sales data available: {(dashboard_data?.top_sales ?? []).length} products.</p>
                </section>
            )}
        </section>
    )
}