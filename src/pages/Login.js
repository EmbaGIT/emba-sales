import {useState, useRef, useContext} from 'react';
import { post } from '../api/Api';
import AuthContext from "../store/AuthContext";

const Login = () => {
    const [isFetching, setIsFetching] = useState(false);
    const passwordInputRef = useRef();
    const usernameInputRef = useRef();
    const [errMessage, setErrorMessage] = useState('');
    console.log("is emba store: ", window.location.host.includes('emba'))
    console.log("host: ", window.location.host)
    const authCtx = useContext(AuthContext);

    const handleForm = (event) => {
        event.preventDefault();
        setIsFetching(true);
        const enteredName = usernameInputRef.current.value;
        const enteredPassword = passwordInputRef.current.value;

        if (enteredPassword.trim().length && enteredName.trim().length) {
            const host = window.location.host.includes('emba') ? 'emba.store' : 'bpaws01l:8081';
            post(`http://${host}/api/auth/login`, { username: enteredName, password: enteredPassword })
                .then((res) => {
                    setIsFetching(false);
                    localStorage.setItem('jwt_token', res.token);
                    res && authCtx.login(res.token);
                    setErrorMessage('');
                }).catch((err) => {
                setIsFetching(false);
                setErrorMessage(err?.response?.data?.message || 'Xəta baş verdi');
            })
        } else if (!enteredPassword.trim().length) {

        }
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-lg-6 mx-auto mt-5">
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={handleForm}>
                                <div className="form-group mb-3">
                                    <label htmlFor="fname" className="mb-1">İstifadəçi adı:</label>
                                    <input type="text" id="username" name="username" className="form-control"
                                           ref={usernameInputRef} required/>
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="lname" className="mb-1">Şifrə:</label>
                                    <input type="password" id="password" name="password" className="form-control"
                                           ref={passwordInputRef} required/>
                                </div>
                                <div className="text-danger font-weight-semibold mb-2">{errMessage}</div>
                                <button className="btn btn-primary" disabled={isFetching ? true : false}>
                                    Daxil Ol
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
