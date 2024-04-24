import { LeobankForm } from './LeobankForm'
import Modal from '../UI/Modal';

export const LeobankModal = ({
    setLeobankModalIsShown,
    onCloseModal,
    selectedLeobankSale,
    rerender,
    setRerender
}) => {
    return (
        <Modal noPadding onClose={onCloseModal}>
            <div className='card'>
                <div className='list-group-item list-group-item-success'>
                    Leobank kredit yoxlaması
                </div>

                <div className='card-body'>
                    <LeobankForm
                        selectedLeobankSale={selectedLeobankSale}
                        setLeobankModalIsShown={setLeobankModalIsShown}
                        rerender={rerender}
                        setRerender={setRerender}
                    />
                </div>
            </div>
        </Modal>
    )
}
