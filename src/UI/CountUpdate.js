import CountInput from "./CountInput";
import {useRef} from "react";

const CountUpdate = (props) => {
    const amountInputRef = useRef();
    const handleUpdate = (id) =>{
        const enteredAmount = amountInputRef.current.value;
        props.onHandleUpdate(id, enteredAmount);
    }

    return (
        <div>
            <CountInput defaultValue={props.quantity} ref={amountInputRef}/>
            <div className="btn btn-success btn-sm w-100" onClick={handleUpdate.bind(this, props.id)}><i className="fas fa-sync-alt"/></div>
        </div>
    )
}

export default CountUpdate;