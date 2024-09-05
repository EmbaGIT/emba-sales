import React, {useContext, useEffect, useState} from "react";
import logo from '../assets/images/embastore.png';
import CartContext from "../store/CartContext";
import AuthContext from "../store/AuthContext";
import {Link, NavLink, useHistory} from "react-router-dom";
import ProductSearch from "../components/productSearch";
import {get, post} from "../api/Api";
import {getHost} from "../helpers/host";
import jwt from "jwt-decode";
import Modal from "../UI/Modal";

const leobankIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="23" height="28" viewBox="0 0 23 28" fill="none">
<path d="M10.1295 17.9923C7.54447 20.0862 5.82902 18.646 3.65995 16.1505C1.49089 13.6551 -0.310404 11.0495 2.27459 8.95554C4.85957 6.86164 8.7135 7.18713 10.8826 9.68255C13.0516 12.178 12.7144 15.8984 10.1295 17.9923Z" fill="#4f4f4f"/>
<path d="M7.79904 4.32804C7.09603 5.50351 5.73644 6.01628 4.76232 5.47336C3.78819 4.93043 3.56841 3.53741 4.27143 2.36194C4.97444 1.18648 6.33403 0.6737 7.30815 1.21662C8.28228 1.75955 8.50206 3.15258 7.79904 4.32804Z" fill="#4f4f4f"/>
<path d="M13.9884 5.84573C13.0846 6.88549 11.6535 7.16256 10.7918 6.46459C9.93015 5.76663 9.96429 4.35792 10.8681 3.31816C11.7718 2.2784 13.203 2.00132 14.0647 2.69929C14.9263 3.39726 14.8922 4.80597 13.9884 5.84573Z" fill="#4f4f4f"/>
<path d="M17.3745 10.8006C16.1569 11.4793 14.7138 11.2671 14.1514 10.3268C13.589 9.38639 14.1202 8.07391 15.3378 7.39525C16.5555 6.7166 17.9985 6.92876 18.5609 7.86913C19.1233 8.8095 18.5922 10.122 17.3745 10.8006Z" fill="#4f4f4f"/>
<path d="M17.2043 17.2417C15.883 17.7059 14.5001 17.255 14.1154 16.2347C13.7307 15.2143 14.4899 14.0108 15.8111 13.5466C17.1323 13.0824 18.5153 13.5332 18.9 14.5536C19.2847 15.5739 18.5255 16.7774 17.2043 17.2417Z" fill="#4f4f4f"/>
</svg>
`

const Header = (props) => {
    const cartCtx = useContext(CartContext);
    const authCtx = useContext(AuthContext);
    const [isAccountant, setIsAccountant] = useState(false);
    const logout = () => {
        authCtx.logout();
    };

    const [isDualUser, setIsDualUser] = useState(false)
    const [selectedBrand, setSelectedBrand] = useState('Embawood')
    const history = useHistory()

    const [isChangePasswordModalShown, setIsChangePasswordModalIsShown] = useState(false)
    const [oldPassword, setOldPassword] = useState('')
    const [oldPasswordMissing, setOldPasswordMissing] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [newPasswordMissing, setNewPasswordMissing] = useState(false)

    const {items} = cartCtx;
    const numberOfCartItem = items.reduce((curNumber, item) => {
        return curNumber + item.amount;
    }, 0);

    const onBrandChange = e => {
        setSelectedBrand(e.target.value)

        if (history.location.pathname.match(/product|category/i))
            history.push('/')
    }

    const refreshToken = () => {
        get(`${getHost('user', 8081)}/api/user/switch/${selectedBrand}`).then(token => {
            localStorage.setItem('jwt_token', token)
        })
    }

    useEffect(() => {
        if (authCtx.isLoggedIn) {
            const lsToken = localStorage.getItem('jwt_token')
            setSelectedBrand(jwt(lsToken).brand)

            if (jwt(lsToken).dual)
                setIsDualUser(true)
        }
    }, [])

    useEffect(() => {
        if (authCtx.isLoggedIn) {
            const lsToken = localStorage.getItem('jwt_token')
            const decodedToken = jwt(lsToken)
            setSelectedBrand(decodedToken.brand)

            if (decodedToken.brand.includes('/'))
                setIsDualUser(true)

            if ((jwt(lsToken)).roles.includes('ACCOUNTANT') || (jwt(lsToken)).roles.includes('SELLER')) {
                setIsAccountant(true);
            }
        }

        return () => setIsAccountant(false);
    }, [authCtx.isLoggedIn])

    useEffect(() => {
        if (isDualUser)
            refreshToken()
    }, [isDualUser, selectedBrand])

    const changePassword = async (e) => {
        e.preventDefault()
        if (!oldPassword.length) {
            setOldPasswordMissing(true)
        } else if (!newPassword.length) {
            setNewPasswordMissing(true)
        } else {
            try {
                const response = await post(
                    `${getHost('payments', 8094)}/api/v1/passcode`,
                    {
                        oldPasscode: oldPassword,
                        newPasscode: newPassword
                    }
                )
                console.log(response)
                setIsChangePasswordModalIsShown(false)
                setOldPassword('')
                setOldPasswordMissing(false)
                setNewPassword('')
                setNewPasswordMissing(false)
            } catch (e) {
                console.log(e)
            }
        }
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
            <div className="container-fluid d-block">
                <div className="row">
                    <div className={authCtx.isLoggedIn ? "col-lg-3 col-md-3 order-lg-1" : 'col-12'}>
                        <div className={`d-flex flex-grow-1 align-items-center ${authCtx.isLoggedIn ? 'justify-content-start' : 'justify-content-center'}`} id="navbarSupportedContent">
                            <Link className="navbar-brand mt-lg-0" to="/">
                                <img
                                    src={logo}
                                    style={window.innerWidth > 586 ? {maxWidth: '200px'} : {maxWidth: '160px'}}
                                    alt=""
                                    loading="lazy"
                                />
                            </Link>
                        </div>
                    </div>
                    {authCtx.isLoggedIn && <div className="col-lg-6 col-md-9 order-lg-3">
                        <div className="d-flex align-items-center justify-content-end">
                            {isAccountant && (
                                <div>
                                    <button
                                        className="change-password"
                                        onClick={() => setIsChangePasswordModalIsShown(true)}
                                    >
                                        <i className="fas fa-unlock"></i>
                                    </button>
                                </div>
                            )}

                            {isDualUser && (
                                <div className='me-3'>
                                    <select
                                        className="form-control form-select"
                                        onChange={e => onBrandChange(e)}
                                        value={selectedBrand}
                                    >
                                        <option value="Embawood">Embawood</option>
                                        <option value="Madeyra">Madeyra</option>
                                    </select>
                                </div>
                            )}

                            {isAccountant && (
                                <Link to="/order-tracking">
                                    <span
                                        className="text-reset me-4"
                                        role="button"
                                        data-toggle="tooltip"
                                        data-placement="left"
                                        title="Özəl sifarişlərin izlənməsi"
                                    >
                                        <i className="fas fa-truck text-body" style={{ fontSize: '20px' }}></i>
                                    </span>
                                </Link>
                            )}

                            {selectedBrand === 'Embawood' && (
                                <a href="https://embawood.az/catalog/view/theme/embawood/catalog/katalog23.pdf" target="_blank" rel="noreferrer">
                                    <span
                                        className="text-reset me-4"
                                        role="button"
                                        data-toggle="tooltip"
                                        data-placement="left"
                                        title="Kataloq"
                                    >
                                        <i className="fas fa-book-reader text-body" style={{ fontSize: '23px' }}></i>
                                    </span>
                                </a>
                            )}

                            <Link to="/announcements">
                                <span
                                    className="text-reset me-4"
                                    role="button"
                                    data-toggle="tooltip"
                                    data-placement="left"
                                    title="Kampaniyalar"
                                >
                                    <i className="fas fa-gift text-body" style={{ fontSize: '23px' }}></i>
                                </span>
                            </Link>

                            <Link to="/instructions">
                                <span
                                    className="text-reset me-4"
                                    role="button"
                                    data-toggle="tooltip"
                                    data-placement="left"
                                    title="Təlimatlar"
                                >
                                    <i className="fas fa-user-graduate text-body" style={{ fontSize: '20px' }}></i>
                                </span>
                            </Link>

                            <Link to="/reports">
                                <span className="text-reset me-4" role="button">
                                    <i className="fas fa-file-invoice text-body" style={{ fontSize: '20px' }}></i>
                                </span>
                            </Link>

                            <div className="position-relative">
                                <Link to="/cart">
                                    <span
                                        className="text-reset me-4"
                                        role="button">
                                        <i className="fas fa-shopping-cart text-body" style={{ fontSize: '20px' }} />
                                        <span
                                            className="badge rounded-pill badge-notification bg-danger">{numberOfCartItem}
                                        </span>
                                    </span>
                                </Link>
                            </div>
                            <NavLink to="/allOrder/0"><i className="fas fa-cloud-download-alt me-4 text-body" style={{ fontSize: '20px' }} />
                            </NavLink>

                            <div>
                                <button type="button" className="btn btn-primary" onClick={logout}>Çıxış</button>
                            </div>
                        </div>
                    </div>}
                    {authCtx.isLoggedIn && (
                        <div className="col-lg-3 col-md-12 order-lg-2">
                            <ProductSearch/>
                        </div>
                    )}
                </div>
            </div>

            {
                isChangePasswordModalShown && (
                    <ChangePasswordModal
                        setIsChangePasswordModalIsShown={setIsChangePasswordModalIsShown}
                        changePassword={changePassword}
                        oldPassword={oldPassword}
                        setOldPassword={setOldPassword}
                        oldPasswordMissing={oldPasswordMissing}
                        setOldPasswordMissing={setOldPasswordMissing}
                        newPassword={newPassword}
                        setNewPassword={setNewPassword}
                        newPasswordMissing={newPasswordMissing}
                        setNewPasswordMissing={setNewPasswordMissing}
                    />
                )
            }
        </nav>
    )
}

const ChangePasswordModal = ({
    setIsChangePasswordModalIsShown,
    changePassword,
    oldPassword,
    setOldPassword,
    oldPasswordMissing,
    setOldPasswordMissing,
    newPassword,
    setNewPassword,
    newPasswordMissing,
    setNewPasswordMissing
}) => (
    <Modal
        noPadding
        onClose={() => {
            setIsChangePasswordModalIsShown(false)
            setOldPassword('')
            setOldPasswordMissing(false)
            setNewPassword('')
            setNewPasswordMissing(false)
        }}
    >
        <div className='card'>
            <div className='list-group-item list-group-item-success'>
                Taksit ləğvi üçün şifrənin dəyişilməsi
            </div>

            <div className='card-body'>
                <form className='leobank-form' onSubmit={changePassword}>
                    <div className='row'>
                        <div className='col-12 mb-3'>
                            <label className='required mb-1'>Hazırki şifrəni daxil edin:</label>
                            <input
                                className='form-control'
                                placeholder='Hazırki şifrə'
                                value={oldPassword}
                                type='password'
                                onChange={(e) => {
                                    setOldPassword(e.target.value)
                                    setOldPasswordMissing(e.target.value.length === 0)
                                }}
                            />
                            {oldPasswordMissing && (
                                <div className='invalid-feedback d-block position-relative mt-1'>
                                    Zəhmət olmasa, hazırki şifrəni daxil edib davam edin!
                                </div>
                            )}
                        </div>
                        <div className='col-12'>
                            <label className='required mb-1'>Yeni şifrəni daxil edin:</label>
                            <input
                                className='form-control'
                                placeholder='Yeni şifrə'
                                value={newPassword}
                                type='password'
                                onChange={(e) => {
                                    setNewPassword(e.target.value)
                                    setNewPasswordMissing(e.target.value.length === 0)
                                }}
                            />
                            {newPasswordMissing && (
                                <div className='invalid-feedback d-block position-relative mt-1'>
                                    Zəhmət olmasa, yeni şifrəni daxil edib davam edin!
                                </div>
                            )}
                        </div>
                        <div className='col-6'>
                            <button
                                type='submit'
                                className='btn btn-block btn-success'
                            >Təsdiq et</button>
                        </div>
                        <div className='col-6'>
                            <button
                                className='btn btn-block btn-danger'
                                onClick={() => {
                                    setIsChangePasswordModalIsShown(false)
                                    setOldPassword('')
                                    setOldPasswordMissing(false)
                                    setNewPassword('')
                                    setNewPasswordMissing(false)
                                }}
                            >Imtina et</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </Modal>
)

export default Header;