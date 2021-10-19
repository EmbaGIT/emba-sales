import React from 'react';
import ReactDOM from 'react-dom';
import {ApolloProvider, ApolloClient, InMemoryCache} from "@apollo/client";
import App from './App';
import {ToastContainer} from 'react-toastify';
import {BrowserRouter as Router} from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.min.css';

const client = new ApolloClient({
    uri: "http://bpaws01l:8088/graphql",
    cache: new InMemoryCache(),
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

