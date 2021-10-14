import Select from "react-select";
import {selectStyles} from "../../helpers/selectStyles";
import {NoOptionsMessage} from "../../helpers/NoOptionsMessage";
import React, {useEffect, useState} from "react";
import {gql, useLazyQuery} from "@apollo/client";

import "react-datepicker/dist/react-datepicker.css";
import {get} from "../../api/Api";

const CUSTOMER_QUERY = gql`
    query searchByName($name: String!) {
      search(criteria: {name: {contains: $name}}) {
        uid
        name
      }
    }`;

const CustomerInfo = () => {
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [city, setCity] = useState([]);
    const [isRefactorDisabled, setIsRefactorDisabled] = useState(false);
    const [birthDate, setBirthDate] = useState(new Date());
    const [customerInfo, setCustomerInfo] = useState({
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
        city_phone: '',
        address: '',
        gender: '',
        email: ''
    });

    const [getAvailableCustomer, { loading, data }] = useLazyQuery(CUSTOMER_QUERY);

    useEffect(()=>{
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
        if(customerInfo.name.length && customerInfo.surname.length && customerInfo.finCode.length){
            getAvailableCustomer({ variables: {name: `${customerInfo.surname} ${customerInfo.name}`} });
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
        } else {
            alldata = {
                ...alldata,
                [type]: value
            }
        }
        setCustomerInfo(alldata);
    }

    return (
        <div className="card">
            <div className="list-group-item list-group-item-success">Müştəri məlumatları</div>
            <div className="card-body">
                <h6>Müştəri bazasında axtarın</h6>
                <div className="input-group row mb-3">
                    <div className="col-md-4 mb-2">
                        <label>Ad<span className="text-danger">*</span></label>
                        <input type="text" className="form-control" onChange={e => handleInputChange("name", e.target.value)}/>
                    </div>
                    <div className="col-md-4 mb-2">
                        <label>Soyad<span className="text-danger">*</span></label>
                        <input type="text" className="form-control" onChange={e => handleInputChange("surname", e.target.value)}/>
                    </div>
                    <div className="col-md-4 mb-2">
                        <label>Ata adı</label>
                        <input type="text" className="form-control" onChange={e => handleInputChange("patronymic", e.target.value)} />
                    </div>
                    <div className="col-md-5">
                        <label>Şəxsiyyət vəsiqəsi Fin Kod<span className="text-danger">*</span></label>
                        <input type="text" className="form-control" onChange={e => handleInputChange("finCode", e.target.value)}/>
                    </div>
                    <div className="col-md-4">
                        <label>Şəxsiyyət vəsiqəsi №-i</label>
                        <input type="text" className="form-control" onChange={e => handleInputChange("ID", e.target.value)}/>
                    </div>
                    <div className="col-md-3 d-flex align-items-end">
                        <div className="btn btn-primary" onClick={searchOnDatabase}>Axtar</div>
                    </div>
                </div>
                {console.log(data)}
                {data && data.search.map(customer => (
                    <div key={customer.uid}>{customer.name}</div>
                ))}
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
                        <input type="text" className="form-control"/>
                        {/*<DatePicker
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
                                    selected={setBirthDate}
                                    onChange={(date) => setBirthDate(date)}
                                />*/}
                    </div>
                    <div className="col-md-6">
                        <label>Şəhər<span className="text-danger">*</span></label>
                        <Select
                            styles={selectStyles}
                            options={city}
                            value={customerInfo?.city ? [{
                                value: customerInfo?.city?.id,
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
                        <textarea rows="3" className="form-control"/>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor='birthdate'>Mobil telefon<span className="text-danger">*</span></label>
                        <input type="text" className="form-control"/>
                    </div>
                    <div className="col-md-6">
                        <label>Şəhər telefonu</label>
                        <input type="text" className="form-control"/>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default CustomerInfo;

