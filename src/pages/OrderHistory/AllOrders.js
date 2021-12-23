import React, {useContext, useEffect, useState} from "react";
import {get, post, remove} from "../../api/Api";
import AuthContext from "../../store/AuthContext";
import {useQuery} from "../../hooks/useQuery";
import ReactPaginate from "react-paginate";
import OrderInfo from "./OrderInfo";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import DatePicker from "react-datepicker";
import {formattedDate} from "../../helpers/formattedDate";

const AllOrders = () => {
    // const query = useQuery();
    // const currentPage = query.get("page") || 0;
    const [page, setPage] = useState(0);
    const authCtx = useContext(AuthContext);
    const [rows, setRows] = useState(1);
    const [statusValue, setStatusValue] = useState('all');
    const [orderState, setOrderState] = useState([]);
    const [pageState, setPageState] = useState({});
    const [orderInfo, setOrderInfo] = useState({});
    const [cartIsShown, setCartIsShown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchByDate, setSearchByDate] = useState({
        start_date: '',
        end_date: ''
    });

    const orderList = (list, page) => {
        const orders=[];
        list.content.forEach(order => {
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
    }

    useEffect(() => {
        post(`http://bpaws01l:8087/api/order/search?user_uid.equals=${authCtx.user_uid}&size=10&page=${page}&size=10`).then(res => {
            orderList(res, page);
            setPageState(res);
        })
    }, [page]);

    const handleModuleInfo = (id) => {
        post(`http://bpaws01l:8087/api/order/search?id.equals=${id}`).then(resOrderInfo => {
            setOrderInfo(resOrderInfo.content[0])
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

    const handleOrderDelete = (id) => {
        confirmAlert({
            title: '',
            message: 'Sifariş bazadan silinəcək!',
            buttons: [
                {
                    label: 'Sil',
                    onClick: () => {
                        remove(`http://bpaws01l:8087/api/order/${id}`).then(res => {
                            const newList = orderState.filter(item => item.id !== id);
                            setOrderState(newList);
                        })
                    }
                },
                {
                    label: 'Ləğv et',
                    onClick: () => {}
                }
            ]
        });
    }

    const deleteGoodFromOrder = (id) => {
        remove(`http://bpaws01l:8087/api/order/goods/${id}`).then(res => {
            setOrderInfo(res)
        })
    }

    const handleInputChange = (type, value) => {
        if(type === "start_date" || type==="end_date"){
            setSearchByDate(prevState => ({
                ...prevState,
                [type]: value
            }))
        }
    }

    const onSearchDate = () => {
        if(searchByDate.start_date || searchByDate.end_date){
            post(`http://bpaws01l:8087/api/order/search?user_uid.equals=${authCtx.user_uid}&creationDate.greaterThan=${formattedDate(searchByDate.start_date)}&creationDate.lessThan=${formattedDate(searchByDate.end_date)}&size=10&page=${page}&size=10`).then(res =>{
                orderList(res, 0);
                setPageState(res);
            }).catch(err => console.log(err))
        }
    }

    const handleNameSearch = (value) => {
        if(value.trim().length > 3){
            setIsLoading(true);
            post(`http://bpaws01l:8087/api/order/search?user_uid.equals=${authCtx.user_uid}&client_name.contains=${value}&page=0&size=10`).then(res => {
                orderList(res, 0);
                setPage(0);
                setPageState(res);
            }).catch(err => console.log(err))
        }else{
            setIsLoading(true);
            post(`http://bpaws01l:8087/api/order/search?user_uid.equals=${authCtx.user_uid}&&page=0&size=10`).then(res => {
                orderList(res, 0);
                setPage(0);
                setPageState(res);
            }).catch(err => console.log(err))
        }
    }

    const paginate = (n) => {
        setPage(+n.selected);
        statusFilter(statusValue, n.selected);
    }

    const onStatusFilter = (value) => {
        setStatusValue(value);
        statusFilter(value, 0);
    }

    const statusFilter = (value, pageNumber) => {
        if(value==="all"){
            post(`http://bpaws01l:8087/api/order/search?user_uid.equals=${authCtx.user_uid}&size=10&page=${pageNumber}`).then(res => {
                setPageState(res);
                setPage(pageNumber);
                orderList(res, pageNumber);
            })
        }else{
            post(`http://bpaws01l:8087/api/order/search?user_uid.equals=${authCtx.user_uid}&status.equals=${value}&size=10&page=${pageNumber}`).then(res => {
                setPageState(res);
                setPage(pageNumber);
                orderList(res, pageNumber);
            })
        }
    }

    return (
        <div>
            <div className="mb-2">
                <div className="mt-3 row">
                    <div className="col-md-6">
                        <h6 className="fm-poppins flex-1">Tarix aralığı üzrə axtarış</h6>
                        <div className="row">
                            <div className="col-md-5">
                                <DatePicker
                                    className="form-control"
                                    dateFormat="yyyy-MM-dd"
                                    selected={searchByDate?.start_date ? new Date(searchByDate?.start_date) : ''}
                                    onChange={(date) => handleInputChange("start_date", date)}
                                />
                            </div>
                            <div className="col-md-5">
                                <DatePicker
                                    className="form-control"
                                    dateFormat="yyyy-MM-dd"
                                    selected={searchByDate?.end_date ? new Date(searchByDate?.end_date) : ''}
                                    onChange={(date) => handleInputChange("end_date", date)}
                                />
                            </div>
                            <div className="col-md-2"><button className="btn btn-success btn-xs" onClick={onSearchDate}>Axtar</button></div>
                        </div>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-md-4">
                        <h6 className="fm-poppins flex-1">Filter</h6>
                        <div className="">
                            <select className="form-control form-select" onChange={e => onStatusFilter(e.target.value)}>
                                <option value="all">Bütün sifarişlər</option>
                                <option value="ORDERED">Tamamlanmış</option>
                                <option value="ORDER_FAILED">Uğursuz Sifariş</option>
                                <option value="SAVED">Yadda saxlanılan</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <h6 className="fm-poppins flex-1">Müştəri adı ilə axtarış</h6>
                        <div className="">
                            <input type="text" placeholder="min 3 simvol" onChange={(e) => handleNameSearch(e.target.value)} className="form-control"/>
                        </div>
                    </div>
                </div>
                <div className="mt-3">
                    <div className=""><h4 className="fm-poppins flex-1">Satıcı sifarişləri</h4></div>
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
                                        <th scope='col'>-</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {orderState && orderState.map((order, i) => (
                                        <tr key={i}>
                                            <td>{+i + rows}</td>
                                            <td><span className="cursor-pointer text-primary font-weight-bolder" onClick={handleModuleInfo.bind(null, order.id)}>{order.client_name}</span></td>
                                            <td>
                                                {order.status === 'ORDER_FAILED' &&
                                                <span className="badge bg-warning text-dark">Uğursuz sifariş</span>}
                                                {order.status === 'ORDERED' &&
                                                <span className="badge bg-success">Tamamlandı</span>}
                                                {order.status === 'SAVED' &&
                                                <span className="badge bg-primary">Yadda saxlanılan</span>}
                                            </td>
                                            <td>{order.createdAt} {order.creationTime}</td>
                                            <td>{order.totalPrice} AZN</td>
                                            <td>
                                                {(order.status === 'ORDER_FAILED' || order.status === 'SAVED') &&
                                                <i className="fas fa-trash-alt text-danger cursor-pointer" onClick={handleOrderDelete.bind(this, order.id)}/>}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            {cartIsShown && <OrderInfo onCloseModal={hideCartHandler} info={orderInfo}
                                                   onItemDelete={deleteGoodFromOrder}/>}
                            <div className=" d-flex justify-content-end">
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
                                    forcePage={page}
                                />
                            </div>
                        </div>
                        : <p className="text-center">Heç bir məlumat tapılmadı.</p>}
                </div>
            </div>
        </div>
    )

}

export default AllOrders;