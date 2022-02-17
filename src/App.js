import {useEffect, useState, createContext, useContext} from "react";
import PrivateRoute from "./helpers/PrivateRoute";
import {
    Switch,
    Route
} from "react-router-dom";
import Layout from "./layout/Layout";
import {get} from "./api/Api";
import Home from './pages/HomePage';
import Product from './pages/Product/ProductDetail';
import SearchResult from './pages/SearchResult';
import CartProvider from "./store/CartProvider";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Cart/Checkout";
import OrderPrint from "./pages/Order/OrderPrint";
import Login from "./pages/Login";
import AllOrders from "./pages/OrderHistory/AllOrders";
import CategoryList from "./pages/Category/CategoryList";
import Reports from "./pages/Reports/Reports";
import ReportOptions from "./pages/Reports/ReportOptions";
import Warehouse from "./pages/Reports/Warehouse";
import Stock from "./pages/Reports/Stock";
import Sales from "./pages/Reports/Sales";
import { getHost } from "./helpers/host";
import authContext from "./store/AuthContext";

export const IsAuth = createContext(null);

const App = () => {
    const authCtx = useContext(authContext)
    const [isUserAuth, setIsUserAuth] = useState(authCtx.token);
    const [menuList, setMenuList] = useState([]);
    const [isFetchingData, setIsFetchingData] = useState(true);

    useEffect(() => {
        setIsUserAuth(authCtx.token);
    }, [authCtx])

    useEffect(() => {
        if(isUserAuth){
            get(`/menu/search?sort=menuOrder,desc&size=20`).then(res => {
                const menuListArr = [];
                res.content.forEach((menu, i) => {
                    get(`${getHost('files', 8089)}/logo?bucket=emba-store-icon`).then(file => {
                        const menuFile = file.filter(f => f.categoryId === menu.id);

                        menuListArr.push({
                            ...menu,
                            file: menuFile
                        });
                        menuListArr.sort(
                            (a, b) => parseInt(a.id) - parseInt(b.id)
                        );
                        setMenuList(prevState => ([
                            ...menuListArr
                        ]))

                        if (i === res.content.length - 1) {
                            setIsFetchingData(false);
                        }
                    })
                })
            }).catch(err => console.log(err));
        }
    }, [isUserAuth])

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
                        <Home menuData={menuList} isFetching={isFetchingData} />
                    </PrivateRoute>
                    <PrivateRoute path='/category/:id/:page' component={CategoryList}/>
                    <PrivateRoute path='/product/:brand/:category_id/:parent_id' component={Product}/>
                    <PrivateRoute path='/search' component={SearchResult}/>
                    <PrivateRoute path='/cart' exact component={Cart}/>
                    <PrivateRoute path='/checkout' exact component={Checkout}/>
                    <PrivateRoute path='/orderPrint/:id' exact component={OrderPrint}/>
                    <PrivateRoute path='/allOrder' exact component={AllOrders}/>
                    <PrivateRoute path='/reports' exact component={Reports} />
                    <PrivateRoute path='/reports/options' exact component={ReportOptions} />
                    <PrivateRoute path='/reports/warehouse/:page/:pageSize' exact component={Warehouse} />
                    <PrivateRoute path='/reports/fabric/:page/:pageSize' exact>
                        <Stock stock={{ key: 'fabric' }}/>
                    </PrivateRoute>
                    <PrivateRoute path='/reports/chair/:page/:pageSize' exact>
                        <Stock stock={{ key: 'chair' }} />
                    </PrivateRoute>
                    <PrivateRoute path='/reports/sales' exact component={Sales} />
                </Switch>
            </Layout>
        </CartProvider>

    );
}

export default App;