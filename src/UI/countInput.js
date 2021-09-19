import React from 'react';

const CountInput = React.forwardRef((props, ref) => {
    return(
        <div className="count-input-wrapper sub-product-count">
            <button type="button" className="count_down"><i className="fas fa-minus"/>
            </button>
            <input type="number"
                   className="count-input"
                   defaultValue="1"
                   min="0"
                   max="12"
                   ref={ref} readOnly/>
            <button type="button" className="count_up"><i className="fas fa-plus"/>
            </button>
        </div>
    )
});

export default CountInput;