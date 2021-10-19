import React, {useEffect, useContext, useState} from 'react';
import CartContext from "../../store/CartContext";
import CustomerInfo from "./CustomerInfo";

const Checkout = () => {
    const cartCtx = useContext(CartContext);
    const [checkoutState, setCheckoutState] = useState({
        items: [],
        checkout: false
    });

    /*const years = range(1960, getYear(new Date()) + 1, 1);
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];*/


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

    return (
        <div className="row">
            <div className="col-md-6">
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
                                        <td>{product.discount_price} AZN</td>
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
                <CustomerInfo/>
            </div>
        </div>
    )
}

export default Checkout;