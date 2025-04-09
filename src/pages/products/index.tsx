import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { useGetProductsQuery, useGetSingleCategoryQuery } from '@/services'

import { EmptyCustomList } from '@/components/emptyList'
import { ClientLayout } from '@/components/Layouts'
import {
  ProductSubCategoriesList,
  ProductCard,
  ProductFilterControls,
  ProductSort,
  ProductBreadcrumb,
} from '@/components/product'
import { DataStateDisplay, MetaTags } from '@/components/shared'
import { ProductSkeleton } from '@/components/skeleton'
import { Pagination } from '@/components/navigation'
import { FilterModal } from '@/components/modals'

import type { NextPage } from 'next'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { useAppSelector } from '@/hooks'
import { useEffect, useState } from 'react'
import { CategoryWithAllParents, ICategory } from '@/types'
import { BestSeller, DiscountSlider } from '@/components/sliders'
import Link from 'next/link'
import { Button } from '@/components/ui'

const ProductsHome: NextPage = () => {
  // ? Assets
  const { query, events } = useRouter()
  const category = query?.categorySlug?.toString() ?? ''
  const categoryId = query?.categoryId?.toString() ?? undefined
  const brands = typeof query.brands === 'string' ? query.brands.split(',') : undefined
  const sort = query?.sort?.toString() ?? 1
  const { generalSetting } = useAppSelector((state) => state.design)
  // ? Querirs
  //*    Get Products Data
  const { data, ...productsQueryProps } = useGetProductsQuery({ ...query, sort: sort, isActive: true, isClient: true })

  const { data: singleCategoryData, refetch: refetchSingleCategoryData } = useGetSingleCategoryQuery({
    id: categoryId,
  })
  const { products: discountProductsData, isFetching: isFetchingDiscount } = useGetProductsQuery(
    {
      sortBy: 'Discount',
      inStock: '1',
      pageSize: 15,
      discount: true,
      isActive: true,
      // sortBy: 'LastUpdated',
      // sort: "desc",
      // inStock: '1',
      isClient: true,
    },
    {
      selectFromResult: ({ data, isFetching }) => ({
        products: data?.data?.pagination.data,
        isFetching,
      }),
    }
  )

  const { products: bestSellingProductsData, isFetching: isFetchingBestSelling } = useGetProductsQuery(
    {
      bestSelling: true,
      inStock: '1',
      pageSize: 30,
      isActive: true,
      isClient: true,
    },
    {
      selectFromResult: ({ data, isFetching }) => ({
        products: data?.data?.pagination.data,
        isFetching,
      }),
    }
  )
  // ? States
  const [slugData, setSlugData] = useState<CategoryWithAllParents | null>(null)

  useEffect(() => {
    if (singleCategoryData && singleCategoryData.data) {
      console.log(singleCategoryData, 'singleCategoryData')

      setSlugData({
        category: singleCategoryData.data,
        parentCategories: singleCategoryData.data?.parentCategories ?? [],
      })
    }
  }, [refetchSingleCategoryData])

  useEffect(() => {
    events.on('routeChangeComplete', refetchSingleCategoryData)

    return () => {
      events.off('routeChangeComplete', refetchSingleCategoryData)
    }
  }, [events, refetchSingleCategoryData])
  console.log(data?.data?.pagination.data, 'data?.data?.pagination.data')

  // ? Render(s)
  return (
    <>
      <MetaTags
        title={generalSetting?.title + ' | ' + 'فروشگاه' || 'فروشگاه اینترنتی'}
        description={generalSetting?.shortIntroduction || 'توضیحاتی فروشگاه اینترنتی'}
        keywords={generalSetting?.googleTags || ' اینترنتی, فروشگاه'}
      />
      <ClientLayout>
        <main className="lg:container overflow-y-auto lg:max-w-[1900px] lg:px-3 xl:mt-10">
          <ProductSubCategoriesList category={category} />

          <div className="px-1 lg:flex lg:gap-x-0 xl:gap-x-3">
            {/* incorrect  */}
            {!productsQueryProps.isLoading && (
              <aside className="hidden lg:static lg:top-40 lg:mt-6 lg:block lg:h-fit max-w-md w-[40%] lg:rounded-md lg:border-gray-200 lg:px-3 lg:py-4 ">
                <ProductFilterControls
                  mainMaxPrice={data?.data?.mainMaxPrice}
                  mainMinPrice={data?.data?.mainMinPrice}
                />
              </aside>
            )}
            <div id="_products" className="mt-3 w-full p-4 ">
              {/* Filters & Sort */}
              <div className=" divide-gray-300/90">
                <div className="flex gap-x-3 py-2 flex-col">
                  <div className="w-full lg:flex flex-col hidden">
                    <div className="mb-6 text-gray-400 text-sm -mt-2 md:-mt-0 md:text-lg md:text-gray-800 flex">
                      دسته بندی محصولات :
                      {singleCategoryData &&
                      singleCategoryData?.data !== undefined &&
                      singleCategoryData?.data !== null ? (
                        <div className="flex items-center">
                          <ProductBreadcrumb categoryLevelProductList={singleCategoryData?.data} isAdmin />
                        </div>
                      ) : null}
                      {/* <span className="text-[#00c3e1] md:font-bold">{generalSetting?.title}</span> */}
                    </div>
                    {/* correct  */}
                    <ProductSort />
                  </div>
                  <div className="block lg:hidden mt-4">
                    {/* incorrect  */}
                    {/* {!productsQueryProps.isLoading && (
                      <FilterModal mainMaxPrice={data?.data?.mainMaxPrice} mainMinPrice={data?.data?.mainMinPrice} />
                    )} */}
                  </div>
                </div>

                <div className="flex justify-end py-1 text-end">
                  <span className="farsi-digits">{digitsEnToFa(data?.data?.productsLength ?? 0)} کالا</span>
                </div>
              </div>

              <DataStateDisplay
                {...productsQueryProps}
                dataLength={data?.data?.productsLength ? data.data.productsLength : 0}
                loadingComponent={<ProductSkeleton />}
                emptyComponent={<EmptyCustomList />}
              >
                {data && data.data && data.data.pagination.data && data.data.pagination.data.length > 0 && (
                  <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  gap-8">
                    {data?.data?.pagination.data!.map((item) => (
                      <ProductCard product={item} key={item.id} />
                    ))}
                  </section>
                )}
              </DataStateDisplay>
            </div>
          </div>

          {data && data.data?.productsLength! > 5 && (
            <div className="mx-auto py-4 lg:max-w-5xl">
              <Pagination pagination={data?.data?.pagination!} section="_products" client />
            </div>
          )}
        </main>
        {/* //  discount slider */}
        {discountProductsData && discountProductsData.length > 0 && (
          <div className="pt-28 sm:pt-0 relative">
            <hr className="pb-10 mx-8 border-t-2 mt-28" />
            <div className="w-full block text-center px-3 line-clamp-2 overflow-hidden text-ellipsis  sm:hidden whitespace-nowrap -mt-20 text-lg text-gray-400 ">
              تخفیف های {generalSetting?.title}
            </div>
            <div className="flex w-full bg-[#dcb6db] relative h-[340px] sm:h-[275px] mt-28">
              <div className="hidden w-[38%] sm:block md:w-[20%]">
                <div className="hidden sm:block h-[72px]">
                  <div className=" line-clamp-2 overflow-hidden text-ellipsis text-center -mt-20 text-lg text-gray-400  px-3 w-full">
                    تخفیف های {generalSetting?.title}
                  </div>
                </div>
                <div className="mt-10 flex justify-center">
                  <img className="w-[220px]" src="/images/Offer.webp" alt="offer" />
                </div>
                <p className="text-gray-500 font-normal text-md w-full text-center my-4 mb-5">
                  تخفیف های امروز رو از دست نده
                </p>
                <div className="w-full  sm:flex justify-center hidden">
                  <Link href={`/products?sortBy=Discount&discount=true`}>
                    <Button className="bg-red-500 hover:bg-red-400 rounded-lg py-2 px-8 text-white">نمایش همه</Button>
                  </Link>
                </div>
              </div>
              <div className="w-[100%] sm:w-[62%] md:w-[80%] -mt-20">
                <DiscountSlider isFetching={isFetchingDiscount} products={discountProductsData} />
              </div>
            </div>
            <div className="w-full  sm:hidden justify-center flex absolute bottom-[96px]">
              <Link href={`/products?sortBy=Discount&discount=true`}>
                <Button className="bg-red-500 hover:bg-red-400 rounded-lg py-2 px-8 text-white">نمایش همه</Button>
              </Link>
            </div>
          </div>
        )}

        {/* best seller slider */}
        {bestSellingProductsData && bestSellingProductsData.length > 0 && (
          <div className="pt-28 sm:pt-0 pb-20 relative">
            <hr className="pb-20 mx-8 border-t-2 mt-28" />

            <div className="w-full block text-center px-3 line-clamp-2 overflow-hidden text-ellipsis  sm:hidden whitespace-nowrap -mt-20 text-lg text-gray-400 ">
              پرفروش های {generalSetting?.title}
            </div>
            <div className="flex w-full bg-slate-300 relative h-[340px] sm:h-[275px] mt-16">
              <div className="hidden w-[38%] sm:block md:w-[20%]">
                <div className="hidden sm:block h-[72px]">
                  <div className=" line-clamp-2 overflow-hidden text-ellipsis text-center -mt-20 text-lg text-gray-400  px-3 w-full">
                    پرفروش های {generalSetting?.title}
                  </div>
                </div>
                <div className="mt-10 flex justify-center">
                  <img className="w-[220px]" src="/images/Top Seller.webp" alt="offer" />
                </div>
                <p className="text-gray-500 font-normal text-md w-full text-center my-4 mb-5">
                  محصولات پرفروش رو اینجا ببین
                </p>
                <div className="w-full  sm:flex justify-center hidden">
                  <Link href={`/products?bestSelling=true`}>
                    <Button className="bg-red-500 hover:bg-red-400 rounded-lg py-2 px-8 text-white">نمایش همه</Button>
                  </Link>
                </div>
              </div>
              <div className="w-[100%] sm:w-[62%] md:w-[80%] -mt-20">
                <BestSeller isFetching={isFetchingBestSelling} products={bestSellingProductsData} />
              </div>
            </div>
            <div className="w-full  sm:hidden justify-center flex absolute bottom-[130px]">
              <Link href={`/products?bestSelling=true`}>
                <Button className="bg-red-500 hover:bg-red-400 rounded-lg py-2 px-8 text-white">نمایش همه</Button>
              </Link>
            </div>
          </div>
        )}
      </ClientLayout>
    </>
  )
}

export default dynamic(() => Promise.resolve(ProductsHome), { ssr: false })
