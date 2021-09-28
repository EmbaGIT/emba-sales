import {useReducer} from "react";
import CartContext from "./CartContext";
import {toast} from 'react-toastify'

const defaultCartState = {
    items: [],
    totalAmount: 0
}

console.log("defaultCartState", defaultCartState);

const MessageComponent = ({text}) => (
    <span style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
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
    if (action.type === "ADD") {
        const updatedTotalAmount = state.totalAmount + action.item.price * action.item.amount;
        const existingParentItemIndex = state.items.findIndex(
            (item) => item.parent === action.item.parent
        );

        const existingParentItem = state.items[existingParentItemIndex];

        let updatedState;
        let updatedItems;

        if(existingParentItem){
            const existingItemIndex = existingParentItem.products.findIndex(item => item.id === action.item.id);
            const existingItem = existingParentItem.products[existingItemIndex];

            if(existingItem){
                const updatedItem={
                    ...existingParentItem.products[existingItemIndex],
                    amount: existingItem.amount + action.item.amount
                }
                updatedItems = {...existingParentItem};
                updatedItems.products[existingItemIndex] = updatedItem;
            }else{
                updatedItems = {...existingParentItem};
                updatedItems.products.push(action.item);
            }
            updatedState = [...state.items];
            updatedState[existingParentItemIndex] = updatedItems;
        }else{
            updatedState = [...state.items];
            updatedState.push({
                parent: action.item.parent,
                products: [action.item]
            })
        }

        /*toast.success(<MessageComponent text={`${action.item.name} səbətə əlavə edildi.`}/>, {
            position: toast.POSITION.TOP_RIGHT,
            toastId: 'success-toast-message',
            autoClose: 1500,
            closeOnClick: true,
        });*/

        return {
            items: updatedState,
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
        dispatchCartAction({type: 'ADD', item: item});
    };

    const removeItemFromCartHandler = (id) => {
        dispatchCartAction({type: 'REMOVE', id: id});
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