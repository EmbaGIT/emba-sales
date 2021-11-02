import React from 'react';

const CartContext = React.createContext({
    items: [],
    totalAmount: 0,
    discountAmount: 0,
    totalDiscount: 0,
    addItem: () => {},
    removeItem: () => {},
    discountHandler: () => {},
    clearBasket: () => {},
    updateItem: () => {},
});

export default CartContext;