import React, {useContext, useEffect, useState} from 'react';
import {Link, useParams} from "react-router-dom";
import {get, post} from "../../api/Api";
import noImage from '../../assets/images/no-image.png';
import Loader from "react-loader-spinner";
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import SubProductItem from "./SubProductItem";
import SubProductInfo from "./SubProductInfo";
import {useQuery} from "../../hooks/useQuery";
import AuthContext from "../../store/AuthContext";
import { getHost } from "../../helpers/host";
import {Multiselect} from "multiselect-react-dropdown";

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
    const [productImages, setProductImages] = useState([]);
    const [subProductImages, setSubProductImages] = useState();
    const [subProductsIsIncluded, setSubProductsIsIncluded] = useState();
    const [subProductsNotIncluded, setSubProductsNotIncluded] = useState();
    const [subProductInfo, setSubProductInfo] = useState([]);
    const [cartIsShown, setCartIsShown] = useState(false);
    const [allOptions, setAllOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([])

    const showCartHandler = () => {
        setCartIsShown(true);
    };

    const hideCartHandler = () => {
        setCartIsShown(false);
    };

    function getProductStock(uid) {
        return post(`${getHost('sales', 8087)}/api/inventory`, {
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
            return get(`${getHost('files', 8089)}/api/image/resource?brand=${brand}&color=${currentColor}&category=${category_id}&bucket=emba-store-images&parent=${parent_id}&product=${id}&isBanner=true`)
        }
        return get(`${getHost('files', 8089)}/api/image/resource?brand=${brand}&category=${category_id}&bucket=emba-store-images&parent=${parent_id}&product=${id}&isBanner=true`);
    }

    function getCharacteristics(id) {
        return get(`products/${id}`);
    }

    const subProducts = (products, listType) => {
        const subProductIncludedArr = [];
        let  totalSetPrice=0;

        const mapProduct = async () => {
            const promises = products.map(async item => {
                return listType === "subProductsIsIncluded" && await get(`/v2/products/price/${item.id}`);
            })
            const priceList = await Promise.all(promises);
            priceList.forEach(price => {
                totalSetPrice += price;
            })
            setSetPrice(totalSetPrice);
        }
        mapProduct();

        products.map(async item => {
            const items = [];
            const stock = [];
            const files = [];
            const characteristic = [];
            await Promise.all([getProductStock(item.uid), getProductFiles(item.id), getCharacteristics(item.id)])
                .then(function (results) {
                    items.push(item);
                    stock.push(...results[0]);
                    files.push(...results[1]);
                    characteristic.push(...results[2].characteristics)
                    subProductIncludedArr.push({
                        id: item.id,
                        items,
                        stock,
                        files,
                        characteristic
                    });
                    subProductIncludedArr.sort(
                        (a, b) => parseInt(a.id) - parseInt(b.id)
                    );
                    listType === "subProductsIsIncluded" ? setSubProductsIsIncluded(prevState => ([
                        ...subProductIncludedArr
                    ])) : setSubProductsNotIncluded(prevState => ([...subProductIncludedArr]))
                });
        })
    }

    useEffect(() => {
        setIsFetchingData(true);
        setProductColor(currentColor);
        setSubProductsIsIncluded([]);
        setSubProductsNotIncluded([]);
        const images = [];

        get(`/v2/parents/colors/category/${category_id}/parent/${parent_id}?brand=${brand}`).then(colors => {
            setProductInfo(prevstate => ({
                ...prevstate,
                colors
            }));
            if(colors.length){
                get(`/v2/products/state/category/${category_id}/parent/${parent_id}/color/${currentColor}?brand=${brand}&state=Deste_Daxildir`).then(products => {
                    subProducts(products, "subProductsIsIncluded");
                    get(`${getHost('files', 8089)}/api/image/resource?brand=${brand}&bucket=emba-store-images&category=${category_id}&color=${currentColor}&parent=${parent_id}`).then(files => {
                        files.map(file => {
                            return (
                                images.push({
                                    original: file.originalImageUrl,
                                    thumbnail: file.lowQualityImageUrl,
                                })
                            )
                        })
                        setProductImages(images);
                    })
                })
                get(`/v2/products/state/category/${category_id}/parent/${parent_id}/color/${currentColor}?brand=${brand}&state=Deste_Daxil_Deyil`).then(products => {
                    subProducts(products, "subProductsNotIncluded");
                })
                setIsFetchingData(false);
            }else{
                get(`/v2/products/state/category/${category_id}/parent/${parent_id}?brand=${brand}&state=Deste_Daxildir`).then(products => {
                    subProducts(products, "subProductsIsIncluded");
                    get(`${getHost('files', 8089)}/api/image/resource?brand=${brand}&bucket=emba-store-images&category=${category_id}&parent=${parent_id}`).then(files => {
                        files.map(file => {
                            return (
                                images.push({
                                    original: file.originalImageUrl,
                                    thumbnail: file.lowQualityImageUrl,
                                })
                            )
                        })
                        setProductImages(images);
                    })
                })
                get(`/v2/products/state/category/${category_id}/parent/${parent_id}?brand=${brand}&state=Deste_Daxil_Deyil`).then(products => {
                    subProducts(products, "subProductsNotIncluded");
                })
                setIsFetchingData(false);
            }
        })
    }, [parent_id, productColor]);

    useEffect(() => {
        Promise
            .all([
                get(`/v2/products/state/category/168/parent/209?brand=NONbrand&state=Deste_Daxildir`),
                get(`/v2/products/state/category/168/parent/209?brand=NONbrand&state=Deste_Daxil_Deyil`),
                get(`/v2/products/state/category/168/parent/209?brand=Embawood&state=Deste_Daxil_Deyil`),
                get(`/api/v2/products/state/category/178/parent/990?brand=NONbrand&state=Deste_Daxildir`),
            ])
            .then(promises => {
                promises.map((promise, i) => {
                    return promise.map(p => {
                        Promise.all([
                            get(`/products/${p.id}`), getProductStock(p.uid)
                        ]).then(res => {
                            setAllOptions(prev => [
                                ...prev,
                                {
                                    cat: i === 0 ? 'Dəstə Daxildir' : 'Dəstə Daxil Deyil',
                                    ...res[0],
                                    ...res[1],
                                    ...p,
                                    key: p.name
                                }
                            ])
                        })
                    })
                })
            })
            .catch(err => console.log(err));
    }, [])

    const optionSelected = (options, selectedItem) => {
        setSelectedOptions(prev => [...prev, selectedItem]);
    }

    const removeSelectedItem = (keptItems) => {
        setSelectedOptions([...keptItems]);
    }

    const handleModuleInfo = (id) => {
        const images = [];
        currentColor && get(`${getHost('files', 8089)}/api/image/resource?brand=${brand}&category=${category_id}&color=${currentColor}&bucket=emba-store-images&parent=${parent_id}&product=${id}`).then(files => {
            files.map(file => (
                images.push({
                    original: file.originalImageUrl,
                    thumbnail: file.lowQualityImageUrl,
                })
            ));
            setSubProductImages(images);
            showCartHandler();
        });
        !currentColor && get(`${getHost('files', 8089)}/api/image/resource?brand=${brand}&category=${category_id}&bucket=emba-store-images&parent=${parent_id}&product=${id}`).then(files => {
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
                            {
                                productInfo.name ? <div className="d-flex">
                                    <h1 className="product-name">{productInfo.name}</h1>
                                </div> : null
                            }
                            <div className="product-price-box">
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
                            {parseInt(category_id) === 168 ? <div>
                                <div>
                                    <Multiselect
                                        displayValue="key"
                                        groupBy="cat"
                                        onKeyPressFn={function noRefCheck() {
                                        }}
                                        onSearch={function noRefCheck() {
                                        }}
                                        onRemove={function noRefCheck(keptItems) {
                                            removeSelectedItem(keptItems);
                                        }}
                                        onSelect={function noRefCheck(options, selectedItem) {
                                            optionSelected(options, selectedItem);
                                        }}
                                        options={allOptions}
                                        showCheckbox
                                        placeholder='Çarpayı içi seçin...'
                                    />
                                </div>

                                {selectedOptions.length ? <div className='selected-options'>
                                    {selectedOptions.map(item => (
                                        <SubProductItem
                                            key={item.id}
                                            id={item.id}
                                            uid={item.uid}
                                            name={item.name}
                                            price={item.price}
                                            files={item.files || []}
                                            characteristics={item.characteristics}
                                            defaultValue={1}
                                            parent={item.parentName}
                                            parent_id={209}
                                            color_id={currentColor}
                                            brand={'NONbrand'}
                                            category_id={category_id}
                                            stock={item[0].stock}
                                            onClickHandle={handleModuleInfo}
                                            fw={true}
                                        />
                                    ))}</div> : <p className='mt-4'>Çarpayı içi seçilməyib.</p>}
                            </div> : null}
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
                        key={item.items[0].id}
                        id={item.items[0].id}
                        uid={item.items[0].uid}
                        name={item.items[0].name}
                        price={item.items[0].price}
                        files={item.files}
                        characteristics={item.characteristic}
                        defaultValue={1}
                        parent={item.items[0].parentName}
                        parent_id={parent_id}
                        color_id={currentColor}
                        brand={brand}
                        category_id={category_id}
                        stock={item.stock[0].stock}
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
                                    id={item.items[0].id}
                                    uid={item.items[0].uid}
                                    name={item.items[0].name}
                                    price={item.items[0].price}
                                    files={item.files}
                                    characteristics={item.characteristic}
                                    defaultValue={1}
                                    parent={item.items[0].parentName}
                                    parent_id={parent_id}
                                    color_id={currentColor}
                                    brand={brand}
                                    category_id={category_id}
                                    stock={item.stock[0].stock}
                                    onClickHandle={handleModuleInfo}
                    />
                ))}
            </div>
        </div>
    )
}

export default Product;