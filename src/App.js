import {useEffect, useState, createContext} from "react";
import PrivateRoute from "./helpers/PrivateRoute";
import {
    Switch,
    Route
} from "react-router-dom";
import Layout from "./layout/Layout";
import {get} from "./api/Api";
import Home from './pages/HomePage';
import Category from './pages/Category/CategoryList';
import Product from './pages/Product/ProductDetail';
import SearchResult from './pages/SearchResult';
import CartProvider from "./store/CartProvider";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Cart/Checkout";
import OrderInfo from "./pages/Cart/OrderInfo";
import Login from "./pages/Login";
export const IsAuth = createContext(null);

const App = () => {
    const [isUserAuth, setIsUserAuth] = useState(!!localStorage.getItem('jwt_token'));
    const [menuList, setMenuList] = useState([]);
    const [isFetchingData, setIsFetchingData] = useState(true);

    console.log(isUserAuth);

    useEffect(() => {
        if(isUserAuth){
            get(`/menu/search?sort=menuOrder,desc&size=20`).then(res => {
                const menuListArr = [];
                res.content.forEach(menu => {
                    get(`http://bpaws01l:8089/api/image/resource?bucket=emba-store-icon&parent=${menu.id}`).then(file => {
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
        }
    }, [])

    return (
        <CartProvider>
            <Layout menuData={menuList}>
                <Switch>
                    {!isUserAuth && (
                        <Route path='/login'>
                            <Login/>
                        </Route>
                    )}
                    <PrivateRoute path='/' exact>
                        <Home menuData={menuList}/>
                    </PrivateRoute>
                    <PrivateRoute path='/category/:id' component={Category}/>
                    <PrivateRoute path='/product/:id' component={Product}/>
                    <PrivateRoute path='/search' component={SearchResult}/>
                    <PrivateRoute path='/cart' exact component={Cart}/>
                    <PrivateRoute path='/checkout' exact component={Checkout}/>
                    <PrivateRoute path='/orderInfo' exact component={OrderInfo}/>
                </Switch>
            </Layout>
        </CartProvider>

    );
}

export default App;