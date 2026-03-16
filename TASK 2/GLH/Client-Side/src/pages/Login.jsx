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
                navigate('/products');
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
        <section className='card' style={{ maxWidth : '460px' , margin : '0 auto' }}>
            <form className='card-grid' onSubmit={handleSubmit}>
                <h1>Login</h1>

                <input
                    type='email'
                    className='input'
                    placeholder='example@email.com'
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />

                <input
                    type={showPassword ? 'text' : 'password'}
                    className='input'
                    placeholder='Password'
                    value={password}
                    onChange={(event => setPassword(event.target.value))}
                    required
                />

                <button className='btn-outline' type='button' onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Hide Password' : 'Show Password'}
                </button>

                <button className='btn' type='submit' disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                {error && <p className='pill status-red'>{error}</p>}
            </form>
        </section>
    )
}