import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Login(){
    const navigate = useNavigate();
    const [ email , setEmail ] = useState('');
    const [ password , setPassword ] = useState('');
    const [ showPassword , setShowPassword ] = useState(false);
    const [ loading , setLoading ] = useState(false);
    const [ error , setError ] = useState('');

    const { login } = useAuth();

    const handleSubmit = async( event )=>{
        event.preventDefault();

        setError('');
        setLoading(true);

        try{
            const result = await login( email , password );
            if( result.success ){
                console.log(`Login successful!`,result.data);
                navigate('/dashboard');
                setEmail('');
                setPassword('');
            }else{
                setError(result.error || 'Login failed.');
            }
        }catch(err){
            setError(err.message || 'Something went wrong. Please try again.')
        }finally{
            setLoading(false);
        }
    };

    return(
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            
            <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
            />
            
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(event => setPassword(event.target.value))}
                required
            />
            
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Hide Password' : 'Show Password'}
            </button>
            
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
            
            {error && <p style={{color:'red'}}>{error}</p>}
        </form>
    )
}