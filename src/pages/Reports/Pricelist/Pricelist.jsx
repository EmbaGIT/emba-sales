import React from 'react';
import {Link} from "react-router-dom";

const priceListItems = [
    { title: 'Portfel', url: 'pricelist/portfolio' },
    { title: 'Stul-1C', url: 'pricelist/chair' },
    { title: 'Matrasslar-1C', url: 'pricelist/mattress' },
    { title: 'Outsource', url: 'pricelist/outsource' },
    { title: 'JM', url: 'pricelist/tables' },
    // { title: 'Portfeldən çıxanlar', url: 'pricelist/out-of-portfolio' },
]

const Pricelist = () => {
    return (
        <div>
            <div className="row">
                {
                    priceListItems.map((item, i) => (
                        <div key={i} className="col-lg-4 col-md-4 mb-3">
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

export default Pricelist;