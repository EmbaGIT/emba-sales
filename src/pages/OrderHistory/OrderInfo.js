import Modal from '../../UI/Modal';
import React, {useRef} from "react";
import CountInput from "../../UI/countInput";

const OrderInfo = (props) => {
    const amountInputRef = useRef();

    const handleUpdate = (id) => {
        const enteredAmount = amountInputRef.current.value;
        const enteredAmountNumber = +enteredAmount;

        if (enteredAmount.trim().length === 0 || enteredAmountNumber < 1 || enteredAmountNumber > 12) {
            return;
        } else {
            console.log(id, enteredAmountNumber)
        }
    }

    return (
        <Modal onClose={props.onClose}>
            <div className="row">
                <div className="col-lg-12">
                    <table className="table table-striped table-hover table-bordered">
                        <thead>
                        <tr>
                            <th>Modelin adı</th>
                            <th>Sayı</th>
                            <th>Qiymət</th>
                            <th>Endirim</th>
                            <th>Son qiymət</th>
                            {props.info.status === "SAVED" && <th></th>}
                        </tr>
                        </thead>
                        <tbody>
                        {props.info && props.info?.goods?.map(item => (
                            <tr key={item.id}>
                                <td><b>{item.product_name}</b></td>
                                <td>{props.info.status === "SAVED" ?
                                    <div>
                                        <CountInput defaultValue={item.product_quantity} ref={amountInputRef}/>
                                        <div className="btn btn-success btn-sm w-100" onClick={handleUpdate.bind(this, item.id)}><i className="fas fa-sync-alt"/></div>
                                    </div>
                                    : item.product_quantity}</td>
                                <td>{item.product_price} AZN</td>
                                <td>{item.product_discount.toFixed(2)} %</td>
                                <td>{(item.product_price*item.product_quantity - item.product_quantity* item.product_price * item.product_discount/100).toFixed(2)} AZN</td>
                                {props.info.status === "SAVED" && <td><i className="far fa-trash-alt text-danger cursor-pointer" onClick={() => {props.onItemDelete(item.id)}}/></td>}
                            </tr>
                        ))}
                        {/*{props.info?.orderStateList ?
                            <tr>
                                <th colSpan="4">
                                    <div className="text-end">Sifarişin kodu</div>
                                </th>
                                {props.info?.orderStateList?.map((info, i) => <th
                                    key={i}>{info.erpResponseMessage.split(' ')[2]}</th>)}
                            </tr> : ''
                        }*/}
                        <tr>
                            <th colSpan="5"><div className="text-end">Endirimsiz məbləğ</div></th>
                            <th>{props.info.totalPrice} AZN</th>
                        </tr>
                        <tr>
                            <th colSpan="5"><div className="text-end">Ödəniləcək məbləğ</div></th>
                            <th>{props.info.discountPrice} AZN</th>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="d-flex justify-content-end mt-2">
                {props.info.status === "SAVED" && <div className="btn btn-success me-2">Sifarişi Göndər</div>}
                <div className="btn btn-primary" onClick={props.onClose}>Bağla</div>
            </div>
        </Modal>
    );
};

export default OrderInfo;