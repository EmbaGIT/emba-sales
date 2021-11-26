import React, {useEffect, useState} from 'react';
import jwt_decode from 'jwt-decode';

const AuthContext = React.createContext({
    token: '',
    user_uid: '',
    isLoggedIn: false,
    login: (token) => {},
    logout: () => {},
});

export const AuthContextProvider = (props) => {
    const [token, setToken] = useState(!!localStorage.getItem('jwt_token'));
    const isLoggedIn = !!token;
    const decoded = token && jwt_decode(localStorage.getItem('jwt_token'));
    const uid = decoded && decoded.uid;

    useEffect(() => {
        if(!token){
            localStorage.removeItem("cart");
        }
    }, []);

    const logoutHandler = () => {
        setToken(null);
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("cart");
        window.location.href = '/login';
    };

    const loginHandler = (token) => {
        setToken(token);
        localStorage.setItem("jwt_token", token);
        window.location.href = '/';
    };

    const contextValue = {
        token: localStorage.getItem('jwt_token'),
        user_uid: uid,
        isLoggedIn: isLoggedIn,
        login: loginHandler,
        logout: logoutHandler,
    };

    return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>
};

export default AuthContext;