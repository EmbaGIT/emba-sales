import React, {useContext, useRef, useState} from 'react';
import noImage from "../../assets/images/no-image.png";
import Input from "../../UI/Input";
import CartContext from "../../store/CartContext";


const SubProductItem = (props) => {
    const amountInputRef = useRef();
    const cartCtx=useContext(CartContext);
    const [isAmountValid, setIsAmountValid] = useState(true);

    const addToCartHandler = () => {
        const enteredAmount = amountInputRef.current.value; // always string value also input type number
        const enteredAmountNumber = +enteredAmount;

        if(enteredAmount.trim().length === 0 || enteredAmountNumber<1 || enteredAmountNumber > 12){
            setIsAmountValid(false);
            return;
        }else{
            cartCtx.addItem({
                id: props.id,
                name: props.name,
                amount: enteredAmountNumber,
                price: props.price,
                files: props.files
            });
        }

    }

    return(
        <div className="col-xl-4 col-lg-6 col-md-12 mb-3" key={props.key_id}>
            <div className="sub-item-wrapper">
                <div className="sub-item-info">
                    <div className="sub-item-image">
                        {props.files?.length ? props.files.map(file => (
                            <img src={file.objectUrl} alt=""/>
                        )) : <img src={noImage} alt=""/>}
                    </div>
                    <div className="sub-item">
                        <p>{props.name}</p>
                    </div>
                </div>
                <div className="line"></div>
                <div className="d-flex justify-content-between">
                    <div className="sub-item-price-block">
                        {props.price ? props.price : 0} AZN
                    </div>
                    <Input
                        ref={amountInputRef}
                        input = {{
                            type: 'number',
                            id: props.id,
                            min: '1',
                            max: '12',
                            step: '1',
                            defaultValue: '1'
                        }}
                    />
                </div>
                {!isAmountValid && <small className="text-danger">Zəhmət olmasa düzgün miqdar daxil edin (1-12).</small>}
                <div className="text-end">
                    <button type="button" className="btn btn-success" onClick={addToCartHandler}>Səbətə at</button>
                </div>
            </div>
        </div>
    )
}

export default SubProductItem;