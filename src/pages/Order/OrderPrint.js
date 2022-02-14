import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {get, post} from "../../api/Api";
import { getHost } from "../../helpers/host";

const OrderPrint = () => {
    const params = useParams();
    const order_id = params.id;
    const [orderInfo, setOrderInfo] = useState([]);
    const [totalPrice, setTotalPrice] = useState();
    const [discountTotalPrice, setDiscountTotalPrice] = useState();

    useEffect(() => {
        post(`${getHost('sales', 8087)}/api/order/search?id.equals=${order_id}`,).then(resOrderInfo => {
            const products = [];
            let total_price=0;
            let discount_total_price=0;
            resOrderInfo.content[0].goods.map(item => {
                total_price += item.product_price*item.product_quantity;
                discount_total_price += item.product_price*item.product_quantity - item.product_quantity* item.product_price * item.product_discount/100;
                get(`/products/uid/${item.product_uid}`).then(res => {
                    products.push({
                        ...item,
                        product_name: res.name
                    });
                    products.sort(
                        (a, b) => parseInt(a.id) - parseInt(b.id)
                    );
                    setOrderInfo(prevstate => ({
                        ...resOrderInfo.content[0],
                        goods: products
                    }))
                    setTotalPrice(total_price);
                    setDiscountTotalPrice(discount_total_price);
                })
            })
        }).catch(err => {console.log(err)})
    }, [order_id]);

    return (
        <table className="table table-striped table-hover table-bordered" id="section-to-print">
            <thead>
            <tr>
                <th>Modelin adı</th>
                <th>Sayı</th>
                <th>Qiymət</th>
                <th>Endirim Faizi</th>
                <th>Son qiymət</th>
            </tr>
            </thead>
            <tbody>
            {orderInfo && orderInfo.goods?.map(item => (
                    <tr key={item.id}>
                        <td><b>{item.product_name}</b></td>
                        <td>{item.product_quantity}</td>
                        <td>{item.product_price} AZN</td>
                        <td>{item.product_discount.toFixed(2)} %</td>
                        <td>{(item.product_price*item.product_quantity - item.product_quantity* item.product_price * item.product_discount/100).toFixed(2)} AZN</td>
                    </tr>
            ))}
            <tr>
                <th colSpan="3"><div className="text-end">Sifarişçinin adı:</div></th>
                <th colSpan="2">{orderInfo && orderInfo.client_name}</th>
            </tr>
            <tr>
                <th colSpan="3"><div className="text-end">Telefon:</div></th>
                <th colSpan="2">{orderInfo && orderInfo.client_mobil_phone}</th>
            </tr>
            <tr>
                <th colSpan="3"><div className="text-end">Ünvan</div></th>
                <th colSpan="3">{orderInfo && orderInfo.client_delivery_address}</th>
            </tr>
            <tr>
                <th colSpan="3"><div className="text-end">Sifarişin kodu</div></th>
                {orderInfo?.orderStateList?.map( (info, i) =><th colSpan="2" key={i}>{info.erpResponseMessage.split(' ')[2]}</th>)}
            </tr>
            <tr>
                <th colSpan="3"><div className="text-end">Endirimsiz məbləğ</div></th>
                <th colSpan="2">{totalPrice} AZN</th>
            </tr>
            <tr>
                <th colSpan="4"><div className="text-end">Ödəniləcək məbləğ</div></th>
                <th>{discountTotalPrice} AZN</th>
            </tr>
            <tr>
            </tr>
            <tr>
                <td colSpan="5" className="text-end"><button onClick={()=>window.print()} className="btn btn-success">Çap et</button></td>
            </tr>
            </tbody>
        </table>
    )
}

export default OrderPrint;