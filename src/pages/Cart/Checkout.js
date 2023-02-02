import {useEffect, useContext, useState} from 'react';
import {useHistory} from "react-router-dom";
import {toast} from "react-toastify";
import CartContext from "../../store/CartContext";
import AuthContext from "../../store/AuthContext";
import DatePicker from "react-datepicker";
import Select from "react-select";
import {selectStyles} from "../../helpers/selectStyles";
import {NoOptionsMessage} from "../../helpers/NoOptionsMessage";
import InputMask from "react-input-mask";
import {gql, useLazyQuery} from "@apollo/client";
import {get, post} from "../../api/Api";
import Loader from "react-loader-spinner";
import "react-datepicker/dist/react-datepicker.css";
import {formattedDate} from "../../helpers/formattedDate";
import BirthDateDatepicker from "../../components/birthDateDatepicker";
import { getHost } from "../../helpers/host";

const clientPurOptions = [
    { value: 0, label: 'Cehiz' },
    { value: 1, label: 'Yeniləmə/Şəxsi mənzil' },
    { value: 2, label: 'Bağ evi' },
    { value: 3, label: 'İcarə mənzil' },
    { value: 4, label: 'Hədiyyə' },
    { value: 5, label: 'Digər' },
]
const clientInterOptions = [
    { value: 0, label: 'Rəsmi səhifə' },
    { value: 1, label: 'Mağaza' },
    { value: 2, label: 'Sosial şəbəkə' },
    { value: 3, label: 'Reklam banner' },
    { value: 4, label: 'Sosial media' },
    { value: 5, label: 'Dost/Tanış/Ailə üzvləri məsləhəti' },
]

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

    const cartCtx = useContext(CartContext);
    const authCtx = useContext(AuthContext);
    const [isSending, setIsSending] = useState(false);
    const [isAddingWishlist, setIsAddingWishlist] = useState(false);
    const [checkoutState, setCheckoutState] = useState({
        items: [],
        id: '',
        user_uid: '',
        customerInfo: {
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
            gender: 1,
            email: '',
            note: '',
            client_pur: 0,
            client_inter: 0
        }
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
    const [paymentDate, setPaymentDate] = useState(new Date());
    const [deliveryDate, setDeliveryDate] = useState();
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
    const [creditPercent, setCreditPercent] = useState(2);
    const [customerSelected, setCustomerSelected] = useState(false)
    const [isNewCustomer, setIsNewCustomer] = useState(false)
    const [temporaryUserInfo, setTemporaryUserInfo] = useState({
        name: '',
        surname: '',
        patronymic: ''
    })
    const [lastSelectedUid, setLastSelectedUid] = useState('')

    const handlePercentChange = e => {
        const { value } = e.target;
        setCreditPercent(value);
    }

    const [getAvailableCustomer, {
        data: available_customer,
        loading: available_customer_loading
    }] = useLazyQuery(CUSTOMER_QUERY, {
        context: {headers: {authorization: `Bearer ${authCtx.token}`}},
        fetchPolicy: "network-only",
        onCompleted: () => {
            setCustomerSearch(true);
            if (available_customer.search.length) {
                setAvailableCustomer(available_customer.search);
            }
            if (available_customer.search.length === 1) {
                handleFullInfo(available_customer.search[0].uid)
            }
            setCustomerSelected(!available_customer.search.length)
        }, onError: (err) => {
            console.log(err)
        }
    });

    const [getFullInfo, {data: customer_full_info, loading: customer_full_loading}] = useLazyQuery(FULL_INFO_QUERY, {
        context: {headers: {authorization: `Bearer ${authCtx.token}`}},
        fetchPolicy: "network-only",
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
                setCheckoutState(prevState => ({
                    ...prevState,
                    customerInfo: {
                        ...prevState.customerInfo,
                        uid: customer_full_info.search[0].uid
                    }
                }));
                setCheckoutState(prevState => ({
                    ...prevState,
                    customerInfo: {
                        ...prevState.customerInfo,
                        name: customer_full_info.search[0].name.split(' ')[1]
                    }
                }));
                setCheckoutState(prevState => ({
                    ...prevState,
                    customerInfo: {
                        ...prevState.customerInfo,
                        surname: customer_full_info.search[0].name.split(' ')[0]
                    }
                }));
                setCheckoutState(prevState => ({
                    ...prevState,
                    customerInfo: {
                        ...prevState.customerInfo,
                        patronymic: customer_full_info.search[0].name.split(' ')[2]
                    }
                }));
                customer_full_info.search[0].details.forEach(detail => {
                    if (detail.infoTypeField.field === "Birthdate") {
                        setCheckoutState(prevState => ({
                            ...prevState,
                            customerInfo: {
                                ...prevState.customerInfo,
                                birthdate: new Date(detail.fieldValue?.split(" ")[0].replace(/(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3"))
                            }
                        }));
                    } else if (detail.infoTypeField.field === "City") {
                        get(`${getHost('sales', 8087)}/api/city/search?name.contains=${detail.fieldValue}`).then(res => {
                            if (res.content.length > 0) {
                                setCheckoutState(prevState => ({
                                    ...prevState,
                                    customerInfo: {
                                        ...prevState.customerInfo,
                                        city: {
                                            code: res.content[0].code,
                                            name: detail.fieldValue
                                        }
                                    }
                                }));
                            } else {
                                setCheckoutState(prevState => ({
                                    ...prevState,
                                    customerInfo: {
                                        ...prevState.customerInfo,
                                        city: {
                                            code: "000000079",
                                            name: "Digər"
                                        }
                                    }
                                }));
                            }
                        })
                    } else if (detail.infoTypeField.field === "DocumentPin") {
                        setCheckoutState(prevState => ({
                            ...prevState,
                            customerInfo: {
                                ...prevState.customerInfo,
                                finCode: detail.fieldValue
                            }
                        }));
                    } else if (detail.infoTypeField.field === "Number") {
                        setCheckoutState(prevState => ({
                            ...prevState,
                            customerInfo: {
                                ...prevState.customerInfo,
                                finCode: detail.fieldValue
                            }
                        }));
                    } else if (detail.infoTypeField.field === "Mobile") {
                        setCheckoutState(prevState => ({
                            ...prevState,
                            customerInfo: {
                                ...prevState.customerInfo,
                                mobile_phone: detail.fieldValue
                            }
                        }));
                        setOldCustomerInfo(prevState => ({
                            ...prevState,
                            mobile_phone: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "OtherPhone") {
                        setCheckoutState(prevState => ({
                            ...prevState,
                            customerInfo: {
                                ...prevState.customerInfo,
                                other_phone: detail.fieldValue
                            }
                        }));
                        setOldCustomerInfo(prevState => ({
                            ...prevState,
                            other_phone: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "Email") {
                        setCheckoutState(prevState => ({
                            ...prevState,
                            customerInfo: {
                                ...prevState.customerInfo,
                                email: detail.fieldValue
                            }
                        }));
                    } else if (detail.infoTypeField.field === "PhysicalAddress") {
                        setCheckoutState(prevState => ({
                            ...prevState,
                            customerInfo: {
                                ...prevState.customerInfo,
                                address: detail.fieldValue
                            }
                        }));
                        setOldCustomerInfo(prevState => ({
                            ...prevState,
                            address: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "Gender") {
                        setCheckoutState(prevState => ({
                            ...prevState,
                            customerInfo: {
                                ...prevState.customerInfo,
                                gender: detail.fieldValue === "Kişi" ? 1 : 0
                            }
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
            setCustomerSelected(true)
            if (cartCtx.savedId) {
                setAvailableCustomer((customer_full_info.search))
                setCustomerSelected(true)
            }
        },
        onError: (error) => {
            console.log(error)
        }
    })

    useEffect(() => {
        get(`${getHost('sales', 8087)}/api/city/table?page=0&size=100`).then((res) => {
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
        if (cartCtx.savedId) {
            post(`${getHost('sales', 8087)}/api/order/search?id.equals=${cartCtx.savedId}`).then(resOrderInfo => {
                setCheckoutState(prevState => ({
                    ...prevState,
                    id: resOrderInfo.content[0].id,
                    customerInfo: {
                        uid: resOrderInfo.content[0].client_uid,
                        name: resOrderInfo.content[0].client_name.split(' ')[1],
                        surname: resOrderInfo.content[0].client_name.split(' ')[0],
                        patronymic: resOrderInfo.content[0].client_name.split(' ')[2],
                        finCode: resOrderInfo.content[0].client_fin_code,
                        identifierNumber: resOrderInfo.content[0].client_number_passport,
                        passport_series: resOrderInfo.content[0].client_passport_series,
                        birthdate: resOrderInfo.content[0].client_date_born,
                        city: {
                            code: resOrderInfo.content[0].client_delivery_city_code,
                            name: ''
                        },
                        mobile_phone: resOrderInfo.content[0].client_mobil_phone,
                        other_phone: resOrderInfo.content[0].client_mobil_phone2,
                        address: resOrderInfo.content[0].client_delivery_address,
                        gender: resOrderInfo.content[0].client_gender,
                        email: resOrderInfo.content[0].client_mail,
                        note: resOrderInfo.content[0].comment
                    }
                }))
                setBankCommission(resOrderInfo.content[0].bank_cash);
                setDeliveryDate(resOrderInfo.content[0].delivery_date);
                setPaymentDate(resOrderInfo.content[0].payment_date);
                setPaymentType(resOrderInfo.content[0].payment_method);
                setDeliveryType(resOrderInfo.content[0].delivery_type);
                setCustomerSearch(true)
                setCustomerSelected(true)
                handleFullInfo(resOrderInfo.content[0].client_uid)
            })
        }
    }, [cartCtx]);

    const handleInputChange = (type, value) => {
        let alldata = {...checkoutState.customerInfo};
        if (temporaryUserInfo.hasOwnProperty(type)) {
            setTemporaryUserInfo(prev => ({
                ...prev,
                [type]: value
            }))
        }
        if (type === 'select_client_pur') {
            alldata = {
                ...alldata,
                client_pur: value
            }
        } else if (type === 'select_client_inter') {
            alldata = {
                ...alldata,
                client_inter: value
            }
        } else if (type === 'select_city') {
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
        } else if (type === `product_createsales${value.id}`) {
            // SHUOLD BE IMMUTABLE STATE CHANGE, BUT MUTABLE DONE INSTEAD
            checkoutState.items.find(item => item.id === value.id).product_createsales = value.checked;
        } else if (type === `product_reserve${value.id}`) {
            // SHUOLD BE IMMUTABLE STATE CHANGE, BUT MUTABLE DONE INSTEAD
            checkoutState.items.find(item => item.id === value.id).product_reserve = value.checked;
        } else if (type === 'cash') {
            setPaymentType(0);
            setBankCommission(0);
        } else if (type === "credit") {
            setPaymentType(1);
            setBankCommission(Math.round((cartCtx.discountAmount * creditPercent / 100) * 100) / 100)
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
                    city: false,
                    email: false
                }))
            } else {
                setIsRefactorDisabled(prevState => ({
                    ...prevState,
                    mobile_phone: true,
                    other_phone: true,
                    address: true,
                    city: true,
                    email: true
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

            if (type === 'surname' || type === 'name') {
                !alldata.name && !alldata.surname
                    ? setFormValidation(prevState => ({
                        ...prevState, name: false, surname: false
                    }))
                    : setFormValidation(prevState => ({
                        ...prevState, name: true, surname: true
                    }))
            }
        }
        setCheckoutState(prevState => ({
            ...prevState,
            customerInfo: alldata
        }));
    }

    useEffect(() => {
        if (paymentType === 1) {
            setBankCommission(Math.round((cartCtx.discountAmount * creditPercent / 100) * 100) / 100)
        }
    }, [creditPercent]);

    const searchOnDatabase = () => {
        setCustomerSelected(false)
        setAvailableCustomer([]);
        setCheckoutState(prevstate => ({
            ...prevstate,
            customerInfo: {
                ...prevstate.customerInfo,
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
            }
        }));
        setOldCustomerInfo({
            mobile_phone: '',
            other_phone: '',
            address: '',
        });

        const validNameSurnameSearchQuery = (checkoutState.customerInfo.surname.length >= 3 || checkoutState.customerInfo.name.length >= 3) && (checkoutState.customerInfo.surname.length !== 0 || checkoutState.customerInfo.name.length !== 0)

        if (handleNameSurnameValidation() && validNameSurnameSearchQuery) {
            const {
                surname, name, patronymic, identifierNumber, finCode
            } = checkoutState.customerInfo

            getAvailableCustomer({
                variables: {
                    name: `${surname} ${name} ${patronymic}`.trim(),
                    serial: identifierNumber || null,
                    finCode: finCode || null
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
        setLastSelectedUid(uid)
    }

    const handleNameSurnameValidation = () => {
        !checkoutState.customerInfo.name && !checkoutState.customerInfo.surname
            ? setFormValidation(prevState => ({
                ...prevState, name: false, surname: false
            }))
            : setFormValidation(prevState => ({
                ...prevState, name: true, surname: true
            }))
        return !!checkoutState.customerInfo.name || !!checkoutState.customerInfo.surname;
    }

    const handleValidation = () => {
        !checkoutState.customerInfo.name ? setFormValidation(prevState => ({
            ...prevState,
            name: false
        })) : setFormValidation(prevState => ({...prevState, name: true}))
        !checkoutState.customerInfo.surname ? setFormValidation(prevState => ({
            ...prevState,
            surname: false
        })) : setFormValidation(prevState => ({...prevState, surname: true}))
        !checkoutState.customerInfo.address ? setFormValidation(prevState => ({
            ...prevState,
            address: false
        })) : setFormValidation(prevState => ({...prevState, address: true}))
        !checkoutState.customerInfo.mobile_phone ? setFormValidation(prevState => ({
            ...prevState,
            mobile_phone: false
        })) : setFormValidation(prevState => ({...prevState, mobile_phone: true}))
        !checkoutState.customerInfo.other_phone ? setFormValidation(prevState => ({
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
        !checkoutState.customerInfo.city.code ? setFormValidation(prevState => ({
            ...prevState,
            city: false
        })) : setFormValidation(prevState => ({...prevState, city: true}))

        return !(!checkoutState.customerInfo.name || !checkoutState.customerInfo.surname || !checkoutState.customerInfo.city || !checkoutState.customerInfo.address ||
            !checkoutState.customerInfo.mobile_phone || !deliveryDate || !paymentDate);
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
                brand: item.brand,
                color_id: item.color_id,
                product_id: item.id,
                parent_id: item.parent_id,
                product_uid: item.uid,
                product_characteristic_uid: item.characteristic_uid,
                product_quantity: item.amount,
                product_name: item.name,
                category_id: item.category,
                parent_name: item.parent,
                product_price: item.price,
                product_discount: item.discount,
                product_total: item.amount * item.price,
                product_createsales: item.product_createsales,
                product_reserve: item.product_reserve
            })
        })
        const order_data = {
            user_uid: authCtx.user_uid,
            payment_date: formattedDate(paymentDate),
            delivery_date: formattedDate(deliveryDate),
            client_uid: checkoutState.customerInfo.uid,
            client_name: `${checkoutState.customerInfo.surname} ${checkoutState.customerInfo.name} ${checkoutState.customerInfo.patronymic}`,
            client_date_born: checkoutState.customerInfo.birthdate ? formattedDate(checkoutState.customerInfo.birthdate) : "0001-01-01",
            client_gender: checkoutState.customerInfo.gender,
            client_new_phone: customerRefactoringInfo.mobile_phone ?
                (oldCustomerInfo.mobile_phone === customerRefactoringInfo.mobile_phone ? 0 : 1) : 0,
            client_mobil_phone: checkoutState.customerInfo.mobile_phone,
            client_new_phone2: customerRefactoringInfo.other_phone ?
                (oldCustomerInfo.other_phone === customerRefactoringInfo.other_phone ? 0 : 1) : 0,
            client_mobil_phone2: checkoutState.customerInfo.other_phone,
            client_new_delivery_address: customerRefactoringInfo.address ?
                (oldCustomerInfo.address === customerRefactoringInfo.address ? 0 : 1) : 0,
            client_delivery_city_code: checkoutState.customerInfo.city.code,
            client_delivery_address: checkoutState.customerInfo.address,
            client_mail: checkoutState.customerInfo.email,
            comment: checkoutState.customerInfo.note,
            delivery_type: deliveryType,
            payment_method: paymentType,
            client_number_passport: checkoutState.customerInfo.identifierNumber,
            client_fin_code: checkoutState.customerInfo.finCode,
            client_passport_series: checkoutState.customerInfo.passport_series,
            goods: order_goods,
            bank_cash: bankCommission
        }
        if (status === "ORDERED" && handleValidation()) {
            setIsSending(true);
            post(`${getHost('sales', 8087)}/api/order/send`, order_data).then(res => {
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
                    toast.error(<MessageComponent
                        text={`Sifariş göndərilmədi! ${res.orderStateList[0].erpResponseMessage}`}/>, {
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
            post(`${getHost('sales', 8087)}/api/order/wishlist`, order_data).then(res => {
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
                                    {/*<th style={{width: '110px'}}>Distribütora göndərilsin</th>*/}
                                    {/*<th style={{width: '110px'}}>Rezerv olunsun</th>*/}
                                    <th>Modelin adı</th>
                                    <th style={{width: '110px'}}>Qiyməti</th>
                                    <th style={{width: '110px'}}>Son qiyməti</th>
                                </tr>
                                </thead>
                                <tbody className="">
                                {checkoutState.items?.map(product => (
                                    <tr key={product.id}>
                                        {/*<td>*/}
                                        {/*    <input*/}
                                        {/*        className="form-check-input me-2"*/}
                                        {/*        type="checkbox"*/}
                                        {/*        name={`product_createsales${product.id}`}*/}
                                        {/*        id={`product_createsales${product.id}`}*/}
                                        {/*        onChange={e => handleInputChange(`product_createsales${product.id}`, { id: product.id, checked: e.target.checked })}*/}
                                        {/*        checked={product.product_createsales}*/}
                                        {/*    />*/}
                                        {/*    <label className="form-check-label" htmlFor={`product_createsales${product.id}`}>{product.product_createsales ? 'Bəli' : 'Xeyr'}</label>*/}
                                        {/*</td>*/}

                                        {/*<td>*/}
                                        {/*    <input*/}
                                        {/*        className="form-check-input me-2"*/}
                                        {/*        type="checkbox"*/}
                                        {/*        name={`product_reserve${product.id}`}*/}
                                        {/*        id={`product_reserve${product.id}`}*/}
                                        {/*        onChange={e => handleInputChange(`product_reserve${product.id}`, { id: product.id, checked: e.target.checked })}*/}
                                        {/*        checked={product.product_reserve}*/}
                                        {/*        disabled={!product.product_createsales}*/}
                                        {/*    />*/}
                                        {/*    <label className="form-check-label" htmlFor={`product_reserve${product.id}`}>{product.product_reserve ? 'Bəli' : 'Xeyr'}</label>*/}
                                        {/*</td>*/}

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
                        {
                            paymentType === 1 ? <div className="w-50 mt-3">
                                <h6>Kredit faizi</h6>
                                <input
                                    className="form-control"
                                    value={creditPercent}
                                    onChange={handlePercentChange}
                                />
                            </div> : null
                        }
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
                            {
                                (!(checkoutState.customerInfo.surname.length >= 3 || checkoutState.customerInfo.name.length >= 3)
                                    && (checkoutState.customerInfo.surname.length !== 0 || checkoutState.customerInfo.name.length !== 0))
                                && <div className='col-12'>
                                    <small className='text-danger'>
                                        Axtarış üçün ad və ya soyad xanasına ən azı 3 simvol daxil edin.
                                    </small>
                                </div>
                            }
                            <div className="col-md-4 mb-2">
                                {/*<label>Soyad<span className="text-danger">*</span></label>*/}
                                <label>Soyad</label>
                                <input type="text" className="form-control"
                                       value={checkoutState.customerInfo && checkoutState.customerInfo?.surname}
                                       onChange={e => handleInputChange("surname", e.target.value)}/>
                                {!formValidation.surname &&
                                    <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                            </div>
                            <div className="col-md-4 mb-2">
                                {/*<label>Ad<span className="text-danger">*</span></label>*/}
                                <label>Ad</label>
                                <input type="text" className="form-control"
                                       value={checkoutState.customerInfo && checkoutState.customerInfo?.name}
                                       onChange={e => handleInputChange("name", e.target.value)}/>
                                {!formValidation.name &&
                                    <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                            </div>
                            <div className="col-md-4 mb-2">
                                <label>Ata adı</label>
                                <input type="text" className="form-control"
                                       value={checkoutState.customerInfo && checkoutState.customerInfo?.patronymic}
                                       onChange={e => handleInputChange("patronymic", e.target.value)}/>
                            </div>
                            <div className="col-md-4">
                                <label>ŞV-i Fin Kod</label>
                                <input type="text" className="form-control"
                                       maxLength="7"
                                       value={checkoutState.customerInfo && checkoutState.customerInfo?.finCode}
                                       onChange={e => handleInputChange("finCode", e.target.value)}/>
                            </div>
                            <div className="col-md-5">
                                <label>Şəxsiyyət vəsiqəsi №-i</label>
                                <div className="row">
                                    <div className="col-md-4 pe-0">
                                        <select className="form-control form-select"
                                                value={checkoutState.customerInfo && checkoutState.customerInfo?.passport_series ? checkoutState.customerInfo?.passport_series : ''}
                                                onChange={e => handleInputChange("passport_series", e.target.value)}
                                                placeholder='ŞV seriyası'>
                                            <option value="AZE">AZE</option>
                                            <option value="AA">AA</option>
                                        </select>
                                    </div>
                                    <div className="col-md-8">
                                        <InputMask mask="99999999"
                                                   className="form-control"
                                                   value={checkoutState.customerInfo && checkoutState.customerInfo?.identifierNumber}
                                                   onChange={e => handleInputChange("identifierNumber", e.target.value)}/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 d-flex align-items-end">
                                <div
                                    className="btn btn-primary"
                                    onClick={searchOnDatabase}
                                >Axtar</div>
                            </div>
                        </div>
                        {available_customer_loading && <p>Məlumat yüklənir...</p>}
                        {customerSearch && (availableCustomer?.length ?
                            <div>
                                {!isNewCustomer && availableCustomer?.length > 1 ? <><label className={customerSelected ? '' : 'text-danger'}>Zəhmət olmasa müştərini siyahıdan seçin:</label>
                                    <select className="form-control form-select mb-3"
                                            defaultValue={'DEFAULT'}
                                            onChange={e => handleFullInfo(e.target.value)}>
                                        <option value='DEFAULT' disabled>Müştəri seçin</option>
                                        {availableCustomer.map(customer => (
                                            <option key={customer.uid} value={customer.uid}>{customer.name}</option>
                                        ))}
                                    </select></> : null}
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="isNewCustomer"
                                        onChange={e => {
                                            setIsNewCustomer(e.target.checked)
                                            if (e.target.checked) {
                                                setCheckoutState(prevState => ({
                                                    ...prevState,
                                                    customerInfo: {
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
                                                        gender: 1,
                                                        email: '',
                                                        note: '',
                                                        ...temporaryUserInfo
                                                    }
                                                }));
                                            } else {
                                                if (lastSelectedUid) {
                                                    handleFullInfo(lastSelectedUid)
                                                }
                                            }
                                        }}
                                    />
                                    <label className="form-check-label" htmlFor="isNewCustomer">
                                        Yeni müştəri
                                    </label>
                                </div>
                            </div>
                            : availableCustomer?.length < 1
                                ? <p>Məlumat tapılmadı.</p>
                                : null
                        )}
                        {(customerSearch && availableCustomer?.length && customerSelected && !isNewCustomer) ? <div className="mb-3">
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
                        </div> : null}

                        {customerSearch && (customerSelected || isNewCustomer) && <>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label htmlFor='birthdate'>Doğum tarixi</label>
                                    <BirthDateDatepicker
                                        selectedDate={checkoutState.customerInfo.birthdate ? new Date(checkoutState.customerInfo.birthdate) : ""}
                                        isDisabled={isRefactorDisabled.birthdate && (availableCustomer?.length && !isNewCustomer)}
                                        onDateChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label>Şəhər<span className="text-danger">*</span></label>
                                    <Select
                                        isDisabled={isRefactorDisabled.city && (availableCustomer?.length && !isNewCustomer)}
                                        styles={selectStyles}
                                        options={city}
                                        value={checkoutState.customerInfo && checkoutState.customerInfo?.city ? [{
                                            value: checkoutState.customerInfo?.city?.code,
                                            label: checkoutState.customerInfo?.city?.name
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
                                              disabled={isRefactorDisabled.address && (availableCustomer?.length && !isNewCustomer)}
                                              value={checkoutState.customerInfo && checkoutState.customerInfo.address}
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
                                               disabled={isRefactorDisabled.mobile_phone && (availableCustomer?.length && !isNewCustomer)}
                                               onChange={e => handleInputChange("mobile_phone", e.target.value)}
                                               value={checkoutState.customerInfo && checkoutState.customerInfo.mobile_phone}/>
                                    {!formValidation.mobile_phone &&
                                        <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                                </div>
                                <div className="col-md-6">
                                    <label>Digər telefon</label>
                                    <InputMask mask="(+\9\9499) 999-99-99" className="form-control"
                                               disabled={isRefactorDisabled.other_phone && (availableCustomer?.length && !isNewCustomer)}
                                               onChange={e => handleInputChange("other_phone", e.target.value)}
                                               value={checkoutState.customerInfo && checkoutState.customerInfo.other_phone}/>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <label>Email</label>
                                    <input className="form-control"
                                           disabled={isRefactorDisabled.email && (availableCustomer?.length && !isNewCustomer)}
                                           onChange={e => handleInputChange("email", e.target.value)}
                                           value={checkoutState.customerInfo && checkoutState.customerInfo.email}/>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-12">
                                    <div className="d-flex">
                                    <span className="form-check">
                                        <input
                                            disabled={isRefactorDisabled.gender && (availableCustomer?.length && !isNewCustomer)}
                                            className="form-check-input"
                                            type="radio"
                                            name="gender"
                                            id="male"
                                            onChange={e => handleInputChange("male", e.target.checked)}
                                            checked={(checkoutState.customerInfo.gender === 1)}
                                        />
                                        <label className="form-check-label" htmlFor="male">Kişi</label>
                                    </span>
                                        <span className="form-check ms-3">
                                        <input
                                            disabled={isRefactorDisabled.gender && (availableCustomer?.length && !isNewCustomer)}
                                            className="form-check-input"
                                            type="radio"
                                            name="gender"
                                            id="female"
                                            onChange={e => handleInputChange("female", e.target.checked)}
                                            checked={(checkoutState.customerInfo.gender === 0)}
                                        />
                                        <label className="form-check-label" htmlFor="female">Qadın</label>
                                    </span>
                                    </div>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label>Alışın məqsədi<span className="text-danger">*</span></label>
                                    <Select
                                        styles={selectStyles}
                                        options={clientPurOptions}
                                        defaultValue={clientPurOptions[0]}
                                        components={(props) => NoOptionsMessage(props, 'Alışın məqsədi üçün seçimlər tapılmadı.')}
                                        onChange={value => handleInputChange("select_client_pur", value.value)}
                                        placeholder='Alışın məqsədini seçin...'
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label>Məlumat mənbəyi<span className="text-danger">*</span></label>
                                    <Select
                                        styles={selectStyles}
                                        options={clientInterOptions}
                                        defaultValue={clientInterOptions[0]}
                                        components={(props) => NoOptionsMessage(props, 'Məlumat mənbəyi üçün seçimlər tapılmadı.')}
                                        onChange={value => handleInputChange("select_client_inter", value.value)}
                                        placeholder='Məlumat mənbəyini seçin...'
                                    />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label>Ödəniş tarixi<span className="text-danger">*</span></label>
                                    <DatePicker
                                        onChangeRaw={(e) => e.preventDefault()}
                                        dateFormat="yyyy-MM-dd"
                                        className="form-control"
                                        selected={new Date(paymentDate)}
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
                                        selected={deliveryDate ? new Date(deliveryDate) : ''}
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
                                              value={checkoutState.customerInfo && checkoutState.customerInfo.note}/>
                                </div>
                            </div>
                        </>}
                    </div>
                </div>
                {customerSearch && (customerSelected || isNewCustomer) && <div className="row mt-3">
                    <div className="col-md-12 d-flex justify-content-end">
                        <button
                            disabled={isAddingWishlist}
                            className="btn btn-warning me-2"
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
                </div>}
            </div>
        </div>
    )
}

export default Checkout;