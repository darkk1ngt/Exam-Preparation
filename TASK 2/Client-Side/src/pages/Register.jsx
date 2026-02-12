import { useState } from "react";

export default function Register(){
    const [ email , setEmail ] = useState('');
    const [ password , setPassword ] = useState('');
    const [ displayPassword , SetdisplayPassword ] = useState(false);
    const [ loading , setLoading ] = useState(false);
    const [ error , setError ] = useState('');

    const handleSubmit = async(event) =>{
        event.preventDefault();

        setError('');
        setLoading(true);

        try{
            const response = await fetch('http://localhost:5000/api/auth/register',{
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                },
                credentials : "include",
                body : JSON.stringify({ email , password })

            });

            const data = await response.json();
            if( response.ok ){
                console.log(`Registration Successful!`,data);
            }else{
                setError(data.error || 'Registration failed.')
            }
        }catch(error){
            setError('Something is wrong')
        }finally{
            setLoading(false);
        }
    };

    
    return(
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>
            <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(event)=>setEmail(event.target.value)}
            required
            />
            <div>
            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? 'Registering Userr...' : 'Register'}
            </button>
            {error && <p style={{color:'red'}}>{error}</p>}
        </form>
    )
}