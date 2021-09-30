import React, {useContext, useRef, useState} from 'react';
import noImage from "../../assets/images/no-image.png";
import CountInput from "../../UI/countInput";
import CartContext from "../../store/CartContext";
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';

const img = {
    width: '100%',
    maxWidth: 100,
    marginRight: 10
};

const SubProductItem = (props) => {
    const amountInputRef = useRef();
    const cartCtx = useContext(CartContext);
    const [isAmountValid, setIsAmountValid] = useState(true);

    const addToCartHandler = () => {
        const enteredAmount = amountInputRef.current.value;
        const enteredAmountNumber = +enteredAmount;

        if (enteredAmount.trim().length === 0 || enteredAmountNumber < 1 || enteredAmountNumber > 12) {
            setIsAmountValid(false);
            return;
        } else {
            cartCtx.addItem({
                amount: enteredAmountNumber,
                discount: 0,
                files: props.files,
                id: props.id,
                name: props.name,
                price: props.price,
                parent : props.parent
            });
        }
    }


    return (
        <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12 mb-3" key={props.id}>
            <div className="sub-item-wrapper">
                <div className="sub-item-info">
                    <div className="sub-item-image">
                        {props.files?.length ? props.files.map(file => (
                            <LightGallery speed={500}>
                                <a href={file.originalImageUrl}>
                                    <img alt="" style={img} src={file.lowQualityImageUrl} />
                                </a>
                            </LightGallery>
                        )) : <img src={noImage} alt=""/>}
                    </div>
                    <div className="sub-item">
                        <p className="sub-item-name" onClick={props.onClickHandle.bind(null, props.id)}>{props.name}</p>
                    </div>
                </div>
                <div className="line"></div>
                <div className="d-flex justify-content-between p-2 align-items-center">
                    <div className="sub-item-price-block">
                        {props.price ? props.price : 0} AZN
                    </div>
                    <CountInput defaultValue={props.defaultValue} ref={amountInputRef}/>
                    <div className="text-end">
                        <button type="button" className="btn btn-success" onClick={addToCartHandler}>
                            <i className="fas fa-cart-plus"/>
                        </button>
                    </div>
                </div>
                {!isAmountValid &&
                <small className="text-danger">Zəhmət olmasa düzgün miqdar daxil edin (1-12).</small>
                }
            </div>
        </div>
    )
}

export default SubProductItem;