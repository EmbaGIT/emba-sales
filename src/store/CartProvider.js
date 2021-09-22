import {useReducer} from "react";
import CartContext from "./CartContext";
import { toast } from 'react-toastify'

const defaultCartState = {
    items: [],
    totalAmount: 0
}

const MessageComponent = ({ text }) => (
    <span style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
    <span
        style={{
            fontWeight: 500,
            fontSize: 16,
            lineHeight: '24px',
            color: '#FFEDED',
        }}
    >
      {text}
    </span>
  </span>
);

const cartReducer = (state, action) => {
    if(action.type === "ADD"){
        const updatedItems = state.items.concat(action.item);
        const updatedTotalAmount = state.totalAmount + action.item.price * action.item.amount;

        toast.success(<MessageComponent text={`${action.item.name} səbətə əlavə edildi.`} />, {
            position: toast.POSITION.TOP_RIGHT,
            toastId: 'success-toast-message',
            autoClose: 1500,
            closeOnClick: true,
        });

        return {
            items: updatedItems,
            totalAmount: updatedTotalAmount
        }
    }
    return defaultCartState;
}

const CartProvider = (props) => {
    const [cartState, dispatchCartAction] = useReducer(
        cartReducer,
        defaultCartState
    );

    const addItemToCartHandler = (item) => {
        dispatchCartAction({ type: 'ADD', item: item });
    };

    const removeItemFromCartHandler = (id) => {
        dispatchCartAction({ type: 'REMOVE', id: id });
    };

    const cartContext = {
        items: cartState.items,
        totalAmount: cartState.totalAmount,
        addItem: addItemToCartHandler,
        removeItem: removeItemFromCartHandler,
    };

    return (
        <CartContext.Provider value={cartContext}>
            {props.children}
        </CartContext.Provider>
    )

}

export default CartProvider;