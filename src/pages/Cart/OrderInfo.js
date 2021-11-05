import {useRef} from "react";

const OrderInfo = () => {
    const table_data=useRef();

    return (
        <table className="table table-striped table-hover table-bordered" ref={table_data}>
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
            <tr>
                <td><b>Alfa - Yataq - Birləşdirici (güzgü) - Metallic inci - 1200 x 10 x 30</b></td>
                <td>1</td>
                <td>22 AZN</td>
                <td>7.0000 AZN</td>
                <td>7.0000 AZN</td>
            </tr>
            <tr>
                <td><b>Atlas - Yataq - Tumba - Oak sonomo light / White gloss - 454 x 486 x 470</b></td>
                <td>1</td>
                <td>77 AZN</td>
                <td>50.0000 AZN</td>
                <td>50.0000 AZN</td>
            </tr>
            <tr>
                <th colSpan="4"><div className="text-end">Sifarişçinin adı:</div></th>
                <th>Test Test Test</th>
            </tr>
            <tr>
                <th colSpan="4"><div className="text-end">Telefon:</div></th>
                <th>00000000</th>
            </tr>
            <tr>
                <th colSpan="4"><div className="text-end">Ünvan</div></th>
                <th>test</th>
            </tr>
            <tr>
                <th colSpan="4"><div className="text-end">Mağaza:</div></th>
                <th>Embawood İnşaatçılar mağazası</th>
            </tr>
            <tr>
                <th colSpan="4"><div className="text-end">Sifarişin kodu</div></th>
                <th>P-#14533</th>
            </tr>
            <tr>
                <th colSpan="4"><div className="text-end">Endirimsiz məbləğ</div></th>
                <th>57.0000 AZN</th>
            </tr>
            <tr>
                <th colSpan="4"><div className="text-end">Endirim faizi <span
                    className="discount_percent">12.28</span>%</div></th>
                <th><span className="discount_price">7.00</span></th>
            </tr>
            <tr>
                <th colSpan="4"><div className="text-end">Ödəniləcək məbləğ</div></th>
                <th>50.0000 AZN</th>
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

export default OrderInfo;