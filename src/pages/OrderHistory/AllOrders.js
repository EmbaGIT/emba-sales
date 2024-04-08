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
import { getHost } from "../../helpers/host";
import { LeobankModal } from "../../components/LeobankModal";

const leobankIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="23" height="28" viewBox="0 0 23 28" fill="none">
    <path d="M10.1295 17.9923C7.54447 20.0862 5.82902 18.646 3.65995 16.1505C1.49089 13.6551 -0.310404 11.0495 2.27459 8.95554C4.85957 6.86164 8.7135 7.18713 10.8826 9.68255C13.0516 12.178 12.7144 15.8984 10.1295 17.9923Z" fill="#4f4f4f"/>
    <path d="M7.79904 4.32804C7.09603 5.50351 5.73644 6.01628 4.76232 5.47336C3.78819 4.93043 3.56841 3.53741 4.27143 2.36194C4.97444 1.18648 6.33403 0.6737 7.30815 1.21662C8.28228 1.75955 8.50206 3.15258 7.79904 4.32804Z" fill="#4f4f4f"/>
    <path d="M13.9884 5.84573C13.0846 6.88549 11.6535 7.16256 10.7918 6.46459C9.93015 5.76663 9.96429 4.35792 10.8681 3.31816C11.7718 2.2784 13.203 2.00132 14.0647 2.69929C14.9263 3.39726 14.8922 4.80597 13.9884 5.84573Z" fill="#4f4f4f"/>
    <path d="M17.3745 10.8006C16.1569 11.4793 14.7138 11.2671 14.1514 10.3268C13.589 9.38639 14.1202 8.07391 15.3378 7.39525C16.5555 6.7166 17.9985 6.92876 18.5609 7.86913C19.1233 8.8095 18.5922 10.122 17.3745 10.8006Z" fill="#4f4f4f"/>
    <path d="M17.2043 17.2417C15.883 17.7059 14.5001 17.255 14.1154 16.2347C13.7307 15.2143 14.4899 14.0108 15.8111 13.5466C17.1323 13.0824 18.5153 13.5332 18.9 14.5536C19.2847 15.5739 18.5255 16.7774 17.2043 17.2417Z" fill="#4f4f4f"/>
    </svg>
`

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
    const [rerender, setRerender] = useState(false);
    const [leobankModalIsShown, setLeobankModalIsShown] = useState(false)
    const [selectedLeobankId, setSelectedLeobankId] = useState(null)

    const orderList = (list, page) => {
        const orders=[];
        list.content.forEach(order => {
            let totalPrice=0;
            // let orderNum = order.orderStateList[0]?.erpResponseMessage.split(' ')[2];
            order.goods.map(item => {
                totalPrice += (item.product_price*item.product_quantity - (item.product_price*item.product_quantity*item.product_discount/100));
            })
            orders.push({
                ...order,
                totalPrice,
                // orderNum
            })
        })
        setOrderState(orders);
        setRows(page === 0 ? 1 : (page * 10) + 1);
    }

    useEffect(() => {
        post(`${getHost('sales', 8087)}/api/order/search?user_uid.equals=${authCtx.user_uid}&size=10&page=${page}&size=10`).then(res => {
            orderList(res, page);
            setPageState(res);
        })
    }, [page, rerender]);

    const handleModuleInfo = (id) => {
        post(`${getHost('sales', 8087)}/api/order/search?id.equals=${id}`).then(resOrderInfo => {
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
                        remove(`${getHost('sales', 8087)}/api/order/${id}`).then(res => {
                            const newList = orderState.filter(item => item.id !== id);
                            setOrderState(newList);
                            setRerender(!rerender);
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
        remove(`${getHost('sales', 8087)}/api/order/goods/${id}`).then(res => {
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
            post(`${getHost('sales', 8087)}/api/order/search?user_uid.equals=${authCtx.user_uid}&creationDate.greaterThan=${formattedDate(searchByDate.start_date)}&creationDate.lessThan=${formattedDate(searchByDate.end_date)}&size=10&page=${page}&size=10`).then(res =>{
                orderList(res, 0);
                setPageState(res);
            }).catch(err => console.log(err))
        }
    }

    const handleNameSearch = (value) => {
        if(value.trim().length > 3){
            setIsLoading(true);
            post(`${getHost('sales', 8087)}/api/order/search?user_uid.equals=${authCtx.user_uid}&client_name.contains=${value}&page=0&size=10`).then(res => {
                orderList(res, 0);
                setPage(0);
                setPageState(res);
            }).catch(err => console.log(err))
        }else{
            setIsLoading(true);
            post(`${getHost('sales', 8087)}/api/order/search?user_uid.equals=${authCtx.user_uid}&&page=0&size=10`).then(res => {
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
            post(`${getHost('sales', 8087)}/api/order/search?user_uid.equals=${authCtx.user_uid}&size=10&page=${pageNumber}`).then(res => {
                setPageState(res);
                setPage(pageNumber);
                orderList(res, pageNumber);
            })
        }else{
            post(`${getHost('sales', 8087)}/api/order/search?user_uid.equals=${authCtx.user_uid}&status.equals=${value}&size=10&page=${pageNumber}`).then(res => {
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
                                        <th scope='col'>Kreditin statusu</th>
                                        {/*<th scope='col'>1C Sifariş Nömrəsi</th>*/}
                                        <th scope='col'>Seçimlər</th>
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
                                            <td>Yoxdur!!!</td>
                                            {/*<td>{order.orderNum}</td>*/}
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {
                                                        order.status === 'SAVED' && (
                                                            <button
                                                                className="leobank-button"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: leobankIcon
                                                                }}
                                                                onClick={() => {
                                                                    setSelectedLeobankId(order.id)
                                                                    setLeobankModalIsShown(!leobankModalIsShown)
                                                                }}
                                                            />
                                                        )
                                                    }
                                                    {(order.status === 'ORDER_FAILED' || order.status === 'SAVED') &&
                                                    <i className="fas fa-trash-alt text-danger cursor-pointer" onClick={handleOrderDelete.bind(this, order.id)}/>}
                                                </div>
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

            {
                leobankModalIsShown && (
                    <LeobankModal
                        leobankModalIsShown={leobankModalIsShown}
                        setLeobankModalIsShown={setLeobankModalIsShown}
                        onCloseModal={() => {
                            setLeobankModalIsShown(false)
                            setSelectedLeobankId(null)
                        }}
                        selectedLeobankId={selectedLeobankId}
                    />
                )
            }
        </div>
    )

}

export default AllOrders;