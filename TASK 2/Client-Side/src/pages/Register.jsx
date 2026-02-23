import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register(){
    const [ email , setEmail ] = useState('');
    const [ password , setPassword ] = useState('');
    const [ loading , setLoading ] = useState(false);
    const [ error , setError ] = useState('');

    const { register } = useAuth();

    const handleSubmit = async(event) =>{
        event.preventDefault();

        setError('');
        setLoading(true);

        try{
           const result = await register( email , password);
            if( result.success ){
                console.log(`Registration Successful!`, result.data);
                setEmail('');
                setPassword('');
            }else{
                setError(result.error || 'Registration failed.')
            }
        }catch(error){
            setError('Something went wrong')
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
                {loading ? 'Registering User...' : 'Register'}
            </button>
            {error && <p style={{color:'red'}}>{error}</p>}
        </form>
    )
}