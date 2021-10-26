import React, {useEffect, useState} from 'react';
import {Link, useParams} from "react-router-dom";
import {gett, postt, get} from "../../api/Api";
import noImage from '../../assets/images/no-image.png';
import Loader from "react-loader-spinner";
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import SubProductItem from "./SubProductItem";
import SubProductInfo from "./SubProductİnfo";
import {useQuery} from "../../hooks/useQuery";

const Product = () => {
    const params = useParams();
    const parent_id = params.id;
    let query = useQuery();
    const currentColor = query.get("color") || '';
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [productColor, setProductColor] = useState(currentColor);
    const [productInfo, setProductInfo] = useState([]);
    const [totalPrice, setSetPrice] = useState(0);
    const [productImages, setProductImages] = useState();
    const [subProductImages, setSubProductImages] = useState();
    const [subProductsIsIncluded, setSubProductsIsIncluded] = useState();
    const [subProductsNotIncluded, setSubProductsNotIncluded] = useState();
    const [subProductInfo, setSubProductInfo] = useState([]);
    const [cartIsShown, setCartIsShown] = useState(false);

    const showCartHandler = () => {
        setCartIsShown(true);
    };

    const hideCartHandler = () => {
        setCartIsShown(false);
    };

    function getProductStock(uid) {
        return postt(`http://bpaws01l:8087/api/inventory`, {
            "user_uid": "8f859d20-e5f4-11eb-80d7-2c44fd84f8db",
            "goods": [
                {
                    "product_uid": uid,
                    "characteristic_uid": ""
                }
            ]
        });
    }

    function getProductFiles(id) {
        return gett(`http://bpaws01l:8089/api/image/resource?bucket=emba-store&parent=${parent_id}&product=${id}/banner`);
    }

    useEffect(() => {
        setIsFetchingData(true);
        let setPrice = 0;
        const subProductIsIncludedArr = [];
        const subProductNotIncludedArr = [];
        get(`parents/${parent_id}`).then(productInfo => {
            setProductInfo(productInfo);
            get(`products/search?parentId.equals=${parent_id}&size=50&categoryId.equals=1&attributeId.equals=${productColor}`).then((res) => {
                res.content.map(async item => {
                    setPrice += item.price;
                    const items = [];
                    const stock = [];
                    const files = [];
                    await Promise.all([getProductStock(item.uid), getProductFiles(item.id)])
                        .then(function (results) {
                            items.push(item);
                            stock.push(...results[0].data[0].stock);
                            files.push(...results[1].data);
                            subProductIsIncludedArr.push({
                                id: item.id,
                                items,
                                stock,
                                files
                            });
                            subProductIsIncludedArr.sort(
                                (a, b) => parseInt(a.id) - parseInt(b.id)
                            );
                            setSubProductsIsIncluded(prevState => ([
                                ...subProductIsIncludedArr
                            ]));
                        });
                })
                setIsFetchingData(false);
                setSetPrice(setPrice);
            });
            get(`products/search?parentId.equals=${parent_id}&size=50&categoryId.equals=4&attributeId.equals=${productColor}`).then((res) => {
                res.content.map(async item => {
                    const items = [];
                    const stock = [];
                    const files = [];
                    await Promise.all([getProductStock(item.uid), getProductFiles(item.id)])
                        .then(function (results) {
                            items.push(item);
                            stock.push(...results[0].data[0].stock);
                            files.push(...results[1].data);
                            subProductNotIncludedArr.push({
                                id: item.id,
                                items,
                                stock,
                                files
                            });
                            subProductNotIncludedArr.sort(
                                (a, b) => parseInt(a.id) - parseInt(b.id)
                            );
                            setSubProductsNotIncluded(prevState => ([
                                ...subProductNotIncludedArr
                            ]));
                        });
                })
                setIsFetchingData(false);
            });
            get(`products/search?parentId.equals=${parent_id}&size=50&categoryId.equals=1&attributeId.equals=${productColor}`).then(res => {
                const images = [];
                get(`http://bpaws01l:8089/api/image/resource?bucket=emba-store&parent=${parent_id}&color=${productColor}`).then(files => {
                    files.map(file => (
                        images.push({
                            original: file.originalImageUrl,
                            thumbnail: file.lowQualityImageUrl,
                        })
                    ))
                });
                res.content.map(item => (
                    get(`http://bpaws01l:8089/api/image/resource?bucket=emba-store&parent=${parent_id}&product=${item.id}`).then(files => {
                        files.map(file => (
                            images.push({
                                original: file.originalImageUrl,
                                thumbnail: file.lowQualityImageUrl,
                            })
                        ))
                    })
                ))
                setProductImages(images);
            })
        });
    }, [parent_id, productColor]);

    const handleModuleInfo = (id) => {
        const images = [];
        get(`http://bpaws01l:8089/api/image/resource?&bucket=emba-store&parent=${parent_id}&product=${id}`).then(files => {
            files.map(file => (
                images.push({
                    original: file.originalImageUrl,
                    thumbnail: file.lowQualityImageUrl,
                })
            ));
            get(`http://bpaws01l:8089/api/image/resource?&bucket=emba-store&parent=${parent_id}&product=${id}/banner`).then(banner => {
                banner.map(file => (
                    images.push({
                        original: file.originalImageUrl,
                        thumbnail: file.lowQualityImageUrl,
                    })
                ))
                setSubProductImages(images);
                showCartHandler();
            });
        });
        get(`products/${id}`).then(res => {
            setSubProductInfo(res);
        })
    }

    const changeColor = (color) =>{
        setProductColor(color);
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
        <div className="mt-3">
            <div className="row">
                <div className="col-lg-7">
                    {productImages?.length ?
                        <ImageGallery items={productImages}/>
                        : <img src={noImage} className="w-100"/>
                    }
                </div>
                <div className="col-lg-5">
                    {productInfo &&
                    <>
                        <div className="d-flex">
                            <h1 className="product-name">{productInfo.name}</h1>
                            <div className="ms-3"><i className="far fa-heart"/></div>
                        </div>
                        <div className="product-price-box mt-2">
                            <div className="d-flex align-items-center product-info-wrapper justify-content-between">
                                <div className="price-block">
                                    <span className="product-price-current">
                                        <span className="price">{totalPrice ? totalPrice : 0}</span> AZN
                                    </span>
                                </div>
                            </div>
                        </div>
                        {productInfo.colors &&
                        <div className="mt-3">
                            {productInfo.colors.map(color => (
                                <Link to={`/product/${parent_id}?color=${color.id}`}><span key={color.id} onClick={changeColor.bind(this, color.id)} data-toggle="tooltip" title={color.name}><img
                                    className="color-image me-2"
                                    src={`../../assets/images/colors/${color.code}.png`}/></span>
                                </Link>
                            ))}
                        </div>
                        }
                    </>
                    }
                </div>
            </div>
            {cartIsShown && <SubProductInfo onClose={hideCartHandler} info={subProductInfo} images={subProductImages}/>}
            <div className="row mt-4">
                <div className="col-12 mb-3">
                    <p className="panel-heading">Dəst Tərkibi</p>
                </div>
                {subProductsIsIncluded && subProductsIsIncluded.map((item) => (
                    <SubProductItem key={item.items[0].id}
                                    key_id={item.items[0].id}
                                    id={item.items[0].id}
                                    uid={item.items[0].uid}
                                    name={item.items[0].name}
                                    price={item.items[0].price}
                                    files={item.files}
                                    defaultValue={1}
                                    parent={item.items[0].parent.name}
                                    product_uid={item.items[0].uid}
                                    stock={item.stock}
                                    onClickHandle={handleModuleInfo}
                    />
                ))}
            </div>
            <div className="row mt-4">
                <div className="col-12 mb-3">
                    <p className="panel-heading">Dəstə Daxil Olmayan Modullar</p>
                </div>
                {subProductsNotIncluded && subProductsNotIncluded.map((item) => (
                    <SubProductItem key={item.items[0].id}
                                    key_id={item.items[0].id}
                                    id={item.items[0].id}
                                    uid={item.items[0].uid}
                                    name={item.items[0].name}
                                    price={item.items[0].price}
                                    files={item.files}
                                    defaultValue={1}
                                    parent={item.items[0].parent.name}
                                    product_uid={item.items[0].uid}
                                    stock={item.stock}
                                    onClickHandle={handleModuleInfo}
                    />
                ))}
            </div>
        </div>
    )
}

export default Product;