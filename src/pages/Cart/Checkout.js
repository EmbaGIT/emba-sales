import React, {useEffect, useContext, useState} from 'react';
import CartContext from "../../store/CartContext";

const Checkout = () => {
    const cartCtx = useContext(CartContext);
    const [checkoutState, setCheckoutState] = useState({
        items: [],
        checkout: false
    });

    useEffect(() => {
        if (cartCtx.items.length > 0) {
            setCheckoutState(prevState => ({
                ...prevState,
                items: cartCtx.items
            }));
        }
    }, []);


    return (
        <div className="row">
            <div className="col-md-6">
                <div className="card text-center">
                    <div className="card-header list-group-item-success">Sifarişin təsviri</div>
                    <div className="card-body">
                        <table className="table text-start">
                            <thead>
                            <tr>
                                <th scope="col">Modelin adı</th>
                                <th scope="col">Qiyməti</th>
                                <th scope="col">Son qiyməti</th>
                            </tr>
                            </thead>
                            <tbody>
                            {checkoutState.items?.map(product => (
                                <tr key={product.id}>
                                    <th scope="row">{product.name}</th>
                                    <td>{product.price} AZN</td>
                                    <td>{Math.round((product.amount * (product.price - (product.price * product.discount/100)))*100)/100} AZN</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="col-md-6">

            </div>
        </div>
    )
}

export default Checkout;