import {useState, useEffect, useContext} from "react";
import Modal from '../../UI/Modal';
import CountUpdate from "../../UI/CountUpdate";
import DatePicker from "react-datepicker";
import getYear from "date-fns/getYear";
import getMonth from "date-fns/getYear";
import Select from "react-select";
import {selectStyles} from "../../helpers/selectStyles";
import {NoOptionsMessage} from "../../helpers/NoOptionsMessage";
import InputMask from "react-input-mask";
import {gql, useLazyQuery} from "@apollo/client";
import {get, post} from "../../api/Api";
import AuthContext from "../../store/AuthContext";

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
    const authCtx = useContext(AuthContext);
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
    const [paymentDate, setPaymentDate] = useState();
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
    const [orderInfo, setOrderInfo] = useState({});

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
                setOrderInfo(prevState => ({
                    ...prevState,
                    client_uid: customer_full_info.search[0].uid
                }));
                setOrderInfo(prevState => ({
                    ...prevState,
                    client_name: customer_full_info.search[0].name
                }));
                customer_full_info.search[0].details.forEach(detail => {
                    if (detail.infoTypeField.field === "Birthdate") {
                        setOrderInfo(prevstate => ({
                            ...prevstate,
                            client_date_born: new Date(detail.fieldValue?.split(" ")[0].replace(/(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3"))
                        }));
                    } else if (detail.infoTypeField.field === "City") {
                        get(`http://bpaws01l:8087/api/city/search?name.contains=${detail.fieldValue}`).then(res => {
                            if (res.content.length > 0) {
                                setOrderInfo(prevstate => ({
                                    ...prevstate,
                                    client_delivery_city_code: res.context[0].code
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
                            client_fin_code: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "Number") {
                        setOrderInfo(prevstate => ({
                            ...prevstate,
                            client_number_passport: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "Mobile") {
                        setOrderInfo(prevstate => ({
                            ...prevstate,
                            client_mobil_phone: detail.fieldValue
                        }));
                        setOldCustomerInfo(prevstate => ({
                            ...prevstate,
                            client_mobil_phone: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "OtherPhone") {
                        setOrderInfo(prevstate => ({
                            ...prevstate,
                            client_mobil_phone2: detail.fieldValue
                        }));
                        setOldCustomerInfo(prevstate => ({
                            ...prevstate,
                            client_mobil_phone2: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "Email") {
                        setOrderInfo(prevstate => ({
                            ...prevstate,
                            client_mail: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "PhysicalAddress") {
                        setOrderInfo(prevstate => ({
                            ...prevstate,
                            client_delivery_address: detail.fieldValue
                        }));
                        setOldCustomerInfo(prevstate => ({
                            ...prevstate,
                            client_delivery_address: detail.fieldValue
                        }));
                    } else if (detail.infoTypeField.field === "Gender") {
                        setOrderInfo(prevstate => ({
                            ...prevstate,
                            client_gender: detail.fieldValue === "Kişi" ? 1 : 0
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
    }, [props.info])

    const handleOrderInfo = (resOrderInfo) => {
        const products = [];
        let total_price=0;
        let discount_total_price=0;
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
                    ...resOrderInfo,
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
                client_gender: 1
            }
        } else if (type === "female") {
            alldata = {
                ...alldata,
                client_gender: 0
            }
        } else if (type === "refactor") {
            if (value) {
                setIsRefactorDisabled(prevState => ({
                    ...prevState,
                    client_mobil_phone: false,
                    client_mobil_phone2: false,
                    client_delivery_address: false,
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
                    name: `${orderInfo.name}`,
                    serial: orderInfo.client_number_passport ? orderInfo.client_number_passport : null,
                    finCode: orderInfo.client_fin_code ? orderInfo.client_fin_code : null
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
        !orderInfo.client_delivery_address ? setFormValidation(prevState => ({
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
        !deliveryDate ? setFormValidation(prevState => ({
            ...prevState,
            delivery_date: false
        })) : setFormValidation(prevState => ({...prevState, delivery_date: true}))
        !paymentDate ? setFormValidation(prevState => ({
            ...prevState,
            payment_date: false
        })) : setFormValidation(prevState => ({...prevState, payment_date: true}))
        !orderInfo.city.code ? setFormValidation(prevState => ({
            ...prevState,
            city: false
        })) : setFormValidation(prevState => ({...prevState, city: true}))

        return !(!orderInfo.name || !orderInfo.city || !orderInfo.address || !orderInfo.mobile_phone || !deliveryDate || !paymentDate);
    }

    const handleCountUpdate = (id, enteredAmount) => {
        const enteredAmountNumber = +enteredAmount;
        if (enteredAmount.trim().length === 0 || enteredAmountNumber < 1 || enteredAmountNumber > 12) {
            return;
        } else {
            const updatedItem = [];
            let updatedGoods = [];
            orderInfo.goods.map(good => {
                good.id === id ? updatedGoods.push({
                    ...good,
                    product_quantity: enteredAmountNumber
                }) : updatedGoods.push(good);
            })
            updatedItem.push({
                ...props.info,
                goods: updatedGoods
            })
            setOrderInfo(...updatedItem);
        }
    }

    const sendWishListOrder = () => {
        if(handleValidation()){
            setIsSending(true);
            post(`http://bpaws01l:8087/api/order/update/${orderInfo.id}`, orderInfo).then(res => {
                setIsSending(false);
            }).catch(err => {
                setIsSending(false);
                console.log(err)
            });
        }else{

        }
    }

    return (
        <Modal onClose={props.onClose}>
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
                                    {props.info.status === "SAVED" && <th></th>}
                                </tr>
                                </thead>
                                <tbody>
                                {orderInfo && orderInfo?.goods?.map(item => (
                                    <tr key={item.id}>
                                        <td><b>{item.product_name}</b></td>
                                        <td>{props.info.status === "SAVED" ?
                                            <CountUpdate id={item.id} quantity={item.product_quantity}
                                                         onHandleUpdate={handleCountUpdate}/>
                                            : item.product_quantity}</td>
                                        <td>{item.product_price} AZN</td>
                                        <td>{item.product_discount.toFixed(2)} %</td>
                                        <td>{(item.product_price * item.product_quantity - item.product_quantity * item.product_price * item.product_discount / 100).toFixed(2)} AZN</td>
                                        {orderInfo.status === "SAVED" &&
                                        <td><i className="far fa-trash-alt text-danger cursor-pointer" onClick={() => {
                                            props.onItemDelete(item.id)
                                        }}/></td>}
                                    </tr>
                                ))}
                                {/*{props.info?.orderStateList ?
                                    <tr>
                                        <th colSpan="4">
                                            <div className="text-end">Sifarişin kodu</div>
                                        </th>
                                        {props.info?.orderStateList?.map((info, i) => <th
                                            key={i}>{info.erpResponseMessage.split(' ')[2]}</th>)}
                                    </tr> : ''
                                }*/}
                                <tr>
                                    <th colSpan="5">
                                        <div className="text-end">Endirimsiz məbləğ</div>
                                    </th>
                                    <th>{orderInfo.totalPrice} AZN</th>
                                </tr>
                                <tr>
                                    <th colSpan="5">
                                        <div className="text-end">Ödəniləcək məbləğ</div>
                                    </th>
                                    <th>{orderInfo.discountPrice} AZN</th>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="tab-pane fade" id="customer-info" role="tabpanel"
                             aria-labelledby="customer-info">
                            <h6>Müştəri bazasında axtarın</h6>
                            <div className="input-group row mb-3">
                                <div className="col-md-4 mb-2">
                                    <label>Ad<span className="text-danger">*</span></label>
                                    <input type="text" className="form-control"
                                           value={orderInfo && orderInfo?.client_name?.split(' ')[1]}
                                           onChange={e => handleInputChange("client_name", e.target.value)}/>
                                    {!formValidation.name &&
                                    <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                                </div>
                                <div className="col-md-4 mb-2">
                                    <label>Soyad<span className="text-danger">*</span></label>
                                    <input type="text" className="form-control"
                                           value={orderInfo && orderInfo?.client_name?.split(' ')[0]}
                                           onChange={e => handleInputChange("client_name", e.target.value)}/>
                                    {!formValidation.surname &&
                                    <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                                </div>
                                <div className="col-md-4 mb-2">
                                    <label>Ata adı</label>
                                    <input type="text" className="form-control"
                                           value={orderInfo && orderInfo?.client_name?.split(' ')[2]}
                                           onChange={e => handleInputChange("client_name", e.target.value)}/>
                                </div>
                                <div className="col-md-4">
                                    <label>ŞV-i Fin Kod</label>
                                    <input type="text" className="form-control"
                                           maxLength="7"
                                           value={orderInfo && orderInfo?.client_fin_code}
                                           onChange={e => handleInputChange("client_fin_code", e.target.value)}/>
                                </div>
                                <div className="col-md-5">
                                    <label>Şəxsiyyət vəsiqəsi №-i</label>
                                    <div className="row">
                                        <div className="col-md-4 pe-0">
                                            <select className="form-control"
                                                    value={orderInfo && orderInfo?.client_passport_series ? orderInfo?.client_passport_series : ''}
                                                    onChange={e => handleInputChange("client_passport_series", e.target.value)}
                                                    placeholder='ŞV seriyası'>
                                                <option value="AZE">AZE</option>
                                                <option value="AA">AA</option>
                                            </select>
                                        </div>
                                        <div className="col-md-8">
                                            <input type="number" className="form-control"
                                                   maxLength="8"
                                                   value={orderInfo && orderInfo?.client_number_passport}
                                                   onChange={e => handleInputChange("client_number_passport", e.target.value)}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 d-flex align-items-end">
                                    <div className="btn btn-primary" onClick={searchOnDatabase}>Axtar</div>
                                </div>
                            </div>
                            {available_customer_loading && <p>Məlumat yüklənir...</p>}
                            {customerSearch && (availableCustomer?.length ?
                                <select className="form-control mb-3"
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
                                        disabled={isRefactorDisabled.birthdate}
                                        dateFormat="dd.MM.yyyy"
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
                                        onChange={(date) => handleInputChange("client_date_born", date)}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label>Şəhər<span className="text-danger">*</span></label>
                                    <Select
                                        isDisabled={isRefactorDisabled.city}
                                        styles={selectStyles}
                                        options={city}
                                        value={orderInfo && orderInfo?.client_delivery_city_code ? [{
                                            value: orderInfo?.city?.code,
                                            label: orderInfo?.city?.name
                                        }] : ''}
                                        components={(props) => NoOptionsMessage(props, 'Şəhər tapılmadı.')}
                                        onChange={value => handleInputChange("client_delivery_city", value)}
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
                                              value={orderInfo && orderInfo?.client_delivery_address}
                                              onChange={e => handleInputChange("client_delivery_address", e.target.value)}
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
                                               onChange={e => handleInputChange("client_mobil_phone", e.target.value)}
                                               value={orderInfo && orderInfo?.client_mobil_phone}/>
                                    {!formValidation.mobile_phone &&
                                    <small className="text-danger">Xananı doldurmaq mütləqdir.</small>}
                                </div>
                                <div className="col-md-6">
                                    <label>Digər telefon</label>
                                    <InputMask mask="(+\9\9499) 999-99-99" className="form-control"
                                               disabled={isRefactorDisabled.other_phone}
                                               onChange={e => handleInputChange("client_mobil_phone2", e.target.value)}
                                               value={orderInfo && orderInfo?.client_mobil_phone2}/>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <label>Email</label>
                                    <input className="form-control"
                                           disabled={isRefactorDisabled.email}
                                           onChange={e => handleInputChange("client_mail", e.target.value)}
                                           value={orderInfo && orderInfo?.client_mail}/>
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
                                            checked={!!(orderInfo && orderInfo?.client_gender === 1)}
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
                                            checked={!!(orderInfo && orderInfo?.client_gender === 1)}
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
                                              value={orderInfo && orderInfo.note}/>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div className="d-flex justify-content-end mt-2">
                {props.info.status === "SAVED" &&
                    <button className="btn btn-success me-2" disabled={isSending} onClick={sendWishListOrder}>{isSending ? "Gözləyin" : "Sifarişi göndər"}</button>
                }
                <div className="btn btn-primary" onClick={props.onClose}>Bağla</div>
            </div>
        </Modal>
    );
};

export default OrderInfo;