import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {get} from "../../api/Api";
import noImage from '../../assets/images/no-image.png';
import Loader from "react-loader-spinner";
import Slider from "react-slick";
import SubProductItem from "./SubProductItem";

const Product = () => {
    const params = useParams();
    const parent_id = params.id;
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [productInfo, setProductInfo] = useState();
    const [productImages, setProductImages] = useState();
    const [subProducts, setSubProducts] = useState();
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };

    useEffect(() => {
        setProductInfo([]);
        setIsFetchingData(true);
        get(`http://bpaws10l:8083/api/products/search?parentId.equals=${parent_id}&size=20`).then((res) => {
            const subProductArr = [];
            res.content.map(item => (
                get(`http://bpaws10l:8082/api/files/resource?resourceId=${item.id}&bucket=mobi-c&folder=module-banner`).then(files => {
                    subProductArr.push({item, files});
                    setSubProducts(prevState => ([
                        ...subProductArr
                    ]));
                })
            ))
            get(`http://bpaws10l:8082/api/files/resource?resourceId=${parent_id}&bucket=mobi-c&folder=parent-products`).then(files => {
                setProductInfo(res);
                setProductImages(files);
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
                    <Slider {...settings}>
                        {productImages.length ? productImages.map((file, index) => (
                            <div key={index}>
                                <img src={file.objectUrl} alt=""/>
                            </div>
                        )) : <div><img src={noImage} alt=""/></div>}
                    </Slider>
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