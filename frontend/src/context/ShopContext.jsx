import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { apiErrorMessage } from "../utils/apiError"

const GUEST_CART_KEY = 'guestCart'

function readGuestCart() {
    try {
        return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '{}')
    } catch {
        return {}
    }
}

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '$';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [token, setToken] = useState(() => localStorage.getItem('token') || '')
    const [cartItems, setCartItems] = useState(() => localStorage.getItem('token') ? {} : readGuestCart());
    const [cartProducts, setCartProducts] = useState({});
    const [wishlist, setWishlist] = useState([]);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [demoCatalog, setDemoCatalog] = useState(false);
    const mergedRef = useRef(false);
    const navigate = useNavigate();

    const fetchProducts = useCallback(async (params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, value);
            }
        });

        const response = await axios.get(`${backendUrl}/api/product/list?${query}`);
        if (response.data.success) {
            if (typeof response.data.demoCatalog === 'boolean') {
                setDemoCatalog(response.data.demoCatalog);
            }
            return response.data;
        }
        throw new Error(response.data.message || 'Failed to fetch products');
    }, [backendUrl]);

    const fetchProductById = useCallback(async (productId) => {
        const response = await axios.post(`${backendUrl}/api/product/single`, { productId });
        if (response.data.success) {
            if (typeof response.data.demoCatalog === 'boolean') {
                setDemoCatalog(response.data.demoCatalog);
            }
            return response.data.product;
        }
        throw new Error(response.data.message || 'Product not found');
    }, [backendUrl]);

    const loadCartProducts = useCallback(async (items) => {
        const ids = Object.keys(items).filter((id) =>
            Object.values(items[id]).some((qty) => qty > 0)
        );

        if (ids.length === 0) {
            setCartProducts({});
            return;
        }

        try {
            const data = await fetchProducts({ ids: ids.join(',') });
            const map = {};
            data.products.forEach((product) => {
                map[product._id] = product;
            });
            setCartProducts(map);
        } catch (error) {
            console.log(error);
        }
    }, [fetchProducts]);

    const addToCart = async (itemId, size) => {
        if (demoCatalog || String(itemId).startsWith('fake-')) {
            toast.info('Demo products are for browsing only. Switch to your catalog in the admin panel to enable cart.');
            return;
        }
        if (!size) {
            toast.error('Select Product Size');
            return;
        }

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/add', { itemId, size }, { headers: { token } })
            } catch (error) {
                toast.error(apiErrorMessage(error))
            }
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                if (cartItems[items][item] > 0) {
                    totalCount += cartItems[items][item];
                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData)

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers: { token } })
            } catch (error) {
                toast.error(apiErrorMessage(error))
            }
        }
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            const itemInfo = cartProducts[items];
            if (!itemInfo) continue;
            for (const item in cartItems[items]) {
                if (cartItems[items][item] > 0) {
                    totalAmount += itemInfo.price * cartItems[items][item];
                }
            }
        }
        return totalAmount;
    }

    const applyCouponCode = async (code) => {
        try {
            const response = await axios.post(backendUrl + '/api/coupon/validate', {
                code,
                amount: getCartAmount(),
            })
            if (response.data.success) {
                setCouponCode(response.data.couponCode)
                setDiscount(response.data.discount)
                toast.success('Coupon applied')
            }
        } catch (error) {
            setCouponCode('')
            setDiscount(0)
            toast.error(apiErrorMessage(error))
        }
    }

    const clearCoupon = () => {
        setCouponCode('')
        setDiscount(0)
    }

    const loadWishlist = async (authToken) => {
        try {
            const response = await axios.get(backendUrl + '/api/wishlist', { headers: { token: authToken } })
            if (response.data.success) {
                setWishlist(response.data.wishlist || [])
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                console.log(error)
            }
        }
    }

    const toggleWishlist = async (productId) => {
        if (demoCatalog || String(productId).startsWith('fake-')) {
            toast.info('Wishlist is disabled while demo catalog is active.')
            return
        }
        if (!token) {
            toast.error('Login to save items')
            navigate('/login')
            return
        }
        try {
            const response = await axios.post(backendUrl + '/api/wishlist', { productId }, { headers: { token } })
            if (response.data.success) {
                setWishlist(response.data.wishlist || [])
                toast.success(response.data.message)
            }
        } catch (error) {
            toast.error(apiErrorMessage(error))
        }
    }

    const getUserCart = async (authToken) => {
        try {
            const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token: authToken } })
            if (response.data.success) {
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('token')
                setToken('')
                setCartItems(readGuestCart())
                return
            }
            toast.error(apiErrorMessage(error))
        }
    }

    useEffect(() => {
        const loadCatalogMode = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/catalog-mode`);
                if (response.data.success) {
                    setDemoCatalog(Boolean(response.data.useFakeStoreCatalog));
                }
            } catch (error) {
                console.log(error);
            }
        };
        loadCatalogMode();
    }, [backendUrl]);

    useEffect(() => {
        loadCartProducts(cartItems);
    }, [cartItems, loadCartProducts]);

    useEffect(() => {
        if (!token) {
            localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems))
        }
    }, [cartItems, token]);

    useEffect(() => {
        const syncCart = async () => {
            if (!token) {
                mergedRef.current = false
                return
            }

            const guest = readGuestCart()
            const hasGuest = Object.keys(guest).length > 0
            if (hasGuest && !mergedRef.current) {
                mergedRef.current = true
                try {
                    const response = await axios.post(
                        backendUrl + '/api/cart/merge',
                        { cartData: guest },
                        { headers: { token } }
                    )
                    localStorage.removeItem(GUEST_CART_KEY)
                    if (response.data.success) {
                        setCartItems(response.data.cartData)
                        await loadWishlist(token)
                        return
                    }
                } catch (error) {
                    console.log(error)
                }
            }

            await getUserCart(token)
            await loadWishlist(token)
        }

        syncCart()
    }, [token])

    const value = {
        currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, cartProducts, addToCart, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token,
        fetchProducts, fetchProductById,
        wishlist, toggleWishlist,
        couponCode, discount, applyCouponCode, clearCoupon,
        demoCatalog,
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;
