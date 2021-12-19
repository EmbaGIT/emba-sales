import {useEffect, useState} from 'react';
import {useHistory, useParams} from "react-router-dom";
import Loader from 'react-loader-spinner';
import {get} from "../../api/Api";
import ModelListItem from "./ModelListItem";
import ReactPaginate from "react-paginate";

const Category = () => {
    const params = useParams();
    const category_id = params.id;
    const pageNumber = params.page;
    const [brand, setBrand] = useState('Embawood');
    const [page, setPage] = useState(pageNumber);
    const [pageInfo, setPageInfo] = useState();
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [productList, setProductList] = useState([]);
    const history = useHistory();

    useEffect(() => {
        getParentList(brand, pageNumber);
    }, [pageNumber, category_id]);

    const getParentList = (brand, page) => {
        setProductList([]);
        setIsFetchingData(true);
        if(brand){
            get(`/v2/parents/category/${category_id}?brand=${brand}&pageNumber=${page}&pageSize=16`).then(res => {
                setPageInfo(res);
                const productListArr = [];
                res.content.forEach(parent => {
                    get(`/v2/parents/colors/category/${category_id}/parent/${parent.id}?brand=${brand}`).then(colors => {
                        if (colors?.length) {
                            get(`http://bpaws01l:8089/api/image/resource?brand=${brand}&bucket=emba-store-images&category=${category_id}&parent=${parent.id}&color=${colors[0].id}&isBanner=true`).then(file => {
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
                            get(`http://bpaws01l:8089/api/image/resource?brand=${brand}&bucket=emba-store-images&category=${category_id}&parent=${parent.id}&isBanner=true`).then(file => {
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
        if(type==="brand_select"){
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
                    <select className="form-control form-select" onChange={e => handleInputChange("brand_select", e.target.value)}>
                        <option value="Embawood">Embawood</option>
                        <option value="Madeyra">Madeyra</option>
                        <option value="NONBrand">Non Brand</option>
                        <option value="IdealDizayn">Ideal Dizayn</option>
                        <option value="Dolcenoche">Dolcenoche</option>
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
            <ModelListItem productList={productList} brand={brand} category={category_id}/>
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