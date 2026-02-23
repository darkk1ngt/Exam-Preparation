import { createContext , useState , useContext , useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }){
    const [ user , setUser ] = useState(null);
    const [ loading , setLoading] = useState(true);

    /* check if user is already logged in on mount */
    useEffect(() =>{
        checkAuth()
    },[]);

    const checkAuth = async () => {
        try{
            const response = await fetch('http://localhost:5000/api/auth/status',{
                credentials : "include"
            });
            if( response.ok ){
                const data = await response.json();
                if (data.isAuthenticated) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            }else{
                setUser(null);
            }
        }catch ( error ){
            console.error('Auth check failed:',error);
            setUser(null);
        }finally{
            setLoading(false);
        }
    };

    const login = async ( email , password )=>{
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
            setUser(data.user);
            return{ success : true , data };
        }else{
            return { success : false , error : data.error || 'Login failed.'}
        }
    };

    const register = async ( email , password )=>{
        const response = await fetch('http://localhost:5000/api/auth/register',{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
            },
            credentials : 'include',
            body : JSON.stringify({ email , password })
        });

        const data = await response.json();

        if( response.ok ){
            setUser(data.user);
            return{ success : true , data };
        }else{
            return { success : false , error : data.error || 'Registration failed.'}
        }
    };

    const logout = async () =>{
        try{
            await fetch('http://localhost:5000/api/auth/logout',{
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
        checkAuth
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