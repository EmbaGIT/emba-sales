import React, {useEffect, useRef, useState} from 'react'
import {post} from '../../api/Api'
import {getHost} from '../../helpers/host'
import Loader from 'react-loader-spinner'
import ReactPaginate from 'react-paginate'
import {formattedDate} from '../../helpers/formattedDate'
import jwt from "jwt-decode";
import Select from "react-select"
import DatePicker from "react-datepicker"

const SalesDetailed = () => {
    // state for date of type string
    const lsSavedDate = JSON.parse(localStorage.getItem(('salesDate')))

    const [sales, setSales] = useState({})
    const [classNames, setClassNames] = useState(
        Array(10)
            .fill(undefined)
            .map((_) => ({ hidden: true }))
    )
    const [page, setPage] = useState(0)
    const [isFetching, setIsFetching] = useState(false)
    const paginationContainer = useRef()
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

    const saveSelectedDate = (dateStr) => localStorage.setItem('salesDate', JSON.stringify(dateStr))

    // Convert date to string to post to server
    const convertDateToString = (startDate, endDate) => ({
        start: formattedDate(startDate),
        end: formattedDate(endDate)
    })

    const defaultStringDateState = lsSavedDate || convertDateToString(searchByDate?.dataBegin, searchByDate?.dataEnd)
    const [stringDateState, setStringDateState] = useState(defaultStringDateState)

    useEffect(() => {
        const salesDate = JSON.parse(localStorage.getItem(('salesDate')))
        const user = getUser()

        if (salesDate || defaultStringDateState) {
            setIsFetching(true)

            post(`${getHost('erp/report', 8091)}/api/sales/report-detailed?size=${pageSize.value}&page=${page}`, {
                "databegin": salesDate.start || defaultStringDateState?.start,
                "dataend": salesDate.end || defaultStringDateState?.end,
                "uid": user.uid
            })
                .then(response => {
                    setSales(response)
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

            post(`${getHost('erp/report', 8091)}/api/sales/report-detailed?size=${pageSize.value}&page=${page}`, {
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
    }, [page, stringDateState, pageSize])

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
        <div className='container-fluid row'>
            <div className='col-12 d-flex justify-content-between align-items-end mb-3'>
                <h1>Distribütorun Mağazaya Satışı</h1>
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
