import { React, useEffect, useState } from "react";
import { get, post } from "../../api/Api";
import jwt from "jwt-decode";
import { formattedDate, getSpecificDate } from "../../helpers/formattedDate";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import { Calendar } from "react-modern-calendar-datepicker";
import { calendarLocaleAZ } from "../../locales/calendar-locale";
import Loader from "react-loader-spinner";
import { getHost } from "../../helpers/host";

const Sales = () => {
    const [sale, setSale] = useState({});
    const [isFetching, setIsFetching] = useState(true);

    const getUser = () => {
        const token = localStorage.getItem("jwt_token");
        return jwt(token);  // decodes user from jwt and returns it
    }

    // Default start and end dates:
    const defaultStartDate = getSpecificDate(90);
    const defaultEndDate = new Date();

    // Minimum and maximum date
    const minimumDate = {
        year: new Date(defaultStartDate).getFullYear(),
        month: new Date(defaultStartDate).getMonth() + 1,
        day: new Date(defaultStartDate).getDate()
    };

    const maximumDate = {
        year: defaultEndDate.getFullYear(),
        month: defaultEndDate.getMonth() + 1,
        day: defaultEndDate.getDate()
    };

    // Convert date to string to post to server
    const convertDateToString = (startDate, endDate) => ({
        start: formattedDate(startDate),
        end: formattedDate(endDate)
    });

    // Convert array to react-modern-calendar-datepicker format
    const convertArrToCalendar = (arr) => ({
        year: Number(arr[0]),
        month: Number(arr[1]),
        day: Number(arr[2])
    })

    // state for date of type string
    const [stringDateState, setStringDateState] = useState(convertDateToString(defaultStartDate, defaultEndDate));

    // calendar dates
    const startDateArr = stringDateState.start.split('-');
    const endDateArr = stringDateState.end.split('-');

    const defaultFrom = convertArrToCalendar(startDateArr);
    const defaultTo = convertArrToCalendar(endDateArr);

    const defaultRange = { from: defaultFrom, to: defaultTo };
    const [selectedDayRange, setSelectedDayRange] = useState(defaultRange);

    // get selected date from calendar
    const onDateChange = (date) => {
        setSelectedDayRange(date);

        const { from, to } = date;
        if (from && to) {
            setStringDateState(convertDateToString(new Date(from.year, from.month - 1, from.day), new Date(to.year, to.month - 1, to.day)));
        }
    }

    useEffect(() => {
        const user = getUser();
        const { start, end } = stringDateState;

        setIsFetching(true);
        post(`${getHost('erp/report', 8091)}/api/sales/report`, { databegin: start, dataend: end, uid: user.uid })
            .then((res) => {
                setSale(res);
                setIsFetching(false);
            }).catch((err) => {
                console.log("err", err);
            });
    }, [stringDateState]);

    return (
        <div className='container-fluid row'>
            <div className="col-12">
                <h1>Mənim Satışlarım</h1>
            </div>
            <div className='col-12 my-4'>
                <Calendar
                    value={selectedDayRange}
                    onChange={onDateChange}
                    shouldHighlightWeekends
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    locale={calendarLocaleAZ}
                />
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
                            : <table className="table bordered striped calendar-result">
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
                        </table>
                    }
                </div>
            </div>
        </div>
    )
}

export default Sales;