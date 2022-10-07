import React, { useState } from 'react';

const CountInput = props => {
    const [count, setCount] = useState(props.defaultValue);

    const handleOnChange = (type) => {
        if (type==="add") {
            setCount(count => count + 1);
            props.handleUpdate(count + 1);
        } else if (type==="remove" && count > 0) {
            setCount(count => count - 1);
            props.handleUpdate(count - 1);
        }
    }

    return(
        <div className="count-input-wrapper sub-product-count">
            <button type="button" className="count_down" onClick={handleOnChange.bind(null, "remove")}><i className="fas fa-minus"/>
            </button>
            <input type="number"
                   value={count}
                   className="count-input"
                   min="0"
                   max="12"
                   readOnly
            />
            <button type="button" className="count_up" onClick={handleOnChange.bind(null, "add")}><i className="fas fa-plus"/>
            </button>
        </div>
    )
};

export default CountInput;