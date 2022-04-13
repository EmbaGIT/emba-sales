import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import jwt from "jwt-decode";

const menuItems = [
    {title: 'Mənim Satışlarım', url: 'sales'},
    {title: 'Qarşılıqlı Hesablaşmalar', url: ''},
    {title: 'Anbar Qalığı', url: 'options'},
    {title: 'Price List', url: 'pricelist'}
]

const Reports = () => {
    const [brand, setBrand] = useState("");

    const getUser = () => {
        const token = localStorage.getItem("jwt_token");
        return token && jwt(token);
    }

    useEffect(() => {
        setBrand(getUser().brand);
    }, []);

    return (
        <div>
            <div className="row">
                {
                    menuItems.map((item, i) => (
                        <React.Fragment key={i}>
                            {
                                (brand === "Madeyra" && item.title === "Price List")
                                    ? null
                                    : <div className="col-lg-3 col-md-4 mb-3">
                                        <Link to={`/reports/${item.url}`}>
                                            <div className='category-box'>
                                                <div className="category-hover-box">
                                                    <span className='category-name'>{item.title}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                            }
                        </React.Fragment>
                    ))
                }
            </div>
        </div>
    )
}

export default Reports;