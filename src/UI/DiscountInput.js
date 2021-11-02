import {useState} from 'react';

const DiscountInput = (props) => {

    const [discount, setDiscount] = useState(0);

    const handleInputChange = (value) => {
        setDiscount(value);
    }

    return(
        <input type="text" disabled={props.isDisabled} className="form-control"
               style={{width: '80px'}} placeholder="%" value={discount}
               onBlur={props.onClickHandle.bind(null, )}
               onChange={(e) => handleInputChange(e.target.value)}
        />
    )
};

export default DiscountInput;