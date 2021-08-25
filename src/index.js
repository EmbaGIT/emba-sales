import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {ToastContainer, Flip} from 'react-toastify';
import {BrowserRouter as Router} from 'react-router-dom';

ReactDOM.render(
    <Router>
        <ToastContainer transition={Flip}/>
        <React.StrictMode>
            <App/>
        </React.StrictMode>
    </Router>,
    document.getElementById('root')
);

