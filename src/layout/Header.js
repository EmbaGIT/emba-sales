import React, {useContext} from "react";
import logo from '../assets/images/logo.png';
import CartContext from "../store/CartContext";
import {Link, NavLink} from "react-router-dom";

const Header = (props) => {

    const cartCtx = useContext(CartContext);

    const numberOfCartItem = cartCtx.items.reduce((cardNumber, item) => {
        console.log("cardNumber", cardNumber);
        console.log("item", item);
        return cardNumber + item.amount
    }, 0)

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
                                className="text-reset me-3"
                                role="button">
                                <i className="fas fa-shopping-cart text-body"/>
                                <span className="badge rounded-pill badge-notification bg-danger">{numberOfCartItem}</span>
                            </span>
                        </Link>
                    </div>

                    <NavLink to="/wishlist"><i className="fas fa-heart me-3 text-body"/></NavLink>

                    <div className="">
                        <button type="button" className="btn btn-primary">Çıxış</button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Header;