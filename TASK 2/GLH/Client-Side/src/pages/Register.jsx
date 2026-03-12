import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Register(){
    const navigate = useNavigate();
    const [ email , setEmail ] = useState('');
    const [ password , setPassword ] = useState('');
    const [ confirmPassword , setConfirmPassword ] = useState('');
    const [ showPassword , setShowPassword ] = useState(false);
    const [ loading , setLoading ] = useState(false);
    const [ error , setError ] = useState('');

    const { register } = useAuth();

    const validateForm = () => {
        if (!email || !password || !confirmPassword) {
            setError('All fields are required');
            return false;
        }
        
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async(event) =>{
        event.preventDefault();

        setError('');
        
        if (!validateForm()) return;
        
        setLoading(true);

        try{
           const result = await register( email , password);
            if( result.success ){
                console.log(`Registration Successful!`, result.data);
                navigate('/dashboard');
                setEmail('');
                setPassword('');
            }else{
                setError(result.error || 'Registration failed.')
            }
        }catch(error){
            setError(error.message || 'Registration failed. Please try again.')
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
            
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Hide Passwords' : 'Show Passwords'}
            </button>
            
            <button type="submit" disabled={loading}>
                {loading ? 'Registering User...' : 'Register'}
            </button>
            
            {error && <p style={{color:'red'}}>{error}</p>}
        </form>
    )
}