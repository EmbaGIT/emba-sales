import {useState, useEffect, useContext} from "react";
import Modal from '../../UI/Modal';
import DatePicker from "react-datepicker";
import Select from "react-select";
import {selectStyles} from "../../helpers/selectStyles";
import {NoOptionsMessage} from "../../helpers/NoOptionsMessage";
import InputMask from "react-input-mask";
import {gql, useLazyQuery} from "@apollo/client";
import {get, post} from "../../api/Api";
import AuthContext from "../../store/AuthContext";
import {toast} from "react-toastify";
import BirthDateDatepicker from "../../components/birthDateDatepicker";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import CartContext from "../../store/CartContext";
import {useHistory} from "react-router-dom";

const CUSTOMER_QUERY = gql`
    query searchCustomer($name: String, $serial: String, $finCode: String) {
      search(criteria: {
        name: {contains: $name},
        serial: {equals: $serial},
        finCode: {equals: $finCode}}) {
        uid
        name
      }
    }`;

const FULL_INFO_QUERY = gql`
    query fullInfo($uid: String) {
      search(criteria: {
        uid: {equals: $uid}
      }) {
        id
        uid
        name
        isActive
        note
        details {
          infoTypeField {
            field
          }
          fieldValue
        }
      }
    }`

const OrderInfo = (props) => {
    const [orders, setOrders] = useState(props.info);
    const authCtx = useContext(AuthContext);
    const cartCtx = useContext(CartContext);
    const [city, setCity] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [isRefactorDisabled, setIsRefactorDisabled] = useState({
        birthdate: false,
        city: false,
        mobile_phone: false,
        other_phone: false,
        address: false,
        gender: false,
        email: false,
        note: false,
        isDisabled: true
    });
    const [customerSearch, setCustomerSearch] = useState(false);
    const [availableCustomer, setAvailableCustomer] = useState([]);
    const [customerRefactoringInfo, setCustomerRefactoringInfo] = useState({
        address: '',
        mobile_phone: '',
        other_phone: '',
    });
    const [oldCustomerInfo, setOldCustomerInfo] = useState({
        address: '',
        mobile_phone: '',
        other_phone: '',
    });
    const [formValidation, setFormValidation] = useState({
        name: true,
        surname: true,
        city: true,
        address: true,
        mobile_phone: true,
        other_phone: true,
        email: true,
        delivery_date: true,
        payment_date: true
    })
    const [orderInfo, setOrderInfo] = useState({
        id: '',
        uid: '',
        name: '',
        surname: '',
        patronymic: '',
        finCode: '',
        identifierNumber: '',
        passport_series: 'AZE',
        birthdate: '',
        city: {
            code: '',
            name: ''
        },
        mobile_phone: '',
        other_phone: '',
        address: '',
        gender: '',
        email: '',
        note: '',
        goods: [],
        totalPrice: 0,
        discountPrice: 0,
        bank_cash: 0,
        deliveryType: 0,
        paymentType: 0
    });
    const history = useHistory();

    const [getAvailableCustomer, {
        data: available_customer,
        loading: available_customer_loading
    }] = useLazyQuery(CUSTOMER_QUERY, {
        context: {headers: {authorization: `Bearer ${authCtx.token}`}},
        onCompleted: () => {
            setCustomerSearch(true);
            if (available_customer.search.length) {
                setAvailableCustomer(available_customer.search);
            }
        }, onError: (err) => {
            console.log(err)
        }
    });

    const [getFullInfo, {data: customer_full_info}] = useLazyQuery(FULL_INFO_QUERY, {
        context: {headers: {authorization: `Bearer ${authCtx.token}`}},
        onCompleted: () => {
            if (customer_full_info) {
                setIsRefactorDisabled({
                    birthdate: true,
                    city: true,
                    mobile_phone: true,
                    other_phone: true,
                    address: true,
                    gender: true,
                    email: true,
                    note: true,
                    isDisabled: false
                })
                setOrderInfo(prevState => ({
                    ...prevState,
                    uid: customer_full_info.search[0].uid
                }));
                setOrderInfo(prevState => ({
                    ...prevState,
                    name: customer_full_info.search[0].name.split(' ')[1]
                }));
                setOrderInfo(prevState => ({
                    ...prevState,
                    surname: customer_full_info.search[0].name.split(' ')[0]
                }));
                setOrderInfo(prevState => ({
                    ...prevState,
                    patronymic: customer_full_info.search[0].name.split(' ')[2]
                }));
                customer_full_info.search[0].details.forEach(detail => {
                    if (detail.infoTypeField.field === "Birthdate") {
                        setOrderInfo(prevstate => ({
                            ...prevstate,
                            birthdate: new Date(detail.fieldValue?.split(" ")[0].replace(/(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3"))
                        }));
                    } else if (detail.infoTypeField.field === "City") {
                        get(`http://bpaws01l:8087/api/city/search?name.contains=${detail.fieldValue}`).then(res => {
                            if (res.content.length > 0) {
                                setOrderInfo(prevstate => ({
                                    ...prevstate,
                                    city: {
                                        code: res.content[0].code,
                                        name: detail.fieldValue
                                    }
                                }));
                            } else {
                                setOrderInfo(prevstate => ({
                                    ...prevstate,
                                    city: {
                                        code: "000000079",
                                        name: "Digər"
                                    }
                                }));
                            }
                        })
                    } else if (detail.infoTypeField.field === "DocumentPin") {
                        setOrderInfo(prevstate => ({
                            ...prevstate,
                            finCode: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "Number") {
                        setOrderInfo(prevstate => ({
                            ...prevstate,
                            client_number_passport: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "Mobile") {
                        setOrderInfo(prevstate => ({
                            ...prevstate,
                            mobile_phone: detail.fieldValue
                        }));
                        setOldCustomerInfo(prevstate => ({
                            ...prevstate,
                            mobile_phone: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "OtherPhone") {
                        setOrderInfo(prevstate => ({
                            ...prevstate,
                            other_phone: detail.fieldValue
                        }));
                        setOldCustomerInfo(prevstate => ({
                            ...prevstate,
                            other_phone: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "Email") {
                        setOrderInfo(prevstate => ({
                            ...prevstate,
                            email: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "PhysicalAddress") {
                        setOrderInfo(prevstate => ({
                            ...prevstate,
                            address: detail.fieldValue
                        }));
                        setOldCustomerInfo(prevstate => ({
                            ...prevstate,
                            address: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "Gender") {
                        setOrderInfo(prevstate => ({
                            ...prevstate,
                            gender: detail.fieldValue === "Kişi" ? 1 : 0
                        }));
                    }
                })
            } else {
                setIsRefactorDisabled({
                    birthdate: false,
                    city: false,
                    mobile_phone: false,
                    other_phone: false,
                    address: false,
                    gender: false,
                    email: false,
                    note: false,
                    isDisabled: true
                })
            }
        },
        onError: (error) => {
            console.log(error)
        }
    })

    useEffect(() => {
        handleOrderInfo(props.info);
        get('http://bpaws01l:8087/api/city/table?page=0&size=100').then((res) => {
            setCity(res?.content?.map((city) => ({
                value: city.code,
                label: `${city.name}`,
            })));
        }).catch((err) => console.log(err));

        setOrders(props.info);
    }, [props.info])

    const newCartObject = () => {
        props.onCloseModal();
        confirmAlert({
            title: '',
            message: 'Əvvəlki səbət məlumatları silinəcək!',
            buttons: [
                {
                    label: 'Təsdiqlə',
                    onClick: () => {
                        cartCtx.clearBasket();
                        cartCtx.updateSavedOrder(props.info);
                        history.push('/cart');
                    }
                },
                {
                    label: 'Ləğv et',
                    onClick: () => {}
                }
            ]
        });
    }

    const handleOrderInfo = (resOrderInfo) => {
        const products = [];
        let total_price=0;
        let discount_total_price=0;
        if(resOrderInfo.client_delivery_city_code){
            get(`http://bpaws01l:8087/api/city/code/${resOrderInfo.client_delivery_city_code}`).then(city => {
                setOrderInfo(prevstate => ({
                    ...prevstate,
                    city: {
                        code: city.code,
                        name: city.name
                    }
                }));
            })
        }else{
            setOrderInfo(prevstate => ({
                ...prevstate,
                city: {
                    code: '',
                    name: ''
                }
            }));
        }

        resOrderInfo.goods.map(item => {
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
                    ...prevstate,
                    id: resOrderInfo.id,
                    uid: resOrderInfo.client_uid,
                    name: resOrderInfo.client_name.split(' ')[1],
                    surname: resOrderInfo.client_name.split(' ')[0],
                    patronymic: resOrderInfo.client_name.split(' ')[2],
                    finCode: resOrderInfo.client_fin_code,
                    identifierNumber: resOrderInfo.client_number_passport,
                    passport_series: resOrderInfo.client_passport_series ? resOrderInfo.client_passport_series : 'AZE',
                    birthdate: resOrderInfo.client_date_born,
                    mobile_phone:  resOrderInfo.client_mobil_phone,
                    other_phone: resOrderInfo.client_mobil_phone2,
                    address: resOrderInfo.client_delivery_address,
                    gender: resOrderInfo.client_gender,
                    email: resOrderInfo.client_mail,
                    note: resOrderInfo.comment,
                    status: resOrderInfo.status,
                    payment_date: resOrderInfo.payment_date,
                    delivery_date: resOrderInfo.delivery_date,
                    goods: products,
                    totalPrice: total_price,
                    discountPrice: discount_total_price
                }))
            })
        })
    }

    const handleInputChange = (type, value) => {
        let alldata = {...orderInfo};
        if (type === 'select_city') {
            alldata = {
                ...alldata,
                city: {
                    code: value.value,
                    name: value.label
                }
            }
        } else if (type === "male") {
            alldata = {
                ...alldata,
                gender: 1
            }
        } else if (type === "female") {
            alldata = {
                ...alldata,
                gender: 0
            }
        }else if (type === 'cash') {
            alldata = {
                ...alldata,
                bank_cash: 0,
                paymentType: 0
            }
        } else if (type === "credit") {
            alldata = {
                ...alldata,
                bank_cash: Math.round((orderInfo.discountPrice * 2 / 100) * 100) / 100,
                paymentType: 1
            }
        } else if (type === 'byStore') {
            alldata = {
                ...alldata,
                deliveryType: 0
            }
        } else if (type === "byCustomer") {
            alldata = {
                ...alldata,
                deliveryType: 1
            }
        } else if (type === "refactor") {
            if (value) {
                setIsRefactorDisabled(prevState => ({
                    ...prevState,
                    mobile_phone: false,
                    other_phone: false,
                    address: false,
                }))
            } else {
                setIsRefactorDisabled(prevState => ({
                    ...prevState,
                    mobile_phone: true,
                    other_phone: true,
                    address: true,
                }))
            }
        } else {
            alldata = {
                ...alldata,
                [type]: value
            }
            !isRefactorDisabled.isDisabled && setCustomerRefactoringInfo(prevState => ({
                ...prevState,
                [type]: value
            }))
        }
        setOrderInfo(alldata);
    }
    const searchOnDatabase = () => {
        setAvailableCustomer([]);
        setOrderInfo(prevstate => ({
            ...prevstate,
            uid: '',
            birthdate: '',
            city: {
                code: '',
                name: ''
            },
            mobile_phone: '',
            other_phone: '',
            address: '',
            gender: '',
            email: '',
            note: ''
        }));
        setOldCustomerInfo(prevstate => ({
            mobile_phone: '',
            other_phone: '',
            address: '',
        }));
        if (handleNameSurnameValidation()) {
            getAvailableCustomer({
                variables: {
                    name: `${orderInfo.surname} ${orderInfo.name} ${orderInfo.patronymic}`,
                    serial: orderInfo.identifierNumber ? orderInfo.identifierNumber : null,
                    finCode: orderInfo.finCode ? orderInfo.finCode : null
                }
            });
        }
    }
    const handleFullInfo = (uid) => {
        getFullInfo({
            variables: {
                uid: `${uid}`
            }
        });
    }

    const handleNameSurnameValidation = () => {
        !orderInfo.name ? setFormValidation(prevState => ({
            ...prevState,
            name: false
        })) : setFormValidation(prevState => ({...prevState, name: true}))
        return !(!orderInfo.name);
    }

    const handleValidation = () => {
        !orderInfo.name ? setFormValidation(prevState => ({
            ...prevState,
            name: false
        })) : setFormValidation(prevState => ({...prevState, name: true}))
        !orderInfo.address ? setFormValidation(prevState => ({
            ...prevState,
            address: false
        })) : setFormValidation(prevState => ({...prevState, address: true}))
        !orderInfo.mobile_phone ? setFormValidation(prevState => ({
            ...prevState,
            mobile_phone: false
        })) : setFormValidation(prevState => ({...prevState, mobile_phone: true}))
        !orderInfo.other_phone ? setFormValidation(prevState => ({
            ...prevState,
            other_phone: false
        })) : setFormValidation(prevState => ({...prevState, other_phone: true}))
        !orderInfo.delivery_date ? setFormValidation(prevState => ({
            ...prevState,
            delivery_date: false
        })) : setFormValidation(prevState => ({...prevState, delivery_date: true}))
        !orderInfo.payment_date ? setFormValidation(prevState => ({
            ...prevState,
            payment_date: false
        })) : setFormValidation(prevState => ({...prevState, payment_date: true}))
        !orderInfo.city.code ? setFormValidation(prevState => ({
            ...prevState,
            city: false
        })) : setFormValidation(prevState => ({...prevState, city: true}))

        return !(!orderInfo.name || !orderInfo.city || !orderInfo.address || !orderInfo.mobile_phone || !orderInfo.delivery_date || !orderInfo.payment_date);
    }

    const MessageComponent = ({text}) => (
        <span style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
            <span
                style={{
                    fontWeight: 500,
                    fontSize: 16,
                    lineHeight: '24px',
                    color: '#FFEDED',
                }}>
              {text}
            </span>
        </span>
    );

    const sendWishListOrder = () => {
        if(handleValidation()){
            setIsSending(true);
            const postData = {
                "bank_cash": orderInfo.bank_cash,
                "client_date_born": orderInfo.birthdate,
                "client_delivery_address": orderInfo.address,
                "client_delivery_city_code": orderInfo.city.code,
                "client_fin_code": orderInfo.finCode,
                "client_gender": orderInfo.gender,
                "client_mail": orderInfo.email,
                "client_mobil_phone": orderInfo.mobile_phone,
                "client_mobil_phone2": orderInfo.other_phone,
                "client_name": `${orderInfo.surname} ${orderInfo.name} ${orderInfo.patronymic}`,
                "client_new_delivery_address": customerRefactoringInfo.address ?
                    (oldCustomerInfo.address === customerRefactoringInfo.address ? 0 : 1) : 0,
                "client_new_phone": customerRefactoringInfo.mobile_phone ?
                    (oldCustomerInfo.mobile_phone === customerRefactoringInfo.mobile_phone ? 0 : 1) : 0,
                "client_new_phone2": customerRefactoringInfo.other_phone ?
                    (oldCustomerInfo.other_phone === customerRefactoringInfo.other_phone ? 0 : 1) : 0,
                "client_number_passport": orderInfo.identifierNumber,
                "client_passport_series": orderInfo.passport_series,
                "client_uid": orderInfo.uid,
                "comment": orderInfo.note,
                "createdAt": props.info.createdAt,
                "creationTime": props.info.creationTime,
                "delivery_date": orderInfo.delivery_date,
                "delivery_type": orderInfo.deliveryType,
                "goods": orderInfo.goods,
                "id": orderInfo.id,
                "payment_date": orderInfo.payment_date,
                "payment_method": orderInfo.paymentType,
                "user_uid": authCtx.user_uid
            }
            post(`http://bpaws01l:8087/api/order/update/${orderInfo.id}`, postData).then(res => {
                setIsSending(false);
                props.onCloseModal();
                toast.success(<MessageComponent text='Sifariş göndərildi!'/>, {
                    position: toast.POSITION.TOP_LEFT,
                    toastId: 'success-toast-message',
                    autoClose: 1500,
                    closeOnClick: true,
                });
            }).catch(err => {
                setIsSending(false);
            });
        }else{

        }
    }

    return (
        <Modal onClose={props.onCloseModal}>
            <div className="row">
                <div className="col-lg-12">
                    <ul className="nav nav-tabs mb-3" id="ex1" role="tablist">
                        <li className="nav-item" role="goods">
                            <a
                                className="nav-link active"
                                id="ex1-tab-1"
                                data-mdb-toggle="tab"
                                href="#goods"
                                role="tab"
                                aria-controls="ex1-tabs-1"
                                aria-selected="true"
                            >Məhsullar</a>
                        </li>
                        <li className="nav-item" role="presentation">
                            <a
                                className="nav-link"
                                id="ex1-tab-2"
                                data-mdb-toggle="tab"
                                href="#customer-info"
                                role="tab"
                                aria-controls="ex1-tabs-2"
                                aria-selected="false"
                            >Müştəri məlumatı</a>
                        </li>
                    </ul>
                    <div className="tab-content" id="ex1-content">
                        <div
                            className="tab-pane fade show active"
                            id="goods"
                            role="tabpanel"
                            aria-labelledby="goods">
                            <table className="table table-striped table-hover table-bordered">
                                <thead>
                                <tr>
                                    <th>Modelin adı</th>
                                    <th>Sayı</th>
                                    <th>Qiymət</th>
                                    <th>Endirim</th>
                                    <th>Son qiymət</th>
                                    {orderInfo.status === "SAVED" && <th></th>}
                                </tr>
                                </thead>
                                <tbody>
                                {orders && orders?.goods?.map(item => (
                                    <tr key={item.id}>
                                        <td><b>{item.product_name}</b></td>
                                        <td>{item.product_quantity}</td>
                                        <td>{item.product_price} AZN</td>
                                        <td>{item.product_discount.toFixed(2)} %</td>
                                        <td>{(item.product_price * item.product_quantity - item.product_quantity * item.product_price * item.product_discount / 100).toFixed(2)} AZN</td>
                                        {orderInfo.status === "SAVED" &&
                                            <td><i className="far fa-trash-alt text-danger cursor-pointer" onClick={() => {
                                                props.onItemDelete(item.id)
                                            }}/></td>}
                                    </tr>
                                ))}
                                {orderInfo?.status === "ORDERED" &&
                                    props.info?.orderStateList?.map((info, i) => (
                                        info.erpResponseHeader === "ERROR" ? <tr key={i}>
                                            <th>
                                                <div className="text-end">Uğursuz Sifariş</div>
                                            </th>
                                            <th colSpan="4">{info.erpResponseMessage}</th>
                                        </tr> : <tr key={i}>
                                            <th>
                                                <div className="text-end">Sifariş</div>
                                            </th>
                                            <th colSpan="4">{info.erpResponseMessage}</th>
                                        </tr>
                                    ))
                                }
                                <tr>
                                    <th><div className="text-end">Endirimsiz məbləğ</div></th>
                                    <th colSpan={orderInfo?.status === "ORDERED" ? 4 : 5}>{orderInfo.totalPrice.toFixed(2)} AZN</th>
                                </tr>
                                <tr>
                                    <th><div className="text-end">Ödəniləcək məbləğ</div></th>
                                    <th colSpan={orderInfo?.status === "ORDERED" ? 4 : 5}>{orderInfo.discountPrice.toFixed(2)} AZN</th>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="tab-pane fade" id="customer-info" role="tabpanel"
                             aria-labelledby="customer-info">
                            {orderInfo?.status !== "ORDERED" && <h6>Müştəri bazasında axtarın</h6>}
                            <div className="input-group row mb-3">
                                <div className="col-md-4 mb-2">
                                    <label>Ad<span className="text-danger">*</span></label>
                                    <input type="text" className="form-control"
                                           disabled={orderInfo?.status === "ORDERED"}
                                           value={orderInfo && orderInfo?.name}
                                           onChange={e => handleInputChange("name", e.target.value)}/>
                                    {!formValidation.name &&
                                        <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                                </div>
                                <div className="col-md-4 mb-2">
                                    <label>Soyad<span className="text-danger">*</span></label>
                                    <input type="text" className="form-control"
                                           disabled={orderInfo?.status === "ORDERED"}
                                           value={orderInfo && orderInfo?.surname}
                                           onChange={e => handleInputChange("surname", e.target.value)}/>
                                    {!formValidation.surname &&
                                        <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                                </div>
                                <div className="col-md-4 mb-2">
                                    <label>Ata adı</label>
                                    <input type="text" className="form-control"
                                           disabled={orderInfo?.status === "ORDERED"}
                                           value={orderInfo && orderInfo?.patronymic}
                                           onChange={e => handleInputChange("patronymic", e.target.value)}/>
                                </div>
                                <div className="col-md-4">
                                    <label>ŞV-i Fin Kod</label>
                                    <input type="text" className="form-control"
                                           disabled={orderInfo?.status === "ORDERED"}
                                           maxLength="7"
                                           value={orderInfo && orderInfo?.finCode}
                                           onChange={e => handleInputChange("finCode", e.target.value)}/>
                                </div>
                                <div className="col-md-5">
                                    <label>Şəxsiyyət vəsiqəsi №-i</label>
                                    <div className="row">
                                        <div className="col-md-4 pe-0">
                                            <select className="form-control form-select"
                                                    disabled={orderInfo?.status === "ORDERED"}
                                                    value={orderInfo && orderInfo?.passport_series ? orderInfo?.passport_series : ''}
                                                    onChange={e => handleInputChange("passport_series", e.target.value)}
                                                    placeholder='ŞV seriyası'>
                                                <option value="AZE">AZE</option>
                                                <option value="AA">AA</option>
                                            </select>
                                        </div>
                                        <div className="col-md-8">
                                            <InputMask mask="99999999"
                                                       className="form-control"
                                                       disabled={orderInfo?.status === "ORDERED"}
                                                       value={orderInfo && orderInfo?.identifierNumber}
                                                       onChange={e => handleInputChange("identifierNumber", e.target.value)}/>
                                        </div>
                                    </div>
                                </div>
                                {orderInfo?.status !== "ORDERED" && <div className="col-md-3 d-flex align-items-end">
                                    <div className="btn btn-primary" onClick={searchOnDatabase}>Axtar</div>
                                </div>}
                            </div>
                            {available_customer_loading && <p>Məlumat yüklənir...</p>}
                            {customerSearch && (availableCustomer?.length ?
                                <select className="form-control form-select mb-3"
                                        defaultValue={'DEFAULT'}
                                        onChange={e => handleFullInfo(e.target.value)}>
                                    <option value='DEFAULT' disabled>Müştəri seçin</option>
                                    {availableCustomer.map(customer => (
                                        <option key={customer.uid} value={customer.uid}>{customer.name}</option>
                                    ))}
                                </select> : <p>Məlumat tapılmadı.</p>)}
                            <div className="mb-3">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="refactorInfo"
                                        onChange={e => handleInputChange("refactor", e.target.checked)}
                                        disabled={orderInfo?.status === "ORDERED" || isRefactorDisabled.isDisabled}
                                    />
                                    <label className="form-check-label" htmlFor="refactorInfo">
                                        Məlumatları Yenilə
                                    </label>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label htmlFor='birthdate'>Doğum tarixi</label>
                                    <BirthDateDatepicker
                                        selectedDate={orderInfo?.birthdate ? new Date(orderInfo?.birthdate) : ""}
                                        isDisabled={orderInfo?.status === "ORDERED" || isRefactorDisabled.birthdate}
                                        onDateChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label>Şəhər<span className="text-danger">*</span></label>
                                    <Select
                                        isDisabled={orderInfo?.status === "ORDERED" || isRefactorDisabled.city}
                                        styles={selectStyles}
                                        options={city}
                                        value={orderInfo && orderInfo?.city ? [{
                                            value: orderInfo?.city?.code,
                                            label: orderInfo?.city?.name
                                        }] : ''}
                                        components={(props) => NoOptionsMessage(props, 'Şəhər tapılmadı.')}
                                        onChange={value => handleInputChange("select_city", value)}
                                        placeholder='Şəhər seçin...'
                                    />
                                    {!formValidation.city &&
                                        <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-12">
                                    <label htmlFor='address'>Ünvan<span className="text-danger">*</span></label>
                                    <textarea className="form-control"
                                              disabled={orderInfo?.status === "ORDERED" || isRefactorDisabled.address}
                                              value={orderInfo && orderInfo?.address}
                                              onChange={e => handleInputChange("address", e.target.value)}
                                    />
                                    {!formValidation.address &&
                                        <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label>Mobil telefon<span className="text-danger">*</span></label>
                                    <InputMask mask="(+\9\9499) 999-99-99" className="form-control"
                                               disabled={orderInfo?.status === "ORDERED" || isRefactorDisabled.mobile_phone}
                                               onChange={e => handleInputChange("mobile_phone", e.target.value)}
                                               value={orderInfo && orderInfo?.mobile_phone}/>
                                    {!formValidation.mobile_phone &&
                                        <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                                </div>
                                <div className="col-md-6">
                                    <label>Digər telefon</label>
                                    <InputMask mask="(+\9\9499) 999-99-99" className="form-control"
                                               disabled={orderInfo?.status === "ORDERED" || isRefactorDisabled.other_phone}
                                               onChange={e => handleInputChange("other_phone", e.target.value)}
                                               value={orderInfo && orderInfo?.other_phone}/>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <label>Email</label>
                                    <input className="form-control"
                                           disabled={orderInfo?.status === "ORDERED" || isRefactorDisabled.email}
                                           onChange={e => handleInputChange("email", e.target.value)}
                                           value={orderInfo && orderInfo?.email}/>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-12">
                                    <div className="d-flex">
                                        <span className="form-check">
                                            <input
                                                disabled={orderInfo?.status === "ORDERED" || isRefactorDisabled.gender}
                                                className="form-check-input"
                                                type="radio"
                                                name="gender"
                                                id="male"
                                                onChange={e => handleInputChange("male", e.target.checked)}
                                                checked={!!(orderInfo && orderInfo?.gender === 1)}
                                            />
                                            <label className="form-check-label" htmlFor="male">Kişi</label>
                                        </span>
                                        <span className="form-check ms-3">
                                            <input
                                                disabled={orderInfo?.status === "ORDERED" || isRefactorDisabled.gender}
                                                className="form-check-input"
                                                type="radio"
                                                name="gender"
                                                id="female"
                                                onChange={e => handleInputChange("female", e.target.checked)}
                                                checked={!!(orderInfo && orderInfo?.gender === 0)}
                                            />
                                            <label className="form-check-label" htmlFor="female">Qadın</label>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label>Ödəniş tarixi<span className="text-danger">*</span></label>
                                    <DatePicker
                                        disabled={orderInfo?.status === "ORDERED"}
                                        className="form-control"
                                        dateFormat="yyyy-MM-dd"
                                        selected={orderInfo?.payment_date ? new Date(orderInfo?.payment_date) : ''}
                                        onChange={(date) => handleInputChange("payment_date", date)}
                                        minDate={new Date()}
                                    />
                                    {!formValidation.payment_date &&
                                        <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                                </div>
                                <div className="col-md-6">
                                    <label>Çatdırılma tarixi<span className="text-danger">*</span></label>
                                    <DatePicker
                                        disabled={orderInfo?.status === "ORDERED"}
                                        className="form-control"
                                        dateFormat="yyyy-MM-dd"
                                        selected={orderInfo?.delivery_date ? new Date(orderInfo?.delivery_date) : ''}
                                        onChange={(date) => handleInputChange("delivery_date", date)}
                                        minDate={new Date()}
                                    />
                                    {!formValidation.delivery_date &&
                                        <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <label>Şərh</label>
                                    <textarea className="form-control"
                                              disabled={orderInfo?.status === "ORDERED"}
                                              onChange={e => handleInputChange("note", e.target.value)}
                                              value={orderInfo && orderInfo.note}/>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div className="d-flex justify-content-end mt-2">
                {props.info.status === "SAVED" &&
                    <div>
                        <button className="btn btn-info me-2" disabled={isSending} onClick={newCartObject}>Dəyişiklik et</button>
                        <button className="btn btn-success me-2" disabled={isSending} onClick={sendWishListOrder}>{isSending ? "Gözləyin" : "Sifarişi göndər"}</button>
                    </div>
                }
                <div className="btn btn-primary" onClick={props.onCloseModal}>Bağla</div>
            </div>
        </Modal>
    );
};

export default OrderInfo;