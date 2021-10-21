import Select from "react-select";
import {selectStyles} from "../../helpers/selectStyles";
import InputMask from 'react-input-mask';
import Loader from 'react-loader-spinner';
import {NoOptionsMessage} from "../../helpers/NoOptionsMessage";
import React, {useEffect, useState} from "react";
import {gql, useLazyQuery} from "@apollo/client";
import DatePicker  from 'react-datepicker';
import getYear from "date-fns/getYear";
import getMonth from "date-fns/getYear";
import "react-datepicker/dist/react-datepicker.css";
import {get} from "../../api/Api";

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

const CustomerInfo = () => {
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [city, setCity] = useState([]);
    const [isRefactorDisabled, setIsRefactorDisabled] = useState(true);
    const [customerSearch, setCustomerSearch] = useState(false);
    const [orderDate, setOrderDate] = useState();
    const [deliveryDate, setDeliveryDate] = useState();
    const [nameInvalid, setNameInvalid] = useState(false);
    const [surnameInvalid, setSurnameInvalid] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({
        uid: '',
        name: '',
        surname: '',
        patronymic: '',
        finCode: '',
        identifierNumber: '',
        birthdate: '',
        city: {
            "id": '',
            'name': ''
        },
        mobile_phone: '',
        other_phone: '',
        address: '',
        gender: '',
        email: '',
        note: ''
    });
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

    const [getAvailableCustomer, {data: available_customer, loading: available_customer_loading}] = useLazyQuery(CUSTOMER_QUERY);
    const [getFullInfo, {data: customer_full_info, loading: customer_full_loading}] = useLazyQuery(FULL_INFO_QUERY, {
        onCompleted: () => {
            console.log(customer_full_info);
            if(customer_full_info){
                setIsRefactorDisabled(false);
                setCustomerInfo(prevState => ({
                    ...prevState,
                    uid: customer_full_info.search[0].uid
                }))
                customer_full_info.search[0].details.forEach(detail => {
                    if(detail.infoTypeField.field === "Birthdate"){
                        setCustomerInfo(prevstate => ({
                            ...prevstate,
                            birthdate: new Date(detail.fieldValue?.split(" ")[0].replace( /(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3"))
                        }));
                    }else if(detail.infoTypeField.field === "City"){
                        setCustomerInfo(prevstate => ({
                            ...prevstate,
                            city: {
                                id: '',
                                name: detail.fieldValue
                            }
                        }));
                    }else if(detail.infoTypeField.field === "DocumentPin"){
                        setCustomerInfo(prevstate => ({
                            ...prevstate,
                            finCode: detail.fieldValue
                        }));
                    }else if(detail.infoTypeField.field === "Number"){
                        setCustomerInfo(prevstate => ({
                            ...prevstate,
                            identifierNumber: detail.fieldValue
                        }));
                    }else if(detail.infoTypeField.field === "Mobile"){
                        setCustomerInfo(prevstate => ({
                            ...prevstate,
                            mobile_phone: detail.fieldValue
                        }));
                    }else if(detail.infoTypeField.field === "OtherPhone"){
                        setCustomerInfo(prevstate => ({
                            ...prevstate,
                            other_phone: detail.fieldValue
                        }));
                    }else if(detail.infoTypeField.field === "Email"){
                        setCustomerInfo(prevstate => ({
                            ...prevstate,
                            email: detail.fieldValue
                        }));
                    }else if(detail.infoTypeField.field === "PhysicalAddress"){
                        setCustomerInfo(prevstate => ({
                            ...prevstate,
                            address: detail.fieldValue
                        }));
                    }else if(detail.infoTypeField.field === "Gender"){
                        setCustomerInfo(prevstate => ({
                            ...prevstate,
                            gender: detail.fieldValue === "Kişi" ? 1 : 0
                        }));
                    }
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
                value: city.id,
                label: `${city.name}`,
            })));
        }).catch((err) => {
            setIsFetchingData(false);
        });
    }, [])

    const searchOnDatabase = () => {
        if ((customerInfo.name.length && customerInfo.surname.length) || customerInfo.finCode || customerInfo.identifierNumber) {
            getAvailableCustomer({
                variables: {
                    name: `${customerInfo.surname} ${customerInfo.name}`,
                    serial: customerInfo.identifierNumber ? customerInfo.identifierNumber : null,
                    finCode: customerInfo.finCode ? customerInfo.finCode : null
                }
            });
            setCustomerSearch(true);
        }
    }

    const handleInputChange = (type, value) => {
        let alldata = {...customerInfo};
        if (type === 'select_city') {
            alldata = {
                ...alldata,
                city: {
                    id: value.value,
                    name: value.label
                }
            }
        } else if(type==="male") {
            alldata = {
                ...alldata,
                gender: 1
            }
        } else if(type==="female") {
            alldata = {
                ...alldata,
                gender: 0
            }
        }else{
            alldata = {
                ...alldata,
                [type]: value
            }
        }
        setCustomerInfo(alldata);
    }

    const handleFullInfo = (uid) => {
        getFullInfo({
            variables: {
                uid: `${uid}`
            }
        });
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
        <div className="card">
            <div className="list-group-item list-group-item-success">Müştəri məlumatları</div>
            <div className="card-body">
                <h6>Müştəri bazasında axtarın</h6>
                <div className="input-group row mb-3">
                    <div className="col-md-4 mb-2">
                        <label>Ad<span className="text-danger">*</span></label>
                        <input type="text" className="form-control"
                               onChange={e => handleInputChange("name", e.target.value)}/>
                        {nameInvalid && <span className="text-danger">Xananın doldurulması vacibdir.</span>}
                    </div>
                    <div className="col-md-4 mb-2">
                        <label>Soyad<span className="text-danger">*</span></label>
                        <input type="text" className="form-control"
                               onChange={e => handleInputChange("surname", e.target.value)}/>
                        {surnameInvalid && <span className="text-danger">Xananın doldurulması vacibdir.</span>}
                    </div>
                    <div className="col-md-4 mb-2">
                        <label>Ata adı</label>
                        <input type="text" className="form-control"
                               onChange={e => handleInputChange("patronymic", e.target.value)}/>
                    </div>
                    <div className="col-md-5">
                        <label>Şəxsiyyət vəsiqəsi Fin Kod</label>
                        <input type="text" className="form-control"
                               value={customerInfo && customerInfo?.finCode}
                               onChange={e => handleInputChange("finCode", e.target.value)}/>
                    </div>
                    <div className="col-md-4">
                        <label>Şəxsiyyət vəsiqəsi №-i</label>
                        <input type="text" className="form-control"
                               value={customerInfo && customerInfo?.identifierNumber}
                               onChange={e => handleInputChange("identifierNumber", e.target.value)}/>
                    </div>
                    <div className="col-md-3 d-flex align-items-end">
                        <div className="btn btn-primary" onClick={searchOnDatabase}>Axtar</div>
                    </div>
                </div>
                {available_customer_loading && <p>Məlumat yüklənir...</p>}
                {customerSearch && (available_customer?.search.length ?
                <select className="form-control mb-3" onChange={e => handleFullInfo(e.target.value)}>
                    <option selected={true} disabled>Mümkün Siyahı</option>
                    {available_customer.search.map(customer => (
                        <option key={customer.uid} value={customer.uid}>{customer.name}</option>
                    ))}
                </select> : <p>Məlumat tapılmadı.</p>)}
                <div className="mb-3">
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="refactorInfo"
                            disabled={isRefactorDisabled}
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
                                        onChange={({ target: { value } }) => changeYear(value)}
                                    >
                                        {years.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={months[getMonth(date)]}
                                        onChange={({ target: { value } }) =>
                                            changeMonth(months.indexOf(value))
                                        }
                                    >
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
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-12">
                        <label htmlFor='address'>Ünvan<span className="text-danger">*</span></label>
                        <textarea className="form-control"
                                  value={customerInfo && customerInfo.address}
                                  onChange={e => handleInputChange("address", e.target.value)}
                        />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label>Mobil telefon<span className="text-danger">*</span></label>
                        <InputMask mask="(+\9\9499) 999-99-99" className="form-control"
                                   onChange={e => handleInputChange("mobile_phone", e.target.value)}
                                   value={customerInfo && customerInfo.mobile_phone}/>
                    </div>
                    <div className="col-md-6">
                        <label>Digər telefon</label>
                        <InputMask mask="(+\9\9499) 999-99-99" className="form-control"
                                   onChange={e => handleInputChange("other_phone", e.target.value)}
                                   value={customerInfo && customerInfo.other_phone}/>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-12">
                        <div className="d-flex">
                            <span className="form-check">
                                <input
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
                        <label>Siafriş tarixi<span className="text-danger">*</span></label>
                        <DatePicker
                            className="form-control"
                            selected={orderDate}
                            onChange={(date) => setOrderDate(date)}
                            minDate={new Date()}
                        />
                    </div>
                    <div className="col-md-6">
                        <label>Çatdırılma tarixi<span className="text-danger">*</span></label>
                        <DatePicker
                            className="form-control"
                            selected={deliveryDate}
                            onChange={(date) => setDeliveryDate(date)}
                            minDate={new Date()}
                        />
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
    )
}

export default CustomerInfo;

