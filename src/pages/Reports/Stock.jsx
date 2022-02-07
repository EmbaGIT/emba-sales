import { React, useEffect, useState } from "react";
import { get } from "../../api/Api";
import Select from "react-select";
import { useParams, useHistory, Link } from "react-router-dom";
import Loader from "react-loader-spinner";
import ReactPaginate from "react-paginate";

const buttons = [
    { title: 'Parça qalığı', key: 'fabric' },
    { title: 'Stul qalığı', key: 'chair' },
]

const tableHeaders = {
    fabric: ["Məhsul adı", "Masallı divan-kreslo material anbarı", "Masallı yumşaq mebel yarımfabrikat anbarı", "Sumqayıt stul material anbarı"],
    chair: ["Stullar", "Sumqayıt stul material anbarı"]
}

const Stock = ({ stock }) => {
    const params = useParams();
    const history = useHistory();
    const [search, setSearch] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const sizeOptions = [
        {value: 10, label: 10},
        {value: 20, label: 20},
        {value: 50, label: 50},
        {value: 100, label: 100}
    ];
    const [stockGoods, setStockGoods] = useState({});
    const [currentStock, setCurrentStock] = useState(stock.key);

    const [page, setPage] = useState(Number(params.page));
    const [pageSize, setPageSize] = useState({value: Number(params.pageSize), label: Number(params.pageSize)});

    const paginate = (n) => {
        setPage(+n.selected);
        history.push(`/reports/${stock.key}/${n.selected}/10`);
    }

    const onPageSizeChange = (n) => {
        setPageSize({value: n.value, label: n.value});
        history.push(`/reports/${stock.key}/${page}/${n.value}`);
    }

    useEffect(() => {
        setCurrentStock(stock.key);
    })

    useEffect(() => {
        setIsFetching(true);

        const { key } = stock;
        setPage(Number(params.page));

        get(`http://bpaws01l:8091/api/${key}?page=0&size=${pageSize.value}&filter=${search}`).then((res) => {
            setStockGoods(res);
            setIsFetching(false);
        }).catch((err) => {
            console.log("err", err);
        });
    }, [currentStock])

    useEffect(() => {
        setIsFetching(true);
        const { key } = stock;

        get(`http://bpaws01l:8091/api/${key}?page=${page}&size=${pageSize.value}&filter=${search}`).then((res) => {
            setStockGoods(res);
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
            {
                buttons?.map(({ title, key}) => (
                    <div className={`col-lg-3 col-md-6 mb-3 ${key === stock.key ? 'd-none' : ''}`} key={key}>
                        <Link to={`/reports/${key}/0/10`}>
                            <div className='category-box'>
                                <div className="category-hover-box">
                                    <span className='category-name'>{title}</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))
            }
            <div className='col-lg-6 col-md-12 mb-3 report-search'>
                <input className='form-control h-100 w-100' type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Axtarış' />
            </div>

            <div className='mt-3 position-relative'>
                {isFetching &&
                    <div className="col-12 d-flex align-items-center justify-content-center w-100 h-100 position-absolute">
                        <Loader
                            type="ThreeDots"
                            color="#00BFFF"
                            height={60}
                            width={60}
                        />
                    </div>
                }

                {stockGoods.items?.length
                    ? <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fm-poppins flex-1 mb-0">{stock.title}</h4>
                            <div style={{width: "20%"}}>
                                <Select
                                    className="basic-single"
                                    classNamePrefix="select"
                                    defaultValue={10}
                                    name="pageSize"
                                    options={sizeOptions}
                                    placeholder="Məhsul sayı"
                                    onChange={value => onPageSizeChange(value)}
                                />
                            </div>
                        </div>

                        {!isFetching && <> <div className="table-responsive">
                            <table className="table bordered striped">
                                <thead>
                                    <tr>
                                        <th scope='col'>#</th>
                                        {tableHeaders[stock.key].map(header => (
                                            <th key={header}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {stockGoods.items?.map((item, i) => (
                                        <tr key={item['fabric'] || item['chairs']}>
                                            <td>{+i + (Number(page) * Number(pageSize.value)) + 1}</td>
                                            {Object.keys(item).map(key => (
                                                <td key={key}>{item[key]}</td>
                                            ))}
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
                                pageCount={stockGoods?.totalPages + 1 || 0}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={3}
                                onPageChange={paginate}
                                containerClassName={'pagination'}
                                activeClassName={'active'}
                                pageClassName={'page-item'}
                                pageLinkClassName={'page-link'}
                                forcePage={page}
                            />
                        </div></>}
                    </div>
                    : <h5 className='text-center mt-5'>Məhsul tapılmadı.</h5>
                }
            </div>
        </div>
    )
}

export default Stock;