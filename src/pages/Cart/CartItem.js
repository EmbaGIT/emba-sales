import {useRef, useContext} from 'react';
import noImage from "../../assets/images/no-image.png";
import CountInput from "../../UI/CountInput";
import CartContext from "../../store/CartContext";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const CartItem = (props) =>{
    const cartCtx = useContext(CartContext);
    const handleDelete = (id) => {
        confirmAlert({
            title: '',
            message: 'Məhsul səbətdən silinəcək!',
            buttons: [
                {
                    label: 'Sil',
                    onClick: () => cartCtx.removeItem(id)
                },
                {
                    label: 'Ləğv et',
                    onClick: () => {}
                }
            ]
        });
    }

    const handleUpdate = (id, amount) => {
        const enteredAmount = amount;
        const enteredAmountNumber = +enteredAmount;
        cartCtx.updateItem(enteredAmountNumber, id);
    }

    return(
        <div className="cart-product-table pr-wrapper" key={props.product.id}>
            <div className="basket-product-image-row">
                {props.product.files.length ?
                        <img src={props.product.files[0].originalImageUrl} alt=""
                             className="basket-product-image"/>
                        :  <img src={noImage} alt="" className="basket-product-image"/>
                }
            </div>
            <div className="basket-product-name-row">
                <p className="fm-poppins_bold mb-0">{props.product.name}</p>
                {props.product.characteristic_code && <p className="mb-0"><span className="text-warning">Xar.Code: {props.product.characteristic_code}</span></p>}
                <span className="text-success">Qiymət: {props.product.price} ₼</span>
            </div>
            <div>
                <CountInput
                    defaultValue={props.product.amount}
                    productId={props.product.id}
                    handleUpdate={handleUpdate}
                />
            </div>
            <div className="basket-product-price-row">
                <div className="basket-product-old-price">
                    <span>{(props.product.price * props.product.amount).toFixed(2)} ₼</span></div>
                <div className="basket-product-price">
                    <span>{(props.product.price * props.product.amount - (props.product.price * props.product.amount * props.product.discount / 100)).toFixed(2)} ₼</span>
                </div>
            </div>
            <div className="basket-product-price-row">
                <input type="number" disabled={props.isDisabled} className="form-control"
                       onBlur={event => event.target.value.trim() && props.applyDiscountProduct("single", {
                           id: props.product.id,
                           discount: parseInt(event.target.value),
                           characteristic_uid: props.product.characteristic_uid,
                       })}
                       onChange={event => {
                           if (event.target.value > 100) {
                               props.handleInputChange(props.index, props.pr_index, 100)
                           } else if (event.target.value < 0) {
                               props.handleInputChange(props.index, props.pr_index, 0)
                           } else if (event.target.value.startsWith('0')) {
                               props.handleInputChange(props.index, props.pr_index, event.target.value.slice(1))
                           } else {
                               props.handleInputChange(props.index, props.pr_index, event.target.value)
                           }
                       }}
                       value={props.product.discount}
                       style={{width: '80px'}} placeholder="%"/>
            </div>
            <div className="basket-product-delete-row">
                <div className="delete-cart-item"
                     onClick={handleDelete.bind(this, props.product.id)}><i
                    className="text-danger fas fa-trash-alt"/>
                </div>
            </div>
        </div>
    )

}

export default CartItem;