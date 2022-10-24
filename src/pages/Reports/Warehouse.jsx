import React, { useEffect, useState, useContext } from "react";
import { get, remove } from "../../api/Api";
import jwt from 'jwt-decode';
import Loader from 'react-loader-spinner';
import ReactPaginate from "react-paginate";
import Select from "react-select";
import { Link, useHistory, useParams } from "react-router-dom";
import { getHost } from "../../helpers/host";
import CartContext from "../../store/CartContext";

const categoryEnum = [
    { id: 8, value: 'BEDROOM' },
    { id: 19, value: 'CHAIR' },
    { id: 17, value: 'COMMERCIAL_HOME' },
    { id: 20, value: 'COMMERCIAL_HOME_TEXTILE' },
    { id: 14, value: 'HALLWAY' },
    { id: 22, value: 'KITCHEN' },
    { id: 11, value: 'LIVING_ROOM' },
    { id: 18, value: 'MATTRESS' },
    { id: 15, value: 'MODULAR_GROUP' },
    { id: 12, value: 'UPHOLDSTERED' },
    { id: 16, value: 'WALL_UNIT' },
    { id: 13, value: 'YOUNG' }
]

const Warehouse = () => {
    const history = useHistory();
    const params = useParams();
    const cartCtx = useContext(CartContext)
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
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('')

    const getUser = () => {
        const token = localStorage.getItem("jwt_token");
        return token && jwt(token);  // decodes user from jwt and returns it
    }

    useEffect(() => {
        get(`/menu/search?sort=menuOrder,desc&size=20`).then(res => {
            setCategories([
                { value: '', label: 'Bütün dəstlər' },
                ...res.content.map(category => ({
                    value: categoryEnum.find(c => c.id === category.id).value,
                    label: category.nameAz
                }))
            ])
        })
    }, [])

    useEffect(() => {
        const user = getUser();
        setIsFetching(true);
        get(`${getHost('erp/report', 8091)}/api/warehouse/${user?.uid}?page=${params.page}&size=${params.pageSize}&category=${selectedCategory?.value || ''}&filter=${search}`).then((res) => {
            setWarehouseInfo(res);
            setIsFetching(false);
        }).catch((err) => {
            console.log("err", err);
        });
    }, [page, pageSize, search, selectedCategory]);

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
        remove(`${getHost('erp/report', 8091)}/api/warehouse/${user?.uid}`).then((res) => {
            get(`${getHost('erp/report', 8091)}/api/warehouse/${user?.uid}?page=0&size=10&category=${selectedCategory.value}&filter=${search}`).then((res) => {
                setWarehouseInfo(res);
                setIsFetching(false);
            }).catch((err) => {
                console.log("error in getting goods: ", err);
            });
        }).catch(error => console.log("error in cleaning cache: ", error));
    }

    const addToCartHandler = async (uid, characteristics) => {
        const product = await get(`/products/uid/${uid}`)
        const price = product.price ?? product.characteristics.find(ch => ch.name === characteristics)?.price
        const { id, name } = product
        const brand = product.attributes.find(a => a.groups.name === 'Brand').name
        const parent = product.attributes.find(a => a.groups.name === 'Model').name
        const category = product.attributes.find(a => a.groups.name === 'Vidmebeli').id.toString()
        const parent_id = product.attributes.find(a => a.groups.name === 'Model').id.toString()
        const color_id = product.colors[0]?.id.toString() ?? ''
        const characteristic_uid = product.characteristics.find(c => c.name === characteristics)?.uid ?? ''
        const characteristic_code = product.characteristics.find(c => c.name === characteristics)?.code ?? ''

        const fileUrl = color_id
            ? `${getHost('files', 8089)}/api/image/resource?brand=${brand}&bucket=emba-store-images&category=${category}&parent=${parent_id}&product=${id}&color=${color_id}`
            : `${getHost('files', 8089)}/api/image/resource?brand=${brand}&bucket=emba-store-images&category=${category}&parent=${parent_id}&product=${id}`

        const files = await get(fileUrl)

        cartCtx.addItem({
            amount: 1,
            discount: 0,
            id,
            name,
            price,
            parent,
            parent_id,
            brand,
            category,
            uid,
            characteristic_uid,
            characteristic_code,
            color_id,
            files,
            discount_price: price,
            product_createsales: false,
            product_reserve: false,
        });
    }

    const changeCategory = category => setSelectedCategory(category)

    return (
        <div className='container-fluid row'>
            <div className="col-lg-3 col-md-6 mb-3">
                <Link to='/reports/fabric/0/10'>
                    <div className='category-box'>
                        <div className="category-hover-box">
                            <span className='category-name'>Parça qalığı</span>
                        </div>
                    </div>
                </Link>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
                <Link to='/reports/chair/0/10'>
                    <div className='category-box'>
                        <div className="category-hover-box">
                            <span className='category-name'>Stul qalığı</span>
                        </div>
                    </div>
                </Link>
            </div>
            <div className='col-lg-6 col-md-12 mb-3 report-search'>
                <input className='form-control h-100 w-100' type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Axtarış' />
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
                            <div className='me-3' style={{ width: "20%" }}>
                                <Select
                                    className="basic-single"
                                    classNamePrefix="select"
                                    defaultValue={''}
                                    name="selectedCategory"
                                    options={categories}
                                    placeholder="Dəst seçin"
                                    onChange={changeCategory}
                                />
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
                                    <th scope='col'>Səbətə at</th>
                                </tr>
                                </thead>
                                <tbody>
                                {warehouseInfo.goods?.sort((g1, g2) => g1?.productName?.localeCompare(g2?.productName)).map((good, i) => (
                                    <tr key={i}>
                                        <td>{+i + (Number(page) * Number(pageSize.value)) + 1}</td>
                                        <td><span className="cursor-pointer text-primary font-weight-bolder">{good.productName}</span></td>
                                        <td>{good.characteristicName}</td>
                                        <td>{good.quantity}</td>
                                        <td>
                                            <div>
                                                <button
                                                    type="button"
                                                    className="btn btn-success"
                                                    onClick={() => addToCartHandler(good.productUid, good.characteristicName)}
                                                >
                                                    <i className="fas fa-cart-plus"/>
                                                </button>
                                            </div>
                                        </td>
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
                                pageCount={warehouseInfo?.totalPages || 0}
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