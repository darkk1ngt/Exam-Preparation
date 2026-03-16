import { createContext , useState , useContext , useEffect , useCallback } from "react";
import config from '../config.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }){
    const [ user , setUser ] = useState(null);
    const [ loading , setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        const response = await fetch(`${config.apiUrl}/api/profile`, {
            credentials : 'include'
        });

        if( !response.ok ){
            return null;
        }

        const data = await response.json();
        return data.user ?? null;
    }, []);

    const checkAuth = useCallback(async () => {
        try{
            const response = await fetch(`${config.apiUrl}/api/auth/status`,{
                credentials : "include"
            });
            
            if (!response.ok) {
                throw new Error('Auth check failed');
            }
            
            const data = await response.json();
            
            if (data.isAuthenticated) {
                const profile = await fetchProfile();
                setUser({
                    ...data.user,
                    ...(profile ?? {})
                });
            } else {
                setUser(null);
            }
        }catch ( error ){
            console.error('Auth check failed:',error);
            setUser(null);
        }finally{
            setLoading(false);
        }
    }, [fetchProfile]);

    /* check if user is already logged in on mount */
    
    useEffect(() =>{
        checkAuth()
    },[checkAuth]);

    const login = async ( email , password )=>{
        const response = await fetch(`${config.apiUrl}/api/auth/login`,{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
            },
            credentials : 'include',
            body : JSON.stringify({ email , password })
        });

        const data = await response.json();

        if( response.ok ){
            const profile = await fetchProfile();
            setUser({
                ...data.user,
                ...(profile ?? {})
            });
            return{ success : true , data };
        }else{
            return { success : false , error : data.error || 'Login failed.'}
        }
    };

    const register = async ( registration_payload )=>{
        const response = await fetch(`${config.apiUrl}/api/auth/register`,{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
            },
            credentials : 'include',
            body : JSON.stringify(registration_payload)
        });

        const data = await response.json();

        if( response.ok ){
            const profile = await fetchProfile();
            setUser({
                ...data.user,
                ...(profile ?? {})
            });
            return{ success : true , data };
        }else{
            return { success : false , error : data.error || 'Registration failed.'}
        }
    };

    const logout = async () =>{
        try{
            await fetch(`${config.apiUrl}/api/auth/logout`,{
                method : 'POST',
                credentials : 'include'
            });
        }catch( error ){
            console.error('Logout Failed:',error);
        }finally{
            setUser(null);
        }
    }

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        checkAuth,
        refreshProfile : checkAuth
    };

    return(
        <AuthContext.Provider value={value}>
            { children }
        </AuthContext.Provider>
    );
}

export function useAuth(){
    const context = useContext(AuthContext);
    if(!context){
        throw new Error('useAuth must be used within an AuthProvider.')
    }
    return context;
}