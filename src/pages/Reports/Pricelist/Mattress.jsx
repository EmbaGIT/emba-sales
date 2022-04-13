import React, {useEffect, useState} from "react";
import {get} from "../../../api/Api";
import { getHost } from "./../../../helpers/host";
import latinize from "latinize";

const Mattress = () => {
    const [mattresses, setMattresses] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        get(`${getHost('pricing/panel', 8092)}/api/mattress-type`).then(mattresses => setMattresses(mattresses))
    }, [])

    useEffect(() => {
        get(`${getHost('pricing/panel', 8092)}/api/mattress-type/search?name.contains=${latinize(search).toLowerCase()}&size=1000`).then(mattresses => {
            setMattresses(mattresses.content);
        })
    }, [search])

    const getListItems = selectedList => {
        get(`${getHost('pricing/panel', 8092)}/api/mattress-type/${selectedList.id}/mattresses`).then(m => {
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
                <div className='col-lg-12 col-md-12 mb-3'>
                    <input className='form-control' type="text" placeholder='Axtarış' value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="col-12">
                    <div className="table-responsive">
                        <table className="table table-hover bordered striped">
                            <thead>
                            <tr style={{backgroundColor: "blue", color: "#fff"}}>
                                <th style={{width: "55%"}}>Matrasslar</th>
                                <th style={{width: "15%"}}>Mağaza Alış</th>
                                <th style={{width: "15%"}}>Mağaza Satış</th>
                                <th style={{width: "15%"}}>Endirimli Qiymət</th>
                            </tr>
                            </thead>

                            <tbody>
                            {
                                mattresses?.map(mattress => (
                                    <React.Fragment key={mattress.id}>
                                        <tr style={{backgroundColor: "darkblue", color: "#fff"}}
                                            onClick={() => getListItems(mattress)}>
                                            <td colSpan={4}>
                                                <h6 style={{fontWeight: 600}} className='mb-0'>{mattress.name}</h6>
                                            </td>
                                        </tr>
                                        {
                                            mattress.mattresses ? <tr>
                                                <td colSpan={4} className='p-0'>
                                                    <div className="table-responsive">
                                                        <table className="table table-hover bordered striped mb-0">
                                                            <tbody>
                                                            {
                                                                mattress.mattresses?.map(list => (
                                                                    <React.Fragment key={list.id}>
                                                                        <tr>
                                                                            <td style={{width: "55%"}}>{list.name}</td>
                                                                            <td style={{width: "15%"}}>{list.purchasingPrice}</td>
                                                                            <td style={{width: "15%"}}>{list.sellingPrice}</td>
                                                                            <td style={{width: "15%"}}>{list.discountPrice}</td>
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