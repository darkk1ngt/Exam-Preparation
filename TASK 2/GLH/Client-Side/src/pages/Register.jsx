import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Register(){
    const navigate = useNavigate();
    const [ role , setRole ] = useState('customer');
    const [ email , setEmail ] = useState('');
    const [ password , setPassword ] = useState('');
    const [ confirmPassword , setConfirmPassword ] = useState('');
    const [ farm_name , setFarmName ] = useState('');
    const [ contact_number , setContactNumber ] = useState('');
    const [ showPassword , setShowPassword ] = useState(false);
    const [ loading , setLoading ] = useState(false);
    const [ error , setError ] = useState('');

    const { register } = useAuth();

    const validateForm = () => {
        if (!email || !password || !confirmPassword) {
            setError('All fields are required');
            return false;
        }

        if( role === 'producer' && (!farm_name.trim() || !contact_number.trim()) ){
            setError('Farm name and contact number are required for producer registration.');
            return false;
        }
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 8 characters with uppercase, lowercase, number and special character');
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
           const result = await register({
                email,
                password,
                role,
                farm_name : role === 'producer' ? farm_name.trim() : null,
                contact_number : role === 'producer' ? contact_number.trim() : null
           });
            if( result.success ){
                navigate('/products');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setFarmName('');
                setContactNumber('');
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
        <section className='card' style={{ maxWidth : '460px' , margin : '0 auto' }}>
            <form className='card-grid' onSubmit={handleSubmit}>
                <h1>{role === 'producer' ? 'Register as Producer' : 'Register as Customer'}</h1>

                <div className='tabs'>
                    <button
                        type='button'
                        className={`tab ${role === 'customer' ? 'active' : ''}`}
                        onClick={() => setRole('customer')}
                    >
                        Customer
                    </button>
                    <button
                        type='button'
                        className={`tab ${role === 'producer' ? 'active' : ''}`}
                        onClick={() => setRole('producer')}
                    >
                        Producer
                    </button>
                </div>

                <input
                    type='email'
                    className='input'
                    placeholder='example@email.com'
                    value={email}
                    onChange={(event)=>setEmail(event.target.value)}
                    required
                />

                {role === 'producer' && (
                    <>
                        <input
                            type='text'
                            className='input'
                            placeholder='Farm name'
                            value={farm_name}
                            onChange={(event) => setFarmName(event.target.value)}
                            required
                        />
                        <input
                            type='text'
                            className='input'
                            placeholder='Contact number'
                            value={contact_number}
                            onChange={(event) => setContactNumber(event.target.value)}
                            required
                        />
                    </>
                )}

                <input
                    type={showPassword ? 'text' : 'password'}
                    className='input'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <input
                    type={showPassword ? 'text' : 'password'}
                    className='input'
                    placeholder='Confirm Password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                <button className='btn-outline' type='button' onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                </button>

                <button className='btn' type='submit' disabled={loading}>
                    {loading ? 'Registering User...' : 'Register'}
                </button>

                {error && <p className='pill status-red'>{error}</p>}
            </form>
        </section>
    )
}