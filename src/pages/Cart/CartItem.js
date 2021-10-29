import React, {useRef, useContext} from 'react';
import noImage from "../../assets/images/no-image.png";
import CountInput from "../../UI/countInput";
import CartContext from "../../store/CartContext";

const CartItem = (props) =>{
    const amountInputRef = useRef();
    const cartCtx = useContext(CartContext);

    const handleDelete = (id) => {
        cartCtx.removeItem(id);
    }

    const handleUpdate = ( id) => {
        const enteredAmount = amountInputRef.current.value;
        const enteredAmountNumber = +enteredAmount;
        cartCtx.updateItem(enteredAmountNumber, id);
    }

    return(
        <div className="cart-product-table pr-wrapper" key={props.product.id}>
            <div className="basket-product-image-row">
                {props.product.files.length ? props.product.files.map(file => (
                        <img src={file.originalImageUrl} alt=""
                             className="basket-product-image"/>
                    )) :
                    <img src={noImage} alt="" className="basket-product-image"/>
                }
            </div>
            <div className="basket-product-name-row">
                <p className="fm-poppins_bold mb-0">{props.product.name}</p>
                <span className="text-success">Qiymət: {props.product.price} ₼</span>
            </div>
            <div>
                <CountInput defaultValue={props.product.amount} ref={amountInputRef}/>
                <div className="btn btn-success btn-sm w-100" onClick={handleUpdate.bind(this, props.product.id)}><i className="fas fa-sync-alt"/></div>
            </div>
            <div className="basket-product-price-row">
                <div className="basket-product-old-price">
                    <span>{props.product.price * props.product.amount} ₼</span></div>
                <div className="basket-product-price">
                    <span>{props.product.price * props.product.amount - (props.product.price * props.product.amount * props.product.discount / 100)} ₼</span>
                </div>
            </div>
            <div className="basket-product-price-row">
                <input type="text" disabled={props.isDisabled} className="form-control"
                       onBlur={event => event.target.value.trim() ? props.applyDiscountProduct("single", [{
                           id: props.product.id,
                           discount: parseInt(event.target.value),
                           amount: props.product.amount,
                           price: props.product.price,
                           name: props.product.name,
                           parent: props.product.parent,
                           files: props.product.files,
                           uid: props.product.uid
                       }]) : props.applyDiscountProduct("single", [{
                           id: props.product.id,
                           discount: 0,
                           amount: props.product.amount,
                           price: props.product.price,
                           name: props.product.name,
                           parent: props.product.parent,
                           files: props.product.files,
                           uid: props.product.uid
                       }])}
                       onChange={event => props.handleInputChange(props.index, props.pr_index, event.target.value)}
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