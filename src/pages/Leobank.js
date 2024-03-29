import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import InputMask from 'react-input-mask'
import { get } from '../api/Api'
import { getHost } from '../helpers/host'

const createArrayFromRange = ([start, end]) =>
    Array(end - (start - 1))
        .fill(0)
        .map((_, i) => start + i)

const validationErrorMessages = {
    phone: 'Zəhmət olmasa telefon nömrəsini daxil edin.',
    initialSum: 'Zəhmət olmasa nağd ödəniş məbləğini daxil edin.',
    totalSum: 'Zəhmət olmasa ümumi ödəniş məbləğini daxil edin.',
    date: 'Zəhmət olmasa sifariş tarixini daxil edin.',
    numberOfPayments: 'Zəhmət olmasa ödəniş aylarının sayını daxil edin.'
}

export const Leobank = () => {
    const [orderInfo, setOrderInfo] = useState({
        phone: '',
        initialSum: '',
        totalSum: '',
        date: '',
        numberOfPayments: ''
    })
    const [validationErrors, setValidationErrors] = useState(
        Object.keys(orderInfo).reduce(
            (result, key) => ({ ...result, [key]: false }),
            {}
        )
    )
    const [mounted, setMounted] = useState(false)

    const validateOrderInfo = () => setValidationErrors(
        Object
            .entries(orderInfo)
            .reduce((result, [key, value]) => {
                if (!value) {
                    return { ...result, [key]: true }
                } else if (value && validationErrors[key]) {
                    return { ...result, [key]: false }
                }

                return { ...result, [key]: value }
            }, {})
    )

    const updateOrderInfo = (key, value) => {
        console.log('orderInfo', orderInfo)
        console.log('validationErrors', validationErrors)
        setOrderInfo({ ...orderInfo, [key]: value })
    }

    const hasValidationError = () => !!Object
        .values(orderInfo)
        .filter(info => !info).length

    const createOrder = (e) => {
        e.preventDefault()
        if (hasValidationError()) validateOrderInfo()
    }

    useEffect(() => {
        if (!mounted) setMounted(true)
        get(`${getHost('payments', 8094)}/api/v1/query`)
            .then((response) => console.log(response))
            .catch((error) => console.log(error))
    }, [])

    return (
        <div>
            <form onSubmit={createOrder}>
                <div className='row'>
                    <div className='col-4 mb-3'>
                        <label>Telefon nömrəsi</label>
                        <InputMask
                            mask='(+\9\9499) 999-99-99'
                            className='form-control'
                            onChange={(e) =>
                                updateOrderInfo('phone', e.target.value)
                            }
                            value={orderInfo?.phone || ''}
                        />
                        {validationErrors.phone && (
                            <div className='invalid-feedback d-block position-relative mt-1'>
                                {validationErrorMessages.phone}
                            </div>
                        )}
                    </div>
                    <div className='col-4 mb-3'>
                        <label>Nağd ödəniş məbləği</label>
                        <input
                            className='form-control'
                            placeholder='Nağd ödəniş məbləği'
                            type='number'
                            value={orderInfo?.initialSum || ''}
                            onChange={(e) =>
                                updateOrderInfo('initialSum', e.target.value)
                            }
                        />
                        {validationErrors.initialSum && (
                            <div className='invalid-feedback d-block position-relative mt-1'>
                                {validationErrorMessages.initialSum}
                            </div>
                        )}
                    </div>
                    <div className='col-4 mb-3'>
                        <label>Ümumi məbləğ</label>
                        <input
                            className='form-control'
                            placeholder='Ümumi məbləğ'
                            type='number'
                            value={orderInfo?.totalSum || ''}
                            onChange={(e) =>
                                updateOrderInfo('totalSum', e.target.value)
                            }
                        />
                        {validationErrors.totalSum && (
                            <div className='invalid-feedback d-block position-relative mt-1'>
                                {validationErrorMessages.totalSum}
                            </div>
                        )}
                    </div>
                    <div className='col-4 mb-3'>
                        <label>Tarix</label>
                        <DatePicker
                            className='form-control'
                            dateFormat='yyyy-MM-dd'
                            selected={orderInfo?.date || ''}
                            onChange={(date) => updateOrderInfo('date', date)}
                        />
                        {validationErrors.date && (
                            <div className='invalid-feedback d-block position-relative mt-1'>
                                {validationErrorMessages.date}
                            </div>
                        )}
                    </div>
                    <div className='col-4 mb-3'>
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
                        >
                            <option
                                value={''}
                                key={'first default option'}
                            >
                                Aylıq ödənişlərin sayını seçin
                            </option>
                            {createArrayFromRange([3, 24]).map((m) => (
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
                    <div className='col-12 mt-3'>
                        <button
                            type='submit'
                            className='btn btn-primary'
                        >
                            Sifariş yaradın
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
