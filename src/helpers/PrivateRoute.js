import {useContext} from 'react';
import { Route, Redirect } from 'react-router-dom';
import AuthContext from "../store/AuthContext";

const PrivateRoute = ({component: Component, ...rest}) => {
    const authCtx = useContext(AuthContext);
    return (
        <Route {...rest} render={props => (
            authCtx.isLoggedIn ?
                <Component {...props} />
                : <Redirect to="/login" />
        )} />
    );
};

export default PrivateRoute;
