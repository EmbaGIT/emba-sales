import {useEffect, useState, createContext, useContext} from "react";
import PrivateRoute from "./helpers/PrivateRoute";
import {
    Switch,
    Route
} from "react-router-dom";
import Layout from "./layout/Layout";
import {get} from "./api/Api";
import jwt from "jwt-decode";
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
// import Pricelist from "./pages/Reports/Pricelist/Pricelist";
import {getHost} from "./helpers/host";
import authContext from "./store/AuthContext";
import SalesDetailed from "./pages/Reports/SalesDetailed";
import {Settlements} from "./pages/Reports/Settlements";
import {SettlementsEmbakitchen} from "./pages/Reports/SettlementsEmbakitchen";
// import Portfolio from "./pages/Reports/Pricelist/Portfolio";
// import Chair from "./pages/Reports/Pricelist/Chair";
// import Mattress from "./pages/Reports/Pricelist/Mattress";
// import Outsource from "./pages/Reports/Pricelist/Outsource";
// import Tables from "./pages/Reports/Pricelist/Tables";
// import OutOfPortfolio from "./pages/Reports/Pricelist/Out-of-portfolio";
import Instructions from "./pages/Instructions";
import SalesReserve from "./pages/Reports/SalesReserve";
import AnnouncementList from "./pages/Announcement/AnnouncementList";
import AnnouncementItem from './pages/Announcement/AnnouncementItem';
import OrderTracking from "./pages/OrderHistory/OrderTracking";

export const IsAuth = createContext(null);

const App = () => {
    const authCtx = useContext(authContext)
    const [isUserAuth, setIsUserAuth] = useState(authCtx.token);
    const [menuList, setMenuList] = useState([]);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [isAccountant, setIsAccountant] = useState(false)

    useEffect(() => {
        setIsUserAuth(authCtx.token);

        if (authCtx.token) {
            setIsAccountant(jwt(authCtx.token).roles.includes('ACCOUNTANT'))
        }
    }, [authCtx])

    useEffect(() => {
        if (isUserAuth) {
            get(`/menu/search?sort=menuOrder,desc&size=20`).then(res => {
                const menuListArr = [];
                res.content.forEach((menu, i) => {
                    get(`${getHost('files', 8089)}/api/logo?bucket=emba-store-icon`).then(file => {
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
                        <Home menuData={menuList} isFetching={isFetchingData}/>
                    </PrivateRoute>
                    <PrivateRoute path='/category/:id/:page' component={CategoryList}/>
                    <PrivateRoute path='/product/:brand/:category_id/:parent_id' component={Product}/>
                    <PrivateRoute path='/search' component={SearchResult}/>
                    <PrivateRoute path='/cart' exact component={Cart}/>
                    <PrivateRoute path='/checkout' exact component={Checkout}/>
                    <PrivateRoute path='/orderPrint/:id' exact component={OrderPrint}/>
                    <PrivateRoute path='/allOrder' exact component={AllOrders}/>
                    <PrivateRoute path='/reports' exact component={Reports}/>
                    <PrivateRoute path='/reports/options' exact component={ReportOptions}/>
                    <PrivateRoute path='/reports/warehouse/:page/:pageSize' exact component={Warehouse}/>
                    <PrivateRoute path='/reports/fabric/:page/:pageSize' exact>
                        <Stock stock={{key: 'fabric'}}/>
                    </PrivateRoute>
                    <PrivateRoute path='/reports/chair/:page/:pageSize' exact>
                        <Stock stock={{key: 'chair'}}/>
                    </PrivateRoute>
                    <PrivateRoute path='/reports/sales' exact component={Sales}/>
                    <PrivateRoute path='/reports/sales-reserve' exact component={SalesReserve}/>
                    <PrivateRoute path='/instructions' exact component={Instructions}/>
                    <PrivateRoute path='/announcements' exact component={AnnouncementList}/>
                    <PrivateRoute path='/announcements/:id' exact component={AnnouncementItem}/>
                    <PrivateRoute path='/order-tracking' exact component={OrderTracking}/>
                    {
                        isAccountant && (
                            <>
                                <PrivateRoute path='/reports/sales-detailed' exact component={SalesDetailed}/>
                                <PrivateRoute path='/reports/settlements' exact component={Settlements}/>
                                <PrivateRoute path='/reports/settlements/embakitchen' exact component={SettlementsEmbakitchen}/>
                            </>
                        )
                    }
                    {/*<PrivateRoute path='/reports/pricelist' exact component={Pricelist} />*/}
                    {/*<PrivateRoute path='/reports/pricelist/portfolio' exact component={Portfolio} />*/}
                    {/*<PrivateRoute path='/reports/pricelist/chair' exact component={Chair} />*/}
                    {/*<PrivateRoute path='/reports/pricelist/mattress' exact component={Mattress} />*/}
                    {/*<PrivateRoute path='/reports/pricelist/outsource' exact component={Outsource} />*/}
                    {/*<PrivateRoute path='/reports/pricelist/tables' exact component={Tables} />*/}
                    {/*<PrivateRoute path='/reports/pricelist/out-of-portfolio' exact component={OutOfPortfolio} />*/}
                </Switch>
            </Layout>
        </CartProvider>

    );
}

export default App;