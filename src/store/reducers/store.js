// src/store/reducers/store.js
import { configureStore } from '@reduxjs/toolkit';
import { productReducer } from './ProductReducer';

import { authReducer } from './authReducer';
import { addressReducer } from './addressReducer';
import { cartReducer } from './cartReducer';
import { orderReducer } from './orderReducer';
import { adminOrderReducer } from './adminOrderReducer';
import orderUserReducer from './orderUserReducer';
import { getStoredAuth } from '../../utils/auth';


const user = getStoredAuth() || [];


const initialState = {
    auth: { user: user },
};

const store = configureStore({
    reducer: {
        products: productReducer,
        auth: authReducer,
        address: addressReducer,
        cart: cartReducer,
        order: orderReducer,
        orderUser: orderUserReducer,
        adminOrders: adminOrderReducer,
    },
    preloadedState: initialState,
});

export default store;

