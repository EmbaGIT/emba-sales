import {useReducer} from "react";
import CartContext from "./CartContext";
import {toast} from 'react-toastify'

const defaultCartState = {
    items: [{
        parent: 'Alyans yataq dəsti',
        products: [{
            amount: 2,
            discount: 0,
            files: [],
            id: 733,
            name: "Alyans - Yataq - Tumba - Ceviz hareli / Magic blue - 650 x 420 x 520 - MFF",
            price: 125
        }],
    }, {
        parent: 'Nevis yataq dəsti',
        products: [{
            amount: 3,
            discount: 0,
            files: [],
            id: 733,
            name: "Alyans - Yataq - Tumba - Ceviz hareli / Magic blue - 650 x 420 x 520 - MFF",
            price: 125
        }]
    }],
    totalAmount: 0
}

console.log(defaultCartState);

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

        const existingCartItemIndex = state.items.findIndex(
            (item) => item.parent === action.item.parent
        );

        const existingCartItem = state.items[existingCartItemIndex];

        console.log("item already part", state.items[existingCartItemIndex].products);

        let updatedItems;

        if (existingCartItem) {
            const updatedItem = {
                ...existingCartItem,
                amount: existingCartItem.amount + action.item.amount,
            };
            updatedItems = [...state.items];
            updatedItems[existingCartItemIndex] = updatedItem;
        } else {
            updatedItems = state.items.concat(action.item);
        }
        toast.success(<MessageComponent text={`${action.item.name} səbətə əlavə edildi.`}/>, {
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