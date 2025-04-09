import Link from 'next/link'
import { useGetProductsQuery } from '@/services'

import { ProductDiscountTag, ProductPriceDisplay } from '@/components/product'
import { Button, ResponsiveImage } from '@/components/ui'

import type { GetStockItems, ICategory, IProduct } from '@/types'
import { useAppSelector } from '@/hooks'
import dynamic from 'next/dynamic'
import 'owl.carousel/dist/assets/owl.carousel.css'
import 'owl.carousel/dist/assets/owl.theme.default.css'
interface Props {
  currentCategory?: ICategory
  products: IProduct[]
  isFetching: boolean
}
const OwlCarousel = dynamic(() => import('react-owl-carousel'), {
  ssr: false,
})

const RecentVisitedSlider: React.FC<Props> = (props) => {
  const { currentCategory, products, isFetching } = props
  const { generalSetting } = useAppSelector((state) => state.design)

  const carouselOptions = {
    margin: 10,
    nav: true,
    startPosition: products ? products.length - 1 : 0,
    responsive: {
      0: {
        items: 2,
      },
      640: {
        items: 1,
      },
      768: {
        items: 2,
      },
      950: {
        items: 3,
      },
      1200: {
        items: 4,
      },
      1500: {
        items: 5,
      },
    },
    navText: [
      `<button class="custom-prev"><img className='h-3 w-3' src='/icons/left.png' alt="left" /></button>`,
      `<button class="custom-next"><img className='h-3 w-3' src='/icons/right.png' alt="right" /></button>`,
    ],
  }

  if (isFetching) {
    return <div>Loading...</div>
  }
  console.log(products, 'product -- product')

  return (
    <>
      {/**************** There is a responsive issue here, which is why duplicate code was created *****************/}
      <div className="new-products-slider-containers hidden sm:flex relative w-full ">
        <OwlCarousel
          className="new-products-slider owl-carousel owl-theme d-inline-block owl-loaded owl-drag"
          {...carouselOptions}
          dir="ltr"
        >
          {[...products]
            .sort((a, b) => {
              const dateA = a.created ? new Date(a.created).getTime() : 0
              const dateB = b.created ? new Date(b.created).getTime() : 0
              return dateA - dateB
            })
            .map((product) => {
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
                if (stockItems.every((item) => item.quantity !== 0)) {
                  return true
                }
                return false
              }
              const availableItems = product.stockItems.filter((item) => item.price > 0 && item.quantity > 0)
            const isInStock = product.stockItems.some((item) => item.quantity > 0)

              return (
                <div
                  key={product.id}
                  className="w-[150px] sm:w-[200px] z-50 shadow-item2 rounded-lg mb-3 bg-white h-[328px]"
                >
                  <div className="h-slider">
                    <Link href={`/products/${product.slug}`}>
                      <ResponsiveImage
                        dimensions="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] lg:w-[200px] lg:h-[200px]"
                        className="mx-auto relative"
                        src={product.mainImageSrc.imageUrl}
                        blurDataURL={product.mainImageSrc.placeholder}
                        alt={product.title}
                        imageStyles="object-center rounded-t-lg"
                      />
                      <div className="flex flex-col justify-between gap-y-1 py-3 h-[130px] ">
                        <h2 dir="rtl" className="text-right line-clamp-2 overflow-hidden text-ellipsis px-2 text-sm">
                          {product.title}
                        </h2>
                        <div className="mt-1.5 flex justify-center gap-x-2 px-2 relative">
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
                          {/* <div className="">
                          {filteredItems[0].discount > 0 && (
                            <ProductDiscountTag
                              price={filteredItems[0].price}
                              discount={filteredItems[0].discount}
                              isSlider
                            />
                          )}
                        </div>
                        <ProductPriceDisplay
                          inStock={product.inStock}
                          discount={filteredItems[0].discount}
                          price={filteredItems[0].price}
                          isSlider
                        /> */}
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              )
            })}
        </OwlCarousel>
      </div>

      <div className="new-products-slider-containers flex sm:hidden relative w-full ">
        <OwlCarousel
          className="new-products-slider owl-carousel owl-theme d-inline-block owl-loaded owl-drag"
          {...carouselOptions}
          dir="ltr"
        >
          {products?.map((product) => {
            const stockItemWithDiscount = product.stockItems.find((stockItem) => stockItem.discount! > 0)
            const stockItemWithOutDiscount = product.stockItems.find((stockItem) => stockItem.discount === 0)

            return (
              <div
                key={product.id}
                className="w-[150px] sm:w-[200px] z-50 shadow-item2 rounded-lg mb-3 bg-white h-[300px]"
              >
                <div className="h-slider">
                  <Link href={`/products/${product.slug}`}>
                    <ResponsiveImage
                      dimensions="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] lg:w-[200px] lg:h-[200px]"
                      className="mx-auto relative"
                      src={product.mainImageSrc.imageUrl}
                      blurDataURL={product.mainImageSrc.placeholder}
                      alt={product.title}
                      imageStyles="object-center rounded-t-lg"
                    />
                    <div className="flex flex-col justify-between py-3 h-[150px] ">
                      <h2 dir="rtl" className="text-right line-clamp-2 overflow-hidden text-ellipsis px-2 text-sm">
                        {product.title}
                      </h2>
                      <div className="mt-1.5 flex justify-center gap-x-2 px-2 relative">
                        <div className="">
                          {stockItemWithOutDiscount === undefined && (
                            <ProductDiscountTag
                              price={stockItemWithDiscount?.price ?? 0}
                              discount={stockItemWithDiscount?.discount ?? 0}
                              isSlider
                            />
                          )}
                        </div>
                        <ProductPriceDisplay
                          inStock={product.inStock}
                          discount={stockItemWithDiscount?.discount || 0}
                          price={
                            stockItemWithDiscount?.discount === undefined
                              ? stockItemWithOutDiscount?.price!
                              : stockItemWithDiscount?.price ?? 0
                          }
                        />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            )
          })}

          <div>
            <div className="mt-10 flex justify-center">
              <img className="w-[120px] xs2:w-[180px] static-img" src="/images/NEW.webp" alt="offer" />
            </div>
            <p className="text-gray-500 font-normal text-md w-full text-center my-4 mb-5">
              بازدید های اخیر رو اینجا ببین
            </p>
            <div className="w-full sm:flex justify-center hidden">
              {/* <Link href={`/products?sortBy=Created`}>
                <Button className="bg-red-500 hover:bg-red-400 rounded-lg py-2 px-8 text-white">نمایش همه</Button>
              </Link> */}
            </div>
          </div>
        </OwlCarousel>
      </div>
    </>
  )
}

export default RecentVisitedSlider
