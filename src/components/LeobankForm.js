import { useEffect, useState } from 'react'
import InputMask from 'react-input-mask'
import jwt from 'jwt-decode'
import { v4 as uuidv4 } from 'uuid'
import { post } from '../api/Api'
import { getHost } from '../helpers/host'
import { formattedDate } from '../helpers/formattedDate'
import { LEOBANK_ORDER_STATES, LEOBANK_ORDER_SUB_STATES } from '../helpers/leobank-order-statuses'

const createArrayFromRange = (start, end) =>
    Array(end - (start - 1))
        .fill(0)
        .map((_, i) => start + i)

const validationErrorMessages = {
    phone: 'Zəhmət olmasa telefon nömrəsini daxil edin.',
    numberOfPayments: 'Zəhmət olmasa ödəniş aylarının sayını daxil edin.'
}

export const LeobankForm = ({
    selectedLeobankSale,
    setLeobankModalIsShown,
    rerender,
    setRerender
}) => {
    const products = selectedLeobankSale?.goods
        .map(({ product_price, product_quantity, product_name }) => ({
            amount: product_price,
            count: product_quantity,
            name: product_name
        }))

    const [orderInfo, setOrderInfo] = useState({
        phone: selectedLeobankSale?.bankInfo?.phone || '',
        initialSum: selectedLeobankSale?.bankInfo?.initialAmount || '',
        numberOfPayments: selectedLeobankSale?.bankInfo?.program?.numberOfPayments || ''
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
                if (key !== 'initialSum' && !value) {
                    return { ...result, [key]: true }
                }

                return { ...result, [key]: false }
            }, {})
    )

    const updateOrderInfo = (key, value) => {
        setOrderInfo({ ...orderInfo, [key]: value })
    }

    const hasValidationError = () => Object
        .entries(orderInfo)
        .filter(([key, value]) => key !== 'initialSum' && !value).length

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

        if (
            selectedLeobankSale?.bankInfo?.state === LEOBANK_ORDER_STATES.FAIL &&
            (
                selectedLeobankSale?.bankInfo?.subState === LEOBANK_ORDER_SUB_STATES.STORE_CONFIRM_TIME_EXPIRED ||
                selectedLeobankSale?.bankInfo?.subState === LEOBANK_ORDER_SUB_STATES.CLIENT_CONFIRM_TIME_EXPIRED
            )
        ) {
            post(
                `${getHost('sales', 8087)}/api/order/wishlist/${selectedLeobankSale.id}`,
                selectedLeobankSale
            )
            .then((saleResponse) => {
                const requestBody = {
                    initialAmount: +orderInfo.initialSum,
                    invoice: {
                        date: formattedDate(new Date()),
                        number: uuidv4()
                    },
                    orderId: saleResponse?.uuid,
                    phone: orderInfo.phone.replace(/\D/g, ''),
                    products,
                    program: {
                        numberOfPayments: +orderInfo.numberOfPayments,
                        type: 'part-payment'
                    },
                    totalAmount: +selectedLeobankSale?.bankInfo?.totalAmount || +selectedLeobankSale?.totalPrice
                }

                post(
                    `${getHost('payments', 8094)}/api/v1/lending/leo-bank/order/create`,
                    requestBody
                )
                    .then(() => {
                        setRerender(!rerender)
                    })
                    .catch(() => {
                        if (
                            !!selectedLeobankSale?.bankInfo?.state ||
                            !!selectedLeobankSale?.bankInfo?.subState
                        ) {
                            setRerender(!rerender)
                        }
                    })

                setRerender(!rerender)
            })
            .catch(saleError => console.log(saleError))
            .finally(() => {
                setLeobankModalIsShown(true)
            })
        } else {
            const requestBody = {
                initialAmount: +orderInfo.initialSum,
                invoice: {
                    date: formattedDate(new Date()),
                    number: uuidv4()
                },
                orderId: selectedLeobankSale?.uuid,
                phone: orderInfo.phone.replace(/\D/g, ''),
                products,
                program: {
                    numberOfPayments: +orderInfo.numberOfPayments,
                    type: 'part-payment'
                },
                totalAmount: +selectedLeobankSale?.bankInfo?.totalAmount || +selectedLeobankSale?.totalPrice
            }

            post(
                `${getHost('payments', 8094)}/api/v1/lending/leo-bank/order/create`,
                requestBody
            )
                .then(() => {
                    setRerender(!rerender)
                })
                .catch(() => {
                    if (
                        !!selectedLeobankSale?.bankInfo?.state ||
                        !!selectedLeobankSale?.bankInfo?.subState
                    ) {
                        setRerender(!rerender)
                    }
                })
        }
    }

    useEffect(() => {
        const token = jwt(localStorage.getItem('jwt_token'))
        setDecodedToken(token)
    }, [])

    return (
        <div>
            <form className='leobank-form' onSubmit={createOrder}>
                <div className='row'>
                    <div className='col-6 mb-3'>
                        <label className='required'>Telefon nömrəsi</label>
                        <InputMask
                            mask='(+\9\9499) 999-99-99'
                            className='form-control'
                            onChange={(e) =>
                                updateOrderInfo('phone', e.target.value)
                            }
                            value={orderInfo?.phone || ''}
                            disabled={selectedLeobankSale?.bankInfo?.subState === LEOBANK_ORDER_SUB_STATES.STORE_CONFIRM_TIME_EXPIRED || false}
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
                            disabled={selectedLeobankSale?.bankInfo?.subState === LEOBANK_ORDER_SUB_STATES.STORE_CONFIRM_TIME_EXPIRED || false}
                        />
                    </div>
                    <div className='col-6 mb-3'>
                        <label className='required'>Ümumi məbləğ</label>
                        <input
                            className='form-control'
                            placeholder='Ümumi məbləğ'
                            type='number'
                            disabled
                            value={selectedLeobankSale?.bankInfo?.totalAmount || selectedLeobankSale?.totalPrice}
                        />
                        {validationErrors.totalSum && (
                            <div className='invalid-feedback d-block position-relative mt-1'>
                                {validationErrorMessages.totalSum}
                            </div>
                        )}
                    </div>
                    <div className='col-6 mb-3'>
                        <label className='required'>Ayların sayı</label>
                        <select
                            className='form-control'
                            value={orderInfo?.numberOfPayments || ''}
                            onChange={(e) =>
                                updateOrderInfo(
                                    'numberOfPayments',
                                    e.target.value
                                )
                            }
                            disabled={selectedLeobankSale?.bankInfo?.subState === LEOBANK_ORDER_SUB_STATES.STORE_CONFIRM_TIME_EXPIRED || false}
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
                    </div>
                </div>
            </form>
        </div>
    )
}
