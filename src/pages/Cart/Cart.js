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

    useEffect(() => {
        const newCartArr = [];
        newCartArr.push({
            parent: cartCtx.items[0].parent,
            products: [{
                amount: cartCtx.items[0].amount,
                discount: cartCtx.items[0].discount,
                files: cartCtx.items[0].files,
                id: cartCtx.items[0].id,
                name: cartCtx.items[0].name,
                price: cartCtx.items[0].price
            }],
        });
        cartCtx.items.forEach((item, index) => {
            if (index > 0) {
                const existingParentItemIndex = newCartArr.findIndex(
                    (product) => product.parent === item.parent
                );
                if (existingParentItemIndex) {
                    console.log(newCartArr[existingParentItemIndex]);
                    // newCartArr[existingParentItemIndex].products.push(item);
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
        console.log(newCartArr);
        setCartState(newCartArr);
    }, []);

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
                                    <div className="bg-llight">{item.parent}</div>
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
                                            </div>
                                            <CountInput ref={amountInputRef} defaultValue={product.amount}/>
                                            <div className="basket-product-price-row">
                                                <div className="basket-product-price"><span>{product.price}</span> ₼
                                                </div>
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
                                        <td>Çatdırılma:</td>
                                        <td className="text-right">Pulsuz</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-body">
                            <p className="fm-poppins_bold">Endirim və ya hədiyyə kuponu</p>
                            <div className="d-flex">
                                <input type="text" placeholder="Kodu daxil edin"
                                       className="border-radius-0 form-control"/>
                                <button className="btn btn-custom border-radius-0">Yoxla</button>
                            </div>
                        </div>
                    </div>
                    {hasItem &&
                    <button type="submit" className="btn btn-success py-2 fm-poppins w-100">Səbəti təsdiq et<i
                        className="fas fa-chevron-right ms-1"/></button>
                    }
                </div>
            </div>
        </>
    )
}

export default Cart;