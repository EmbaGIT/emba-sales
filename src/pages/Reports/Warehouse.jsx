import React, { useEffect, useState, useContext } from "react";
import { get, remove } from "../../api/Api";
import jwt from 'jwt-decode';
import Loader from 'react-loader-spinner';
import ReactPaginate from "react-paginate";
import Select from "react-select";
import { Link, useHistory, useParams } from "react-router-dom";

const Warehouse = () => {
    const history = useHistory();
    const params = useParams();
    const [warehouseInfo, setWarehouseInfo] = useState({});
    const [isFetching, setIsFetching] = useState(false);
    const [page, setPage] = useState(Number(params.page));
    const [pageSize, setPageSize] = useState({value: Number(params.pageSize), label: Number(params.pageSize)});
    const sizeOptions = [
        { value: 10, label: 10 },
        { value: 20, label: 20 },
        { value: 50, label: 50 },
        { value: 100, label: 100 }
    ];

    const getUser = () => {
        const token = localStorage.getItem("jwt_token");
        return token && jwt(token);  // decodes user from jwt and returns it
    }

    useEffect(() => {
        const user = getUser();
        setIsFetching(true);
        get(`http://bpaws01l:8091/api/warehouse/${user?.uid}?page=${params.page}&size=${params.pageSize}`).then((res) => {
            setWarehouseInfo(res);
            setIsFetching(false);
        }).catch((err) => {
            console.log("err", err);
        });
    }, [page, pageSize]);

    const paginate = (n) => {
        setPage(+n.selected);
        history.push(`/reports/warehouse/${n.selected}/${pageSize.value}`);
    }

    const onPageSizeChange = (n) => {
        setPageSize({ value: n.value, label: n.value });
        history.push(`/reports/warehouse/${page}/${n.value}`);
    }

    const updateWarehouseInfo = () => {
        const user = getUser();
        setIsFetching(true);
        remove(`http://bpaws01l:8091/api/warehouse/${user?.uid}`).then((res) => {
            get(`http://bpaws01l:8091/api/warehouse/${user?.uid}?page=0&size=10`).then((res) => {
                setWarehouseInfo(res);
                setIsFetching(false);
            }).catch((err) => {
                console.log("error in getting goods: ", err);
            });
        }).catch(error => console.log("error in cleaning cache: ", error));
    }

    return (
        <div className='container-fluid row'>
            <div className="col-lg-3 col-md-4 mb-3">
                <Link to='/reports/fabric/0/10'>
                    <div className='category-box'>
                        <div className="category-hover-box">
                            <span className='category-name'>Parça qalığı</span>
                        </div>
                    </div>
                </Link>
            </div>
            <div className="col-lg-3 col-md-4 mb-3">
                <Link to='/reports/chair/0/10'>
                    <div className='category-box'>
                        <div className="category-hover-box">
                            <span className='category-name'>Stul qalığı</span>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="mt-3 position-relative">
                {isFetching &&
                    <div className="col-12 d-flex align-items-center justify-content-center w-100 h-100 position-absolute" style={{ backdropFilter: "blur(2px)", zIndex: "100" }}>
                        <Loader
                            type="ThreeDots"
                            color="#00BFFF"
                            height={60}
                            width={60}/>
                    </div>
                }
                {warehouseInfo.goods?.length &&
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fm-poppins flex-1 mb-0">{warehouseInfo.warehouse} mövcud məhsullar</h4>
                            <div className='me-3'>
                                <button onClick={updateWarehouseInfo} style={{ backgroundColor: "transparent", border: ".5px solid rgba(0, 0, 0, .5)", padding: ".3rem .75rem", borderRadius: "5px" }}>
                                    <span className='me-2'>Yenilə</span>
                                    <span><i className="fas fa-sync-alt"></i></span>
                                </button>
                            </div>
                            <div style={{ width: "20%" }}>
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
                                    <th scope='col'>Məhsul adı</th>
                                    <th scope='col'>Məhsulun xatakteristikası</th>
                                    <th scope='col'>Məhsulun sayı</th>
                                </tr>
                                </thead>
                                <tbody>
                                {warehouseInfo.goods?.map((good, i) => (
                                    <tr key={i}>
                                        <td>{+i + (Number(page) * Number(pageSize.value)) + 1}</td>
                                        <td><span className="cursor-pointer text-primary font-weight-bolder">{good.productName}</span></td>
                                        <td>{good.characteristicName}</td>
                                        <td>{good.quantity}</td>
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
                                pageCount={warehouseInfo?.totalPages + 1 || 0}
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
                {warehouseInfo.goods?.length === 0 && <p className="text-center">Heç bir məlumat tapılmadı.</p>}
            </div>
        </div>
    )
};

export default Warehouse;