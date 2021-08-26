import React from "react";
import logo from '../assets/images/logo.png';
import {Link, NavLink} from "react-router-dom";

const Header = (props) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
            <div className="container">
                <button
                    className="navbar-toggler"
                    type="button"
                    data-mdb-toggle="collapse"
                    data-mdb-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <i className="fas fa-bars"/>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <Link className="navbar-brand mt-2 mt-lg-0" to="/">
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
                        <span
                            className="text-reset me-3 dropdown-toggle hidden-arrow"
                            id="navbarDropdownCart"
                            role="button"
                            data-mdb-toggle="dropdown"
                            aria-expanded="false">
                            <i className="fas fa-shopping-cart"/>
                            <span className="badge rounded-pill badge-notification bg-danger">1</span>
                        </span>
                        <ul
                            className="dropdown-menu dropdown-menu-end"
                            aria-labelledby="navbarDropdownCart">
                            <li>
                                <NavLink to='/product/250' className="dropdown-item">Mehsul</NavLink>
                            </li>
                            <li>
                                <NavLink to='/product/251' className="dropdown-item">Mehsul</NavLink>
                            </li>
                            <li>
                                <NavLink to='/product/252' className="dropdown-item">Mehsul</NavLink>
                            </li>
                        </ul>
                    </div>

                    <NavLink to="/wishlist"><i className="fas fa-heart me-3 text-body"/></NavLink>

                    <div>
                        <span
                            className="dropdown-toggle d-flex align-items-center hidden-arrow"
                            id="navbarDropdownProfile"
                            role="button"
                        >
                            <img
                                src="https://mdbootstrap.com/img/new/avatars/2.jpg"
                                className="rounded-circle"
                                height="25"
                                alt=""
                                loading="lazy"
                            />
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Header;