import React, {useContext} from "react";
import logo from '../assets/images/logo.png';
import CartContext from "../store/CartContext";
import {Link, NavLink} from "react-router-dom";

const Header = (props) => {
    const cartCtx = useContext(CartContext);

    const { items } = cartCtx;
    const numberOfCartItem = items.reduce((curNumber, item) => {
        return curNumber + item.amount;
    }, 0);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
            <div className="container-fluid">
                <div className="d-flex flex-grow-1 align-items-center" id="navbarSupportedContent">
                    <Link className="navbar-brand mt-lg-0" to="/">
                        <img
                            src={logo}
                            style={window.innerWidth > 586 ? {maxWidth: '200px'} : {maxWidth: '160px'}}
                            alt=""
                            loading="lazy"
                        />
                    </Link>
                    <div className="position-relative">
                        <span className="dropdown-toggle d-flex align-items-center"
                              data-mdb-toggle="dropdown"
                              aria-expanded="false"
                              role="button"
                              id="navbarDropdownMenuLink"
                        >Kateqoriyalar</span>
                        <ul
                            className="dropdown-menu dropdown-menu-end"
                            aria-labelledby="navbarDropdownMenuLink"
                        >
                            {props.menuData && props.menuData.map(menu => (
                                <li key={menu.id}><Link to={`/category/${menu.attributes.id}`} className="dropdown-item">{menu.nameAz}</Link></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="d-flex align-items-center">
                    <div className="position-relative">
                        <Link to="/cart">
                            <span
                                className="text-reset me-5"
                                role="button">
                                <i className="fas fa-shopping-cart text-body" style={{fontSize: '20px'}}/>
                                <span className="badge rounded-pill badge-notification bg-danger">{numberOfCartItem}</span>
                            </span>
                        </Link>
                    </div>

                    <NavLink to="/saved"><i className="fas fa-cloud-download-alt me-5 text-body" style={{fontSize: '20px'}}/></NavLink>

                    <div className="">
                        <button type="button" className="btn btn-primary">Çıxış</button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Header;