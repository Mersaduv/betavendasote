import { useState, useEffect } from 'react'

import { addToCart, showAlert } from '@/store'

import { exsitItem } from '@/utils'

import { useAppDispatch, useAppSelector } from '@/hooks'

import { CartItemActions } from '@/components/cart'
import { ArrowLink } from '@/components/ui'
import { ProductPriceDisplay } from '@/components/product'

import type { IProduct, ICart } from '@/types'

interface Porps {
  product: IProduct
}

const CartOperations: React.FC<Porps> = (props) => {
  // ? Props
  const { product } = props

  // ? Assets
  const dispatch = useAppDispatch()

  // ? Store
  const { cartItems, tempColor, tempSize, tempObjectValue } = useAppSelector((state) => state.cart)

  // ? State
  const [currentItemInCart, setCurrentItemInCart] = useState<ICart | undefined>(undefined)
  const firstStockItemWithPriceOrDiscount = product.stockItems.find(item => item.price > 0 || item.discount > 0) || product.stockItems[0];
  const [currentPrice, setCurrentPrice] = useState(firstStockItemWithPriceOrDiscount?.price ?? 0)
  const [currentDiscount, setCurrentDiscount] = useState(firstStockItemWithPriceOrDiscount?.discount ?? 0)

  // ? Re-Renders
  useEffect(() => {
    const item = exsitItem(cartItems, product.id, tempColor, tempSize, tempObjectValue)
    setCurrentItemInCart(item)

    const selectedStockItem = product.stockItems.find((item) => {
      let matches = true

      if (tempColor && item['رنگ'] !== tempColor.name) {
        matches = false
      }
      if (tempSize && item.sizeId !== tempSize.id) {
        matches = false
      }
      if (tempObjectValue && tempObjectValue.value && !item.featureValueId?.includes(tempObjectValue?.value[0].id)) {
        matches = false
      }

      return matches
    })

    if (selectedStockItem) {
      setCurrentPrice(selectedStockItem.price ?? 0)
      setCurrentDiscount(selectedStockItem.discount ?? 0)
    } else {
      setCurrentPrice(product.stockItems[0]?.price ?? 0)
      setCurrentDiscount(product.stockItems[0]?.discount ?? 0)
    }
  }, [tempColor, tempSize, tempObjectValue, cartItems, product.id, product.stockItems])

  // ? handlers
  const handleAddItem = () => {
    const stockItem = product.stockItems.find((item) => {
      let matches = true

      if (tempColor && item['رنگ'] !== tempColor.name) {
        matches = false
      }
      if (tempSize && item.sizeId !== tempSize.id) {
        matches = false
      }
      if (tempObjectValue && tempObjectValue.value && !item.featureValueId?.includes(tempObjectValue?.value[0].id)) {
        matches = false
      }

      return matches
    })

    if (!stockItem || stockItem.quantity === 0) {
      return dispatch(
        showAlert({
          status: 'error',
          title: 'موجودی این محصول به اتمام رسیده',
        })
      )
    }

    dispatch(
      addToCart({
        productID: product.id,
        name: product.title,
        slug: product.slug,
        price: stockItem.price ?? 0,
        discount: stockItem.discount ?? 0,
        inStock: product.inStock,
        sold: product.sold ?? 0,
        productCode: product.code,
        productCategory: product.parentCategories.category.name,
        color: tempColor,
        size: tempSize,
        features: tempObjectValue,
        img: product.mainImageSrc,
        quantity: 1,
        cancelOrder: null,
      })
    )
  }

  // ? Render(s)
  return (
    <div className="flex items-center md:justify-center justify-between bg-white sm:px-5  md:flex-col-reverse md:gap-y-4  px-3 py-2 border md:border-none shadow-add md:p-0 md:py-3">
      {currentItemInCart ? (
        <div className="flex w-full gap-x-4 md:flex-col md:justify-center md:items-center md:gap-y-4 mt-4">
          <div className="w-44 md:w-1/2 ">
            <CartItemActions item={currentItemInCart} />
          </div>
          <div className="hidden md:block">
            <ArrowLink path="/checkout/cart">مشاهده سبد خرید</ArrowLink>
          </div>
        </div>
      ) : (
        <button onClick={handleAddItem} className="btn text-sm xs:px-12 whitespace-nowrap xs:text-base md:w-1/2 ">
          افزودن به سید خرید{' '}
        </button>
      )}

      <div className="min-w-fit md:flex md:justify-center md:w-full md:self-end">
        <ProductPriceDisplay inStock={product.inStock} discount={currentDiscount} price={currentPrice} singleProduct />
      </div>
    </div>
  )
}

export default CartOperations
