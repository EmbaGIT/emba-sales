import { React, useEffect, useState } from "react";
import { get } from "../../api/Api";
import jwt from "jwt-decode";
import Select from "react-select";
import ReactPaginate from "react-paginate";
import { useParams, useHistory, Link } from "react-router-dom";
import Loader from "react-loader-spinner";

const Chair = () => {
    const params = useParams();
    const history = useHistory();
    const [isFetching, setIsFetching] = useState(false);
    const [fabric, setFabric] = useState({});
    const [page, setPage] = useState(Number(params.page));
    const [pageSize, setPageSize] = useState({value: Number(params.pageSize), label: Number(params.pageSize)});
    const sizeOptions = [
        {value: 10, label: 10},
        {value: 20, label: 20},
        {value: 50, label: 50},
        {value: 100, label: 100}
    ];
    const [search, setSearch] = useState('');

    const getUser = () => {
        const token = localStorage.getItem("jwt_token");
        return jwt(token);  // decodes user from jwt and returns it
    }

    const paginate = (n) => {
        setPage(+n.selected);
        history.push(`/reports/chair/${n.selected}/10`);
    }

    const onPageSizeChange = (n) => {
        setPageSize({value: n.value, label: n.value});
        history.push(`/reports/chair/${page}/${n.value}`);
    }

    useEffect(() => {
        const user = getUser();
        setIsFetching(true);
        get(`http://bpaws01l:8091/api/chair?page=${page}&size=${pageSize.value}&filter=${search}`).then((res) => {
            setFabric(res)
            setIsFetching(false);
        }).catch((err) => {
            console.log("err", err);
        });
    }, [page, pageSize, search]);

    return (
        <div className='container-fluid row'>
            <div className="col-lg-3 col-md-6 mb-3">
                <Link to='/reports/warehouse/0/10'>
                    <div className='category-box'>
                        <div className="category-hover-box">
                            <span className='category-name'>Anbar qalığı</span>
                        </div>
                    </div>
                </Link>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
                <Link to='/reports/fabric/0/10'>
                    <div className='category-box'>
                        <div className="category-hover-box">
                            <span className='category-name'>Parça qalığı</span>
                        </div>
                    </div>
                </Link>
            </div>
            <div className='col-lg-6 col-md-12 mb-3 report-search'>
                <input className='form-control h-100 w-100' type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Axtarış' />
            </div>

            <div className='mt-3 position-relative'>
                {isFetching &&
                    <div
                        className="col-12 d-flex align-items-center justify-content-center w-100 h-100 position-absolute"
                        style={{backdropFilter: "blur(2px)", zIndex: "100"}}>
                        <Loader
                            type="ThreeDots"
                            color="#00BFFF"
                            height={60}
                            width={60}/>
                    </div>
                }
                {fabric.items?.length &&
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fm-poppins flex-1 mb-0">Stul qalığı</h4>
                            <div style={{width: "20%"}}>
                                <Select
                                    className="basic-single"
                                    classNamePrefix="select"
                                    defaultValue={pageSize}
                                    name="pageSize"
                                    options={sizeOptions}
                                    placeholder="Məhsul sayı"
                                    onChange={value => onPageSizeChange(value)}
                                />
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table bordered striped">
                                <thead>
                                <tr>
                                    <th scope='col'>#</th>
                                    <th scope='col'>Stullar</th>
                                    <th scope='col'>Sumqayıt stul material anbarı</th>
                                </tr>
                                </thead>
                                <tbody>
                                {fabric.items?.map((good, i) => (
                                    <tr key={i}>
                                        <td>{+i + (Number(page) * Number(pageSize.value)) + 1}</td>
                                        <td><span
                                            className="cursor-pointer text-primary font-weight-bolder">{good?.chairs}</span>
                                        </td>
                                        <td>{good?.chairMaterialStock}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className=" d-flex justify-content-end">
                            <ReactPaginate
                                previousLabel={'Əvvəlki'}
                                nextLabel={'Növbəti'}
                                previousClassName={'page-item'}
                                nextClassName={'page-item'}
                                previousLinkClassName={'page-link'}
                                nextLinkClassName={'page-link'}
                                breakLabel={'...'}
                                breakClassName={'break-me'}
                                pageCount={fabric?.totalPages + 1 || 0}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={3}
                                onPageChange={paginate}
                                containerClassName={'pagination'}
                                activeClassName={'active'}
                                pageClassName={'page-item'}
                                pageLinkClassName={'page-link'}
                                forcePage={page}
                            />
                        </div>
                    </div>
                }
                {fabric.items?.length === 0 && <p className="text-center">Heç bir məlumat tapılmadı.</p>}
            </div>
        </div>
    )
}

export default Chair;