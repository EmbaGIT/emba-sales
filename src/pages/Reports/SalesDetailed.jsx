import React, {useEffect, useRef, useState} from 'react'
import Loader from 'react-loader-spinner'
import ReactPaginate from 'react-paginate'
import { Calendar } from "react-modern-calendar-datepicker";
import { calendarLocaleAZ } from "../../locales/calendar-locale";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import {post} from '../../api/Api'
import {getHost} from '../../helpers/host'
import {formattedDate, getSpecificDate} from '../../helpers/formattedDate'
import jwt from 'jwt-decode'

const SalesDetailed = () => {
    const [sales, setSales] = useState({})
    const [classNames, setClassNames] = useState([])
    const [page, setPage] = useState(0)
    const [isFetching, setIsFetching] = useState(false)
    const paginationContainer = useRef()
    const didMount = useRef(false)

    const getUser = () => {
        const token = localStorage.getItem("jwt_token");
        return jwt(token);  // decodes user from jwt and returns it
    }

    const showItems = (i) => {
        setClassNames(classNames.map((name, index) => {
            if (i === index) {
                if (classNames[i].hidden) {
                    return {hidden: false}
                }

                return {hidden: true}
            }

            return name.hidden ? name : {hidden: true}
        }))
    }

    const paginate = (n) => {
        setPage(+n.selected)
        paginationContainer.current.scrollIntoView({ behavior: 'smooth' })
    }

    // Default start and end dates
    const defaultStartDate = new Date(2015, 1, 1)
    const defaultEndDate = new Date()

    // Minimum and maximum date
    const minimumDate = {
        year: new Date(defaultStartDate).getFullYear(),
        month: new Date(defaultStartDate).getMonth() + 1,
        day: new Date(defaultStartDate).getDate()
    }
    const maximumDate = {
        year: defaultEndDate.getFullYear(),
        month: defaultEndDate.getMonth() + 1,
        day: defaultEndDate.getDate()
    }

    // Convert date to string to post to server
    const convertDateToString = (startDate, endDate) => ({
        start: formattedDate(startDate),
        end: formattedDate(endDate)
    })

    // Convert array to react-modern-calendar-datepicker format
    const convertArrToCalendar = (arr) => ({
        year: Number(arr[0]),
        month: Number(arr[1]),
        day: Number(arr[2])
    })

    // state for date of type string
    const [stringDateState, setStringDateState] = useState(convertDateToString(defaultStartDate, defaultEndDate))

    // calendar dates
    const startDateArr = stringDateState.start.split('-')
    const endDateArr = stringDateState.end.split('-')

    const defaultFrom = convertArrToCalendar(startDateArr)
    const defaultTo = convertArrToCalendar(endDateArr)

    const defaultRange = { from: defaultFrom, to: defaultTo }
    const [selectedDayRange, setSelectedDayRange] = useState(defaultRange)

    // get selected date from calendar
    const onDateChange = async (date) => {
        await setSelectedDayRange(date)
        await setPage(0)

        const { from, to } = date
        if (from && to) {
            setStringDateState(convertDateToString(new Date(from.year, from.month - 1, from.day), new Date(to.year, to.month - 1, to.day)))
            paginationContainer.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }

    useEffect(() => {
        if (didMount.current) {
            setIsFetching(true)
            const { start, end } = stringDateState
            const user = getUser()

            post(`${getHost('erp/report', 8091)}/api/sales/report-detailed?size=10&page=${page}`, {
                databegin: start,
                dataend: end,
                uid: user.uid
            })
                .then(response => {
                    setIsFetching(false)
                    setSales(response)

                    const salesLength = response.customerGroups?.length
                    setClassNames(new Array(salesLength).fill().map(elm => ({
                        hidden: true
                    })))
                })
                .catch(error => {
                    setIsFetching(false)
                    return error
                })
        } else {
            didMount.current = true
        }
    }, [page, stringDateState])

    return (
        <div className='container-fluid row'>
            <div className='col-12 d-flex justify-content-between align-items-end'>
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

            <div className='col-12 d-flex justify-content-end'>
                {
                    isFetching
                        ? <Loader
                            type='ThreeDots'
                            color='#00BFFF'
                            height={60}
                            width={60}
                        />
                        : (
                            sales.total === undefined
                                ? null
                                : <h6>{sales.total?.toFixed(2)} AZN</h6>
                        )
                }
            </div>

            {
                isFetching
                    ? <div
                        className='col-12 d-flex justify-content-center w-100'
                        style={{backdropFilter: 'blur(2px)', zIndex: '100'}}
                    >
                        <Loader
                            type='ThreeDots'
                            color='#00BFFF'
                            height={60}
                            width={60}
                        />
                    </div>
                    : (
                        Object.keys(sales).length === 0
                            ? null
                            : <div className='table-responsive sales-table'>
                                <table className='table table-striped table-bordered'>
                                    <thead>
                                    <tr>
                                        <th scope='col' className='long'>Müştəri ünvanı</th>
                                        <th scope='col' className='long'>Realizasiya sənədi</th>
                                        <th scope='col' className='long'>Sifariş</th>
                                        <th scope='col' className='short'>Cəmi</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {
                                        sales.customerGroups?.map((order, i) => {
                                            return (
                                                <React.Fragment key={i}>
                                                    <tr onClick={showItems.bind(null, i)} className='parent-row'>
                                                        <td className='long'>{order.customer_adress || 'Müştəri ünvanı yoxdur'}</td>
                                                        <td className='long'>{order.sales_group.realizas_group.realizas || 'Sənəd yoxdur'}</td>
                                                        <td className='long'>{order.sales_group.sales_order || 'Sifariş yoxdur'}</td>
                                                        <td className='short'>{order.sales_group.realizas_group.total?.toFixed(2) || '0'} AZN</td>
                                                    </tr>

                                                    <tr className={classNames[i]?.hidden ? 'hidden' : 'show'}>
                                                        <td colSpan={4} className='p-0'>
                                                            <div className='table-responsive'>
                                                                <table className='table table-bordered mb-0'>
                                                                    <thead>
                                                                    <tr>
                                                                        <th className='long'>Adı</th>
                                                                        <th className='long'>Xarakteristika</th>
                                                                        <th className='long'>Sayı</th>
                                                                        <th className='short'>Cəmi</th>
                                                                    </tr>
                                                                    </thead>

                                                                    <tbody>
                                                                    {
                                                                        order.sales_group.realizas_group.items?.map((item, index) => {
                                                                            return (
                                                                                <tr key={index}>
                                                                                    <td className='long'>{item.product_uid}</td>
                                                                                    <td className='long'>{item.product_characteristic_uid || 'Xarakteristika yoxdur'}</td>
                                                                                    <td className='long'>{item.product_quantity}</td>
                                                                                    <td className='short'>{item.product_total} AZN</td>
                                                                                </tr>
                                                                            )
                                                                        })
                                                                    }
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            )
                                        })
                                    }
                                    </tbody>
                                </table>
                            </div>
                        )
            }

            {
                (isFetching || Object.keys(sales).length === 0)
                    ? null
                    : <div className='d-flex justify-content-center' ref={paginationContainer}>
                        <ReactPaginate
                            previousLabel='Əvvəlki'
                            nextLabel='Növbəti'
                            previousClassName='page-item'
                            nextClassName='page-item'
                            previousLinkClassName='page-link'
                            nextLinkClassName='page-link'
                            breakLabel='...'
                            breakClassName='break-me'
                            pageCount={sales.totalPages + 1 || 0}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3}
                            onPageChange={paginate}
                            containerClassName='pagination'
                            activeClassName='active'
                            pageClassName='page-item'
                            pageLinkClassName='page-link'
                            forcePage={page}
                        />
                    </div>
            }
        </div>
    )
}

export default SalesDetailed
