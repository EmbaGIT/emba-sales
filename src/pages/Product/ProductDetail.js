import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {get} from "../../api/Api";
import noImage from '../../assets/images/no-image.png';
import Loader from "react-loader-spinner";
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import SubProductItem from "./SubProductItem";
import {useQuery} from "../../hooks/useQuery";

const Product = () => {
    const params = useParams();
    let query = useQuery();
    const parent_id = params.id;
    const parent_name = query.get("parentName");
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [productName, setProductName] = useState(parent_name);
    const [productImages, setProductImages] = useState();
    const [subProductsIsIncluded, setSubProductsIsIncluded] = useState();
    const [subProductsNotIncluded, setSubProductsNotIncluded] = useState();

    useEffect(() => {
        setIsFetchingData(true);
        get(`products/search?parentId.equals=${parent_id}&size=50&categoryId.equals=1`).then((res) => {
            const subProductIsIncludedArr = [];
            res.content.map(item => (
                get(`http://bpaws01l:8082/api/files/resource?resourceId=${item.id}&bucket=mobi-c&folder=module-banner`).then(files => {
                    subProductIsIncludedArr.push({item, files});
                    setSubProductsIsIncluded(prevState => ([
                        ...subProductIsIncludedArr
                    ]));
                })
            ))
            setIsFetchingData(false);
        });
        get(`products/search?parentId.equals=${parent_id}&size=50&categoryId.equals=4`).then((res) => {
            const subProductArr = [];
            res.content.map(item => (
                get(`http://bpaws01l:8082/api/files/resource?resourceId=${item.id}&bucket=mobi-c&folder=module-banner`).then(files => {
                    subProductArr.push({item, files});
                    setSubProductsNotIncluded(prevState => ([
                        ...subProductArr
                    ]));
                })
            ))
            setIsFetchingData(false);
        });
        get(`http://bpaws01l:8082/api/files/resource?resourceId=${parent_id}&bucket=mobi-c&folder=parent-products`).then(files => {
            const images = [];
            files.map(file => (
                images.push({
                    original: file.objectUrl,
                    thumbnail: file.objectUrl,
                })
            ))
            setProductImages(images);
        });
    }, [parent_id]);


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
                    {productName &&
                    <>
                        <div className="d-flex">
                            <h1 className="product-name">{productName}</h1>
                            <div className="ms-3"><i className="far fa-heart"/></div>
                        </div>
                        <div className="product-price-box mt-2">
                            <div className="d-flex align-items-center product-info-wrapper justify-content-between">
                                <div className="price-block">
                                        <span className="product-price-current">
                                            <span>311</span> AZN
                                        </span>
                                </div>
                            </div>
                        </div>
                    </>
                    }
                </div>
            </div>
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
                    />
                ))}
            </div>
            <div className="row mt-4">
                <div className="col-12 mb-3">
                    <p className="panel-heading">Dəst Daxil Olmayan Modullar</p>
                </div>
                {subProductsNotIncluded && subProductsNotIncluded.map((item) => (
                    <SubProductItem
                        key_id={item.item.id}
                        id={item.item.id}
                        name={item.item.name}
                        price={item.item.price}
                        files={item.files}
                    />
                ))}
            </div>
        </div>
    )
}

export default Product;