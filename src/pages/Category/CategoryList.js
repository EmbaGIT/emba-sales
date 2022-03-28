import {useEffect, useState} from 'react';
import {useHistory, useParams} from "react-router-dom";
import Loader from 'react-loader-spinner';
import {get} from "../../api/Api";
import ModelListItem from "./ModelListItem";
import ReactPaginate from "react-paginate";
import {getHost} from "../../helpers/host";
import jwt from "jwt-decode";

const Category = () => {
    const params = useParams();
    const category_id = params.id;
    const pageNumber = params.page;
    const [brand, setBrand] = useState(jwt(localStorage.getItem("jwt_token")).brand);
    const [page, setPage] = useState(pageNumber);
    const [pageInfo, setPageInfo] = useState();
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [productList, setProductList] = useState([]);
    const history = useHistory();
    const [isEmpty, setIsEmpty] = useState(false);
    const [userBrand, setUserBrand] = useState('');

    useEffect(() => {
        const token = jwt(localStorage.getItem("jwt_token"));
        setUserBrand(token.brand);

        getParentList(token.brand, pageNumber);
    }, []);

    useEffect(() => {
        const token = jwt(localStorage.getItem("jwt_token"));
        setUserBrand(token.brand);

        getParentList(brand, pageNumber);
    }, [pageNumber, category_id]);

    const getParentList = (brand, page) => {
        setProductList([]);
        setIsFetchingData(true);
        if (brand) {
            get(`/v2/parents/category/${category_id}?brand=${brand}&pageNumber=${page}&pageSize=16`).then(res => {
                setPageInfo(res);
                const productListArr = [];

                if (!res.content.length) {
                    setIsFetchingData(false);
                    setIsEmpty(true);
                    return;
                }

                setIsEmpty(false);
                res.content.forEach(parent => {
                    get(`/v2/parents/colors/category/${category_id}/parent/${parent.id}?brand=${brand}`).then(colors => {
                        if (colors?.length) {
                            get(`${getHost('files', 8089)}/api/image/resource?brand=${brand}&bucket=emba-store-images&category=${category_id}&parent=${parent.id}&color=${colors[0].id}&isBanner=true`).then(file => {
                                productListArr.push({
                                    ...parent,
                                    colors: colors,
                                    file
                                });
                                productListArr.sort(
                                    (a, b) => a.name.localeCompare(b.name)
                                );
                                setProductList(prevState => ([
                                    ...productListArr
                                ]))
                            })
                        } else {
                            get(`${getHost('files', 8089)}/api/image/resource?brand=${brand}&bucket=emba-store-images&category=${category_id}&parent=${parent.id}&isBanner=true`).then(file => {
                                productListArr.push({
                                    ...parent,
                                    colors: [],
                                    file
                                });
                                productListArr.sort(
                                    (a, b) => a.name.localeCompare(b.name)
                                );
                                setProductList(prevState => ([
                                    ...productListArr
                                ]))
                            })
                        }
                    })
                    setIsFetchingData(false);
                })
            })
        }
    }

    const handleInputChange = (type, value) => {
        if (type === "brand_select") {
            setBrand(value);
            getParentList(value, 0);
            setPage(0);
            history.push({
                pathname: `/category/${category_id}/0`
            })
        }
    };

    const paginate = (number) => {
        setPage(number.selected);
        history.push({
            pathname: `/category/${category_id}/${number.selected}`
        })
    }

    return (
        <div>
            <div className="row">
                <div className="col-md-4 d-flex mb-3">
                    <h5 className="me-2">Brend</h5>
                    <select className="form-control form-select"
                            onChange={e => handleInputChange("brand_select", e.target.value)}>
                        {
                            userBrand === 'Embawood'
                                ? <option value="Embawood">Embawood</option>
                                : userBrand === 'Madeyra'
                                    ? <option value="Madeyra">Madeyra</option>
                                    : null
                        }
                        {
                            userBrand ?
                                <>
                                    <option value="NONBrand">Non Brand</option>
                                    <option value="IdealDizayn">Ideal Dizayn</option>
                                    <option value="Dolcenoche">Dolcenoche</option>
                                </>
                                : null
                        }

                    </select>
                </div>
            </div>
            {isFetchingData &&
                <div className="d-flex align-items-center justify-content-center">
                    <Loader
                        type="ThreeDots"
                        color="#00BFFF"
                        height={60}
                        width={60}/>
                </div>
            }
            {!isEmpty && <ModelListItem productList={productList} brand={brand} category={category_id}/>}
            {isEmpty && !isFetchingData && <h5>Bu kateqoriyada heç bir məhsul tapılmadı.</h5>}
            <div className="mt-3 d-flex justify-content-end">
                {!!productList.length &&
                    <ReactPaginate
                        previousLabel={'Əvvəlki'}
                        nextLabel={'Növbəti'}
                        previousClassName={'page-item'}
                        nextClassName={'page-item'}
                        previousLinkClassName={'page-link'}
                        nextLinkClassName={'page-link'}
                        breakLabel={'...'}
                        breakClassName={'break-me'}
                        pageCount={pageInfo.totalPages}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={3}
                        onPageChange={paginate}
                        containerClassName={'pagination'}
                        activeClassName={'active'}
                        pageClassName={'page-item'}
                        pageLinkClassName={'page-link'}
                        forcePage={parseInt(page)}
                    />
                }
            </div>
        </div>
    )

}

export default Category;