import {useState, useEffect, useRef} from "react";
import {get} from "../api/Api";
import {Link} from "react-router-dom";
import jwt from "jwt-decode";

const ProductSearch = () => {
    const [searchResult, setSearchResult] = useState([]);
    const [searchParam, setSearchParam] = useState('');
    const [searchDisplay, setSearchDisplay] = useState('none');
    const inputBox = useRef(null);
    const [brand, setBrand] = useState('');

    useEffect(() => {
        const token = jwt(localStorage.getItem("jwt_token"));
        setBrand(token.brand);
    }, [])

    useEffect(() => {
        function handleOutsideClick(event) {
            if (inputBox.current && !inputBox.current.contains(event.target)) {
                setSearchDisplay('none');
                setSearchParam('');
            }
        }
        document.addEventListener("click", handleOutsideClick);

    }, [inputBox]);

    const handleSearch = (value) => {
        setSearchParam(value);
        if(value.trim().length >= 3){
            get(`products/search?name.contains=${value}&page=0&size=5`).then(res => {
                setSearchResult(res);
                setSearchDisplay('block');
            }).catch(err => console.log(err));
        }else{
            setSearchResult([]);
        }
    }

    return (
        <div className="position-relative">
            <input className="form-control" placeholder="Ən az 3 simvol daxil edib axtarış edin" ref={inputBox} value={searchParam} onChange={e => handleSearch(e.target.value)}/>
            <div className="live-search" style={{display: searchDisplay}}>
                <ul>
                    {searchResult.content?.length && searchResult.content.filter(item => item.brand === brand).map(product => (
                        <li className="result-box-wrapper" key={product.id}>
                            <div className="flex-1">
                                <Link to={product.colors.length ? `/product/${product.brand}/${product.categoryId}/${product.parentId}?color=${product.colors[0]?.id}`
                                    : `/product/${product.brand}/${product.categoryId}/${product.parentId}`}>
                                    <div className="product-name">{product.name}</div>
                                    <div className="product-price">{product.price} AZN</div>
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
                {
                    searchResult?.totalElements > 5 && searchResult?.content?.filter(item => item.brand === brand).length ? <Link
                        to={`/search?param=${searchParam}`} className="text-light"
                    >
                        <div className="result-text">
                            Bütün nəticələr ({searchResult?.totalElements})
                        </div>
                    </Link> : null
                }
            </div>
        </div>
    )
}


export default ProductSearch;