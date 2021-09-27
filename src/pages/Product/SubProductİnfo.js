import Modal from '../../UI/Modal';
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import noImage from "../../assets/images/no-image.png";
import React from "react";

const SubProductInfo = (props) => {
    return (
        <Modal onClose={props.onClose}>
            <div className="row">
                <div className="col-lg-6">
                    {props.images?.length ?
                        <ImageGallery items={props.images} showFullscreenButton={false} showPlayButton={false}/>
                        : <img src={noImage} className="w-100"/>
                    }
                </div>
                <div className="col-lg-6">
                    <table className="table sub-product-info-table">
                        <tbody>
                        {props.info?.attributes && props.info?.attributes.map((info, index) => (
                            <tr key={info.id}>
                                <td><strong>{info.groups.name}</strong></td>
                                <td>{info.name}</td>
                                <td></td>
                            </tr>
                        ))}
                        {props.info?.characteristics && props.info?.characteristics.map((info, index) => (
                            <tr key={info.id}>
                                <td><strong>{info.name}</strong></td>
                                <td>{info.code}</td>
                                <td>{info.price} AZN</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="d-flex justify-content-end mt-2">
                <div className="btn btn-primary" onClick={props.onClose}>Bağla</div>
            </div>
        </Modal>
    );
};

export default SubProductInfo;