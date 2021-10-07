import {useReducer} from "react";
import CartContext from "./CartContext";
import {toast} from 'react-toastify';

const defaultCartState = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : {
    items: [],
    totalAmount: 0,
    discountAmount: 0,
    totalDiscount: 0
};

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

const SumItem = (state, action) => {
    return state.totalAmount + action.item.price * action.item.amount;
}

const SumDiscountItem = (state, action) => {
    return parseFloat(state.discountAmount) + (action.item.price * action.item.amount - action.item.discount * action.item.price * action.item.amount / 100);
}

const cartReducer = (state, action) => {
    if (action.type === 'ADD') {
        const updatedTotalAmount = SumItem(state, action);
        const updatedDiscountAmount = SumDiscountItem(state, action);

        console.log(state, action);

        const existingCartItemIndex = state.items.findIndex(
            (item) => item.id === action.item.id
        );
        const existingCartItem = state.items[existingCartItemIndex];
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

        const totalDiscount = parseFloat(100-(updatedDiscountAmount*100/updatedTotalAmount)).toFixed(2);

        localStorage.setItem('cart', JSON.stringify({
            items: updatedItems,
            totalAmount: updatedTotalAmount,
            discountAmount: updatedDiscountAmount,
            totalDiscount: totalDiscount
        }));

        return {
            items: updatedItems,
            totalAmount: updatedTotalAmount,
            discountAmount: updatedDiscountAmount,
            totalDiscount: totalDiscount
        };
    }

    if (action.type === 'REMOVE') {
        const existingCartItemIndex = state.items.findIndex(
            (item) => item.id === action.id
        );
        const existingItem = state.items[existingCartItemIndex];
        const updatedTotalAmount = state.totalAmount - existingItem.price * existingItem.amount;
        const updatedDiscountAmount = parseFloat(state.discountAmount - (existingItem.price * existingItem.amount - existingItem.discount * existingItem.price * existingItem.amount / 100)).toFixed(2);
        const updatedItems = state.items.filter(item => item.id !== action.id);
        const totalDiscount = parseFloat(100-(updatedDiscountAmount*100/updatedTotalAmount)).toFixed(2);

        localStorage.setItem('cart', JSON.stringify({
            items: updatedItems,
            totalAmount: updatedTotalAmount,
            discountAmount: updatedDiscountAmount,
            totalDiscount: totalDiscount
        }));

        console.log({
            items: updatedItems,
            totalAmount: updatedTotalAmount,
            discountAmount: updatedDiscountAmount,
        })

        return {
            items: updatedItems,
            totalAmount: updatedTotalAmount,
            discountAmount: updatedDiscountAmount,
            totalDiscount: totalDiscount
        };
    }


    if (action.type === 'DISCOUNT') {
        let updatedTotalAmount = 0;
        let updatedDiscountAmount = 0;

        action.discount.items.forEach(item => {
            updatedTotalAmount += item.amount * item.price;
        })

        action.discount.items.forEach(item => {
            updatedDiscountAmount += item.amount * item.price - (item.amount * item.price * item.discount / 100);
        });
        const totalDiscount = parseFloat(100 - (updatedDiscountAmount*100/updatedTotalAmount)).toFixed(2);

        localStorage.setItem('cart', JSON.stringify({
            items: action.discount.items,
            totalAmount: updatedTotalAmount,
            discountAmount: updatedDiscountAmount,
            totalDiscount: totalDiscount
        }));

        return {
            items: action.discount.items,
            totalAmount: updatedTotalAmount,
            discountAmount: updatedDiscountAmount,
            totalDiscount: totalDiscount
        };

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

    const discountCartHandler = (discount) => {
        dispatchCartAction({type: 'DISCOUNT', discount: discount});
    };

    const cartContext = {
        items: cartState.items,
        totalAmount: cartState.totalAmount,
        discountAmount: cartState.discountAmount,
        totalDiscount: cartState.totalDiscount,
        addItem: addItemToCartHandler,
        removeItem: removeItemFromCartHandler,
        discountHandler: discountCartHandler,
    };


    return (
        <CartContext.Provider value={cartContext}>
            {props.children}
        </CartContext.Provider>
    )

}

export default CartProvider;

