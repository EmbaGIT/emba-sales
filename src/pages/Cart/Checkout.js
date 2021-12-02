import {useEffect, useContext, useState} from 'react';
import {useHistory} from "react-router-dom";
import {toast} from "react-toastify";
import CartContext from "../../store/CartContext";
import AuthContext from "../../store/AuthContext";
import DatePicker from "react-datepicker";
import getYear from "date-fns/getYear";
import getMonth from "date-fns/getYear";
import Select from "react-select";
import {selectStyles} from "../../helpers/selectStyles";
import {NoOptionsMessage} from "../../helpers/NoOptionsMessage";
import InputMask from "react-input-mask";
import {gql, useLazyQuery} from "@apollo/client";
import {get, post} from "../../api/Api";
import Loader from "react-loader-spinner";
import "react-datepicker/dist/react-datepicker.css";
import {formattedDate} from "../../helpers/formattedDate";

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

const Checkout = () => {
    const history = useHistory();
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
    const range = (start, end) => {
        return new Array(end - start).fill().map((d, i) => i + start);
    };
    const years = range(1950, getYear(new Date()) + 1, 1);
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const cartCtx = useContext(CartContext);
    const authCtx = useContext(AuthContext);
    const [isSending, setIsSending] = useState(false);
    const [isAddingWishlist, setIsAddingWishlist] = useState(false);
    const [checkoutState, setCheckoutState] = useState({
        items: []
    })
    const [paymentType, setPaymentType] = useState(0);
    const [deliveryType, setDeliveryType] = useState(0);
    const [bankCommission, setBankCommission] = useState(0);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [city, setCity] = useState([]);
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
    const [paymentDate, setPaymentDate] = useState();
    const [deliveryDate, setDeliveryDate] = useState();
    const [availableCustomer, setAvailableCustomer] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({
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
        note: ''
    });
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

    const [getFullInfo, {data: customer_full_info, loading: customer_full_loading}] = useLazyQuery(FULL_INFO_QUERY, {
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
                setCustomerInfo(prevState => ({
                    ...prevState,
                    uid: customer_full_info.search[0].uid
                }));
                setCustomerInfo(prevState => ({
                    ...prevState,
                    name: customer_full_info.search[0].name.split(' ')[1]
                }));
                setCustomerInfo(prevState => ({
                    ...prevState,
                    surname: customer_full_info.search[0].name.split(' ')[0]
                }));
                setCustomerInfo(prevState => ({
                    ...prevState,
                    patronymic: customer_full_info.search[0].name.split(' ')[2]
                }));
                customer_full_info.search[0].details.forEach(detail => {
                    if (detail.infoTypeField.field === "Birthdate") {
                        setCustomerInfo(prevstate => ({
                            ...prevstate,
                            birthdate: new Date(detail.fieldValue?.split(" ")[0].replace(/(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3"))
                        }));
                    } else if (detail.infoTypeField.field === "City") {
                        get(`http://bpaws01l:8087/api/city/search?name.contains=${detail.fieldValue}`).then(res => {
                            if (res.content.length > 0) {
                                setCustomerInfo(prevstate => ({
                                    ...prevstate,
                                    city: {
                                        code: res.content[0].code,
                                        name: detail.fieldValue
                                    }
                                }));
                            } else {
                                setCustomerInfo(prevstate => ({
                                    ...prevstate,
                                    city: {
                                        code: "000000079",
                                        name: "Digər"
                                    }
                                }));
                            }
                        })
                    } else if (detail.infoTypeField.field === "DocumentPin") {
                        setCustomerInfo(prevstate => ({
                            ...prevstate,
                            finCode: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "Number") {
                        setCustomerInfo(prevstate => ({
                            ...prevstate,
                            identifierNumber: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "Mobile") {
                        setCustomerInfo(prevstate => ({
                            ...prevstate,
                            mobile_phone: detail.fieldValue
                        }));
                        setOldCustomerInfo(prevstate => ({
                            ...prevstate,
                            mobile_phone: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "OtherPhone") {
                        setCustomerInfo(prevstate => ({
                            ...prevstate,
                            other_phone: detail.fieldValue
                        }));
                        setOldCustomerInfo(prevstate => ({
                            ...prevstate,
                            other_phone: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "Email") {
                        setCustomerInfo(prevstate => ({
                            ...prevstate,
                            email: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "PhysicalAddress") {
                        setCustomerInfo(prevstate => ({
                            ...prevstate,
                            address: detail.fieldValue
                        }));
                        setOldCustomerInfo(prevstate => ({
                            ...prevstate,
                            address: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "Gender") {
                        setCustomerInfo(prevstate => ({
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
        get('http://bpaws01l:8087/api/city/table?page=0&size=100').then((res) => {
            setIsFetchingData(false);
            setCity(res?.content?.map((city) => ({
                value: city.code,
                label: `${city.name}`,
            })));
        }).catch((err) => {
            setIsFetchingData(false);
        });
    }, [])

    useEffect(() => {
        if (cartCtx.items.length > 0) {
            setCheckoutState(prevState => ({
                ...prevState,
                items: cartCtx.items
            }));
        }
    }, [cartCtx]);

    const handleInputChange = (type, value) => {
        let alldata = {...customerInfo};
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
        } else if (type === 'cash') {
            setPaymentType(0);
            setBankCommission(0);
        } else if (type === "credit") {
            setPaymentType(1);
            setBankCommission(Math.round((cartCtx.discountAmount * 2 / 100) * 100) / 100)
        } else if (type === 'byStore') {
            setDeliveryType(0);
        } else if (type === "byCustomer") {
            setDeliveryType(1);
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
        setCustomerInfo(alldata);
    }
    const searchOnDatabase = () => {
        setAvailableCustomer([]);
        setCustomerInfo(prevstate => ({
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
                    name: `${customerInfo.surname} ${customerInfo.name} ${customerInfo.patronymic}`,
                    serial: customerInfo.identifierNumber ? customerInfo.identifierNumber : null,
                    finCode: customerInfo.finCode ? customerInfo.finCode : null
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
        !customerInfo.name ? setFormValidation(prevState => ({
            ...prevState,
            name: false
        })) : setFormValidation(prevState => ({...prevState, name: true}))
        !customerInfo.surname ? setFormValidation(prevState => ({
            ...prevState,
            surname: false
        })) : setFormValidation(prevState => ({...prevState, surname: true}))
        return !(!customerInfo.name || !customerInfo.surname);
    }

    const handleValidation = () => {
        !customerInfo.name ? setFormValidation(prevState => ({
            ...prevState,
            name: false
        })) : setFormValidation(prevState => ({...prevState, name: true}))
        !customerInfo.surname ? setFormValidation(prevState => ({
            ...prevState,
            surname: false
        })) : setFormValidation(prevState => ({...prevState, surname: true}))
        !customerInfo.address ? setFormValidation(prevState => ({
            ...prevState,
            address: false
        })) : setFormValidation(prevState => ({...prevState, address: true}))
        !customerInfo.mobile_phone ? setFormValidation(prevState => ({
            ...prevState,
            mobile_phone: false
        })) : setFormValidation(prevState => ({...prevState, mobile_phone: true}))
        !customerInfo.other_phone ? setFormValidation(prevState => ({
            ...prevState,
            other_phone: false
        })) : setFormValidation(prevState => ({...prevState, other_phone: true}))
        !deliveryDate ? setFormValidation(prevState => ({
            ...prevState,
            delivery_date: false
        })) : setFormValidation(prevState => ({...prevState, delivery_date: true}))
        !paymentDate ? setFormValidation(prevState => ({
            ...prevState,
            payment_date: false
        })) : setFormValidation(prevState => ({...prevState, payment_date: true}))
        !customerInfo.city.code ? setFormValidation(prevState => ({
            ...prevState,
            city: false
        })) : setFormValidation(prevState => ({...prevState, city: true}))

        return !(!customerInfo.name || !customerInfo.surname || !customerInfo.city || !customerInfo.address || !customerInfo.mobile_phone || !deliveryDate || !paymentDate);
    }

    const onPriceChange = (event) => {
        const enteredValue = event.target.value;
        cartCtx.checkoutPriceChange({
            value: enteredValue
        });
    }

    const sendOrder = (status) => {
        const order_goods = [];
        cartCtx.items.forEach(item => {
            order_goods.push({
                product_uid: item.uid,
                product_characteristic_uid: item.characteristic_uid,
                product_quantity: item.amount,
                product_price: item.price,
                product_discount: item.discount,
                product_total: item.amount * item.price
            })
        })
        const order_data = {
            user_uid: "8f859d20-e5f4-11eb-80d7-2c44fd84f8db",
            payment_date: formattedDate(paymentDate),
            delivery_date: formattedDate(deliveryDate),
            client_uid: customerInfo.uid,
            client_name: `${customerInfo.surname} ${customerInfo.name} ${customerInfo.patronymic}`,
            client_date_born: customerInfo.birthdate ? formattedDate(customerInfo.birthdate) : "0001-01-01",
            client_gender: customerInfo.gender,
            client_new_phone: customerRefactoringInfo.mobile_phone ?
                (oldCustomerInfo.mobile_phone === customerRefactoringInfo.mobile_phone ? 0 : 1) : 0,
            client_mobil_phone: customerInfo.mobile_phone,
            client_new_phone2: customerRefactoringInfo.other_phone ?
                (oldCustomerInfo.other_phone === customerRefactoringInfo.other_phone ? 0 : 1) : 0,
            client_mobil_phone2: customerInfo.other_phone,
            client_new_delivery_address: customerRefactoringInfo.address ?
                (oldCustomerInfo.address === customerRefactoringInfo.address ? 0 : 1) : 0,
            client_delivery_city_code: customerInfo.city.code,
            client_delivery_address: customerInfo.address,
            client_mail: customerInfo.email,
            comment: customerInfo.note,
            delivery_type: deliveryType,
            payment_method: paymentType,
            client_number_passport: customerInfo.identifierNumber,
            client_fin_code: customerInfo.finCode,
            client_passport_series: customerInfo.passport_series,
            goods: order_goods,
            bank_cash: bankCommission
        }
        if (status === "ORDERED" && handleValidation()) {
            setIsSending(true);
            post(`http://bpaws01l:8087/api/order/send`, order_data).then(res => {
                setIsSending(false);
                if (res.status === "ORDERED") {
                    history.push(`/orderPrint/${res.id}`);
                    toast.success(<MessageComponent text='Sifariş göndərildi!'/>, {
                        position: toast.POSITION.TOP_LEFT,
                        toastId: 'success-toast-message',
                        autoClose: 1500,
                        closeOnClick: true,
                    });
                    cartCtx.clearBasket();
                } else if (res.status === "ORDER_FAILED") {
                    toast.error(<MessageComponent text={`Sifariş göndərilmədi! ${res.orderStateList[0].erpResponseMessage}`}/>, {
                        position: toast.POSITION.TOP_LEFT,
                        toastId: 'success-toast-message',
                        autoClose: 1500,
                        closeOnClick: true,
                    });
                }
            }).catch(err => {
                setIsSending(false);
                console.log(err);
            })
        }
        if (status === "SAVED" && handleNameSurnameValidation()) {
            setIsAddingWishlist(true);
            post(`http://bpaws01l:8087/api/order/wishlist`, order_data).then(res => {
                setIsAddingWishlist(false);
                history.push(`/allOrder`);
                toast.success(<MessageComponent text='Sifariş yadda saxlanıldı!'/>, {
                    position: toast.POSITION.TOP_LEFT,
                    toastId: 'success-toast-message',
                    autoClose: 1500,
                    closeOnClick: true,
                });
                cartCtx.clearBasket();
            }).catch(err => {
                setIsAddingWishlist(false);
                console.log(err);
            })
        }
    }

    if (isFetchingData) {
        return (
            <div className='display-absolute-center'>
                <Loader
                    type='Oval'
                    color='#00BFFF'
                    height={50}
                    width={50}
                />
            </div>
        );
    }

    return (
        <div className="row">
            <div className="col-lg-6">
                <div className="card">
                    <div className="list-group-item list-group-item-success">Sifarişin təsviri</div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table text-start">
                                <thead className="">
                                <tr>
                                    <th>Modelin adı</th>
                                    <th style={{width: '110px'}}>Qiyməti</th>
                                    <th style={{width: '110px'}}>Son qiyməti</th>
                                </tr>
                                </thead>
                                <tbody className="">
                                {checkoutState.items?.map(product => (
                                    <tr key={product.id}>
                                        <td>
                                            {product.name}
                                            <div className="text-success font-weight-bold">Sayı: {product.amount}</div>
                                        </td>
                                        <td>{product.price} AZN</td>
                                        <td>{(product.amount * product.discount_price).toFixed(2)} AZN</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <h6>Ödəniş forması</h6>
                            <div className="d-flex">
                                <span className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="paymentType"
                                        id="cash"
                                        onChange={e => handleInputChange("cash", e.target.checked)}
                                        checked={!!(paymentType === 0)}
                                    />
                                    <label className="form-check-label" htmlFor="cash">Nağd</label>
                                </span>
                                <span className="form-check ms-3">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="paymentType"
                                        id="credit"
                                        onChange={e => handleInputChange("credit", e.target.checked)}
                                        checked={!!(paymentType === 1)}
                                    />
                                    <label className="form-check-label" htmlFor="credit">Kredit</label>
                                </span>
                            </div>
                        </div>
                        <div className="mt-3">
                            <h6>Çatdırılma</h6>
                            <div className="d-flex">
                                <span className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="deliveryType"
                                        id="byStore"
                                        onChange={e => handleInputChange("byStore", e.target.checked)}
                                        checked={!!(deliveryType === 0)}
                                    />
                                    <label className="form-check-label" htmlFor="byStore">Mağaza</label>
                                </span>
                                <span className="form-check ms-3">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="deliveryType"
                                        id="byCustomer"
                                        onChange={e => handleInputChange("byCustomer", e.target.checked)}
                                        checked={!!(deliveryType === 1)}
                                    />
                                    <label className="form-check-label" htmlFor="byCustomer">Müştəri</label>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer">
                        <ul className="ps-0">
                            <li className="d-flex align-content-center justify-content-between mb-2">
                                <strong>Cəm məbləğ:</strong>
                                <div className="float-end">{cartCtx.totalAmount} AZN</div>
                            </li>
                            <li className="d-flex align-content-center justify-content-between mb-2">
                                <strong>Endirimli məbləğ:</strong>
                                <div className="float-end">{cartCtx.discountAmount} AZN</div>
                            </li>
                            <li className="d-flex align-content-center justify-content-between mb-2">
                                <strong>Qiymətdə dəyişiklik:</strong>
                                <div className="float-end"><input className="form-control" onBlur={onPriceChange}
                                                                  style={{width: '80px'}}/></div>
                            </li>
                            <li className="d-flex align-content-center justify-content-between mb-2">
                                <strong>Bank komissiyası:</strong>
                                <div className="float-end"><strong>{bankCommission} AZN</strong></div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="col-lg-6">
                <div className="card">
                    <div className="list-group-item list-group-item-success">Müştəri məlumatları</div>
                    <div className="card-body">
                        <h6>Müştəri bazasında axtarın</h6>
                        <div className="input-group row mb-3">
                            <div className="col-md-4 mb-2">
                                <label>Ad<span className="text-danger">*</span></label>
                                <input type="text" className="form-control"
                                       value={customerInfo && customerInfo?.name}
                                       onChange={e => handleInputChange("name", e.target.value)}/>
                                {!formValidation.name &&
                                <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                            </div>
                            <div className="col-md-4 mb-2">
                                <label>Soyad<span className="text-danger">*</span></label>
                                <input type="text" className="form-control"
                                       value={customerInfo && customerInfo?.surname}
                                       onChange={e => handleInputChange("surname", e.target.value)}/>
                                {!formValidation.surname &&
                                <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                            </div>
                            <div className="col-md-4 mb-2">
                                <label>Ata adı</label>
                                <input type="text" className="form-control"
                                       value={customerInfo && customerInfo?.patronymic}
                                       onChange={e => handleInputChange("patronymic", e.target.value)}/>
                            </div>
                            <div className="col-md-4">
                                <label>ŞV-i Fin Kod</label>
                                <input type="text" className="form-control"
                                       maxLength="7"
                                       value={customerInfo && customerInfo?.finCode}
                                       onChange={e => handleInputChange("finCode", e.target.value)}/>
                            </div>
                            <div className="col-md-5">
                                <label>Şəxsiyyət vəsiqəsi №-i</label>
                                <div className="row">
                                    <div className="col-md-4 pe-0">
                                        <select className="form-control form-select"
                                                value={customerInfo && customerInfo?.passport_series ? customerInfo?.passport_series : ''}
                                                onChange={e => handleInputChange("passport_series", e.target.value)}
                                                placeholder='ŞV seriyası'>
                                            <option value="AZE">AZE</option>
                                            <option value="AA">AA</option>
                                        </select>
                                    </div>
                                    <div className="col-md-8">
                                        <input type="number" className="form-control"
                                               maxLength="8"
                                               value={customerInfo && customerInfo?.identifierNumber}
                                               onChange={e => handleInputChange("identifierNumber", e.target.value)}/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 d-flex align-items-end">
                                <div className="btn btn-primary" onClick={searchOnDatabase}>Axtar</div>
                            </div>
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
                                    disabled={isRefactorDisabled.isDisabled}
                                />
                                <label className="form-check-label" htmlFor="refactorInfo">
                                    Məlumatları Yenilə
                                </label>
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label htmlFor='birthdate'>Doğum tarixi</label>
                                <DatePicker
                                    onChangeRaw={(e) => e.preventDefault()}
                                    disabled={isRefactorDisabled.birthdate}
                                    dateFormat="yyyy-MM-dd"
                                    className="form-control"
                                    renderCustomHeader={({
                                                             date,
                                                             changeYear,
                                                             changeMonth,
                                                             decreaseMonth,
                                                             increaseMonth,
                                                             prevMonthButtonDisabled,
                                                             nextMonthButtonDisabled,
                                                         }) => (
                                        <div
                                            style={{
                                                margin: 10,
                                                display: "flex",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                                                {"<"}
                                            </button>
                                            <select
                                                value={getYear(date)}
                                                onChange={({target: {value}}) => changeYear(value)}
                                            >
                                                {years.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>

                                            <select
                                                value={months[getMonth(date)]}
                                                onChange={({target: {value}}) =>
                                                    changeMonth(months.indexOf(value))
                                                }>
                                                {months.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>

                                            <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                                                {">"}
                                            </button>
                                        </div>
                                    )}
                                    selected={customerInfo.birthdate}
                                    onChange={(date) => handleInputChange("birthdate", date)}
                                />
                            </div>
                            <div className="col-md-6">
                                <label>Şəhər<span className="text-danger">*</span></label>
                                <Select
                                    isDisabled={isRefactorDisabled.city}
                                    styles={selectStyles}
                                    options={city}
                                    value={customerInfo && customerInfo?.city ? [{
                                        value: customerInfo?.city?.code,
                                        label: customerInfo?.city?.name
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
                                          disabled={isRefactorDisabled.address}
                                          value={customerInfo && customerInfo.address}
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
                                           disabled={isRefactorDisabled.mobile_phone}
                                           onChange={e => handleInputChange("mobile_phone", e.target.value)}
                                           value={customerInfo && customerInfo.mobile_phone}/>
                                {!formValidation.mobile_phone &&
                                <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                            </div>
                            <div className="col-md-6">
                                <label>Digər telefon</label>
                                <InputMask mask="(+\9\9499) 999-99-99" className="form-control"
                                           disabled={isRefactorDisabled.other_phone}
                                           onChange={e => handleInputChange("other_phone", e.target.value)}
                                           value={customerInfo && customerInfo.other_phone}/>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-md-12">
                                <label>Email</label>
                                <input className="form-control"
                                       disabled={isRefactorDisabled.email}
                                       onChange={e => handleInputChange("email", e.target.value)}
                                       value={customerInfo && customerInfo.email}/>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-12">
                                <div className="d-flex">
                                    <span className="form-check">
                                        <input
                                            disabled={isRefactorDisabled.gender}
                                            className="form-check-input"
                                            type="radio"
                                            name="gender"
                                            id="male"
                                            onChange={e => handleInputChange("male", e.target.checked)}
                                            checked={!!(customerInfo.gender === 1)}
                                        />
                                        <label className="form-check-label" htmlFor="male">Kişi</label>
                                    </span>
                                    <span className="form-check ms-3">
                                        <input
                                            disabled={isRefactorDisabled.gender}
                                            className="form-check-input"
                                            type="radio"
                                            name="gender"
                                            id="female"
                                            onChange={e => handleInputChange("female", e.target.checked)}
                                            checked={!!(customerInfo.gender === 0)}
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
                                    onChangeRaw={(e) => e.preventDefault()}
                                    dateFormat="yyyy-MM-dd"
                                    className="form-control"
                                    selected={paymentDate}
                                    onChange={(date) => setPaymentDate(date)}
                                    minDate={new Date()}
                                />
                                {!formValidation.delivery_date &&
                                <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                            </div>
                            <div className="col-md-6">
                                <label>Çatdırılma tarixi<span className="text-danger">*</span></label>
                                <DatePicker
                                    onChangeRaw={(e) => e.preventDefault()}
                                    dateFormat="yyyy-MM-dd"
                                    className="form-control"
                                    selected={deliveryDate}
                                    onChange={(date) => setDeliveryDate(date)}
                                    minDate={new Date()}
                                />
                                {!formValidation.payment_date &&
                                <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-md-12">
                                <label>Şərh</label>
                                <textarea className="form-control"
                                          onChange={e => handleInputChange("note", e.target.value)}
                                          value={customerInfo && customerInfo.note}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-md-12 d-flex justify-content-between">
                        <button
                            disabled={isAddingWishlist}
                            className="btn btn-warning"
                            onClick={sendOrder.bind(this, 'SAVED')}>
                            {isAddingWishlist ? "Gözləyin" : "Yadda saxla"}
                        </button>
                        <button
                            disabled={isSending}
                            className="btn btn-success"
                            onClick={sendOrder.bind(this, 'ORDERED')}>
                            {isSending ? "Gözləyin" : "Göndər"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout;