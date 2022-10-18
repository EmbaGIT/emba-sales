import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import jwt from "jwt-decode";
import {get} from "../../api/Api";

const menuItems = [
    {title: 'Mənim Satışlarım', url: 'sales'},
    {title: 'Qarşılıqlı Hesablaşmalar', url: 'settlements'},
    {title: 'Anbar Qalığı', url: 'options'},
    {title: 'Distribütorun Mağazaya Satışı', url: 'sales-detailed'}
    // {title: 'Price List', url: 'pricelist'}
]

const Reports = () => {
    const [brand, setBrand] = useState("");
    const [isAccountant, setIsAccountant] = useState(false)

    const getUser = () => {
        const token = localStorage.getItem("jwt_token");
        return token && jwt(token);
    }

    useEffect(() => {
        if (getUser().roles.includes('ACCOUNTANT')) {
            setIsAccountant(true)
        } else {
            setIsAccountant(false)
        }
    })

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
                                (brand === "Madeyra" && item.title === "Price List") ||
                                (!isAccountant && (item.url.includes('settlement') || item.url.includes('sales-detailed')))
                                    ? null
                                    : <div className="col-lg-3 col-md-4 mb-3">
                                        <Link to={`/reports/${item.url}`} className='d-block h-100'>
                                            <div className='category-box h-100 d-flex align-items-center justify-content-center'>
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
                {
                    isAccountant
                        ? <div className="col-lg-3 col-md-4 mb-3">
                            <Link to='/reports/sales-reserve' className='d-block h-100'>
                                <div className='category-box h-100 d-flex align-items-center justify-content-center'>
                                    <div className="category-hover-box">
                                        <span className='category-name'>Rezervdə olan sifarişlər</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        : null
                }
                {
                    brand === 'Embawood' ? <div className="col-lg-3 col-md-4 mb-3">
                        <a href='https://1drv.ms/x/s!ArrmD3gpN8JGc6afQd0dC7EsRaw?e=oO3oX6' className='d-block h-100' target='_blank'>
                            <div className='category-box h-100 d-flex align-items-center justify-content-center'>
                                <div className="category-hover-box">
                                    <span className='category-name'>Embawood Price List</span>
                                </div>
                            </div>
                        </a>
                    </div> : null
                }
            </div>
        </div>
    )
}

export default Reports;