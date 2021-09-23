import React from "react";
import {Link} from "react-router-dom";

const Home = (props) => {
    return (
        <div className="row py-5">
            {props.menuData && props.menuData.map((menu, index) => (
                <div key={index} className="col-md-3 mb-3">
                    <Link to={`category/${menu.attributes.id}`}>
                        <div className="category-box">
                            <div className="category-hover-box">
                                {menu.file.map(file => (
                                    <img src={file.objectUrl} className="category-box-image" alt=""/>
                                ))}
                                <div className="category-name">{menu.nameAz}</div>
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    )
}

export default Home;