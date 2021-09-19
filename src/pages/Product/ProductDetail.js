import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {get} from "../../api/Api";
import noImage from '../../assets/images/no-image.png';
import Loader from "react-loader-spinner";
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import SubProductItem from "./SubProductItem";

const Product = () => {
    const params = useParams();
    const parent_id = params.id;
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [productInfo, setProductInfo] = useState();
    const [productImages, setProductImages] = useState();
    const [subProducts, setSubProducts] = useState();

    useEffect(() => {
        setProductInfo([]);
        setIsFetchingData(true);
        get(`http://bpaws10l.embawood.dm:8083/api/products/search?parentId.equals=${parent_id}&size=20`).then((res) => {
            const subProductArr = [];
            res.content.map(item => (
                get(`http://bpaws10l.embawood.dm:8082/api/files/resource?resourceId=${item.id}&bucket=mobi-c-test&folder=module-banner`).then(files => {
                    subProductArr.push({item, files});
                    setSubProducts(prevState => ([
                        ...subProductArr
                    ]));
                })
            ))
            get(`http://bpaws10l.embawood.dm:8082/api/files/resource?resourceId=${parent_id}&bucket=mobi-c-test&folder=parent-products`).then(files => {
                setProductInfo(res);
                const images = [];
                files.map(file => (
                    images.push({
                        original: file.objectUrl,
                        thumbnail: file.objectUrl,
                    })
                ))

                setProductImages(images);
                setIsFetchingData(false);
            });
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
                    {productImages.length ?
                        <ImageGallery items={productImages}/>
                        : <img src={noImage} className="w-100"/>
                    }
                </div>
                <div className="col-lg-5">
                    {productInfo &&
                    <>
                        <div className="d-flex">
                            <h1 className="product-name">{productInfo.content[0].parent.name}</h1>
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
                {subProducts && subProducts.map((item) => (
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