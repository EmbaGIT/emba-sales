import {useState, useRef, useContext, useEffect} from 'react';
import { post } from '../api/Api';
import AuthContext from "../store/AuthContext";
import { getHost } from "../helpers/host";

const Login = () => {
    const [isFetching, setIsFetching] = useState(false);
    const passwordInputRef = useRef();
    const usernameInputRef = useRef();
    const [errMessage, setErrorMessage] = useState('');
    const authCtx = useContext(AuthContext);

    const handleForm = (event) => {
        event.preventDefault();
        setIsFetching(true);
        const enteredName = usernameInputRef.current.value.trim();
        const enteredPassword = passwordInputRef.current.value.trim();

        if (enteredPassword.length && enteredName.length) {
            post(`${getHost('user', 8081)}/api/auth/login`, { username: enteredName, password: enteredPassword })
                .then((res) => {
                    setIsFetching(false);
                    localStorage.setItem('jwt_token', res.token);
                    res && authCtx.login(res.token);
                    setErrorMessage('');
                }).catch((err) => {
                setIsFetching(false);
                setErrorMessage(err?.response?.data?.message || 'Xəta baş verdi');
            })
        } else if (!enteredPassword.length) {

        }
    };

    useEffect(() => {
        return () => {
            setIsFetching(false);
        }
    }, [])

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
