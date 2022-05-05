import React, {useEffect, useState} from "react";
import {get} from "../../../api/Api";
import { getHost } from "./../../../helpers/host";
import latinize from "latinize";

const Chair = () => {
    const [chairs, setChairs] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        get(`${getHost('pricing/panel', 8092)}/api/chair-type`).then(chairs => setChairs(chairs))
    }, [])

    useEffect(() => {
        get(`${getHost('pricing/panel', 8092)}/api/chair-type/search?name.contains=${latinize(search).toLowerCase()}&size=1000`).then(chairs => {
            setChairs(chairs.content.map(chair => ({
                id: chair.id,
                name: chair.name
            })))
        })
    }, [search])

    const getListItems = selectedList => {
        get(`${getHost('pricing/panel', 8092)}/api/chair-type/${selectedList.id}/chairs`).then(c => {
            setChairs([
                ...chairs.map(chair => {
                    if (selectedList.id === chair.id) {
                        if (chair.chairs) {
                            return {...chair, chairs: null};
                        } else {
                            return {...chair, chairs: c.chairs};
                        }
                    } else {
                        return { ...chair, chairs: null };
                    }
                })
            ])
        })
    }

    return (
        <div className='price-list'>
            <div className='mt-3 row'>
                <div className='col-lg-12 col-md-12 mb-3'>
                    <input className='form-control' type="text" placeholder='Axtarış' value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="col-12">
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                            <tr className='t-header'>
                                <th style={{width: "55%"}}>Stullar</th>
                                <th style={{width: "15%"}}>Mağaza Alış</th>
                                <th style={{width: "15%"}}>Mağaza Satış</th>
                                <th style={{width: "15%"}}>Endirimli Qiymət</th>
                            </tr>
                            </thead>

                            <tbody>
                            {
                                chairs?.sort((c1, c2) => c1.id - c2.id).map(chair => (
                                    <React.Fragment key={chair.id}>
                                        <tr className={`set ${chair.chairs ? 'parent' : ''}`}
                                            onClick={() => getListItems(chair)}>
                                            <td colSpan={4} className='p-0'>
                                                <div>
                                                    <h6 style={{fontWeight: 600}} className='mb-0'>{chair.name}</h6>
                                                </div>
                                            </td>
                                        </tr>
                                        {
                                            chair.chairs ? <tr className={`products ${chair.chairs.length ? 'opened': ''}`}>
                                                <td colSpan={4} className='p-0'>
                                                    <div className="table-responsive py-3 px-4">
                                                        <table className="table bordered mb-0">
                                                            <tbody>
                                                            {
                                                                chair.chairs?.sort((i1, i2) => i1.id - i2.id).map(list => (
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

export default Chair;