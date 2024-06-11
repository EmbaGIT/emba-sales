import React, {useContext, useEffect, useState} from "react";
import {get, post, remove, MessageComponent} from "../../api/Api";
import AuthContext from "../../store/AuthContext";
import ReactPaginate from "react-paginate";
import OrderInfo from "./OrderInfo";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import DatePicker from "react-datepicker";
import {formattedDate} from "../../helpers/formattedDate";
import { getHost } from "../../helpers/host";
import { LeobankModal } from "../../components/LeobankModal";
import { useHistory, useParams } from 'react-router-dom'
import Loader from 'react-loader-spinner'
import {
    LEOBANK_ORDER_STATES, LEOBANK_ORDER_STATES_LABELS, LEOBANK_ORDER_SUB_STATES,
    LEOBANK_ORDER_SUB_STATES_LABELS
} from '../../helpers/leobank-order-statuses'
import { toast } from 'react-toastify'
import jwt from 'jwt-decode'
import Modal from "../../UI/Modal";

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
    const history = useHistory()
    const params = useParams()
    const [page, setPage] = useState(+params.page);
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
    const [selectedLeobankSale, setSelectedLeobankSale] = useState(null)
    const [returnInstallmentModalIsShown, setReturnInstallmentModalIsShown] = useState(false)
    const [password, setPassword] = useState('')
    const [passwordMissing, setPasswordMissing] = useState(false)
    const [returnedAmount, setReturnedAmount] = useState('')
    const [returnedAmountMissing, setReturnedAmountMissing] = useState(false)
    const [bankOrderIdToReturn, setBankOrderIdToReturn] = useState('')
    const user = localStorage.getItem('jwt_token') ? jwt(localStorage.getItem('jwt_token')) : null

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
        const url = user?.roles?.includes('ACCOUNTANT')
            ? `/api/order/accountant/search?sort=createdAt,desc&sort=creationTime,desc&size=10&page=${page}`
            : `/api/order/search?user_uid.equals=${authCtx.user_uid}&sort=createdAt,desc&size=10&page=${page}`

        setIsLoading(true)
        post(`${getHost('sales', 8087)}${url}`).then(res => {
            const bankOrderPromises = res.content.map(async (c) => {
                if (c.uuid) {
                    const bankInfo = await (
                        async () => {
                            return get(`${getHost('payments', 8094)}/api/v1/query/${c.uuid}`)
                                .then((response) => response)
                                .catch(() => {
                                    if (c.expiredUuid) {
                                        return get(`${getHost('payments', 8094)}/api/v1/query/${c.expiredUuid}`)
                                            .then(response => response)
                                            .catch(err => err)
                                    }
                                })
                        }
                    )()
                    return { ...c, bankInfo }
                }

                return c
            })
            Promise.allSettled(
                bankOrderPromises
            ).then(values => {
                orderList({
                    ...res,
                    content: values.map(v => v.value)
                }, page);
                setIsLoading(false)
            })
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
                setIsLoading(false)
            }).catch(err => console.log(err))
        }else{
            setIsLoading(true);
            post(`${getHost('sales', 8087)}/api/order/search?user_uid.equals=${authCtx.user_uid}&&page=0&size=10`).then(res => {
                orderList(res, 0);
                setPage(0);
                setPageState(res);
                setIsLoading(false)
            }).catch(err => console.log(err))
        }
    }

    const paginate = (n) => {
        history.push(`/allOrder/${n.selected}`)
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

    const checkBankStatus = uuid => {
        post(
            `${getHost('payments', 8094)}/api/v1/lending/leo-bank/order/check`,
            { orderId: uuid }
        )
            .then(() => setRerender(!rerender))
            .catch((error) => console.log(error))
    }

    const confirmOrder = (order) => {
        post(
            `${getHost('payments', 8094)}/api/v1/lending/leo-bank/order/check`,
            { orderId: order.uuid }
        )
            .then((response) => {
                if (
                    response.state === LEOBANK_ORDER_STATES.FAIL &&
                    (response.subState === LEOBANK_ORDER_SUB_STATES.STORE_CONFIRM_TIME_EXPIRED || response.subState === LEOBANK_ORDER_SUB_STATES.CLIENT_CONFIRM_TIME_EXPIRED)
                ) {
                    toast.error(
                        <MessageComponent
                            text={'Taksit təsdiq vaxtı bitmişdir! Zəhmət olmasa, taksit sifarişini yenidən yaradın.'}
                        />, {
                            position: toast.POSITION.TOP_LEFT,
                            toastId: 'error-toast-message',
                            autoClose: 5000,
                            closeOnClick: true,
                        }
                    );
                    post(
                        `${getHost('sales', 8087)}/api/order/wishlist/${order.id}`,
                        order
                    )
                    .then((saleResponse) => {
                        setSelectedLeobankSale({
                            ...saleResponse, bankInfo: response
                        })
                        setRerender(!rerender)
                    })
                    .catch(saleError => console.log(saleError))
                    .finally(() => {
                        setLeobankModalIsShown(true)
                    })
                } else {
                    post(
                        `${getHost('payments', 8094)}/api/v1/lending/leo-bank/order/confirm`,
                        { orderId: order.uuid }
                    )
                        .then((confirmResponse) => {
                            if ((
                                confirmResponse.state === LEOBANK_ORDER_STATES.IN_PROCESS && confirmResponse.subState === LEOBANK_ORDER_SUB_STATES.STORE_APPROVED
                            ) || (
                                confirmResponse.state === LEOBANK_ORDER_STATES.SUCCESS && confirmResponse.subState === LEOBANK_ORDER_SUB_STATES.ACTIVE
                            )) {
                                setRerender(!rerender)
                                toast.success(
                                    <MessageComponent
                                        text={'Taksit bank tərəfindən təsdiqləndi! Zəhmət olmasa, sifarişi 1C bazasına göndərin.'}
                                    />, {
                                        position: toast.POSITION.TOP_LEFT,
                                        toastId: 'success-toast-message',
                                        autoClose: 5000,
                                        closeOnClick: true,
                                    }
                                );
                                handleModuleInfo(order.id)
                            }
                        })
                        .catch((error) => console.log(error))
                }
            })
            .catch((error) => console.log(error))
    }

    const checkPassword = async (e) => {
        e.preventDefault()
        if (!password.toString().length) {
            setPasswordMissing(true)
        } else if (!returnedAmount.toString().length) {
            setReturnedAmountMissing(true)
        } else {
            try {
                const isPasswordCorrect = await post(
                    `${getHost('payments', 8094)}/api/v1/passcode/check?request=${password}`
                )
                if (isPasswordCorrect) {
                    try {
                        await post(
                            `${getHost('payments', 8094)}/api/v1/lending/leo-bank/order/return`,
                            {
                                amount: +returnedAmount,
                                bankOrderId: bankOrderIdToReturn
                            }
                        )
                        setReturnInstallmentModalIsShown(false)
                        setRerender(!rerender)
                        setPassword('')
                        setReturnedAmount('')
                    } catch (returnError) {
                        console.log(returnError)
                    }
                }
            } catch (passwordError) {
                console.log(passwordError)
            }
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
                    <div className="">
                        <h4 className="fm-poppins flex-1">Satıcı sifarişləri</h4>
                    </div>
                    {(!isLoading && orderState.length) ?
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
                                        <th scope='col'>Taksit məbləği</th>
                                        <th scope='col'>Kreditin statusu</th>
                                        {/*<th scope='col'>1C Sifariş Nömrəsi</th>*/}
                                        <th scope='col'>Seçimlər</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {orderState && orderState.map((order, i) => (
                                        <tr
                                            key={i}
                                            style={{ verticalAlign: 'middle' }}
                                        >
                                            <td>{+i + rows}</td>
                                            <td>
                                                <div style={{
                                                    display: user?.roles?.includes('ACCOUNTANT') ? 'flex' : '',
                                                    alignItems: 'center'
                                                }}>    
                                                    <span
                                                        className="cursor-pointer text-primary font-weight-bolder" onClick={handleModuleInfo.bind(null, order.id)}
                                                        style={{
                                                            marginRight: user?.roles?.includes('ACCOUNTANT') ? 16 : 0,
                                                            lineHeight: '100%',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        {order.client_name}
                                                    </span>
                                                    {
                                                        user?.roles?.includes('ACCOUNTANT') && order?.user_uid === user?.uid
                                                            ? <span
                                                                className="badge bg-danger"
                                                            >Mənim satışım</span>
                                                            : null
                                                    }
                                                </div>
                                            </td>
                                            <td>
                                                {order.status === 'ORDER_FAILED' &&
                                                <span className="badge bg-warning text-dark">Uğursuz sifariş</span>}
                                                {order.status === 'ORDERED' &&
                                                <span className="badge bg-success">Tamamlandı</span>}
                                                {order.status === 'SAVED' &&
                                                <span className="badge bg-primary">Yadda saxlanılan</span>}
                                            </td>
                                            <td>{order.createdAt} {order.creationTime}</td>
                                            <td>{Number(Number(order.totalPrice).toFixed(2))} AZN</td>
                                            <td>
                                                {
                                                    order?.bankInfo
                                                        ? order?.bankInfo?.returns
                                                            ? `${+order.bankInfo?.totalAmount - +order.bankInfo?.initialAmount - (order?.bankInfo?.returns?.reduce((acc, r) => acc + r.amount, 0))} AZN`
                                                            : `${+order.bankInfo?.totalAmount - +order.bankInfo?.initialAmount} AZN`
                                                        : ''
                                                }
                                            </td>
                                            <td className='leo-order-states'>
                                                {
                                                    order.status === 'SAVED' ? (!order.bankInfo
                                                        ? <span className="badge leo-no-status">KREDİT MÖVCUD DEYİL</span>
                                                        : (order.bankInfo.state && order.bankInfo.subState)
                                                            ? <span className="leo-double-state">
                                                                <span className={`badge ${order.bankInfo.state}`}>{LEOBANK_ORDER_STATES_LABELS[order.bankInfo.state]}</span>
                                                                <span className={`badge ${order.bankInfo.subState}`}>{LEOBANK_ORDER_SUB_STATES_LABELS[order.bankInfo.subState]}</span>
                                                            </span>
                                                            : <span className="badge leo-in-queue">BANKDAN CAVAB GÖZLƏNİLİR</span>) : order.status === 'ORDERED' && ((
                                                                order.bankInfo?.state === LEOBANK_ORDER_STATES.IN_PROCESS && order.bankInfo?.subState === LEOBANK_ORDER_SUB_STATES.STORE_APPROVED
                                                            ) || (
                                                                order.bankInfo?.state === LEOBANK_ORDER_STATES.SUCCESS && order.bankInfo?.subState === LEOBANK_ORDER_SUB_STATES.ACTIVE
                                                            )) ? <span className="badge bg-success">KREDİT UĞURLA TAMAMLANDI</span> : <span className="badge leo-no-status">KREDİT MÖVCUD DEYİL</span>
                                                }
                                            </td>
                                            {/*<td>{order.orderNum}</td>*/}
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {
                                                        user?.roles?.includes('ACCOUNTANT') && ((
                                                            order.bankInfo
                                                            && !order.bankInfo.state
                                                            && !order.bankInfo.subState
                                                        ) || (
                                                            order.bankInfo?.state === LEOBANK_ORDER_STATES.IN_PROCESS && (order.bankInfo?.subState !== LEOBANK_ORDER_SUB_STATES.WAITING_FOR_STORE_CONFIRM && order.bankInfo?.subState !== LEOBANK_ORDER_SUB_STATES.STORE_APPROVED)
                                                        ))
                                                        && <button
                                                            className="update-leo-status"
                                                            onClick={() => checkBankStatus(order.uuid)}
                                                        >
                                                            <i className="fas fa-sync-alt"></i>
                                                        </button>
                                                    }
                                                    {
                                                        user?.roles?.includes('ACCOUNTANT') && order.bankInfo && order.bankInfo.subState === 'WAITING_FOR_STORE_CONFIRM' && <button
                                                            className="update-leo-status"
                                                            onClick={() => confirmOrder(order)}
                                                        >
                                                            <i className="fas fa-check-double"></i>
                                                        </button>
                                                    }
                                                    {
                                                        user?.roles?.includes('ACCOUNTANT') && order.status === 'SAVED' && (!order.bankInfo || order.bankInfo?.state === LEOBANK_ORDER_STATES.FAIL) && (
                                                            <button
                                                                className="leobank-button"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: leobankIcon
                                                                }}
                                                                onClick={() => {
                                                                    setLeobankModalIsShown(true)
                                                                    setSelectedLeobankSale(order)
                                                                }}
                                                            />
                                                        )
                                                    }
                                                    {(order.status === 'ORDER_FAILED' || order.status === 'SAVED') && !((order.bankInfo?.state === LEOBANK_ORDER_STATES.IN_PROCESS && order.bankInfo?.subState === LEOBANK_ORDER_SUB_STATES.STORE_APPROVED) || (order.bankInfo?.state === LEOBANK_ORDER_STATES.SUCCESS && order.bankInfo?.subState === LEOBANK_ORDER_SUB_STATES.ACTIVE) || (order.bankInfo?.state === LEOBANK_ORDER_STATES.SUCCESS && order.bankInfo?.subState === LEOBANK_ORDER_SUB_STATES.RETURNED)) && (!(user?.roles?.includes('USER') && order?.bankInfo)) &&
                                                    <i className="fas fa-trash-alt text-danger cursor-pointer" onClick={handleOrderDelete.bind(this, order.id)}/>}
                                                    {
                                                        user?.roles?.includes('ACCOUNTANT') && ((order.bankInfo?.state === LEOBANK_ORDER_STATES.IN_PROCESS && order.bankInfo?.subState === LEOBANK_ORDER_SUB_STATES.STORE_APPROVED) || (order.bankInfo?.state === LEOBANK_ORDER_STATES.SUCCESS && order.bankInfo?.subState === LEOBANK_ORDER_SUB_STATES.ACTIVE)) && <button
                                                            className="return-installment"
                                                            onClick={() => {
                                                                setBankOrderIdToReturn(order?.bankInfo?.bankOrderId)
                                                                setReturnInstallmentModalIsShown(true)
                                                                setReturnedAmount(order?.bankInfo?.returns ? (+order.bankInfo?.totalAmount - +order.bankInfo?.initialAmount - (order?.bankInfo?.returns?.reduce((acc, r) => acc + r.amount, 0))) : (+order.bankInfo?.totalAmount - +order.bankInfo?.initialAmount))
                                                            }}
                                                        >
                                                            <i className="fas fa-undo"></i>
                                                        </button>
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            {cartIsShown && <OrderInfo onCloseModal={hideCartHandler} info={orderInfo}
                                                   onItemDelete={deleteGoodFromOrder} rerender={rerender} setRerender={setRerender} orderState={orderState} />}
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
                        : (!isLoading && !orderState.length) ? <div className="alert alert-danger text-center py-3" role="alert">
                            Sizin mövcud sifarişiniz yoxdur!
                        </div>
                        : <div className='w-100 d-flex justify-content-center'>
                        <Loader
                            type="ThreeDots"
                            color="#00BFFF"
                            height={60}
                            width={60}
                        />
                    </div>}
                </div>
            </div>

            {
                leobankModalIsShown && (
                    <LeobankModal
                        setLeobankModalIsShown={setLeobankModalIsShown}
                        selectedLeobankSale={selectedLeobankSale}
                        onCloseModal={() => {
                            setLeobankModalIsShown(false)
                            setSelectedLeobankSale(null)
                        }}
                        rerender={rerender}
                        setRerender={setRerender}
                    />
                )
            }

            {
                returnInstallmentModalIsShown && (
                    <ReturnInstallmentModal
                        password={password}
                        setPassword={setPassword}
                        returnInstallmentModalIsShown={returnInstallmentModalIsShown}
                        setReturnInstallmentModalIsShown={setReturnInstallmentModalIsShown}
                        checkPassword={checkPassword}
                        passwordMissing={passwordMissing}
                        setPasswordMissing={setPasswordMissing}
                        setBankOrderIdToReturn={setBankOrderIdToReturn}
                        returnedAmount={returnedAmount}
                        setReturnedAmount={setReturnedAmount}
                        returnedAmountMissing={returnedAmountMissing}
                        setReturnedAmountMissing={setReturnedAmountMissing}
                    />
                )
            }
        </div>
    )

}

const ReturnInstallmentModal = ({
    password,
    setPassword,
    returnInstallmentModalIsShown,
    setReturnInstallmentModalIsShown,
    checkPassword,
    passwordMissing,
    setPasswordMissing,
    setBankOrderIdToReturn,
    returnedAmount,
    setReturnedAmount,
    returnedAmountMissing,
    setReturnedAmountMissing
}) => (
    <Modal
        noPadding
        onClose={() => {
            setReturnInstallmentModalIsShown(false)
            setPassword('')
            setPasswordMissing(false)
            setReturnedAmount('')
            setReturnedAmountMissing(false)
            setBankOrderIdToReturn(null)
        }}
    >
        <div className='card'>
            <div className='list-group-item list-group-item-success'>
                Taksit ləğvi üçün şifrə
            </div>

            <div className='card-body'>
                <form className='leobank-form' onSubmit={checkPassword}>
                    <div className='row'>
                        <div className='col-12 mb-3'>
                            <label className='required mb-1'>Şifrəni daxil edin:</label>
                            <input
                                className='form-control'
                                placeholder='Şifrə'
                                value={password}
                                type='password'
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    setPasswordMissing(e.target.value.length === 0)
                                }}
                            />
                            {passwordMissing && (
                            <div className='invalid-feedback d-block position-relative mt-1'>
                                Zəhmət olmasa, şifrəni daxil edib davam edin!
                            </div>
                        )}
                        </div>
                        <div className='col-12'>
                            <label className='required mb-1'>Qaytarılacaq məbləği daxil edin:</label>
                            <input
                                className='form-control'
                                placeholder='Qaytarılacaq məbləğ'
                                value={returnedAmount}
                                onChange={(e) => {
                                    setReturnedAmount(e.target.value)
                                    setReturnedAmountMissing(e.target.value.length === 0)
                                }}
                            />
                            {returnedAmountMissing && (
                            <div className='invalid-feedback d-block position-relative mt-1'>
                                Zəhmət olmasa, geri qaytarılacaq məbləği daxil edib davam edin!
                            </div>
                        )}
                        </div>
                        <div className='col-6'>
                            <button
                                type='submit'
                                className='btn btn-block btn-success'
                                onClick={checkPassword}
                            >Təsdiq et</button>
                        </div>
                        <div className='col-6'>
                            <button
                                className='btn btn-block btn-danger'
                                onClick={() => {
                                    setReturnInstallmentModalIsShown(false)
                                    setPassword('')
                                    setPasswordMissing(false)
                                    setReturnedAmount('')
                                    setReturnedAmountMissing(false)
                                    setBankOrderIdToReturn(null)
                                }}
                            >Imtina et</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </Modal>
)

export default AllOrders;