import { PayloadAction, createSlice, nanoid } from '@reduxjs/toolkit'

import { exsitItem, getTotal } from '@/utils'

import type { ICart, IColorDTO, IObjectValue } from '@/types'
import { SizeDTO } from '@/services/feature/types'

interface CartState {
  cartItems: ICart[]
  totalItems: number
  totalPrice: number
  totalDiscount: number
  tempSize: SizeDTO | null
  tempColor: IColorDTO | null
  tempObjectValue: IObjectValue | null
  isProcessPayment: boolean
  placeOrderId: string
  isGiftWrapped: boolean
}

const getCartItems = (): ICart[] => {
  if (typeof window !== 'undefined') {
    const cartItemsJSON = localStorage.getItem('cartItems')
    if (cartItemsJSON) return JSON.parse(localStorage.getItem('cartItems') as string)
  }
  return [] as ICart[]
}

const setCartItems = (cartItems: ICart[]) => localStorage.setItem('cartItems', JSON.stringify(cartItems))

const getIsProcessPayment = () => {
  if (typeof window !== 'undefined') {
    const isProcessPayment = localStorage.getItem('isProcessPayment')
    return isProcessPayment !== null ? JSON.parse(isProcessPayment) : false
  }
}

const getPlaceOrderId = () => {
  if (typeof window !== 'undefined') {
    const placeOrderId = localStorage.getItem('placeOrderId')
    return placeOrderId !== null ? JSON.parse(placeOrderId) : false
  }
}

const initialState: CartState = {
  cartItems: getCartItems(),
  totalItems: getTotal(getCartItems(), 'quantity'),
  totalPrice: getTotal(getCartItems(), 'price'),
  totalDiscount: getTotal(getCartItems(), 'discount'),
  tempObjectValue: null,
  tempSize: null,
  tempColor: null,
  isProcessPayment: getIsProcessPayment(),
  placeOrderId: getPlaceOrderId(),
  isGiftWrapped: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<ICart, 'itemID'>>) => {
      const { color, size, productID, features } = action.payload

      const isItemExist = exsitItem(state.cartItems, productID, color, size, features)

      if (isItemExist) {
        isItemExist.quantity += 1
        state.totalItems = getTotal(state.cartItems, 'quantity')
        state.totalPrice = getTotal(state.cartItems, 'price')
        state.totalDiscount = getTotal(state.cartItems, 'discount')
        setCartItems(state.cartItems)
      } else {
        state.cartItems.push({ itemID: nanoid(), ...action.payload })
        state.totalItems = getTotal(state.cartItems, 'quantity')
        state.totalPrice = getTotal(state.cartItems, 'price')
        state.totalDiscount = getTotal(state.cartItems, 'discount')
        setCartItems(state.cartItems)
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      const index = state.cartItems.findIndex((item) => item.itemID === action.payload)

      if (index !== -1) {
        state.cartItems.splice(index, 1)
        state.totalItems = getTotal(state.cartItems, 'quantity')
        state.totalPrice = getTotal(state.cartItems, 'price')
        state.totalDiscount = getTotal(state.cartItems, 'discount')
        setCartItems(state.cartItems)
      }
    },

    increase: (state, action: PayloadAction<string>) => {
      state.cartItems.forEach((item) => {
        if (item.itemID === action.payload) item.quantity += 1
      })
      state.totalItems = getTotal(state.cartItems, 'quantity')
      state.totalPrice = getTotal(state.cartItems, 'price')
      state.totalDiscount = getTotal(state.cartItems, 'discount')
      setCartItems(state.cartItems)
    },

    decrease: (state, action: PayloadAction<string>) => {
      state.cartItems.forEach((item) => {
        if (item.itemID === action.payload) item.quantity -= 1
      })
      state.totalItems = getTotal(state.cartItems, 'quantity')
      state.totalPrice = getTotal(state.cartItems, 'price')
      state.totalDiscount = getTotal(state.cartItems, 'discount')
      setCartItems(state.cartItems)
    },

    clearCart: (state) => {
      state.cartItems = []
      state.totalItems = 0
      state.totalPrice = 0
      state.totalDiscount = 0
      localStorage.removeItem('cartItems')
    },

    setTempColor: (state, action: PayloadAction<IColorDTO | null>) => {
      state.tempColor = action.payload
    },

    setTempSize: (state, action: PayloadAction<SizeDTO | null>) => {
      state.tempSize = action.payload
    },
    setTempObjectValue: (state, action: PayloadAction<IObjectValue | null>) => {
      state.tempObjectValue = action.payload
    },

    setIsProcessPayment: (state, action: PayloadAction<{ id: string; isProcessPayment: boolean }>) => {
      const { id, isProcessPayment } = action.payload
      state.placeOrderId = id
      state.isProcessPayment = isProcessPayment
      if (typeof window !== 'undefined') {
        localStorage.setItem('placeOrderId', JSON.stringify(id))
        localStorage.setItem('isProcessPayment', JSON.stringify(isProcessPayment))
      }
    },

    clearIsProcessPayment: (state) => {
      state.placeOrderId = ''
      state.isProcessPayment = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('placeOrderId')
        localStorage.removeItem('isProcessPayment')
      }
    },

    setGiftWrapped: (state, action: PayloadAction<{ isGiftWrapped: boolean }>) => {
      state.isGiftWrapped = action.payload.isGiftWrapped
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  clearCart,
  decrease,
  increase,
  setTempColor,
  setTempSize,
  setTempObjectValue,
  setIsProcessPayment,
  clearIsProcessPayment,
  setGiftWrapped,
} = cartSlice.actions

export default cartSlice.reducer
