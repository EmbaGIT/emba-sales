import React, {useEffect, useState} from "react";
import {get} from "../../../api/Api";
import { getHost } from "./../../../helpers/host";
import latinize from "latinize";

const Outsource = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        get(`${getHost('pricing/panel', 8092)}/api/outsource`).then(products => setProducts(products))
    }, [])

    useEffect(() => {
        get(`${getHost('pricing/panel', 8092)}/api/outsource/search?name.contains=${latinize(search).toLowerCase()}&size=1000`).then(products => {
            setProducts(products.content)
        })
    }, [search])

    return (
        <div className='price-list'>
            <div className='mt-3 row'>
                <div className='col-lg-12 col-md-12 mb-3'>
                    <input className='form-control' type="text" placeholder='Axtarış' value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="col-12">
                    <div className="table-responsive">
                        <table className="table table-hover bordered striped">
                            <thead>
                            <tr className='t-header'>
                                <th style={{width: "55%"}}>Номенклатура</th>
                                <th style={{width: "15%"}}>Mağaza Alış</th>
                                <th style={{width: "15%"}}>Mağaza Satış</th>
                                <th style={{width: "15%"}}>Endirimli Qiymət</th>
                            </tr>
                            </thead>

                            <tbody>
                            {
                                products?.map(product => (
                                    <tr key={product.id}>
                                        <td style={{width: "55%"}}>{product.name}</td>
                                        <td style={{width: "15%"}}>{product.purchasingPrice}</td>
                                        <td style={{width: "15%"}}>{product.sellingPrice}</td>
                                        <td style={{width: "15%"}}>{product.discountPrice}</td>
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