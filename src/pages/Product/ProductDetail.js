import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {get} from "../../api/Api";
import noImage from '../../assets/images/no-image.png';
import Loader from "react-loader-spinner";
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import SubProductItem from "./SubProductItem";
import SubProductInfo from "./SubProductİnfo";

const Product = () => {
    const params = useParams();
    const parent_id = params.id;
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [productInfo, setProductInfo] = useState('');
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

    useEffect(() => {
        setIsFetchingData(true);
        let setPrice=0;
        get(`parents/${parent_id}`).then(res => {
            setProductInfo(res);
        })
        get(`products/search?parentId.equals=${parent_id}&size=50&categoryId.equals=1`).then((res) => {
            const subProductIsIncludedArr = [];
            res.content.map(item => {
                setPrice += item.price;
                get(`http://bpaws01l:8082/api/image/resource?resourceId=${item.id}&bucket=mobi-c&folder=module-banner`).then(files => {
                    subProductIsIncludedArr.push({item, files});
                    subProductIsIncludedArr.sort(
                        (a, b) => parseInt(a.item.id) - parseInt(b.item.id)
                    );
                    setSubProductsIsIncluded(prevState => ([
                        ...subProductIsIncludedArr
                    ]));
                })
            })
            setIsFetchingData(false);
            setSetPrice(setPrice);
        });
        get(`products/search?parentId.equals=${parent_id}&size=50&categoryId.equals=4`).then((res) => {
            const subProductNotIncludedArr = [];
            res.content.map(item => (
                get(`http://bpaws01l:8082/api/image/resource?resourceId=${item.id}&bucket=mobi-c&folder=module-banner`).then(files => {
                    subProductNotIncludedArr.push({item, files});

                    subProductNotIncludedArr.sort(
                        (a, b) => parseInt(a.item.id) - parseInt(b.item.id)
                    );
                    setSubProductsNotIncluded(prevState => ([
                        ...subProductNotIncludedArr
                    ]));
                })
            ))
            setIsFetchingData(false);
        });
        get(`http://bpaws01l:8082/api/image/resource?resourceId=${parent_id}&bucket=mobi-c&folder=parent-products`).then(files => {
            const images = [];
            files.map(file => (
                images.push({
                    original: file.originalImageUrl,
                    thumbnail: file.lowQualityImageUrl,
                })
            ))
            setProductImages(images);
        });
    }, [parent_id]);

    const handleModuleInfo = (id) => {
        get(`http://bpaws01l.embawood.dm:8082/api/image/resource?resourceId=${id}&bucket=mobi-c&folder=module-images`).then(files => {
            const images = [];
            files.map(file => (
                images.push({
                    original: file.originalImageUrl,
                    thumbnail: file.lowQualityImageUrl,
                })
            ))
            setSubProductImages(images);
            showCartHandler();
        });
        get(`products/${id}`).then(res => {
            setSubProductInfo(res);
            console.log("product info", res);
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
                    <SubProductItem
                        key_id={item.item.id}
                        id={item.item.id}
                        name={item.item.name}
                        price={item.item.price}
                        files={item.files}
                        defaultValue={1}
                        parent={item.item.parent.name}
                        onClickHandle = {handleModuleInfo}
                    />
                ))}
            </div>
            <div className="row mt-4">
                <div className="col-12 mb-3">
                    <p className="panel-heading">Dəstə Daxil Olmayan Modullar</p>
                </div>
                {subProductsNotIncluded && subProductsNotIncluded.map((item) => (
                    <SubProductItem
                        key_id={item.item.id}
                        id={item.item.id}
                        name={item.item.name}
                        price={item.item.price}
                        files={item.files}
                        defaultValue={0}
                        onClickHandle = {handleModuleInfo}
                    />
                ))}
            </div>
        </div>
    )
}

export default Product;