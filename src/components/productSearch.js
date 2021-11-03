import {useState, useEffect, useRef} from "react";
import {get} from "../api/Api";
import {Link} from "react-router-dom";

const ProductSearch = () => {
    const [searchResult, setSearchResult] = useState([]);
    const [searchParam, setSearchParam] = useState('');
    const [searchDisplay, setSearchDisplay] = useState('none');
    const inputBox = useRef(null);

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
        if(value.trim().length > 3){
            get(`products/search?name.contains=${value}&page=0&size=5`).then(res => {
                setSearchResult(res);
                console.log(res);
                setSearchDisplay('block');
            }).catch(err => console.log(err));
        }else{
            setSearchResult([]);
        }
    }

    return (
        <div className="position-relative">
            <input className="form-control" ref={inputBox} value={searchParam} onChange={e => handleSearch(e.target.value)}/>
            <div className="live-search" style={{display: searchDisplay}}>
                <ul>
                    {searchResult.content?.length && searchResult.content.map(product => (
                        <li className="result-box-wrapper" key={product.id}>
                            <div className="flex-1">
                                <Link to={`/product/${product.parent.id}?color=${product.colors[0]?.id}`}>
                                    <div className="product-name">{product.name}</div>
                                    <div className="product-price">{product.price} AZN</div>
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="result-text">
                    <Link to={`/search?param=${searchParam}`} className="text-light">Bütün nəticələr ({searchResult.totalElements})</Link>
                </div>
            </div>
        </div>
    )
}


export default ProductSearch;