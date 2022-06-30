import React, {useContext, useEffect, useState} from "react";
import logo from '../assets/images/embastore.png';
import CartContext from "../store/CartContext";
import AuthContext from "../store/AuthContext";
import {Link, NavLink, useHistory} from "react-router-dom";
import ProductSearch from "../components/productSearch";
import {get} from "../api/Api";
import {getHost} from "../helpers/host";
import jwt from "jwt-decode";

const Header = (props) => {
    const cartCtx = useContext(CartContext);
    const authCtx = useContext(AuthContext);
    const logout = () => {
        authCtx.logout();
    };

    const [isDualUser, setIsDualUser] = useState(false)
    const [selectedBrand, setSelectedBrand] = useState('Embawood')
    const history = useHistory()

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

            if (decodedToken.brand.includes('/'))
                setIsDualUser(true)
        }
    }, [authCtx.isLoggedIn])

    useEffect(() => {
        if (isDualUser)
            refreshToken()
    }, [isDualUser, selectedBrand])

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
            <div className="container-fluid row">
                <div className="col-lg-3 col-md-3 order-lg-1">
                    <div className="d-flex flex-grow-1 align-items-center" id="navbarSupportedContent">
                        <Link className="navbar-brand mt-lg-0" to="/">
                            <img
                                src={logo}
                                style={window.innerWidth > 586 ? {maxWidth: '200px'} : {maxWidth: '160px'}}
                                alt=""
                                loading="lazy"
                            />
                        </Link>
                        {/*{authCtx.isLoggedIn && (*/}
                        {/*<div className="position-relative">*/}
                        {/*    <span className="dropdown-toggle d-flex align-items-center"*/}
                        {/*          data-mdb-toggle="dropdown"*/}
                        {/*          aria-expanded="false"*/}
                        {/*          role="button"*/}
                        {/*          id="navbarDropdownMenuLink"*/}
                        {/*    >Kateqoriyalar</span>*/}
                        {/*    <ul*/}
                        {/*        className="dropdown-menu dropdown-menu-end"*/}
                        {/*        aria-labelledby="navbarDropdownMenuLink"*/}
                        {/*    >*/}
                        {/*        {props.menuData && props.menuData.map(menu => (*/}
                        {/*            <li key={menu.id}><Link to={`/category/${menu.attributes.id}/0`}*/}
                        {/*                                    className="dropdown-item">{menu.nameAz}</Link></li>*/}
                        {/*        ))}*/}
                        {/*    </ul>*/}
                        {/*</div>)}*/}
                    </div>
                </div>
                <div className="col-lg-6 col-md-9 order-lg-3">
                    <div className="d-flex align-items-center justify-content-end">
                        {authCtx.isLoggedIn && isDualUser && (
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

                        {authCtx.isLoggedIn && (
                            <Link to="/reports">
                                <span className="text-reset me-5" role="button">
                                    <i className="fas fa-file-invoice text-body" style={{fontSize: '20px'}}></i>
                                </span>
                            </Link>
                        )}

                        {authCtx.isLoggedIn && (
                        <div className="position-relative">
                            <Link to="/cart">
                            <span
                                className="text-reset me-5"
                                role="button">
                                <i className="fas fa-shopping-cart text-body" style={{fontSize: '20px'}}/>
                                <span
                                    className="badge rounded-pill badge-notification bg-danger">{numberOfCartItem}</span>
                            </span>
                            </Link>
                        </div>
                        )}
                        {authCtx.isLoggedIn && (
                        <NavLink to="/allOrder"><i className="fas fa-cloud-download-alt me-5 text-body"
                                                style={{fontSize: '20px'}}/></NavLink>)}

                        <div className="">
                            <button type="button" className="btn btn-primary" onClick={logout}>Çıxış</button>
                        </div>
                    </div>
                </div>
                {authCtx.isLoggedIn && (
                    <div className="col-lg-3 col-md-12 order-lg-2">
                        <ProductSearch/>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Header;