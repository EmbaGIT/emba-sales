import React, {useEffect, useState} from "react";
import {get} from "../../../api/Api";
import { getHost } from "./../../../helpers/host";
import latinize from "latinize";

const Portfolio = () => {
    const [collections, setCollections] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        get(`${getHost('pricing/panel', 8092)}/api/types`).then(types => {
            Promise.all(types.map(t => {
                return get(`${getHost('pricing/panel', 8092)}/api/types/${t.id}/collections/`);
            })).then(collections => setCollections(collections));
        })
    }, [])

    useEffect(() => {
        get(`${getHost('pricing/panel', 8092)}/api/collections/search?name.contains=${latinize(search).toLowerCase()}&size=1000`).then(res => {
            setCollections(prev => prev.map(collection => ({
                ...collection, collectionList: []
            })))

            const result = res.content
                .map(item => item.type)
                .reduce((acc, item) => {
                    if (item && acc.find(elm => elm?.id === item?.id) === undefined) {
                        acc.push(item)
                    }
                    return acc
                }, [])

            res.content.forEach(content => {
                const resultTarget = result.find(elm => elm.id === content?.type?.id);
                if (resultTarget) {
                    if (!resultTarget.collectionList) {
                        resultTarget.collectionList = []
                    }
                    resultTarget.collectionList.push(content)
                }
            })

            setCollections(result)
        })
    }, [search])

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
                        return { ...list, items: null };
                    })
                }))
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
                        <table className="table bordered">
                            <thead>
                                <tr className='t-header'>
                                    <th style={{ width: "40%" }}>Model</th>
                                    <th style={{ width: "15%" }}>Xarakteristika</th>
                                    <th style={{ width: "15%" }}>Mağaza Alış</th>
                                    <th style={{ width: "15%" }}>Mağaza Satış</th>
                                    <th style={{ width: "15%" }}>Endirimli Qiymət</th>
                                </tr>
                            </thead>

                            <tbody>
                            {
                                collections?.sort((c1, c2) => c1.id - c2.id).map(collection => (
                                    <React.Fragment key={collection.id}>
                                        <tr className='text-center'>
                                            <td colSpan={5}>
                                                <h6 style={{ fontWeight: 700, color: "#398420" }} className='mb-0'>{collection.name || 'no name'}</h6>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={5} className='p-0'>
                                                <div className="table-responsive">
                                                    <table className="table bordered table-striped mb-0">
                                                        <tbody>
                                                        {
                                                            collection.collectionList?.sort((i1, i2) => i1.id - i2.id).map(list => (
                                                                <React.Fragment key={list.id}>
                                                                    <tr onClick={() => getListItems(list)} className={`set ${list.items ? 'parent' : ''}`}>
                                                                        <td colSpan={5} className='p-0'>
                                                                            <div className='d-flex' style={{ padding: "0" }}>
                                                                                <div style={{ width: "40%", padding: ".5rem .7rem" }}>{list.name}</div>
                                                                                <div style={{ width: "15%", padding: ".5rem .7rem" }}></div>
                                                                                <div style={{ width: "15%", padding: ".5rem .7rem" }}>{list.purchasingPrice}</div>
                                                                                <div style={{ width: "15%", padding: ".5rem .7rem" }}>{list.sellingPrice}</div>
                                                                                <div style={{ width: "15%", padding: ".5rem .7rem" }}>{list.discountPrice}</div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    {
                                                                        list.items ? <tr className={`products ${list.items.length ? 'opened': ''}`}>
                                                                            <td colSpan={5} className='p-0'>
                                                                                <div className="table-responsive">
                                                                                    <table className="table bordered mb-0">
                                                                                        <tbody>
                                                                                        {
                                                                                            list.items?.sort((l1, l2) => l1.id - l2.id).map(item => (
                                                                                                <tr key={item.id}>
                                                                                                    <td style={{ width: "40%" }}>{item.name}</td>
                                                                                                    <td style={{ width: "15%" }}>
                                                                                                        {item.status
                                                                                                            ? <span
                                                                                                                style={{color: "#398420", fontWeight: 600 }}>Dəstə Daxildir</span>
                                                                                                            : <span
                                                                                                                style={{color: "red", fontWeight: 600 }}>Dəstə Daxil Deyil</span>
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td style={{ width: "15%" }}>{item.purchasingPrice}</td>
                                                                                                    <td style={{ width: "15%" }}>{item.sellingPrice}</td>
                                                                                                    <td style={{ width: "15%" }}>{item.discountPrice}</td>
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