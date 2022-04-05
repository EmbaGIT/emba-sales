import React, {useEffect, useState} from "react";
import {get} from "../../../api/Api";
import { getHost } from "../../helpers/host";

const Tables = () => {
    const [tables, setTables] = useState([]);

    useEffect(() => {
        get(`${getHost('pricing/panel', 8092)}/api/coffee-table`).then(tables => setTables(tables))
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
                                tables?.map(table => (
                                    <tr key={table.id}>
                                        <td style={{width: "60%"}}>{table.name}</td>
                                        <td style={{width: "20%"}}>{table.purchasingPrice}</td>
                                        <td style={{width: "20%"}}>{table.sellingPrice}</td>
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