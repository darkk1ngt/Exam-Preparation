import { useState } from "react";

export default function Login(){
    const [ email , setEmail ] = useState('');
    const [ password , setPassword ] = useState('');
    const [ loading , setLoading ] = useState(false);
    const [ error , setError ] = useState('');

    const handleSubmit = async( event )=>{
        event.preventDefault();

        setError('');
        setLoading(true);

        try{
            const response = await fetch('http://localhost:5000/api/auth/login',{
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                },
                credentials : 'include',
                body : JSON.stringify({ email , password })

            });

            const data = await response.json();
            if( response.ok ){
                console.log(`Login successful!`,data);
            }else{
                setError(data.error || 'Login failed.');
            }
        }catch(err){
            setError('Something is wrong')
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
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event => setPassword(event.target.value))}
            required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <p style={{color:'red'}}>{error}</p>}
        </form>
    )
}