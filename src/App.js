import React, {useEffect, useState} from "react";
import {
    Switch,
    Route
} from "react-router-dom";
import Layout from "./layout/Layout";
import {get} from "./api/Api";
import Loader from "react-loader-spinner";
import Home from './pages/HomePage';
import Category from './pages/Category/CategoryList';
import Product from './pages/Product/ProductDetail';
import CartProvider from "./store/CartProvider";

const App = () => {
    const [menuList, setMenuList] = useState([]);
    const [isFetchingData, setIsFetchingData] = useState(true);

    useEffect(() => {
        get(`menu/search?sort=menuOrder,desc`).then(res => {
            const menuListArr = [];
            res.content.forEach(menu => {
                get(`http://bpaws10l:8082/api/files/resource?resourceId=${menu.id}&bucket=mobi-c&folder=menu-logo`).then(file => {
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
            setIsFetchingData(false)
        }).catch(err => console.log(err))
    }, [])

    return (
        <CartProvider>
            {isFetchingData &&
            <div className="d-flex align-items-center justify-content-center">
                <Loader
                    type="ThreeDots"
                    color="#00BFFF"
                    height={60}
                    width={60}/>
            </div>}
            {!isFetchingData && menuList.length > 0 && <Layout menuData={menuList}>
                <Switch>
                    <Route path='/' exact>
                        <Home menuData={menuList}/>
                    </Route>
                    <Route path='/category/:id'>
                        <Category/>
                    </Route>
                    <Route path='/product/:id'>
                        <Product/>
                    </Route>
                </Switch>
            </Layout>
            }
        </CartProvider>

    );
}

export default App;