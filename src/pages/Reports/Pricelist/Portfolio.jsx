import React, {useEffect, useState} from "react";
import {get} from "../../../api/Api";
import { getHost } from "../../helpers/host";

const Portfolio = () => {
    const [collections, setCollections] = useState([]);

    useEffect(() => {
        get(`${getHost('pricing/panel', 8092)}/api/types`).then(types => {
            Promise.all(types.map(t => {
                return get(`${getHost('pricing/panel', 8092)}/api/types/${t.id}/collections/`);
            })).then(collections => setCollections(collections));
        })
    }, [])

    const getListItems = selectedList => {
        get(`${getHost('pricing/panel', 8092)}/api/collections/${selectedList.id}/items`).then(items => {
            setCollections([
                ...collections.map(collection => ({
                    ...collection,
                    collectionList: collection.collectionList.map(list => {
                        if (selectedList.id === list.id) {
                            if (selectedList.items) {
                                return { ...list, items: null };
                            } else {
                                return { ...list, items: items.items };
                            }
                        }
                        return list;
                    })
                }))
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
                                <tr style={{ backgroundColor: "blue", color: "#fff" }}>
                                    <th style={{ width: "50%" }}>Model</th>
                                    <th style={{ width: "20%" }}>Xarakteristika</th>
                                    <th style={{ width: "15%" }}>Mağaza Alış</th>
                                    <th style={{ width: "15%" }}>Mağaza Satış</th>
                                </tr>
                            </thead>

                            <tbody>
                            {
                                collections?.map(collection => (
                                    <React.Fragment key={collection.id}>
                                        <tr className='text-center' style={{ backgroundColor: "blue", color: "#fff" }}>
                                            <td colSpan={4}>
                                                <h6 style={{ fontWeight: 600 }} className='mb-0'>{collection.name}</h6>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={4} className='p-0'>
                                                <div className="table-responsive">
                                                    <table className="table table-hover bordered striped mb-0">
                                                        <tbody>
                                                        {
                                                            collection.collectionList?.map(list => (
                                                                <React.Fragment key={list.id}>
                                                                    <tr onClick={() => getListItems(list)} style={{ backgroundColor: "darkblue", color: "#fff" }}>
                                                                        <td style={{ width: "50%" }}>{list.name}</td>
                                                                        <td style={{ width: "20%" }}></td>
                                                                        <td style={{ width: "15%" }}>{list.purchasingPrice}</td>
                                                                        <td style={{ width: "15%" }}>{list.sellingPrice}</td>
                                                                    </tr>
                                                                    {
                                                                        list.items ? <tr>
                                                                            <td colSpan={4} className='p-0'>
                                                                                <div className="table-responsive">
                                                                                    <table className="table table-hover bordered striped mb-0">
                                                                                        <tbody>
                                                                                        {
                                                                                            list.items?.map(item => (
                                                                                                <tr key={item.id}>
                                                                                                    <td style={{ width: "50%" }}>{item.name}</td>
                                                                                                    <td style={{ width: "20%" }}>{item.status}</td>
                                                                                                    <td style={{ width: "15%" }}>{item.purchasingPrice}</td>
                                                                                                    <td style={{ width: "15%" }}>{item.sellingPrice}</td>
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
                                            </td>
                                        </tr>
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

export default Portfolio;