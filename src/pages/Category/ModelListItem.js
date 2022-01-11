import {Link} from "react-router-dom";
import noImage from "../../assets/images/no-image.png";

const ModelListItem = ({productList, brand, category}) => {
    return (
        <div className="grid-wrapper">
            {productList && productList.map((product, index) => (
                <div className="grid-item" key={index}>
                    <Link to={product.colors.length ? `/product/${brand}/${category}/${product.id}?color=${product.colors[0].id}` : `/product/${brand}/${category}/${product.id}`} className="pr-wrapper product-add">
                        <div className="pr-image">
                            {product.file.length ?
                                <img src={product.file[0].lowQualityImageUrl} alt="" key={index}/>
                                : <img src={noImage} alt=""/>}
                        </div>
                    </Link>
                    <div className="pr-info">
                        <Link to={product.colors.length ? `/product/${brand}/${category}/${product.id}?color=${product.colors[0].id}` : `/product/${brand}/${category}/${product.id}`} className="pr-wrapper product-add"><div className="model-name">{product.name}</div></Link>
                        <div>
                            {product.colors.length ? product.colors.map((color, index) => (
                                <Link to={`/product/${brand}/${category}/${product.id}?color=${color.id}`} key={index}>
                                        <span key={color.id} data-toggle="tooltip" title={color.name}>
                                            <img className="color-image" src={`../../assets/images/colors/${color.code}.png`} alt=""/>
                                        </span>
                                </Link>
                            )) : ''}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ModelListItem;