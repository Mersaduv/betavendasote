// import { truncate } from '@/utils'

// import { Plus, Star } from '@/icons'
// import { ResponsiveImage } from '@/components/ui'
// import {
//   ProductDiscountTag,
//   ProductSpecialOffer,
//   ProductPriceDisplay,
//   ProductStockIndicator,
// } from '@/components/product'

// import type { IProduct } from '@/types'

// interface Props {
//   product: IProduct
//   slide?: boolean
// }

// const ProductCard: React.FC<Props> = (props) => {
//   // ? Props
//   const { product, slide } = props

//   const stockItemWithDiscount = product.stockItems.find((stockItem) => stockItem.discount! > 0)
//   const stockItemWithOutDiscount = product.stockItems.find((stockItem) => stockItem.discount === null)
//   const stockItemPrice = product.stockItems.find( (stockItem) => stockItem.quantity! > 0 && (stockItem.price !== undefined || stockItem.price > 0))
//   const hasStock = product.stockItems.some(
//     (stockItem) => stockItem.quantity! > 0 && (stockItem.price !== undefined || stockItem.price > 0)
//   )
//   console.log(product.stockItems, 'product.stockItems')

//   // ? Render(s)
//   return (
//     <a target="_blank" href={`/products/${product.slug}`} className="block">
//       <article
//         className={`flex flex-col flex-1 items-center justify-center rounded-lg shadow hover:shadow-xl relative`}
//       >
//         <>
//           <ResponsiveImage
//             dimensions="h-[155px] xs:h-[210px] sm:h-[300px] lg:h-[280px] xl:h-[300px] w-full"
//             className="mx-auto relative sm:object-center"
//             src={product.mainImageSrc.imageUrl}
//             blurDataURL={product.mainImageSrc.placeholder}
//             alt={product.title}
//             imageStyles="object-center rounded-t-lg"
//           />
//           <div className="h-full flex flex-col gap-y-4 pt-4 pb-2">
//             <h2 className="text-center">{product.title}</h2>
//             <div className="mt-1.5 flex justify-center gap-x-2 px-2 ">
//               <div>
//                 {stockItemWithDiscount && stockItemWithDiscount?.discount !== null && (
//                   <ProductDiscountTag
//                     price={stockItemWithDiscount.price ?? 0}
//                     discount={stockItemWithDiscount.discount ?? 0}
//                   />
//                 )}
//               </div>
//               {hasStock ? (
//                 <ProductPriceDisplay
//                   inStock={product.inStock}
//                   discount={0}
//                   price={stockItemPrice?.price!}
//                 />
//               ) : (
//                 <div className="text-gray-400 font-semibold mb-1">ناموجود</div>
//               )}
//             </div>
//           </div>
//         </>
//       </article>
//     </a>
//   )
// }

// export default ProductCard

import { truncate } from '@/utils'

import { Plus, Star } from '@/icons'
import { ResponsiveImage } from '@/components/ui'
import {
  ProductDiscountTag,
  ProductSpecialOffer,
  ProductPriceDisplay,
  ProductStockIndicator,
} from '@/components/product'

import type { GetStockItems, IProduct } from '@/types'

interface Props {
  product: IProduct
  slide?: boolean
}

const ProductCard: React.FC<Props> = (props) => {
  const { product, slide } = props

  const filteredItems = product.stockItems.filter((item) => {
    if (item.discount === 0 && item.price > 0 && item.quantity === 0) {
      return true
    } else if (item.discount > 0 && item.price > 0 && item.quantity === 0) {
      return true
    } else if (item.discount === 0 && item.price > 0 && item.quantity > 0) {
      return true
    } else if (item.discount > 0 && item.price > 0 && item.quantity > 0) {
      return true
    }
    return false
  })

  const getStockStatus = (stockItems: GetStockItems[]) => {
    console.log(
      stockItems,
      'stockItems',
      stockItems.every((item) => item.quantity !== 0)
    )

    if (stockItems.every((item) => item.quantity !== 0)) {
      return true
    }
    return false
  }
  const availableItems = product.stockItems.filter((item) => item.price > 0 && item.quantity > 0)
  const isInStock = product.stockItems.some((item) => item.quantity > 0)

  // ? Render(s)
  return (
    <a target="_blank" href={`/products/${product.slug}`} className="block">
      <article className="flex flex-col flex-1 items-center justify-center rounded-lg shadow hover:shadow-xl relative">
        <>
          {/* <ResponsiveImage
            dimensions="w-full"
            className=""
            src={product.mainImageSrc.imageUrl}
            blurDataURL={product.mainImageSrc.placeholder}
            alt={product.title}
            imageStyles="rounded-t-lg  object-cover"
          /> */}
          <img className="rounded-t-lg  object-cover" src={product.mainImageSrc.imageUrl} alt={product.title} />
          <div className="flex flex-col justify-between py-3 h-[150px] w-full">
            <h2 dir="rtl" className="text-right line-clamp-2 overflow-hidden text-ellipsis px-2 text-sm">
              {product.title}
            </h2>
            <div className="mt-1.5 flex justify-center gap-x-2 px-2 relative ">
              <div className="">
                {!isInStock ? (
                  <div className="text-gray-400 font-semibold mb-1">ناموجود</div>
                ) : availableItems.length > 0 ? (
                  <>
                    {availableItems[0].discount > 0 && (
                      <ProductDiscountTag
                        price={availableItems[0].price}
                        discount={availableItems[0].discount}
                        isSlider
                      />
                    )}
                    <ProductPriceDisplay
                      inStock={product.inStock}
                      discount={availableItems[0].discount}
                      price={availableItems[0].price}
                    />
                  </>
                ) : (
                  <div className="text-gray-400 font-semibold mb-1">ناموجود</div>
                )}
              </div>
            </div>
          </div>
        </>
      </article>
    </a>
  )
}

export default ProductCard
