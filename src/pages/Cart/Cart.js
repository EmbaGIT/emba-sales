import React, {useContext} from 'react';
import {Link} from 'react-router-dom'
import CartContext from "../../store/CartContext";
import noImage from "../../assets/images/no-image.png";

const Cart = () => {
    const cartCtx=useContext(CartContext);
    console.log(cartCtx);

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
                    {cartCtx.items.length ?
                        <div className="basket-product-wrapper card card-table">
                            {cartCtx.items.map(item => (
                                <div className="cart-product-table pr-wrapper">
                                    <div className="basket-product-image-row">
                                        {item.files.length ? item.files.map(file => (
                                                <img src={file.objectUrl} alt="" className="basket-product-image"/>
                                            )) :
                                            <img src={noImage} alt="" className="basket-product-image"/>
                                        }
                                    </div>
                                    <div className="basket-product-name-row">
                                        <p className="fm-poppins_bold mb-0"><Link
                                            to={`/product/${item.id}`}>{item.name}</Link></p>
                                    </div>
                                    <div className="basket-product-count-row pr-count">
                                        <div className="count-input-wrapper">
                                            <button type="button" className="count_down"><i className="fas fa-minus"/>
                                            </button>
                                            <input type="number" className="count-input" value="1" readOnly/>
                                            <button type="button" className="count_up"><i className="fas fa-plus"/>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="basket-product-price-row">
                                        <div className="basket-product-price"><span>{item.price}</span> ₼</div>
                                    </div>
                                    <div className="basket-product-delete-row">
                                        <div className="delete-cart-item"><i className="text-danger fas fa-trash-alt"/>
                                        </div>
                                    </div>
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
                    <button type="submit" className="btn btn-success py-2 fm-poppins w-100">Səbəti təsdiq et<i
                        className="fas fa-chevron-right ms-1"/></button>
                </div>
            </div>
        </>
    )
}

export default Cart;