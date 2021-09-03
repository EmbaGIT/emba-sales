import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {ToastContainer} from 'react-toastify';
import {BrowserRouter as Router} from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.min.css';

ReactDOM.render(
    <Router>
        <ToastContainer/>
        <React.StrictMode>
            <App/>
        </React.StrictMode>
    </Router>,
    document.getElementById('root')
);

