import React, {useEffect, useState} from 'react'
import Loader from "react-loader-spinner";
import {post} from "../../api/Api";
import {getHost} from "../../helpers/host";
import jwt from "jwt-decode";

const SalesReserve = () => {
    const [sales, setSales] = useState([])
    const [isFetching, setIsFetching] = useState(false)
    const [classNames, setClassNames] = useState(
        Array(10)
            .fill(undefined)
            .map((_) => ({ hidden: true }))
    )
    const [error, setError] = useState('')
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

    const getUser = () => {
        const token = localStorage.getItem("jwt_token");
        return jwt(token);  // decodes user from jwt and returns it
    }

    useEffect(() => {
        setIsFetching(true)
        const user = getUser()

        post(`${getHost('erp/report', 8091)}/api/sales/reserve`, {
            uid: user.uid
        })
            .then(response => {
                setIsFetching(false)
                setSales(response.customer_group)

                const salesLength = response.customer_group?.length
                setClassNames(new Array(salesLength).fill().map(_ => ({
                    hidden: true
                })))
            })
            .catch(error => {
                setIsFetching(false)
                setError(error.response.data.Message)
            })
    }, [])

    return (
        <div>
            <h1>Rezervdə olan sifarişlər</h1>

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
                    : !error ? (
                        sales?.length === 0
                            ? null
                            : <div className='table-responsive sales-table'>
                                <table className='table table-striped table-bordered'>
                                    <thead>
                                        <tr>
                                            <th scope='col' className='long'>Müştəri ünvanı</th>
                                            <th scope='col' className='long'>Sifariş</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                    {
                                        sales?.map((order, i) => {
                                            return (
                                                <React.Fragment key={i}>
                                                    <tr className='parent-row' onClick={showItems.bind(null, i)}>
                                                        <td className='long'>{order.customer_adress || 'Müştəri ünvanı yoxdur'}</td>
                                                        <td className='long'>{order.sales_group.sales_order || 'Sənəd yoxdur'}</td>
                                                    </tr>
                                                    <tr className={classNames[i]?.hidden ? 'hidden' : 'show'}>
                                                        <td colSpan={4} className='p-0'>
                                                            <div className='table-responsive'>
                                                                <table className='table table-bordered mb-0'>
                                                                    <thead>
                                                                    <tr>
                                                                        <th className='long'>Adı</th>
                                                                        <th className='long'>Sayı</th>
                                                                    </tr>
                                                                    </thead>

                                                                    <tbody>
                                                                    {
                                                                        order.sales_group.items?.map((item, index) => {
                                                                            return (
                                                                                <tr key={index}>
                                                                                    <td className='long'>{item.product_uid}</td>
                                                                                    <td className='long'>{item.product_quantity}</td>
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
                    ) : <div className='col-12'>
                        <div className='alert alert-danger py-3'>{error}</div>
                    </div>
            }
        </div>
    )
}

export default SalesReserve