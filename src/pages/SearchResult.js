import {Link, useHistory} from "react-router-dom";
import {useQuery} from "../hooks/useQuery";
import {useEffect, useState} from "react";
import {get} from "../api/Api";
import Loader from "react-loader-spinner";
import noImage from "../assets/images/no-image.png";
import ReactPaginate from "react-paginate";

const SearchProductList = () => {
    const history = useHistory();
    let query = useQuery();
    const searchParameter = query.get("param") || '';
    const currentPage = query.get("page") || 0;
    const [page, setPage] = useState(currentPage);
    const [searchParam, setSearchParam] = useState(searchParameter);
    const [pageInfo, setPageInfo] = useState();
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [productList, setProductList] = useState([]);

    useEffect(() => {
        setProductList([]);
        setIsFetchingData(true);
        setSearchParam(searchParameter);
        get(`/products/search?name.contains=${searchParameter}&page=${currentPage}&size=16`).then((res) => {
            setPageInfo(res);
            const productListArr = [];
            res.content.forEach(product => {
                if(product.colors.length){
                    get(`http://bpaws01l:8089/api/image/resource?bucket=emba-store&parent=${product.parent.id}&product=${product.id}/banner`).then(file => {
                        productListArr.push({
                            ...product,
                            colors: product.colors,
                            file
                        });
                        productListArr.sort(
                            (a, b) => parseInt(a.id) - parseInt(b.id)
                        );
                        setProductList(prevState => ([
                            ...productListArr
                        ]))
                        console.log(productList)
                    })
                }else{
                    get(`http://bpaws01l:8089/api/image/resource?bucket=emba-store&parent=${product.parent.id}&product=${product.id}/banner`).then(file => {
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
                }

            })
            setIsFetchingData(false);
        })
    }, [page, searchParameter]);

    const paginate = (n) => {
        setPage(+n.selected);
        history.push({
            pathname: `/search`,
            search: `?param=${searchParam}&page=${n.selected}&size=16`
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
                        <Link to={product.colors.length ? `/product/${product.parent.id}?color=${product.colors[0].id}` : `/product/${product.parent.id}`} className="pr-wrapper product-add">
                            <div className="pr-image">
                                {product.file.length ? product.file.map(file => (
                                    <img src={file.lowQualityImageUrl} alt=""/>
                                )) : <img src={noImage} alt=""/>}
                            </div>
                        </Link>
                        <div className="pr-info">
                            <Link to={product.colors.length ? `/product/${product.parent.id}?color=${product.colors[0].id}` : `/product/${product.parent.id}`} className="pr-wrapper product-add"><div className="model-name">{product.name}</div></Link>
                            <div>
                                {product.colors.length ? product.colors.map(color => (
                                    <Link to={`/product/${product.parent.id}?color=${color.id}`} key={color.id}>
                                        <span data-toggle="tooltip" title={color.name}>
                                            <img className="color-image" alt="" src={`../../assets/images/colors/${color.code}.png`}/>
                                        </span>
                                    </Link>
                                )) : ''}
                            </div>
                        </div>
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

export default SearchProductList;