import { useEffect, useState } from "react";
import LoadingSpinner from '../components/LoadingSpinner';
import config from '../config';

export default function Attractions(){

    const [ attractions , setAttractions ] = useState([]);
    const [ loading , setLoading ] = useState(true);
    const [ error , setError ] = useState('');

    /* stateful filtering */
    const [ filters , setFilters ] = useState({
        category : 'all',
        status : 'all',
        sortBy : 'name'
    })

    const [ searchTerm , setSearchTerm ] = useState(''); // search by name

    useEffect(()=>{
        fetchAttractions();
    },[]);

    const fetchAttractions = async()=>{
        try {
            const response = await fetch(`${config.apiUrl}/api/attractions`,{
                credentials : 'include'
            });

            if( response.ok){
                const data = await response.json();
                setAttractions(data.attractions);
            }else{
                setError('Failed to load attractions.');
            }
        } catch (error) {
            setError('Something went wrong.')
        } finally{
            setLoading(false)
        }
    };

    if( loading ){
        return <LoadingSpinner message="Loading attractions..." />
    }
    
    if( error ){
        return<div style={{ color: 'red'}}>{error}</div>
    }

    const handleJoinQueue = async(attractionId , attractionName) => {
        try{
            const response = await fetch(`${config.apiUrl}/api/queue/${attractionId}/join`,{
                method : 'POST',
                credentials : 'include'
            });

            if ( response.ok ){
                alert(`Successfully joined queue for ${attractionName}!`);
                fetchAttractions();
            }else{
                const data = await response.json();
                alert(data.error || 'Failed to join queue.')
            }
        }catch( err ){
            alert('Something went wrong.');
        }
    }

    const getFilteredAttractions = ()=>{
        let filtered = [...attractions];

        /* filter by category */
        if ( filters.category !== 'all' ){
            filtered = filtered.filter(attr=>attr.category.toLowerCase() === filters.category.toLowerCase())
        }

        /* filter by status */
        if ( filters.status !== 'all' ){
            filtered = filtered.filter(attr=>attr.status.toLowerCase() === filters.status.toLowerCase())
        }

        /* filter by search term */
        if ( searchTerm.trim()){
            filtered = filtered.filter(attr=>
                attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                attr.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        /* sort attractions */
        filtered.sort(( a , b )=>{
            switch(filters.sortBy){
                case 'name' :
                    return a.name.localeCompare(b.name);
                case 'wait-asc' :
                    return (a.estimated_wait_minutes || 0) - (b.estimated_wait_minutes || 0);
                case 'wait-desc':
                    return (b.estimated_wait_minutes || 0) - (a.estimated_wait_minutes || 0);
                case 'queue-asc' :
                    return (a.queue_length || 0) - (b.queue_length || 0);
                case 'queue-desc' :
                    return (b.queue_length || 0) - (a.queue_length || 0);
                default :
                    return 0;
            }
        });
        
        return filtered;
    }

    // Helper function to get status badge styling
    const getStatusStyle = (status) => {
        const baseStyle = {
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
        };
        
        switch(status?.toLowerCase()) {
            case 'open':
                return { ...baseStyle, backgroundColor: '#305e3a', color: 'white' };
            case 'closed':
                return { ...baseStyle, backgroundColor: '#e74c3c', color: 'white' };
            case 'delayed':
                return { ...baseStyle, backgroundColor: '#f39c12', color: 'white' };
            default:
                return { ...baseStyle, backgroundColor: '#95a5a6', color: 'white' };
        }
    };

    // Helper function for queue status (visual indicator)
    const getQueueStatusStyle = (waitMinutes) => {
        if (waitMinutes < 15) {
            return { backgroundColor: '#d4edda', borderLeft: '4px solid #28a745' }; // Green
        } else if (waitMinutes < 30) {
            return { backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107' }; // Yellow
        } else {
            return { backgroundColor: '#f8d7da', borderLeft: '4px solid #dc3545' }; // Red
        }
    };
    
    return(
        <div style={{ padding: '20px' }}>
            <h1>Zoo Attractions</h1>

            {/*Filter and Search*/}
            <div style={{
                backgroundColor : '#f5f5f5',
                padding : '20px',
                borderRadius : '8px',
                marginBottom : '20px'
            }}>

                {/* Search Bar */}
                <div style={{ marginBottom : '15px'}}>
                    <input
                    type="text"
                    placeholder='Search attractions...'
                    value={searchTerm}
                    onChange={(event)=> setSearchTerm(event.target.value)}
                    style={{
                        width : '100%',
                        padding : '10px',
                        fontSize : '16px',
                        borderRadius : '4px',
                        border : '1px solid #ccc'
                    }}
                    /> 
                </div>

                {/* Filter Controls */}
                <div style={{
                    display : 'grid',
                    gridTemplateColumns : 'repeat(auto-fit, minmax(200px,1fr))',
                    gap : '15px'  
                }}>
                    {/* Category Filter */}
                    <div>
                        <label style={{ display : 'block' , marginBottom : '5px' , fontWeight : 'bold', color: '#333'}}>
                            Category:
                        </label>
                        <select
                        value={filters.category}
                        onChange={(event)=> setFilters({...filters, category: event.target.value})}
                        style={{
                            width : '100%',
                            padding : '8px',
                            fontSize : '14px',
                            borderRadius : '4px',
                            border : '1px solid #ccc'
                        }}>
                            <option value='all'>All Categories</option>
                            <option value='exhibit'>Exhibits</option>
                            <option value='ride'>Rides</option>
                            <option value='show'>Shows</option>
                            <option value='facility'>Facilities</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label style={{ display : 'block' , marginBottom : '5px' , fontWeight : 'bold', color: '#333'}}>
                            Status:
                        </label>
                        <select
                        value={filters.status}
                        onChange={(event)=>setFilters({...filters , status : event.target.value})}
                        style={{
                            width : '100%',
                            padding : '8px',
                            fontSize : '14px',
                            borderRadius : '4px',
                            border : '1px solid #ccc'
                        }}
                        >
                            <option value='all'>All Status</option>
                            <option value='open'>Open</option>
                            <option value='closed'>Closed</option>
                            <option value='delayed'>Delayed</option>
                        </select>
                    </div>

                    {/* Sort By */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                            Sort By:
                        </label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                            style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '14px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        >
                            <option value="name">Name (A-Z)</option>
                            <option value="wait-asc">Wait Time (Low to High)</option>
                            <option value="wait-desc">Wait Time (High to Low)</option>
                            <option value="queue-asc">Queue Length (Short to Long)</option>
                            <option value="queue-desc">Queue Length (Long to Short)</option>
                        </select>
                    </div>  
                </div>

                {/* Results Count */}
                <div style={{ marginTop : '15px' , color : '#666'}}>
                    Showing {getFilteredAttractions().length} of {attractions.length} attractions
                </div>
            </div>

            {/* Attractions Grid */}
            <div style={{ display: 'grid' , gap : '20px'}}>
                {getFilteredAttractions().map((attraction) => (
                    <div key={attraction.id} style={{ 
                        border: '1px solid #ddd', 
                        padding: '20px', 
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        backgroundColor: '#fff'
                    }}>
                        {/* Header with Name and Status Badge */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '10px'
                        }}>
                            <h2 style={{ margin: 0, color: '#333' }}>{attraction.name}</h2>
                            <span style={getStatusStyle(attraction.status)}>
                                {attraction.status || 'Unknown'}
                            </span>
                        </div>
                        
                        <p style={{ color: '#666' }}>{attraction.description}</p>
                        
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(2, 1fr)', 
                            gap: '10px',
                            marginBottom: '15px',
                            color: '#555'
                        }}>
                            <p><strong>Category:</strong> {attraction.category}</p>
                            <p><strong>Duration:</strong> {attraction.estimated_duration_minutes} min</p>
                        </div>
                        
                        {/* Queue Information with Color Coding */}
                        {attraction.queue_length !== null && (
                            <div style={{ 
                                ...getQueueStatusStyle(attraction.estimated_wait_minutes),
                                padding: '15px',
                                borderRadius: '4px',
                                marginBottom: '15px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#333' }}>
                                    <div>
                                        <strong>Queue Length:</strong> {attraction.queue_length} people
                                    </div>
                                    <div>
                                        <strong>Wait Time:</strong> {attraction.estimated_wait_minutes} min
                                    </div>
                                </div>
                                {/* Visual wait time indicator */}
                                <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                                    {attraction.estimated_wait_minutes < 15 && '✓ Short Wait'}
                                    {attraction.estimated_wait_minutes >= 15 && attraction.estimated_wait_minutes < 30 && '⚠ Medium Wait'}
                                    {attraction.estimated_wait_minutes >= 30 && '⏱ Long Wait'}
                                </div>
                            </div>
                        )}
                        
                        <button
                        onClick={()=>handleJoinQueue( attraction.id , attraction.name )}
                        disabled={attraction.status !== 'open'}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: attraction.status === 'open' ? '#27ae60' : '#95a5a6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: attraction.status === 'open' ? 'pointer' : 'not-allowed',
                            width: '100%',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}>
                            {attraction.status === 'open' ? 'Join Queue' : 'Currently Unavailable'}
                        </button>
                    </div>
                ))}
            </div>

            {/* No Results Message */}
            {getFilteredAttractions().length === 0 && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#666',
                    fontSize: '18px' 
                }}>
                    No attractions match your filters. Try adjusting your search criteria.
                </div>
            )}
        </div>
    )
}
