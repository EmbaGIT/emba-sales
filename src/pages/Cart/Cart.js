import {useContext, useState, useEffect} from 'react';
import {Link} from 'react-router-dom'
import CartContext from "../../store/CartContext";
import CartItem from "./CartItem";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useLocation } from "react-router-dom";

const Cart = () => {
    const cartCtx = useContext(CartContext);
    const location = useLocation();
    const [hasItem, setHasItem] = useState(cartCtx.items.length > 0);
    const [totalDiscount, setTotalDiscount] = useState(0);
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
                    characteristic_uid: cartCtx.items[0].characteristic_uid,
                    characteristic_code: cartCtx.items[0].characteristic_code,
                    price: cartCtx.items[0].price,
                    parent: cartCtx.items[0].parent,
                    category: cartCtx.items[0].category,
                    uid: cartCtx.items[0].uid
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
                            characteristic_uid: item.characteristic_uid,
                            characteristic_code: item.characteristic_code,
                            price: item.price,
                            parent: item.parent,
                            category: item.category,
                            uid: item.uid
                        }],
                    })
                }
            }
        })
        setCartState(newCartArr);

        //If there are products in the basket, show "Səbəti təsdiq et" button on the redirect to Cart page using location state
        if (location.state?.length > 0) {
            setHasItem(true);
        }
    }, [cartCtx, hasItem]);

    const clearDiscount = () => {
        const cartStateArr = [];
        cartCtx.discountHandler({
            discountType: "all",
            discountData: {discount: 0}
        });
        cartState.forEach(item => {
            const itemArr = [];
            item.products.forEach(product => (
                itemArr.push({
                    ...product,
                    discount: 0
                })
            ));
            cartStateArr.push({
                ...item,
                products: itemArr
            })
        })
        setCartState(cartStateArr);
    }

    const applyDiscountProduct = (type, param) => {
        if (type === "all") {
            cartCtx.discountHandler({
                discountType: "all",
                discountData: {discount: param}
            });
        } else {
            cartCtx.discountHandler({
                discountType: "single",
                discountData: param
            })
        }
    }

    const handleInputChange = (index, pr_index, param) => {
        let alldata = [...cartState];
        let updatedProductDiscount = [...alldata[index].products];

        updatedProductDiscount[pr_index] = {
            ...updatedProductDiscount[pr_index],
            discount: param
        }
        alldata[index] = {
            ...alldata[index],
            products: updatedProductDiscount
        };
        setCartState(alldata);
    }

    const handleCheckboxChange = (value) => {
        setIsDisabled(value);
        setTotalDiscount('');
        clearDiscount();
    }

    const clearBasket = () => {
        confirmAlert({
            title: '',
            message: 'Bütün məhsullar səbətdən silinəcək!',
            buttons: [
                {
                    label: 'Sil',
                    onClick: () => cartCtx.clearBasket()
                },
                {
                    label: 'Ləğv et',
                    onClick: () => {}
                }
            ]
        });
    }

    return (
        <>
            <div className="row mb-2">
                <div className="col-lg-9 col-md-7">
                    <h3 className="fm-poppins">Səbət</h3>
                </div>
                <div className="col-lg-3 col-md-5">
                    <Link to='/' className="w-100 btn btn-dark">Alış verişə davam et</Link>
                </div>
            </div>
            <div className="row mb-3">
                <div className="col-lg-9">
                    {cartState.length ?
                        <div>
                            <div className="basket-product-wrapper card card-table">
                                {cartState.map((item, index) => (
                                    <div key={index}>
                                        <div
                                            className="list-group-item-primary p-3 d-flex justify-content-between align-content-center">
                                            <span>{item.parent}</span>
                                        </div>
                                        {item.products && item.products.map((product, pr_index) => (
                                            <CartItem key={pr_index}
                                                      product={product}
                                                      isDisabled={isDisabled}
                                                      index={index}
                                                      pr_index={pr_index}
                                                      applyDiscountProduct={applyDiscountProduct}
                                                      handleInputChange={handleInputChange}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div className="text-end">
                                <div className="btn btn-danger mt-3" onClick={clearBasket}>Səbəti təmizlə</div>
                            </div>
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
                                        <td className="text-right">{cartCtx.totalDiscount || 0}%</td>
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
                                    onChange={(e) => handleCheckboxChange(e.target.checked)}
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
                                    <input type="number" id="isDisabled" disabled={!isDisabled} autoComplete="off"
                                           placeholder='%'
                                           value={totalDiscount}
                                           onChange={e => {
                                               if (e.target.value > 100) {
                                                   setTotalDiscount(100)
                                               } else if (e.target.value < 0) {
                                                   setTotalDiscount(0)
                                               } else if (e.target.value.startsWith('0')) {
                                                   setTotalDiscount(e.target.value.slice(1))
                                               } else {
                                                   setTotalDiscount(e.target.value)
                                               }
                                           }}
                                           onBlur={event => event.target.value.trim() && applyDiscountProduct("all", event.target.value)}
                                           className="form-control"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    {hasItem &&
                    <Link to="/checkout" className="btn btn-success py-2 mt-2 fm-poppins w-100">Səbəti təsdiq et<i className="fas fa-chevron-right ms-1"/></Link>
                    }
                </div>
            </div>
        </>
    )
}

export default Cart;