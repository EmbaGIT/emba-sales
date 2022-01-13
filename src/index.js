import React from 'react';
import ReactDOM from 'react-dom';
import {ApolloProvider, ApolloClient, InMemoryCache} from "@apollo/client";
import App from './App';
import {ToastContainer} from 'react-toastify';
import {BrowserRouter as Router} from 'react-router-dom';
import {AuthContextProvider} from "./store/AuthContext";
import 'react-toastify/dist/ReactToastify.min.css';

const client = new ApolloClient({
    uri: "http://bpaws01l:8088/graphql",
    cache: new InMemoryCache(),
});

ReactDOM.render(
    <Router>
        <ToastContainer/>
        <AuthContextProvider>
            <ApolloProvider client={client}>
                <App/>
            </ApolloProvider>
        </AuthContextProvider>
    </Router>,
    document.getElementById('root')
);

