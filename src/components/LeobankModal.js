import { useEffect, useState } from 'react';
import { LeobankForm } from './LeobankForm'
import Modal from '../UI/Modal';
import { post } from '../api/Api';
import { getHost } from '../helpers/host';

export const LeobankModal = ({
    leobankModalIsShown,
    setLeobankModalIsShown,
    onCloseModal,
    selectedLeobankId
}) => {
    const [products, setProducts] = useState([])

    useEffect(() => {
        if (selectedLeobankId) {
            post(`${getHost('sales', 8087)}/api/order/search?id.equals=${selectedLeobankId}`)
                .then(response => {
                    setProducts(
                        response?.content[0]?.goods
                            .map(({ product_price, product_quantity, product_name }) => ({
                                amount: product_price,
                                count: product_quantity,
                                name: product_name
                            }))
                    )
                }).catch(error => console.log(error))
        }
    }, [selectedLeobankId])

    return (
        <Modal noPadding onClose={onCloseModal}>
            <div className='card'>
                <div className='list-group-item list-group-item-success'>
                    Leobank kredit yoxlaması
                </div>

                <div className='card-body'>
                    <LeobankForm products={products} />
                </div>
            </div>
        </Modal>
    )
}
