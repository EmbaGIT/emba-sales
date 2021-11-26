import React, {useContext, useEffect, useState} from "react";
import {get, post, remove} from "../../api/Api";
import AuthContext from "../../store/AuthContext";
import {useQuery} from "../../hooks/useQuery";
import ReactPaginate from "react-paginate";
import OrderInfo from "./OrderInfo";

const AllOrders = () => {
    const query = useQuery();
    const currentPage = query.get("page") || 0;
    const [page, setPage] = useState(+currentPage);
    const authCtx = useContext(AuthContext);
    const [rows, setRows] = useState(1);
    const [orderState, setOrderState] = useState([]);
    const [pageState, setPageState] = useState({});
    const [orderInfo, setOrderInfo] = useState({});
    const [cartIsShown, setCartIsShown] = useState(false);

    useEffect(() => {
        post(`http://bpaws01l:8087/api/order/search?user_uid.equals=${authCtx.user_uid}&size=10&page=${page}`).then(res => {
            const orders=[];
            res.content.forEach(order => {
                let totalPrice=0;
                order.goods.map(item => {
                    totalPrice += (item.product_price*item.product_quantity - (item.product_price*item.product_quantity*item.product_discount/100));
                })
                orders.push({
                    ...order,
                    totalPrice
                })
            })
            setOrderState(orders);
            setRows(page === 0 ? 1 : (page * 10) + 1);
            setPageState(res);
        })
    }, [page]);

    const handleModuleInfo = (id) => {
        post(`http://bpaws01l:8087/api/order/search?id.equals=${id}`).then(resOrderInfo => {
            const products = [];
            let total_price=0;
            let discount_total_price=0;
            resOrderInfo.content[0].goods.map(item => {
                total_price += item.product_price * item.product_quantity;
                discount_total_price += item.product_price * item.product_quantity - item.product_quantity * item.product_price * item.product_discount / 100;
                get(`/products/uid/${item.product_uid}`).then(res => {
                    products.push({
                        ...item,
                        product_name: res.name
                    });
                    products.sort(
                        (a, b) => parseInt(a.id) - parseInt(b.id)
                    );
                    setOrderInfo(prevstate => ({
                        ...resOrderInfo.content[0],
                        goods: products,
                        totalPrice: total_price,
                        discountPrice: discount_total_price
                    }))
                })
            })
            showCartHandler();
        })
    }

    const showCartHandler = () => {
        setCartIsShown(true);
    };

    const hideCartHandler = () => {
        setCartIsShown(false);
        setOrderInfo([]);
    };

    const deleteGoodFromOrder = (id) => {
        console.log(`http://bpaws01l:8087/api/order/goods/${id}`)
        remove(`http://bpaws01l:8087/api/order/goods/${id}`).then(res => {
            console.log(res)
        })
    }

    const handleUpdateOrder = () => {

    }

    const paginate = (n) => {
        setPage(+n.selected);
    }

    return (
        <div>
            <div className="row mb-2">
                <div className="col-lg-12 col-md-12">
                    <h3 className="fm-poppins">Satıcı sifarişləri</h3>
                </div>
                <div className="col-lg-12">
                    {orderState.length ?
                        <div>
                            <div className="table-responsive">
                                <table className="table bordered striped">
                                    <thead>
                                    <tr>
                                        <th scope='col'>#</th>
                                        <th scope='col'>Müştəri adı</th>
                                        <th scope='col'>Sifariş statusu</th>
                                        <th scope='col'>Sifariş tarixi</th>
                                        <th scope='col'>Ümumi Qiymət</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {orderState && orderState.map((order, i) => (
                                        <tr key={i}>
                                            <td>{+i + rows}</td>
                                            <td><span className="cursor-pointer text-primary font-weight-bolder" onClick={handleModuleInfo.bind(null, order.id)}>{order.client_name}</span></td>
                                            <td>
                                                {order.status === 'ORDER_FAILED' &&
                                                <span className="badge bg-warning text-dark">Uğursuz siafriş</span>}
                                                {order.status === 'ORDERED' &&
                                                <span className="badge bg-success">Tamamlandı</span>}
                                                {order.status === 'SAVED' &&
                                                <span className="badge bg-primary">Yadda saxlanılan</span>}
                                            </td>
                                            <td>{order.createdAt} {order.creationTime}</td>
                                            <td>{order.totalPrice} AZN</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            {cartIsShown && <OrderInfo onClose={hideCartHandler} info={orderInfo}
                                                   onItemDelete={deleteGoodFromOrder} onUpdateOrder={handleUpdateOrder}/>}
                            <ReactPaginate
                                previousLabel={'Əvvəlki'}
                                nextLabel={'Növbəti'}
                                previousClassName={'page-item'}
                                nextClassName={'page-item'}
                                previousLinkClassName={'page-link'}
                                nextLinkClassName={'page-link'}
                                breakLabel={'...'}
                                breakClassName={'break-me'}
                                pageCount={pageState?.totalPages || 0}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={3}
                                onPageChange={paginate}
                                containerClassName={'pagination'}
                                activeClassName={'active'}
                                pageClassName={'page-item'}
                                pageLinkClassName={'page-link'}
                                initialPage={page}
                            />
                        </div>
                        : <p className="text-center">Heç bir məlumat tapılmadı.</p>}
                </div>
            </div>
        </div>
    )

}

export default AllOrders;