import React from 'react';
import ReactDOM from 'react-dom';
import {ApolloProvider, ApolloClient, InMemoryCache} from "@apollo/client";
import App from './App';
import {ToastContainer} from 'react-toastify';
import {BrowserRouter as Router} from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.min.css';

const client = new ApolloClient({
    uri: "http://192.168.3.86:8088/graphql",
    cache: new InMemoryCache(),
    /*fetchOptions: {
        mode: 'no-cors',
    },
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers":
            "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
    },
    credentials: "omit",*/
});

ReactDOM.render(
    <Router>
        <ToastContainer/>
        <React.StrictMode>
            <ApolloProvider client={client}>
                <App/>
            </ApolloProvider>
        </React.StrictMode>
    </Router>,
    document.getElementById('root')
);

