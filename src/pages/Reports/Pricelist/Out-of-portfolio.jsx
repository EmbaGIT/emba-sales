import React, {useEffect, useState} from "react";
import {get} from "../../../api/Api";

const OutOfPortfolio = () => {
    const [types, setTypes] = useState([]);

    useEffect(() => {
        get("http://bpaws01l:8092/api/portfolio-types").then(types => setTypes(types))
    }, [])

    const getListItems = selectedList => {
        get(`http://bpaws01l:8092/api/portfolio-types/${selectedList.id}/portfolios`).then(p => {
            setTypes([
                ...types.map(type => {
                    if (selectedList.id === type.id) {
                        if (type.portfolioList) {
                            return { ...type, portfolioList: null };
                        } else {
                            return { ...type, portfolioList: p.portfolioList };
                        }
                    }
                    return type;
                })
            ])
        })
    }

    return (
        <div>
            <div className='mt-3 row'>
                <div className="col-12">
                    <div className="table-responsive">
                        <table className="table table-hover bordered striped">
                            <thead>
                            <tr style={{backgroundColor: "blue", color: "#fff"}}>
                                <th style={{width: "40%"}}>Modul</th>
                                <th style={{ width: "30%" }}>Xarakteristika</th>
                                <th style={{width: "15%"}}>Mağaza Alış</th>
                                <th style={{width: "15%"}}>Mağaza Satış</th>
                            </tr>
                            </thead>

                            <tbody>
                            {
                                types?.map(type => (
                                    <React.Fragment key={type.id}>
                                        <tr style={{backgroundColor: "darkblue", color: "#fff"}}
                                            onClick={() => getListItems(type)}
                                            >
                                            <td style={{ width: "40%" }}>
                                                <h6 style={{fontWeight: 600}} className='mb-0'>{type.name}</h6>
                                            </td>
                                            <td style={{ width: "30%" }}>{type.characteristic}</td>
                                            <td style={{ width: "15%" }}>{type.purchasingPrice}</td>
                                            <td style={{ width: "15%" }}>{type.sellingPrice}</td>
                                        </tr>
                                        {
                                            type.portfolioList ? <tr>
                                                <td colSpan={4} className='p-0'>
                                                    <div className="table-responsive">
                                                        <table className="table table-hover bordered striped mb-0">
                                                            <tbody>
                                                            {
                                                                type.portfolioList?.map(list => (
                                                                    <tr key={list.id}>
                                                                        <td style={{width: "40%"}}>{list.name}</td>
                                                                        <td style={{width: "30%"}}>{list.status}</td>
                                                                        <td style={{width: "15%"}}>{list.purchasingPrice}</td>
                                                                        <td style={{width: "15%"}}>{list.sellingPrice}</td>
                                                                    </tr>
                                                                ))
                                                            }
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr> : null
                                        }
                                    </React.Fragment>
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

export default OutOfPortfolio;