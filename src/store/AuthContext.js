import React, {useState} from 'react';

const AuthContext = React.createContext({
    token: '',
    isLoggedIn: false,
    login: (token) => {},
    logout: () => {},
});

export const AuthContextProvider = (props) => {
    const [token, setToken] = useState(!!localStorage.getItem('jwt_token'));
    const isLoggedIn = !!token;

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
        token: token,
        isLoggedIn: isLoggedIn,
        login: loginHandler,
        logout: logoutHandler,
    };

    return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>
};

export default AuthContext;