import { useEffect, useState } from "react";

export default function Attractions(){

    const [ attractions , setAttractions ] = useState([]);
    const [ loading , setLoading ] = useState(true);
    const [ error , setError ] = useState('');

    useEffect(()=>{
        fetchAttractions();
    },[]);

    const fetchAttractions = async()=>{
        try {
            const response = await fetch('http://localhost:5000/api/attractions',{
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
        return<div>Loading Attractions...</div>
    }
    
    if( error ){
        return<div style={{ color: 'red'}}>{error}</div>
    }

    const handleJoinQueue = async(attractionId , attractionName) => {
        try{
            const response = await fetch(`http://localhost:5000/api/queue/${attractionId}/join`,{
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
    
    return(
        <div>
            <h1> Zoo Attractions </h1>
            <div style={{ display: 'grid' , gap : '20px'}}>
                {attractions.map((attraction) => (
                    <div key={attraction.id} style={{ 
                        border: '1px solid #ccc', 
                        padding: '15px', 
                        borderRadius: '8px' 
                    }}>
                        <h2>{attraction.name}</h2>
                        <p>{attraction.description}</p>
                        <p><strong>Category:</strong> {attraction.category}</p>
                        <p><strong>Duration:</strong> {attraction.estimated_duration_minutes} minutes</p>
                        
                        {attraction.queue_length !== null && (
                            <div style={{ 
                                marginTop: '10px', 
                                padding: '10px', 
                                backgroundColor: '#f0f0f0',
                                borderRadius: '4px'
                            }}>
                                <p><strong>Queue Length:</strong> {attraction.queue_length} people</p>
                                <p><strong>Estimated Wait:</strong> {attraction.estimated_wait_minutes} minutes</p>
                            </div>
                        )}
                        
                        <button
                        onClick={()=>handleJoinQueue( attraction.id , attraction.name )}
                        style={{
                            marginTop : '10px',
                            padding : '10px 20px',
                            backgroundColor : '#27ae60',
                            color : 'white',
                            border : 'none',
                            borderRadius : '5px',
                            cursor : 'pointer'
                        }}>
                            Join Queue
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
