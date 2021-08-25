import React, {useEffect, useState} from "react";
import logo from '../assets/images/logo.png';
import {NavLink} from "react-router-dom";
import {get} from "../api/Api";

const Header = () => {

    const [menuList, setMenuList] = useState([]);
    const [isFetchingData, setIsFetchingData] = useState(true);

    useEffect(() => {
        get(`/menu`).then(res => {
            const menuListArr=[];
            res.forEach(menu => {
                get(`http://bpaws07l:8082/api/files/resource?resourceId=${menu.id}&bucket=mobi-c&folder=menu-logo`).then(file => {
                    menuListArr.push({
                        ...menu,
                        file
                    });
                    menuListArr.sort(
                        (a, b) => parseInt(a.id) - parseInt(b.id)
                    );
                    setMenuList(prevState => ([
                        ...menuListArr
                    ]))
                })
            })
        }).catch(err => console.log(err)).finally(() => {
            setIsFetchingData(false)
        });
    }, [])

    if (isFetchingData) {
        return (
            <div className="d-flex align-items-center justify-content-center">

            </div>
        )
    }

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
                    <a className="navbar-brand mt-2 mt-lg-0" href="#">
                        <img
                            src={logo}
                            style={window.innerWidth > 586 ? {maxWidth: '200px'} : {maxWidth: '160px'}}
                            alt=""
                            loading="lazy"
                        />
                    </a>
                    <div className="position-relative">
                        <span className="dropdown-toggle d-flex align-items-center"
                              data-mdb-toggle="dropdown"
                              aria-expanded="false"
                              id="navbarDropdownMenuLink"
                        >Kateqoriyalar</span>
                        <ul
                            className="dropdown-menu dropdown-menu-end"
                            aria-labelledby="navbarDropdownMenuLink"
                        >
                            {menuList && menuList.map(menu => (
                                <li key={menu.id}><NavLink to='/product/250' className="dropdown-item">{menu.nameAz}</NavLink></li>
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

                    <div>
                        <span
                            className="dropdown-toggle d-flex align-items-center hidden-arrow"
                            id="navbarDropdownProfile"
                            role="button"
                            data-mdb-toggle="dropdown"
                            aria-expanded="false"
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