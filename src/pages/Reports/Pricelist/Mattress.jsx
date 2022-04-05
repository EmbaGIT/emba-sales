import React, {useEffect, useState} from "react";
import {get} from "../../../api/Api";
import { getHost } from "./../../../helpers/host";

const Mattress = () => {
    const [mattresses, setMattresses] = useState([]);

    useEffect(() => {
        get(`${getHost('pricing/panel', 8092)}/api/mattress-type`).then(mattresses => setMattresses(mattresses))
    }, [])

    const getListItems = selectedList => {
        get(`http://bpaws01l:8092/api/mattress-type/${selectedList.id}/mattresses`).then(m => {
            setMattresses([
                ...mattresses.map(mattress => {
                    if (selectedList.id === mattress.id) {
                        if (mattress.mattresses) {
                            return {...mattress, mattresses: null};
                        } else {
                            return {...mattress, mattresses: m.mattresses};
                        }
                    } else {
                        return mattress;
                    }
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
                                <th style={{width: "60%"}}>Matrasslar</th>
                                <th style={{width: "20%"}}>Mağaza Alış</th>
                                <th style={{width: "20%"}}>Mağaza Satış</th>
                            </tr>
                            </thead>

                            <tbody>
                            {
                                mattresses?.map(mattress => (
                                    <React.Fragment key={mattress.id}>
                                        <tr style={{backgroundColor: "darkblue", color: "#fff"}}
                                            onClick={() => getListItems(mattress)}>
                                            <td colSpan={3}>
                                                <h6 style={{fontWeight: 600}} className='mb-0'>{mattress.name}</h6>
                                            </td>
                                        </tr>
                                        {
                                            mattress.mattresses ? <tr>
                                                <td colSpan={3} className='p-0'>
                                                    <div className="table-responsive">
                                                        <table className="table table-hover bordered striped mb-0">
                                                            <tbody>
                                                            {
                                                                mattress.mattresses?.map(list => (
                                                                    <React.Fragment key={list.id}>
                                                                        <tr>
                                                                            <td style={{width: "60%"}}>{list.name}</td>
                                                                            <td style={{width: "20%"}}>{list.purchasingPrice}</td>
                                                                            <td style={{width: "20%"}}>{list.sellingPrice}</td>
                                                                        </tr>
                                                                    </React.Fragment>
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

export default Mattress;