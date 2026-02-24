import { useState , useEffect, use } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile(){

    const { user } = useAuth();
    const [ profile , setProfile ] = useState(null);
    const [ preferences , setPreferences ] = useState({
        notifications_enabled : true,
        preferred_attractions : '',
        distance_alert_threshold : 500
    });

    const [ loading , setLoading ] = useState(true);
    const [ saving , setSaving ] = useState(false);
    const [ message , setMessage ] = useState('');

    useEffect(()=>{
        fetchProfile();
    },[]);

    const fetchProfile = async ()=> {
        try{
            const response = await fetch('http://localhost:5000/api/profile',{
                credentials : 'include'
            });

            if ( response.ok ){
                const data = await response.json();
                setProfile(data.user);

                if ( data.preferences ){
                    setPreferences({
                        notifications_enabled : data.preferences.notifications_enabled,
                        preferred_attractions : data.preferences.preferred_attractions || '',
                        distance_alert_threshold : data.preferences.distance_alert_threshold || 500
                    });
                }
            }
        }catch ( error ){
            console.error('Failed to fetch profile:',error);
        }finally{
            setLoading(false);
        }
    };

    const handleSave = async ( event )=> {
        event.preventDefault();
        setSaving(true);
        setMessage('');

        try{
            const response = await fetch('http://localhost:5000/api/profile/preferences',{
                method : 'PATCH',
                headers : {
                    'Content-Type' : 'application/json'
                },
                credentials : 'include',
                body : JSON.stringify(preferences)
            });

            if ( response.ok ){
                setMessage('Preferences saved successfully!');
            }else{
                setMessage('Failed to save preferences.')
            }
        }catch ( error ){
            setMessage('Someting went wrong.')
        }finally{
            setSaving(false);
        }
    };

    if ( loading ){
        return<div>Loading Profile...</div>
    }

    return(
        <div style={{ maxWidth : '600px' , margin : '0 auto' , padding : '20px'}}>
            <h1>User Profile</h1>
            <div style={{ marginBottom : '30px' , padding : '15px' , backgroundColor : '#f5f5f5' , borderRadius : '8px' }}>
                <h2>Account Information</h2>
                <p><strong>Email:</strong>{ profile?.email }</p>
                <p><strong>Role:</strong>{ profile?.role }</p>
                <p><strong>Member Since:</strong>{ new Date( profile?.created_at ).toLocaleDateString() }</p>
            </div>
            <form onSubmit={handleSave}>
                <h2>Preferences</h2>
                <div style={{marginBottom : '15px'}}>
                    <label>
                        <input
                        type="checkbox"
                        checked={preferences.notifications_enabled}
                        onChange={(event)=> setPreferences({
                            ...preferences,
                            notifications_enabled : event.target.checked
                        })}
                        />
                        { ' ' }Enable Notifications
                    </label>
                </div>

                <div>

                </div>
                <div>

                </div>
                <button>
                    {message && (
                        <p style={{
                            marginTop : '10px',
                            color : message.includes('success') ? 'green' : 'red'
                        }}>

                        </p>
                    )}
                </button>
            </form>

        </div>
    )

}