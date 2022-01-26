import React from "react";
import { Link } from "react-router-dom";

const ReportOptions = () => {
    return (
        <div className='container-fluid row'>
            <div className="col-lg-3 col-md-4 mb-3">
                <Link to='/reports/warehouse/0/10'>
                    <div className='category-box'>
                        <div className="category-hover-box">
                            <span className='category-name'>Anbar qalığı</span>
                        </div>
                    </div>
                </Link>
            </div>
            <div className="col-lg-3 col-md-4 mb-3">
                <Link to='/reports/fabric/0/10'>
                    <div className='category-box'>
                        <div className="category-hover-box">
                            <span className='category-name'>Parça qalığı</span>
                        </div>
                    </div>
                </Link>
            </div>
            <div className="col-lg-3 col-md-4 mb-3">
                <Link to='/reports/chair/0/10'>
                    <div className='category-box'>
                        <div className="category-hover-box">
                            <span className='category-name'>Stul qalığı</span>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
};

export default ReportOptions;