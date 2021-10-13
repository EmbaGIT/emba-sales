import React, {useEffect, useContext, useState} from 'react';
import CartContext from "../../store/CartContext";
import {useQuery, gql} from "@apollo/client";

const CUSTOMER_QUERY = gql`
    query searchByName {
      search(criteria: {name: {contains: "Fuad"}}) {
        uid
        name
      }
    }`;

/*
const EXCHANGE_RATES = gql`
  query GetExchangeRates {
    rates(currency: "USD") {
      currency
      rate
    }
  }
`;
*/

const Checkout = () => {

    // const {loading, error, data} = useQuery(CUSTOMER_QUERY);

    // if (loading) return <p>Loading...</p>;
    // if (error) return <p>Error :(</p>;

    // return data.rates.map(({currency, rate}) => (
    //     <div key={currency}>
    //         <p>
    //             {currency}: {rate}
    //         </p>
    //     </div>
    // ));

    const cartCtx = useContext(CartContext);
    const [isRefactorDisabled, setIsRefactorDisabled] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        surname: '',
        patronymic: '',
        birthdate: '',
        city: '',
        mobile_phone: '',
        city_phone: '',
        address: '',
        gender: '',
        email: ''
    })
    const [checkoutState, setCheckoutState] = useState({
        items: [],
        checkout: false
    });

    const { data, loading, error } = useQuery(CUSTOMER_QUERY);

    useEffect(() => {
        if (cartCtx.items.length > 0) {
            setCheckoutState(prevState => ({
                ...prevState,
                items: cartCtx.items
            }));
        }
    }, [cartCtx]);

    const onPriceChange = (event) => {
        const enteredValue = event.target.value;

        cartCtx.checkoutPriceChange({
            value: enteredValue
        });
    }

    if (loading) return "Loading...";
    if (error) return <pre>{error.message}</pre>



    return (
        <div className="row">
            <div className="col-md-6">
                {console.log(data)}
                <div className="card">
                    <div className="list-group-item list-group-item-success">Sifarişin təsviri</div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table text-start">
                                <thead className="">
                                <tr>
                                    <th>Modelin adı</th>
                                    <th style={{width: '110px'}}>Qiyməti</th>
                                    <th style={{width: '110px'}}>Son qiyməti</th>
                                </tr>
                                </thead>
                                <tbody className="">
                                {checkoutState.items?.map(product => (
                                    <tr key={product.id}>
                                        <td>
                                            {product.name}
                                            <div className="text-success font-weight-bold">Sayı: {product.amount}</div>
                                        </td>
                                        <td>{product.price} AZN</td>
                                        <td>{Math.round((product.amount * (product.price - (product.price * product.discount / 100))) * 100) / 100} AZN</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <h6>Ödəniş forması</h6>
                            <div className="d-flex">
                                <span className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="paymentType"
                                        id="cash"
                                    />
                                    <label className="form-check-label" htmlFor="cash">Nağd</label>
                                </span>
                                <span className="form-check ms-3">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="paymentType"
                                        id="credit"
                                    />
                                    <label className="form-check-label" htmlFor="credit">Kredit</label>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer">
                        <ul className="ps-0">
                            <li className="d-flex align-content-center justify-content-between mb-2">
                                <strong>Cəm məbləğ:</strong>
                                <div className="float-end">{cartCtx.totalAmount} AZN</div>
                            </li>
                            <li className="d-flex align-content-center justify-content-between mb-2">
                                <strong>Endirimli məbləğ:</strong>
                                <div className="float-end">{cartCtx.discountAmount} AZN</div>
                            </li>
                            <li className="d-flex align-content-center justify-content-between mb-2">
                                <strong>Qiymət dəyişikliyi:</strong>
                                <div className="float-end"><input type="text" onBlur={onPriceChange}
                                                                  className="form-control" style={{width: '80px'}}/>
                                </div>
                            </li>
                            <li className="d-flex align-content-center justify-content-between mb-2">
                                <strong>Bank komissiyası:</strong>
                                <div className="float-end"><input type="text" className="form-control"
                                                                  style={{width: '80px'}}/></div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="col-md-6">
                <div className="card">
                    <div className="list-group-item list-group-item-success">Müştəri məlumatları</div>
                    <div className="card-body">
                        <h6>Müştəri haqqında məlumat</h6>
                        <div className="input-group row mb-2">
                            <div className="col-md-4">
                                <label>Ad</label>
                                <input type="text" className="form-control"/>
                            </div>
                            <div className="col-md-4">
                                <label>Soyad</label>
                                <input type="text" className="form-control"/>
                            </div>
                            <div className="col-md-4">
                                <label>Ata adı</label>
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="mb-2">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="refactorInfo"
                                    disabled={isRefactorDisabled}
                                />
                                <label className="form-check-label" htmlFor="refactorInfo">
                                    Məlumatları Yenilə
                                </label>
                            </div>
                        </div>

                        <div className="">

                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout;