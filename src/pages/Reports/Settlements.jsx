import React, {useEffect, useRef, useState} from 'react'
import {post} from '../../api/Api'
import {getHost} from '../../helpers/host'
import Loader from 'react-loader-spinner'
import ReactPaginate from 'react-paginate'
import {formattedDate} from '../../helpers/formattedDate'
import jwt from "jwt-decode";
import Modal from '../../UI/Modal'
import Select from "react-select"
import DatePicker from "react-datepicker"

export const Settlements = () => {
    // state for date of type string
    const lsSavedDate = JSON.parse(localStorage.getItem(('settlementDate')))

    const [mutualCalculation, setMutualCalculation] = useState({})
    const [isFetching, setIsFetching] = useState(true)
    const [error, setError] = useState({})
    const [page, setPage] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const [modalData, setModalData] = useState({})
    const [loadingModalData, setLoadingModalData] = useState(false)
    const didMount = useRef(false)
    const sizeOptions = [
        { value: 10, label: 10 },
        { value: 20, label: 20 },
        { value: 50, label: 50 },
        { value: 100, label: 100 }
    ];
    const [pageSize, setPageSize] = useState(sizeOptions[0]);
    const today = new Date();
    const [searchByDate, setSearchByDate] = useState({
        dataBegin: lsSavedDate?.start ? new Date(lsSavedDate.start) : new Date(today.getMonth() === 0 && today.getDate() === 1 ? today.getFullYear() - 1 : today.getFullYear(), today.getMonth() === 0 && today.getDate() === 1 ? 11 : today.getDate() === 1 ? today.getMonth() - 1 : today.getMonth(), 1),
        dataEnd: lsSavedDate?.end ? new Date(lsSavedDate.end) : today
    });
    const startDate = useRef(null)
    const endDate = useRef(null)

    const getUser = () => {
        const token = localStorage.getItem("jwt_token");
        return jwt(token);  // decodes user from jwt and returns it
    }

    const paginate = (n) => {
        setPage(+n.selected)
    }

    const saveSelectedDate = (dateStr) => localStorage.setItem('settlementDate', JSON.stringify(dateStr))

    // Convert date to string to post to server
    const convertDateToString = (startDate, endDate) => ({
        start: formattedDate(startDate),
        end: formattedDate(endDate)
    })

    const defaultStringDateState = lsSavedDate || convertDateToString(searchByDate?.dataBegin, searchByDate?.dataEnd)
    const [stringDateState, setStringDateState] = useState(defaultStringDateState)

    useEffect(() => {
        const settlementDate = JSON.parse(localStorage.getItem(('settlementDate')))
        const user = getUser()

        if (settlementDate || defaultStringDateState) {
            post(`${getHost('erp/report', 8091)}/api/mutual-calculation?size=${pageSize.value}&page=${page}`, {
                "databegin": settlementDate?.start || defaultStringDateState?.start,
                "dataend": settlementDate?.end || defaultStringDateState?.end,
                "uid": user.uid
            })
                .then(response => {
                    setError({});
                    setMutualCalculation(response)
                    setIsFetching(false)
                })
                .catch(error => {
                    setIsFetching(false);
                    setError(error?.response?.data);
                })
        }
    }, [])

    useEffect(() => {
        if (didMount.current) {
            setIsFetching(true)
            const { start, end } = stringDateState
            const user = getUser()

            post(`${getHost('erp/report', 8091)}/api/mutual-calculation?size=${pageSize.value}&page=${page}`, {
                "databegin": start,
                "dataend": end,
                "uid": user.uid
            })
                .then(response => {
                    setError({});
                    setMutualCalculation(response)
                    setIsFetching(false)
                })
                .catch(error => {
                    setIsFetching(false);
                    setError(error?.response?.data);
                })
        } else {
            didMount.current = true
        }
    }, [page, stringDateState, pageSize])

    const getSaleInfo = (sales_uid, isRealization, isReturned) => {
        if (!isRealization && !isReturned) return;

        let url = `${getHost('erp/report', 8091)}/api/mutual-calculation`
        if (isRealization) {
            url += '/detailed/realization';
        } else if (isReturned) {
            url += '/refund';
        }

        setLoadingModalData(true)
        setShowModal(true)
        post(url, {
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

    const onPageSizeChange = (n) => {
        setPageSize(n);
        setPage(0);
    }

    const handleInputChange = (type, value) => {
        if(type === "dataBegin" || type === "dataEnd"){
            setSearchByDate(prevState => ({
                ...prevState,
                [type]: value
            }))
        }
    }

    const searchHandler = () => {
        setPage(0);
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

            saveSelectedDate(convertDateToString(new Date(startDate.year, startDate.month, startDate.day), new Date(endDate.year, endDate.month, endDate.day)))
            setStringDateState(convertDateToString(new Date(startDate.year, startDate.month, startDate.day), new Date(endDate.year, endDate.month, endDate.day)))
        }
    }

    return (
        <>
            <div className='container-fluid row'>
                <div className='col-12 d-flex justify-content-between align-items-end mb-3'>
                    <h1>Qarşılıqlı Hesablaşmalar</h1>
                </div>

                {!!Object.keys(error)?.length && <div className='col-12'>
                    <div className="alert alert-danger" role="alert">
                        {error?.Message || error?.error}
                    </div>
                </div>}

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
                            />
                        </div>
                        <div className='w-50 ms-2 settlement-datepicker'>
                            <DatePicker
                                className="form-control"
                                dateFormat="yyyy-MM-dd"
                                selected={searchByDate?.dataEnd ? new Date(searchByDate?.dataEnd) : ''}
                                onChange={(date) => handleInputChange("dataEnd", date)}
                                ref={endDate}
                            />
                        </div>
                    </div>
                </div>
                <div className='col-3 mb-3'>
                    <h6 className="fm-poppins flex-1">Məlumat sayı</h6>
                    <div>
                        <Select
                            className="settlement-pagesize basic-single"
                            classNamePrefix="select"
                            defaultValue={pageSize}
                            name="pageSize"
                            options={sizeOptions}
                            placeholder="Məhsul sayı"
                            onChange={value => onPageSizeChange(value)}
                        />
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

                {/* <div className='col-12 my-4'>
                    <Calendar
                        value={selectedDayRange}
                        onChange={onDateChange}
                        shouldHighlightWeekends
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                        locale={calendarLocaleAZ}
                    />
                </div> */}

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
                                                    const isReturned = calculation?.document?.includes('Возврат');
                                                    return (
                                                        <tr key={i}>
                                                            <td className='short'>{calculation.date}</td>
                                                            <td className='long'>
                                                                {
                                                                    <span
                                                                        className={(isRealization || isReturned) ? 'text-primary text-underline cursor-pointer d-inline-block' : ''}
                                                                        onClick={() => getSaleInfo(calculation.sales_uid, isRealization, isReturned)}
                                                                        data-toggle={(isRealization || isReturned) ? 'modal' : ''} data-target="#infoModal"
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
