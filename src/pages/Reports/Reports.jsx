import React from "react";
import { Link } from "react-router-dom";

const menuItems = [
    { title: 'Mənim Satışlarım', url: 'sales' },
    { title: 'Qarşılıqlı Hesablaşmalar', url: '' },
    { title: 'Anbar Qalığı', url: 'options' },
    { title: 'Price List', url: 'pricelist' }
]

const Reports = () => {
    return (
        <div>
            <div className="row">
                {
                    menuItems.map((item, i) => (
                        <div key={i} className="col-lg-3 col-md-4 mb-3">
                            <Link to={`/reports/${item.url}`}>
                                <div className='category-box'>
                                    <div className="category-hover-box">
                                        <span className='category-name'>{item.title}</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Reports;