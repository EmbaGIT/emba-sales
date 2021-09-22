import {useEffect, useState} from 'react';
import {useHistory, useParams, Link} from "react-router-dom";
import Loader from 'react-loader-spinner';
import {useQuery} from "../../hooks/useQuery";
import {get} from "../../api/Api";
import noImage from '../../assets/images/no-image.png';
import ReactPaginate from "react-paginate";

const Category = () => {
    const params = useParams();
    const history = useHistory();
    const category_id = params.id;
    let query = useQuery();
    const currentPage = query.get("page") || 0;
    const [page, setPage] = useState(currentPage);
    const [pageInfo, setPageInfo] = useState();
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [productList, setProductList] = useState([]);

    useEffect(() => {
        setProductList([]);
        setIsFetchingData(true);
        get(`http://bpaws10l:8083/api/parents/byAttributeId/${category_id}?page=${page}&size=15`).then((res) => {
            /*if(res.content.length){*/
            setPageInfo(res);
            const productListArr = [];
            res.content.forEach(product => {
                get(`http://bpaws10l:8082/api/files/resource?resourceId=${product.id}&bucket=mobi-c&folder=parent-banner`).then(file => {
                    productListArr.push({
                        ...product,
                        file
                    });
                    productListArr.sort(
                        (a, b) => parseInt(a.id) - parseInt(b.id)
                    );
                    setProductList(prevState => ([
                        ...productListArr
                    ]))
                })
            })
            setIsFetchingData(false);
            /*}else{
                get(`http://bpaws01l:8083/api/products/search?attributeId.equals=${category_id}`).then(response => {
                    console.log("response", response)
                    const productListArr = [];
                    response.content.forEach(product => {
                        get(`http://bpaws01l:8082/api/files/resource?resourceId=${product.id}&bucket=mobi-c&folder=parent-banner`).then(file => {
                            productListArr.push({
                                ...product,
                                file
                            });
                            productListArr.sort(
                                (a, b) => parseInt(a.id) - parseInt(b.id)
                            );
                            setProductList(prevState => ([
                                ...productListArr
                            ]))
                        })
                    })
                    setIsFetchingData(false);
                })
            }*/
        })
    }, [page, category_id]);

    const paginate = (n) => {
        setPage(+n.selected);
        history.push({
            pathname: `/category/${category_id}`,
            search: '?page=' + n.selected + '&size=15'
        })
    }

    if (isFetchingData) {
        return (
            <div className="d-flex align-items-center justify-content-center">
                <Loader
                    type="ThreeDots"
                    color="#00BFFF"
                    height={60}
                    width={60}/>
            </div>
        )
    }

    return (
        <div>
            <div className="grid-wrapper">
                {productList && productList.map((product, index) => (
                    <div className="grid-item" key={index}>
                        <Link to={`/product/${product.id}`} className="pr-wrapper product-add">
                            <div className="pr-image">
                                <div className="product-button">
                                    <div className="add-to-cart btn-cart">
                                        <i className="fas fa-cart-arrow-down text-body"/>
                                    </div>
                                    <div className="add-wishlist">
                                        <i className="fas fa-heart text-body"/>
                                    </div>
                                </div>
                                {product.file.length ? product.file.map(file => (
                                    <img src={file.objectUrl} alt=""/>
                                )) : <img src={noImage} alt=""/>}
                            </div>
                            <div className="pr-info">
                                <div className="model-name">{product.name}</div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
            <div className="mt-3">
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
                        pageCount={pageInfo?.totalPages}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={3}
                        onPageChange={paginate}
                        containerClassName={'pagination'}
                        activeClassName={'active'}
                        pageClassName={'page-item'}
                        pageLinkClassName={'page-link'}
                        initialPage={page}
                    />
                }
            </div>
        </div>

    )

}

export default Category;