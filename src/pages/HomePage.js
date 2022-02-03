import React, {useContext} from "react";
import {Link} from "react-router-dom";
import AuthContext from "../store/AuthContext";
import Login from "./Login";
import Loader from "react-loader-spinner";

const Home = (props) => {
    const authContext= useContext(AuthContext);
    return (
        <React.Fragment>
            {authContext.isLoggedIn &&
            <div className="row py-3">
                {props.isFetching &&
                    <div
                        className="col-12 d-flex justify-content-center position-absolute"
                        style={{backdropFilter: "blur(2px)", zIndex: "100"}}>
                        <Loader
                            type="ThreeDots"
                            color="#00BFFF"
                            height={60}
                            width={60}/>
                    </div>
                }

                {!props.isFetching && props.menuData && props.menuData.map((menu, index) => (
                    <div key={index} className="col-lg-3 col-md-4 mb-3">
                        <Link to={`category/${menu.attributes.id}/0`}>
                            <div className="category-box">
                                <div className="category-hover-box">
                                    {menu.file.map((file, index) => (
                                        <img key={index} src={file?.url} className="category-box-image" alt=""/>
                                    ))}
                                    <div className="category-name">{menu.nameAz}</div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
            }
            {!authContext.isLoggedIn && <Login/>}
        </React.Fragment>
    );
}

export default Home;