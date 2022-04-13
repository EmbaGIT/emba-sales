import React, {useEffect, useState} from "react";
import {get} from "../../../api/Api";
import { getHost } from "./../../../helpers/host";
import latinize from "latinize";

const Tables = () => {
    const [tables, setTables] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        get(`${getHost('pricing/panel', 8092)}/api/coffee-table`).then(tables => setTables(tables))
    }, [])

    useEffect(() => {
        get(`${getHost('pricing/panel', 8092)}/api/coffee-table/search?name.contains=${latinize(search).toLowerCase()}&size=1000`).then(tables => {
            setTables(tables.content);
        })
    }, [search])

    return (
        <div>
            <div className='mt-3 row'>
                <div className='col-lg-12 col-md-12 mb-3'>
                    <input className='form-control' type="text" placeholder='Axtarış' value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="col-12">
                    <div className="table-responsive">
                        <table className="table table-hover bordered striped">
                            <thead>
                            <tr style={{backgroundColor: "blue", color: "#fff"}}>
                                <th style={{width: "55%"}}>Номенклатура</th>
                                <th style={{width: "15%"}}>Mağaza Alış</th>
                                <th style={{width: "15%"}}>Mağaza Satış</th>
                                <th style={{width: "15%"}}>Endirimli Qiymət</th>
                            </tr>
                            </thead>

                            <tbody>
                            {
                                tables?.map(table => (
                                    <tr key={table.id}>
                                        <td style={{width: "55%"}}>{table.name}</td>
                                        <td style={{width: "15%"}}>{table.purchasingPrice}</td>
                                        <td style={{width: "15%"}}>{table.sellingPrice}</td>
                                        <td style={{width: "15%"}}>{table.discountPrice}</td>
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

export default Tables;