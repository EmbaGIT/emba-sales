import { React, useEffect, useState, useRef } from "react";
import { post } from "../../api/Api";
import jwt from "jwt-decode";
import { formattedDate, getSpecificDate } from "../../helpers/formattedDate";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import Loader from "react-loader-spinner";
import { getHost } from "../../helpers/host";
import DatePicker from "react-datepicker"
import { addDays, subDays } from "date-fns";

const Sales = () => {
    const [sale, setSale] = useState({});
    const [isFetching, setIsFetching] = useState(true);
    const [noSales, setNoSales] = useState(false)
    const [error, setError] = useState({})
    const today = new Date();
    const [searchByDate, setSearchByDate] = useState({
        dataBegin: getSpecificDate(90),
        dataEnd: today
    });
    const startDate = useRef(null)
    const endDate = useRef(null)

    const getUser = () => {
        const token = localStorage.getItem("jwt_token");
        return jwt(token);  // decodes user from jwt and returns it
    }

    // Convert date to string to post to server
    const convertDateToString = (startDate, endDate) => ({
        start: formattedDate(startDate),
        end: formattedDate(endDate)
    });

    // state for date of type string
    const [stringDateState, setStringDateState] = useState(convertDateToString(searchByDate.dataBegin, searchByDate.dataEnd));
    console.log('stringDateState', stringDateState);

    useEffect(() => {
        const user = getUser();
        const { start, end } = stringDateState;

        setIsFetching(true);
        post(`${getHost('erp/report', 8091)}/api/sales/report`, { databegin: start, dataend: end, uid: user.uid })
            .then((res) => {
                setSale(res);
            }).catch((err) => {
                setError(err?.response?.data)
                setNoSales(true)
            }).finally(() => setIsFetching(false));
    }, [stringDateState]);

    const handleInputChange = (type, value) => {
        if(type === "dataBegin" || type === "dataEnd"){
            setSearchByDate(prevState => ({
                ...prevState,
                [type]: value
            }))
        }
    }

    const searchHandler = () => {
        const start = startDate?.current?.props?.selected;
        const end = endDate?.current?.props?.selected;
        
        if (start && end) {
            const startDate = {
                year: new Date(start).getFullYear(),
                month: new Date(start).getMonth(),
                day: new Date(start).getDate()
            }
            const endDate = {
                year: new Date(end).getFullYear(),
                month: new Date(end).getMonth(),
                day: new Date(end).getDate()
            }

            setStringDateState(convertDateToString(new Date(startDate.year, startDate.month, startDate.day), new Date(endDate.year, endDate.month, endDate.day)))
        }
    }

    return (
        <div className='container-fluid row'>
            <div className="col-12 mb-3">
                <h1>Mənim Satışlarım</h1>
            </div>
            <div className='col-6 mb-3'>
                <h6 className="fm-poppins flex-1">Tarix aralığı üzrə axtarış</h6>
                <div className='d-flex'>
                    <div className='w-50 me-2 settlement-datepicker'>
                        <DatePicker
                            className="form-control"
                            dateFormat="yyyy-MM-dd"
                            selected={searchByDate?.dataBegin ? new Date(searchByDate?.dataBegin) : ''}
                            onChange={(date) => handleInputChange("dataBegin", date)}
                            ref={startDate}
                            minDate={subDays(new Date(), 90)}
                            maxDate={addDays(new Date(), 0)}
                        />
                    </div>
                    <div className='w-50 ms-2 settlement-datepicker'>
                        <DatePicker
                            className="form-control"
                            dateFormat="yyyy-MM-dd"
                            selected={searchByDate?.dataEnd ? new Date(searchByDate?.dataEnd) : ''}
                            onChange={(date) => handleInputChange("dataEnd", date)}
                            ref={endDate}
                            minDate={subDays(new Date(), 90)}
                            maxDate={addDays(new Date(), 0)}
                        />
                    </div>
                </div>
            </div>
            <div className='col-3 mb-3'>
                <div className='d-flex align-items-end h-100'>
                    <button
                        className='btn btn-success'
                        style={{height: '40px'}}
                        onClick={searchHandler}
                    >Axtar</button>
                </div>
            </div>
            <div className='col-12'>
                <div className="table-responsive">
                    {isFetching
                            ? <div
                                className="col-12 d-flex justify-content-center w-100"
                                style={{backdropFilter: "blur(2px)", zIndex: "100" }}>
                                <Loader
                                    type="ThreeDots"
                                    color="#00BFFF"
                                    height={60}
                                    width={60}/>
                            </div>
                            : !noSales ? <table className="table bordered striped calendar-result">
                            <thead>
                            <tr>
                                <th scope='col'>Mağaza adı</th>
                                <th scope='col'>Satıcı</th>
                                <th scope='col'>Başlama tarixi</th>
                                <th scope='col'>Bitmə tarixi</th>
                                <th scope='col'>Məbləğ</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td data-label='Mağaza adı'>{sale?.shop}</td>
                                <td data-label='Satıcı'>{sale?.seller}</td>
                                <td data-label='Başlama tarixi'>{stringDateState.start.split('-').reverse().join('.')}</td>
                                <td data-label='Bitmə tarixi'>{stringDateState.end.split('-').reverse().join('.')}</td>
                                <td data-label='Məbləğ'>{sale?.sum} AZN</td>
                            </tr>
                            </tbody>
                        </table> : null
                    }
                </div>
            </div>
            {
                !!Object.keys(error).length && <div className='col-12'>
                    <div className="alert alert-danger text-center py-3" role="alert">
                        {error?.Message}
                    </div>
                </div>
            }
        </div>
    )
}

export default Sales;