import React, {useContext, useEffect, useState} from 'react';
import {Link, useParams} from "react-router-dom";
import {gett, postt, get} from "../../api/Api";
import noImage from '../../assets/images/no-image.png';
import Loader from "react-loader-spinner";
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import SubProductItem from "./SubProductItem";
import SubProductInfo from "./SubProductInfo";
import {useQuery} from "../../hooks/useQuery";
import AuthContext from "../../store/AuthContext";

const Product = () => {
    const params = useParams();
    const brand = params.brand;
    const category_id = params.category_id;
    const parent_id = params.parent_id;
    let query = useQuery();
    const authCtx=useContext(AuthContext);
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
            "user_uid": authCtx.user_uid,
            "goods": [
                {
                    "product_uid": uid,
                    "characteristic_uid": ""
                }
            ]
        });
    }

    function getProductFiles(id) {
        if(currentColor){
            return get(`http://bpaws01l:8089/api/image/resource?brand=${brand}&color=${currentColor}&category=${category_id}&bucket=emba-store-images&parent=${parent_id}&product=${id}&isBanner=true`)
        }
        return get(`http://bpaws01l:8089/api/image/resource?brand=${brand}&category=${category_id}&bucket=emba-store-images&parent=${parent_id}&product=${id}&isBanner=true`);
    }

    function getCharacteristics(id) {
        return gett(`products/${id}`);
    }

    useEffect(() => {
        setIsFetchingData(true);
        setProductColor(currentColor);
        setSubProductsIsIncluded([]);
        setSubProductsNotIncluded([]);
        const images = [];
        let setPrice = 0;
        const subProductIsIncludedArr = [];
        const subProductNotIncludedArr = [];

        get(`/v2/parents/colors/category/${category_id}/parent/${parent_id}?brand=${brand}`).then(colors => {
            setProductInfo(prevstate => ({
                ...prevstate,
                colors
            }));
            if(colors.length){
                get(`/v2/products/state/category/${category_id}/parent/${parent_id}/color/${currentColor}?brand=${brand}&state=Deste_Daxildir`).then(products => {
                    products.map(async item => {
                        setPrice += item.price;
                        const items = [];
                        const stock = [];
                        const files = [];
                        const characteristic = [];
                        await Promise.all([getProductStock(item.uid), getProductFiles(item.id), getCharacteristics(item.id)])
                            .then(function (results) {
                                items.push(item);
                                stock.push(...results[0].data[0].stock);
                                files.push(...results[1]);
                                characteristic.push(...results[2].data.characteristics)
                                subProductIsIncludedArr.push({
                                    id: item.id,
                                    items,
                                    stock,
                                    files,
                                    characteristic
                                });
                                subProductIsIncludedArr.sort(
                                    (a, b) => parseInt(a.id) - parseInt(b.id)
                                );
                                setSubProductsIsIncluded(prevState => ([
                                    ...subProductIsIncludedArr
                                ]));
                            });
                    })
                    get(`http://bpaws01l:8089/api/image/resource?brand=${brand}&bucket=emba-store-images&category=${category_id}&color=${currentColor}&parent=${parent_id}`).then(files => {
                        files.map(file => (
                            images.push({
                                original: file.originalImageUrl,
                                thumbnail: file.lowQualityImageUrl,
                            })
                        ))
                    })
                    setSetPrice(setPrice);
                })
                get(`/v2/products/state/category/${category_id}/parent/${parent_id}/color/${currentColor}?brand=${brand}&state=Deste_Daxil_Deyil`).then(products => {
                    products.map(async item => {
                        const items = [];
                        const stock = [];
                        const files = [];
                        const characteristic = [];
                        await Promise.all([getProductStock(item.uid), getProductFiles(item.id), getCharacteristics(item.id)])
                            .then(function (results) {
                                items.push(item);
                                stock.push(...results[0].data[0].stock);
                                files.push(...results[1]);
                                characteristic.push(...results[2].data.characteristics);
                                subProductNotIncludedArr.push({
                                    id: item.id,
                                    items,
                                    stock,
                                    files,
                                    characteristic
                                });
                                subProductNotIncludedArr.sort(
                                    (a, b) => parseInt(a.id) - parseInt(b.id)
                                );
                                setSubProductsNotIncluded(prevState => ([
                                    ...subProductNotIncludedArr
                                ]));
                            });
                    })
                })
                setProductImages(images);
                setIsFetchingData(false);
            }else{
                get(`/v2/products/state/category/${category_id}/parent/${parent_id}?brand=${brand}&state=Deste_Daxildir`).then(products => {
                    products.map(async item => {
                        setPrice += item.price;
                        const items = [];
                        const stock = [];
                        const files = [];
                        const characteristic = [];
                        await Promise.all([getProductStock(item.uid), getProductFiles(item.id), getCharacteristics(item.id)])
                            .then(function (results) {
                                items.push(item);
                                stock.push(...results[0].data[0].stock);
                                files.push(...results[1]);
                                characteristic.push(...results[2].data.characteristics)
                                subProductIsIncludedArr.push({
                                    id: item.id,
                                    items,
                                    stock,
                                    files,
                                    characteristic
                                });
                                subProductIsIncludedArr.sort(
                                    (a, b) => parseInt(a.id) - parseInt(b.id)
                                );
                                setSubProductsIsIncluded(prevState => ([
                                    ...subProductIsIncludedArr
                                ]));
                            });
                    })
                    get(`http://bpaws01l:8089/api/image/resource?brand=${brand}&bucket=emba-store-images&category=${category_id}&parent=${parent_id}`).then(files => {
                        files.map(file => (
                            images.push({
                                original: file.originalImageUrl,
                                thumbnail: file.lowQualityImageUrl,
                            })
                        ))
                    })
                    setSetPrice(setPrice);
                })
                get(`/v2/products/state/category/${category_id}/parent/${parent_id}?brand=${brand}&state=Deste_Daxil_Deyil`).then(products => {
                    products.map(async item => {
                        const items = [];
                        const stock = [];
                        const files = [];
                        const characteristic = [];
                        await Promise.all([getProductStock(item.uid), getProductFiles(item.id), getCharacteristics(item.id)])
                            .then(function (results) {
                                items.push(item);
                                stock.push(...results[0].data[0].stock);
                                files.push(...results[1]);
                                characteristic.push(...results[2].data.characteristics);
                                subProductNotIncludedArr.push({
                                    id: item.id,
                                    items,
                                    stock,
                                    files,
                                    characteristic
                                });
                                subProductNotIncludedArr.sort(
                                    (a, b) => parseInt(a.id) - parseInt(b.id)
                                );
                                setSubProductsNotIncluded(prevState => ([
                                    ...subProductNotIncludedArr
                                ]));
                            });
                    })
                })
                setIsFetchingData(false);
                setProductImages(images);
            }
        })
    }, [parent_id, productColor]);

    const handleModuleInfo = (id) => {
        const images = [];
        currentColor && get(`http://bpaws01l:8089/api/image/resource?brand=${brand}&category=${category_id}&color=${currentColor}&bucket=emba-store-images&parent=${parent_id}&product=${id}`).then(files => {
            files.map(file => (
                images.push({
                    original: file.originalImageUrl,
                    thumbnail: file.lowQualityImageUrl,
                })
            ));
            setSubProductImages(images);
            showCartHandler();
        });
        !currentColor && get(`http://bpaws01l:8089/api/image/resource?brand=${brand}&category=${category_id}&bucket=emba-store-images&parent=${parent_id}&product=${id}`).then(files => {
            files.map(file => (
                images.push({
                    original: file.originalImageUrl,
                    thumbnail: file.lowQualityImageUrl,
                })
            ));
            setSubProductImages(images);
            showCartHandler();
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
                        : <img src={noImage} className="w-100" alt=""/>
                    }
                </div>
                <div className="col-lg-5">
                    {productInfo &&
                    <>
                        <div className="d-flex">
                            <h1 className="product-name">{productInfo.name}</h1>
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
                                <Link to={`/product/${brand}/${category_id}/${parent_id}?color=${color.id}`} key={color.id}><span onClick={changeColor.bind(this, color.id)} data-toggle="tooltip" title={color.name}><img
                                    className="color-image me-2" alt=""
                                    src={`../../../assets/images/colors/${color.code}.png`}/></span>
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
                                    characteristics={item.characteristic}
                                    defaultValue={1}
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
                                    characteristics={item.characteristic}
                                    defaultValue={1}
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