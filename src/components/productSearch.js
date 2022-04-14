import {useState, useEffect, useRef} from "react";
import {Link} from "react-router-dom";
import jwt from "jwt-decode";
import {getHost} from "../helpers/host";
import axios from "axios";

const ProductSearch = () => {
    const [searchResult, setSearchResult] = useState([]);
    const [searchParam, setSearchParam] = useState('');
    const [searchDisplay, setSearchDisplay] = useState('none');
    const inputBox = useRef(null);
    const token = localStorage.getItem("jwt_token");

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
            axios.get(`${getHost('web', '8083')}/api/products/web/search?name=${value}&page=0&size=5`, {
                headers: {
                    'Brand': jwt(token).brand === 'Embawood' ? 'Madeyra' : 'Embawood',
                    Authorization: `Bearer ${token}`
                }
            }).then(res => {
                setSearchResult(res.data);
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
                    {searchResult.content?.length && searchResult.content.map(product => (
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
                    searchResult?.totalElements > 5 && searchResult?.content?.length ? <Link
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