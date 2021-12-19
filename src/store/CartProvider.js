import {useReducer} from "react";
import CartContext from "./CartContext";

const defaultCartState = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : {
    items: [],
    totalAmount: 0,
    discountAmount: 0,
    totalDiscount: 0,
    savedId: ''
};

const cartReducer = (state, action) => {
    if (action.type === 'ADD') {
        let updatedTotalAmount = 0;
        let updatedDiscountAmount = 0;
        let updatedItems;
        const existingCartItemIndex = state.items.findIndex(
            (item) => item.id === action.item.id && item.characteristic_uid === action.item.characteristic_uid
        );
        const existingCartItem = state.items[existingCartItemIndex];
        if (existingCartItem) {
            const updatedItem = {
                ...existingCartItem,
                amount: existingCartItem.amount + action.item.amount,
                discount: 0,
                discount_price: action.item.price
            };
            updatedItems = [...state.items];
            updatedItems[existingCartItemIndex] = updatedItem;
        } else {
            updatedItems = state.items.concat(action.item);
        }

        updatedItems.map(item => {
            updatedTotalAmount += item.price * item.amount
        })

        updatedItems.map(item => {
            updatedDiscountAmount += item.discount_price * item.amount
        });
        const totalDiscount = 100 - (updatedDiscountAmount*100/updatedTotalAmount);

        localStorage.setItem('cart', JSON.stringify({
            items: updatedItems,
            totalAmount: updatedTotalAmount,
            discountAmount: Math.round(updatedDiscountAmount * 100) / 100,
            totalDiscount: Math.round(totalDiscount * 100) / 100,
            savedId: state.savedId
        }));

        return {
            items: updatedItems,
            totalAmount: updatedTotalAmount,
            discountAmount: Math.round(updatedDiscountAmount * 100) / 100,
            totalDiscount: Math.round(totalDiscount * 100) / 100,
            savedId: state.savedId
        };
    }

    if (action.type === 'REMOVE') {
        const existingCartItemIndex = state.items.findIndex(
            (item) => item.id === action.id
        );
        const existingItem = state.items[existingCartItemIndex];
        const updatedTotalAmount = state.totalAmount - existingItem.price * existingItem.amount;
        const updatedDiscountAmount = (state.discountAmount - (existingItem.price * existingItem.amount - existingItem.discount * existingItem.price * existingItem.amount / 100)).toFixed(2);
        const updatedItems = state.items.filter(item => item.id !== action.id);
        const totalDiscount = updatedTotalAmount!==0 ? 100 - (updatedDiscountAmount*100/updatedTotalAmount) : 0;

        localStorage.setItem('cart', JSON.stringify({
            items: updatedItems,
            totalAmount: updatedTotalAmount,
            discountAmount: Math.round(updatedDiscountAmount * 100) / 100,
            totalDiscount: Math.round(totalDiscount * 100) / 100,
            savedId: state.savedId
        }));

        return {
            items: updatedItems,
            totalAmount: updatedTotalAmount,
            discountAmount: Math.round(updatedDiscountAmount * 100) / 100,
            totalDiscount: Math.round(totalDiscount * 100) / 100,
            savedId: state.savedId
        };
    }

    if (action.type === 'DISCOUNT') {
        let updatedTotalAmount = 0;
        let updatedDiscountAmount = 0;
        const updatedItems=[];

        action.discount.items.forEach(item => {
            updatedTotalAmount += item.amount * item.price;
        })

        action.discount.items.forEach(item => {
            updatedDiscountAmount += item.amount * item.price - (item.amount * item.price * item.discount / 100);
            updatedItems.push({
                ...item,
                discount_price: item.price - (item.price * item.discount / 100)
            })
        });
        const totalDiscount = 100 - (updatedDiscountAmount*100/updatedTotalAmount);
        localStorage.setItem('cart', JSON.stringify({
            items: updatedItems,
            totalAmount: updatedTotalAmount,
            discountAmount: Math.round(updatedDiscountAmount * 100) / 100,
            totalDiscount: Math.round(totalDiscount * 100) / 100,
            savedId: state.savedId
        }));

        return {
            items: updatedItems,
            totalAmount: updatedTotalAmount,
            discountAmount: Math.round(updatedDiscountAmount * 100) / 100,
            totalDiscount: Math.round(totalDiscount * 100) / 100,
            savedId: state.savedId
        };
    }

    if (action.type === 'UPDATE') {
        let updatedTotalAmount = 0;
        let updatedDiscountAmount = 0;
        let updatedItems=[];
        const cartItemIndex = state.items.findIndex(
            (item) => item.id === action.id
        );
        const existingCartItem = state.items[cartItemIndex];
        if(existingCartItem){
            const updatedItem = {
                ...existingCartItem,
                amount: action.amount,
                discount: 0,
                discount_price: existingCartItem.price
            };
            updatedItems = [...state.items];
            updatedItems[cartItemIndex] = updatedItem;
        }

        updatedItems.map(item => {
            updatedTotalAmount += item.price * item.amount
        })

        updatedItems.map(item => {
            updatedDiscountAmount += item.discount_price * item.amount
        });

        const totalDiscount = 100 - (updatedDiscountAmount*100/updatedTotalAmount);

        localStorage.setItem('cart', JSON.stringify({
            items: updatedItems,
            totalAmount: updatedTotalAmount,
            discountAmount: Math.round(updatedDiscountAmount * 100) / 100,
            totalDiscount: Math.round(totalDiscount * 100) / 100,
            savedId: state.savedId
        }));

        return {
            items: updatedItems,
            totalAmount: updatedTotalAmount,
            discountAmount: Math.round(updatedDiscountAmount * 100) / 100,
            totalDiscount: Math.round(totalDiscount * 100) / 100,
            savedId: state.savedId
        };
    }

    if(action.type==="PriceChange"){
        if(action.value.value){
            let totalelement=0;
            state.items.forEach(item => {
                totalelement += item.amount
            })
            const change_value=action.value.value/totalelement;
            const updatedItems=[];
            state.items.forEach(item =>(updatedItems.push({
                ...item,
                discount_price: item.discount_price+change_value,
                discount: 100-((item.discount_price+change_value)*100/item.price)
            })));
            const updatedDiscountAmount= state.discountAmount + parseFloat(action.value.value);

            localStorage.setItem('cart', JSON.stringify({
                items: updatedItems,
                totalAmount: state.totalAmount,
                discountAmount: updatedDiscountAmount,
                totalDiscount: state.totalDiscount,
                savedId: state.savedId
            }));

            return {
                items: updatedItems,
                totalAmount: state.totalAmount,
                discountAmount: updatedDiscountAmount,
                totalDiscount: state.totalDiscount,
                savedId: state.savedId
            };
        }
    }

    if(action.type==="CLEAR"){
        localStorage.removeItem('cart');
        return {
            items: [],
            totalAmount: 0,
            discountAmount: 0,
            totalDiscount: 0,
            savedId: ''
        };
    }

    if(action.type==="SavedOrder"){
        const products = [];
        action.value.goods.forEach(good => {
            /*get(`http://bpaws01l:8089/api/image/resource?brand=${brand}&category=${category_id}&color=${currentColor}&bucket=emba-store-images&parent=${parent_id}&product=${id}`).then(file => {
                console.log(file)
            })*/
            products.push({
                amount: good.product_quantity,
                discount: good.product_discount,
                files: '',
                id: good.id,
                name: good.product_name,
                price: good.product_price,
                discount_price: good.product_price - (good.product_price*good.product_discount/100),
                parent : good.parent_name,
                category: good.category_id,
                uid: good.product_uid,
                characteristic_uid: good.product_characteristic_uid,
                characteristic_code: '',
            })
        })

        let updatedTotalAmount = 0;
        let updatedDiscountAmount = 0;
        products.map(item => {
            updatedTotalAmount += item.price * item.amount
        })

        products.map(item => {
            updatedDiscountAmount += item.discount_price * item.amount
        });

        const totalDiscount = 100 - (updatedDiscountAmount*100/updatedTotalAmount);

        localStorage.setItem('cart', JSON.stringify({
            items: products,
            totalAmount: updatedTotalAmount,
            discountAmount: Math.round(updatedDiscountAmount * 100) / 100,
            totalDiscount: Math.round(totalDiscount * 100) / 100,
            savedId: action.value.id
        }));

        return {
            items: products,
            totalAmount: updatedTotalAmount,
            discountAmount: Math.round(updatedDiscountAmount * 100) / 100,
            totalDiscount: Math.round(totalDiscount * 100) / 100,
            savedId: action.value.id
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

    const clearCartHandler = () => {
        dispatchCartAction({type: 'CLEAR'});
    };

    const discountCartHandler = (discount) => {
        dispatchCartAction({type: 'DISCOUNT', discount: discount});
    };


    const updateCartHandler = (amount, id) => {
        dispatchCartAction({type: 'UPDATE', amount, id});
    };

    const priceChangeHandler = (value) => {
        dispatchCartAction({type: 'PriceChange', value: value});
    }

    const updateSavedOrderHandler = (value) => {
        dispatchCartAction({type: 'SavedOrder', value: value});
    }

    const cartContext = {
        items: cartState.items,
        totalAmount: cartState.totalAmount,
        discountAmount: cartState.discountAmount,
        totalDiscount: cartState.totalDiscount,
        savedId: cartState.savedId,
        addItem: addItemToCartHandler,
        removeItem: removeItemFromCartHandler,
        clearBasket: clearCartHandler,
        discountHandler: discountCartHandler,
        updateItem: updateCartHandler,
        updateSavedOrder: updateSavedOrderHandler,
        checkoutPriceChange: priceChangeHandler,
    };


    return (
        <CartContext.Provider value={cartContext}>
            {props.children}
        </CartContext.Provider>
    )

}

export default CartProvider;


