import React, {useEffect, useState} from "react";
import {get} from "../../../api/Api";

const Outsource = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        get("http://bpaws01l:8092/api/outsource").then(products => setProducts(products))
    }, [])

    return (
        <div>
            <div className='mt-3 row'>
                <div className="col-12">
                    <div className="table-responsive">
                        <table className="table table-hover bordered striped">
                            <thead>
                            <tr style={{backgroundColor: "blue", color: "#fff"}}>
                                <th style={{width: "60%"}}>Номенклатура</th>
                                <th style={{width: "20%"}}>Mağaza Alış</th>
                                <th style={{width: "20%"}}>Mağaza Satış</th>
                            </tr>
                            </thead>

                            <tbody>
                            {
                                products?.map(product => (
                                    <tr key={product.id}>
                                        <td style={{width: "60%"}}>{product.name}</td>
                                        <td style={{width: "20%"}}>{product.purchasingPrice}</td>
                                        <td style={{width: "20%"}}>{product.sellingPrice}</td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Outsource;