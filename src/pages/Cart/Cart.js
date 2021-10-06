import React, {useContext, useRef, useState, useEffect} from 'react';
import {Link} from 'react-router-dom'
import CartContext from "../../store/CartContext";
import noImage from "../../assets/images/no-image.png";
import CountInput from "../../UI/countInput";

const Cart = () => {
    const cartCtx = useContext(CartContext);
    const amountInputRef = useRef();
    const [hasItem, setHasItem] = useState(cartCtx.items.length > 0);
    const [cartState, setCartState] = useState([]);
    const [isDisabled, setIsDisabled] = useState(false);

    useEffect(() => {
        const newCartArr = [];
        if (cartCtx.items.length > 0) {
            newCartArr.push({
                parent: cartCtx?.items[0].parent,
                products: [{
                    amount: cartCtx.items[0].amount,
                    discount: cartCtx.items[0].discount,
                    files: cartCtx.items[0].files,
                    id: cartCtx.items[0].id,
                    name: cartCtx.items[0].name,
                    price: cartCtx.items[0].price
                }],
            });
        }
        cartCtx.items.forEach((item, index) => {
            if (index > 0) {
                const existingParentItemIndex = newCartArr.findIndex(
                    (product) => product.parent === item.parent
                );
                if (newCartArr[existingParentItemIndex]) {
                    newCartArr[existingParentItemIndex].products.push(item);
                } else {
                    newCartArr.push({
                        parent: item.parent,
                        products: [{
                            amount: item.amount,
                            discount: item.discount,
                            files: item.files,
                            id: item.id,
                            name: item.name,
                            price: item.price
                        }],
                    })
                }
            }
        })
        setCartState(newCartArr);
    }, [cartCtx]);

    const clearDiscount = () => {
        cartCtx.discountHandler({
            discount: 0,
            items: cartCtx.items
        });
    }

    const applyDiscountProduct = (type, param) => {
        if (type === "all") {
            const cartItems = [];
            cartCtx.items.forEach(item => {
                cartItems.push({id: item.id, discount: param, amount: item.amount, price: item.price})
            })
            cartCtx.discountHandler({
                type: "all",
                items: cartItems
            });
        } else {
            cartCtx.discountHandler({
                type: "single",
                items: param
            })
        }
    }

    const handleInputChange = (value) => {
        setIsDisabled(value);
        clearDiscount();
    }

    return (
        <>
            <div className="row mb-2">
                <div className="col-lg-9">
                    <h3 className="fm-poppins">Səbət</h3>
                </div>
                <div className="col-lg-3">
                    <Link to='/' className="w-100 btn btn-dark">Alış verişə davam et</Link>
                </div>
            </div>
            <div className="row mb-3">
                <div className="col-lg-9">
                    {cartState.length ?
                        <div className="basket-product-wrapper card card-table">
                            {cartState.map(item => (
                                <div>
                                    <div
                                        className="list-group-item-primary p-3 d-flex justify-content-between align-content-center">
                                        <span>{item.parent}</span>
                                    </div>
                                    {item.products && item.products.map(product => (
                                        <div className="cart-product-table pr-wrapper">
                                            <div className="basket-product-image-row">
                                                {product.files.length ? product.files.map(file => (
                                                        <img src={file.originalImageUrl} alt=""
                                                             className="basket-product-image"/>
                                                    )) :
                                                    <img src={noImage} alt="" className="basket-product-image"/>
                                                }
                                            </div>
                                            <div className="basket-product-name-row">
                                                <p className="fm-poppins_bold mb-0">{product.name}</p>
                                                <span className="text-success">Qiymət: {product.price} ₼</span>
                                            </div>
                                            <CountInput ref={amountInputRef} defaultValue={product.amount}/>
                                            <div className="basket-product-price-row">
                                                <div className="basket-product-old-price">
                                                    <span>{product.price * product.amount} ₼</span></div>
                                                <div className="basket-product-price">
                                                    <span>{product.price * product.amount - (product.price * product.amount * product.discount / 100)} ₼</span>
                                                </div>
                                            </div>
                                            <div className="basket-product-price-row">
                                                <input type="text" disabled={isDisabled} className="form-control"
                                                       onBlur={event => applyDiscountProduct("single", [{
                                                           id: product.id,
                                                           discount: event.target.value,
                                                           amount: product.amount,
                                                           price: product.price
                                                       }])}
                                                       style={{width: '80px'}} placeholder="%"/>
                                            </div>
                                            <div className="basket-product-delete-row">
                                                <div className="delete-cart-item"><i
                                                    className="text-danger fas fa-trash-alt"/>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        :
                        <p>Səbətdə məhsul yoxdur</p>
                    }
                </div>
                <div className="col-lg-3">
                    <div className="card mb-2">
                        <div className="card-body basket-review-wrapper">
                            <div className="table">
                                <table className="table">
                                    <tbody>
                                    <tr>
                                        <td>Səbətin ümumi dəyəri</td>
                                        <td className="text-right"><span
                                            className="cart-total-old-price fm-poppins_bold">{cartCtx.totalAmount}</span> ₼
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Səbətin endirimli dəyəri</td>
                                        <td className="text-right"><span
                                            className="cart-total-old-price fm-poppins_bold">{cartCtx.discountAmount}</span> ₼
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Ümumi endirim faizi:</td>
                                        <td className="text-right">0%</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-body">
                            <div className="form-check">
                                <input
                                    checked={isDisabled}
                                    onChange={(e) => handleInputChange(e.target.checked)}
                                    className='form-check-input'
                                    value={isDisabled}
                                    type='checkbox'
                                />
                                <label className="form-check-label" htmlFor="isDisabled">
                                    Bütün səbətə endirim tətbiq et (%-lə)
                                </label>
                            </div>
                            <div className="input-group">
                                <div>
                                    <input type="text" id="isDisabled" disabled={!isDisabled} autoComplete="off"
                                        // onChange={(e) => handleInputChange('fullDiscount', e.target.value)}
                                           onBlur={event => applyDiscountProduct("all", event.target.value)}
                                           className="form-control"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    {hasItem &&
                    <button type="submit" className="btn btn-success py-2 mt-2 fm-poppins w-100">Səbəti təsdiq et<i
                        className="fas fa-chevron-right ms-1"/></button>
                    }
                </div>
            </div>
        </>
    )
}

export default Cart;