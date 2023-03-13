import React, {useEffect, useRef, useState} from 'react'
import {post} from '../../api/Api'
import {getHost} from '../../helpers/host'
import Loader from 'react-loader-spinner'
import ReactPaginate from 'react-paginate'
import {formattedDate} from '../../helpers/formattedDate'
import {Calendar} from 'react-modern-calendar-datepicker'
import {calendarLocaleAZ} from '../../locales/calendar-locale'
import jwt from "jwt-decode";
import Modal from '../../UI/Modal'

export const Settlements = () => {
    const [mutualCalculation, setMutualCalculation] = useState({})
    const [isFetching, setIsFetching] = useState(false)
    const [page, setPage] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const [modalData, setModalData] = useState({})
    const [loadingModalData, setLoadingModalData] = useState(false)
    const didMount = useRef(false)

    const getUser = () => {
        const token = localStorage.getItem("jwt_token");
        return jwt(token);  // decodes user from jwt and returns it
    }

    const paginate = (n) => {
        setPage(+n.selected)
    }

    const saveSelectedDate = (dateStr) => localStorage.setItem('settlementDate', JSON.stringify(dateStr))

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
    const lsSavedDate = JSON.parse(localStorage.getItem(('settlementDate')))
    const defaultStringDateState = lsSavedDate || convertDateToString(defaultStartDate, defaultEndDate)
    const [stringDateState, setStringDateState] = useState(defaultStringDateState)

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
            saveSelectedDate(convertDateToString(new Date(from.year, from.month - 1, from.day), new Date(to.year, to.month - 1, to.day)))
            setStringDateState(convertDateToString(new Date(from.year, from.month - 1, from.day), new Date(to.year, to.month - 1, to.day)))
        }
    }

    useEffect(() => {
        const settlementDate = JSON.parse(localStorage.getItem(('settlementDate')))
        const user = getUser()

        const start = settlementDate?.start.split('-')
        const end = settlementDate?.end.split('-')
        let defaultCalendarValue = {}

        if (start && end) {
            defaultCalendarValue = {
                from: { day: parseInt(start[2]), month: parseInt(start[1]), year: parseInt(start[0]) },
                to: { day: parseInt(end[2]), month: parseInt(end[1]), year: parseInt(end[0]) }
            }
        }

        if (settlementDate) {
            setSelectedDayRange(defaultCalendarValue)

            post(`${getHost('erp/report', 8091)}/api/mutual-calculation?size=10&page=${page}`, {
                "databegin": settlementDate.start,
                "dataend": settlementDate.end,
                "uid": user.uid
            })
                .then(response => {
                    setMutualCalculation(response)
                    setIsFetching(false)
                })
                .catch(error => {
                    setIsFetching(false)
                    return error
                })
        }
    }, [])

    useEffect(() => {
        if (didMount.current) {
            setIsFetching(true)
            const { start, end } = stringDateState
            const user = getUser()

            post(`${getHost('erp/report', 8091)}/api/mutual-calculation?size=10&page=${page}`, {
                "databegin": start,
                "dataend": end,
                "uid": user.uid
            })
                .then(response => {
                    setMutualCalculation(response)
                    setIsFetching(false)
                })
                .catch(error => {
                    setIsFetching(false)
                    return error
                })
        } else {
            didMount.current = true
        }
    }, [page, stringDateState])

    const getSaleInfo = (sales_uid, isRealization) => {
        if (!isRealization) return;

        setLoadingModalData(true)
        setShowModal(true)
        post(`${getHost('erp/report', 8091)}/api/mutual-calculation/detailed/realization`, {
            sales_uid
        })
            .then(response => {
                setModalData(response)
            })
            .catch(error => {
                // setIsFetching(false)
                return error
            })
            .finally(() => setLoadingModalData(false))
    }

    return (
        <>
            <div className='container-fluid row'>
                <div className='col-12 d-flex justify-content-between align-items-end mb-3'>
                    <h1>Qarşılıqlı Hesablaşmalar</h1>
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
                            Object.keys(mutualCalculation).length === 0
                                ? null
                                : <div className='table-responsive sales-table'>
                                    <table className='table table-striped table-bordered'>
                                        <thead>
                                            <tr>
                                                <th scope='col' className='short'>Tarix</th>
                                                <th scope='col' className='long'>Realizasiya sənədi</th>
                                                <th scope='col' className='long'>Şərh</th>
                                                <th scope='col' className='short'>İlkin qalıq</th>
                                                <th scope='col' className='short'>Mədaxil</th>
                                                <th scope='col' className='short'>Məxaric</th>
                                                <th scope='col' className='short'>Son qalıq</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {
                                                mutualCalculation.Items?.map((calculation, i) => {
                                                    const isRealization = calculation?.document?.includes('Реализация');
                                                    return (
                                                        <tr key={i}>
                                                            <td className='short'>{calculation.date}</td>
                                                            <td className='long'>
                                                                {
                                                                    <span
                                                                        className={isRealization ? 'text-primary text-underline cursor-pointer d-inline-block' : ''}
                                                                        onClick={() => getSaleInfo(calculation.sales_uid, isRealization)}
                                                                        data-toggle={isRealization ? 'modal' : ''} data-target="#infoModal"
                                                                    >
                                                                        {calculation.document}
                                                                    </span>
                                                                }
                                                            </td>
                                                            <td className='long'>{calculation.comment}</td>
                                                            <td className='short'>{calculation.initial_balance}</td>
                                                            <td className='short'>{calculation.income}</td>
                                                            <td className='short'>{calculation.out}</td>
                                                            <td className='short'>{calculation.finalbalance}</td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            )
                }

                {
                    isFetching
                        ? null
                        : (
                            Object.keys(mutualCalculation).length === 0 ? null : <div className='d-flex justify-content-center'>
                                <ReactPaginate
                                    previousLabel='Əvvəlki'
                                    nextLabel='Növbəti'
                                    previousClassName='page-item'
                                    nextClassName='page-item'
                                    previousLinkClassName='page-link'
                                    nextLinkClassName='page-link'
                                    breakLabel='...'
                                    breakClassName='break-me'
                                    pageCount={mutualCalculation.totalPages + 1 || 0}
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
                        )
                }
            </div>

            {showModal && <Modal>
                {loadingModalData ? <div
                            className='col-12 d-flex justify-content-center w-100'
                            style={{backdropFilter: 'blur(2px)', zIndex: '100'}}
                        >
                            <Loader
                                type='ThreeDots'
                                color='#00BFFF'
                                height={60}
                                width={60}
                            />
                        </div> : <div>
                    <p>Realizasiya sənədi: <strong>{modalData?.sales_order}</strong></p>
                    <p>Müştəri: <strong>{modalData?.customer}</strong></p>
                    <p>Məbləğ: <strong>{modalData?.amount} AZN</strong></p>
                    <div className='table-responsive sales-table'>
                        <table className='table table-striped table-bordered'>
                            <thead>
                                <tr>
                                    <th scope='col' className='short'>Adı</th>
                                    <th scope='col' className='long'>Xarakteristikası</th>
                                    <th scope='col' className='long'>Miqdarı</th>
                                    <th scope='col' className='short'>Məbləğ</th>
                                </tr>
                            </thead>
                        
                            <tbody>
                                {
                                    modalData.items?.map((item, i) => {
                                        return (
                                            <tr key={i}>
                                                <td className='short'>{item.product_uid}</td>
                                                <td className='long'>{item.product_characteristic_uid}</td>
                                                <td className='long'>{item.product_quantity}</td>
                                                <td className='short'>{item.product_amount}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className='d-flex justify-content-end'>
                            <button
                                className='btn btn-primary'
                                onClick={() => {
                                    setShowModal(false)
                                    setModalData({})
                                }}
                            >Bağla</button>
                    </div>
                </div>}
            </Modal>}
        </>
    )
}
