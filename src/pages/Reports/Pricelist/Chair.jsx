import React, {useEffect, useState} from "react";
import {get} from "../../../api/Api";
import { getHost } from "../../helpers/host";

const Chair = () => {
    const [chairs, setChairs] = useState([]);

    useEffect(() => {
        get(`${getHost('pricing/panel', 8092)}/api/chair-type`).then(chairs => setChairs(chairs))
    }, [])

    const getListItems = selectedList => {
        get(`http://bpaws01l:8092/api/chair-type/${selectedList.id}/chairs`).then(c => {
            setChairs([
                ...chairs.map(chair => {
                    if (selectedList.id === chair.id) {
                        if (chair.chairs) {
                            return {...chair, chairs: null};
                        } else {
                            return {...chair, chairs: c.chairs};
                        }
                    } else {
                        return chair;
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
                                <th style={{width: "60%"}}>Stullar</th>
                                <th style={{width: "20%"}}>Mağaza Alış</th>
                                <th style={{width: "20%"}}>Mağaza Satış</th>
                            </tr>
                            </thead>

                            <tbody>
                            {
                                chairs?.map(chair => (
                                    <React.Fragment key={chair.id}>
                                        <tr style={{backgroundColor: "darkblue", color: "#fff"}}
                                            onClick={() => getListItems(chair)}>
                                            <td colSpan={3}>
                                                <h6 style={{fontWeight: 600}} className='mb-0'>{chair.name}</h6>
                                            </td>
                                        </tr>
                                        {
                                            chair.chairs ? <tr>
                                                <td colSpan={3} className='p-0'>
                                                    <div className="table-responsive">
                                                        <table className="table table-hover bordered striped mb-0">
                                                            <tbody>
                                                            {
                                                                chair.chairs?.map(list => (
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

export default Chair;