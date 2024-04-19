import { useEffect, useState } from 'react'
import InputMask from 'react-input-mask'
import jwt from 'jwt-decode'
import { v4 as uuidv4 } from 'uuid'
import { post } from '../api/Api'
import { getHost } from '../helpers/host'
import { formattedDate } from '../helpers/formattedDate'

const createArrayFromRange = (start, end) =>
    Array(end - (start - 1))
        .fill(0)
        .map((_, i) => start + i)

const validationErrorMessages = {
    phone: 'Zəhmət olmasa telefon nömrəsini daxil edin.',
    initialSum: 'Zəhmət olmasa ilkin ödəniş məbləğini daxil edin.',
    numberOfPayments: 'Zəhmət olmasa ödəniş aylarının sayını daxil edin.'
}

export const LeobankForm = ({ selectedLeobankSale, setLeobankModalIsShown }) => {
    const products = selectedLeobankSale?.goods
        .map(({ product_price, product_quantity, product_name }) => ({
            amount: product_price,
            count: product_quantity,
            name: product_name
        }))

    console.log(selectedLeobankSale)
    const [orderInfo, setOrderInfo] = useState({
        phone: selectedLeobankSale?.bankInfo?.phone,
        initialSum: selectedLeobankSale?.bankInfo?.initialAmount,
        numberOfPayments: selectedLeobankSale?.bankInfo?.program?.numberOfPayments
    })
    const [validationErrors, setValidationErrors] = useState(
        Object.keys(orderInfo).reduce(
            (result, key) => ({ ...result, [key]: false }),
            {}
        )
    )
    const [decodedToken, setDecodedToken] = useState(null)

    const validateOrderInfo = () => setValidationErrors(
        Object
            .entries(orderInfo)
            .reduce((result, [key, value]) => {
                if (!value) {
                    return { ...result, [key]: true }
                }

                return { ...result, [key]: false }
            }, {})
    )

    const updateOrderInfo = (key, value) =>
        setOrderInfo({ ...orderInfo, [key]: value })

    const hasValidationError = () => Object
        .values(orderInfo)
        .filter(info => !info).length

    const createOrder = (e) => {
        e.preventDefault()

        if (hasValidationError()) {
            validateOrderInfo()
            return
        }
        else {
            setValidationErrors(
                Object
                    .keys(validationErrors)
                    .reduce((result, [key]) => ({ ...result, [key]: false }))
            )
        }

        setLeobankModalIsShown(false)
        const pointId = decodedToken ? decodedToken.uid : uuidv4()

        const requestBody = {
            initialAmount: +orderInfo.initialSum,
            invoice: {
                date: formattedDate(new Date()),
                number: uuidv4(),
                pointId
            },
            orderId: selectedLeobankSale?.uuid,
            phone: orderInfo.phone.replace(/\D/g, ''),
            products,
            program: {
                numberOfPayments: orderInfo.numberOfPayments,
                type: 'part-payment'
            },
            resultCallback: 'https://api.emba.store/es/payments/api/v1/lending/leo-bank/order/callback',
            totalAmount: +selectedLeobankSale?.totalPrice
        }

        post(
            `${getHost('payments', 8094)}/api/v1/lending/leo-bank/order/create`,
            requestBody
        )
            .then((response) => {
                localStorage.setItem('bankOrderId', response.bankOrderId)
            })
            .catch((error) => console.log(error))
    }

    // const checkOrderStatus = () => {
    //     post(
    //         `${getHost('payments', 8094)}/api/v1/lending/leo-bank/order/check`,
    //         { bankOrderId }
    //     )
    //         .then((response) => {
    //             console.log(response)
    //         })
    //         .catch((error) => console.log(error))
    // }

    useEffect(() => {
        const token = jwt(localStorage.getItem('jwt_token'))
        setDecodedToken(token);

        // get(`${getHost('payments', 8094)}/api/v1/query`)
        //     .then((response) => console.log(response))
        //     .catch((error) => console.log(error))
    }, [])

    return (
        <div>
            <form className='leobank-form' onSubmit={createOrder}>
                <div className='row'>
                    <div className='col-6 mb-3'>
                        <label>Telefon nömrəsi</label>
                        <InputMask
                            mask='(+\9\9499) 999-99-99'
                            className='form-control'
                            onChange={(e) =>
                                updateOrderInfo('phone', e.target.value)
                            }
                            value={orderInfo?.phone || ''}
                            disabled={!!selectedLeobankSale?.bankInfo?.phone || false}
                        />
                        {validationErrors.phone && (
                            <div className='invalid-feedback d-block position-relative mt-1'>
                                {validationErrorMessages.phone}
                            </div>
                        )}
                    </div>
                    <div className='col-6 mb-3'>
                        <label>Nağd ödəniş məbləği</label>
                        <input
                            className='form-control'
                            placeholder='İlkin ödəniş məbləği'
                            type='number'
                            value={orderInfo?.initialSum || ''}
                            onChange={(e) =>
                                updateOrderInfo('initialSum', e.target.value)
                            }
                            disabled={!!selectedLeobankSale?.bankInfo?.initialAmount.toString() || false}
                        />
                        {validationErrors.initialSum && (
                            <div className='invalid-feedback d-block position-relative mt-1'>
                                {validationErrorMessages.initialSum}
                            </div>
                        )}
                    </div>
                    <div className='col-6 mb-3'>
                        <label>Ümumi məbləğ</label>
                        <input
                            className='form-control'
                            placeholder='Ümumi məbləğ'
                            type='number'
                            disabled
                            value={selectedLeobankSale?.totalPrice || ''}
                        />
                        {validationErrors.totalSum && (
                            <div className='invalid-feedback d-block position-relative mt-1'>
                                {validationErrorMessages.totalSum}
                            </div>
                        )}
                    </div>
                    <div className='col-6 mb-3'>
                        <label>Ayların sayı</label>
                        <select
                            className='form-control'
                            value={orderInfo?.numberOfPayments || ''}
                            onChange={(e) =>
                                updateOrderInfo(
                                    'numberOfPayments',
                                    e.target.value
                                )
                            }
                            disabled={!!selectedLeobankSale?.bankInfo?.program?.numberOfPayments || false}
                        >
                            <option
                                value={''}
                                key={'first default option'}
                            >
                                Aylıq ödənişlərin sayını seçin
                            </option>
                            {createArrayFromRange(3, 24).map((m) => (
                                <option
                                    value={m}
                                    key={m}
                                >
                                    {m}
                                </option>
                            ))}
                        </select>
                        {validationErrors.numberOfPayments && (
                            <div className='invalid-feedback d-block position-relative mt-1'>
                                {validationErrorMessages.numberOfPayments}
                            </div>
                        )}
                    </div>
                    <div className='col-6'>
                        <button
                            type='submit'
                            className='btn btn-block btn-primary'
                        >
                            Sorğu göndərin
                        </button>
                        {/* <div className='w-50 ms-2'>
                            <button
                                className='btn btn-block btn-primary'
                                onClick={checkOrderStatus}
                            >
                                Sorğunun statusunu yoxlayın
                            </button>
                        </div> */}
                    </div>
                </div>
            </form>
        </div>
    )
}
