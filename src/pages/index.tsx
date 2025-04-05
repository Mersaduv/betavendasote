import Head from 'next/head'
import ClientLayout from '@/components/Layouts/ClientLayout'
import { siteDescription } from '@/utils'
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { IBanner, ICategory, ISlider } from '@/types'
import {
  getAllBanners,
  getCategories,
  getFooterBanner,
  getHeaderText,
  getSliders,
  useGetAllSlidersQuery,
  useGetArticlesQuery,
  useGetBrandsQuery,
  useGetProductsQuery,
  useGetStoreBrandListQuery,
} from '@/services'
import config from '@/configs'
import {
  BestSeller,
  BrandSlider,
  DiscountSlider,
  LastSeenSlider,
  MainSlider,
  NewSlider,
  ReadableArticlePlace,
} from '@/components/sliders'
import { Button } from '@/components/ui'
import { CategoryList } from '@/components/categories'
import { ArticleBanners, FooterBanner, LargeBanner } from '@/components/banners'
import { PriceRange } from '@/components/product'
import { IHeaderText } from '@/types/IHeaderText.type'
import { useAppSelector } from '@/hooks'
import { MetaTags } from '@/components/shared'
import Link from 'next/link'

interface Props {
  sliders: ISlider[]
  banners: IBanner[]
  footerBanners: IBanner[]
  headerText: IHeaderText | null
  childCategories: {
    title: string
    categories: ICategory[]
  }
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const dataSlider = await getSliders()
  const dataBanner = await getAllBanners()
  const dataFooterBanner = await getFooterBanner()
  const dataHeaderText = await getHeaderText()
  const dataCategory = await getCategories()

  const slidersData = dataSlider?.data ?? []
  const bannersData = dataBanner?.data ?? []
  const footerBannersData = dataFooterBanner?.data ?? []
  const headerTextData = dataHeaderText?.data ?? null
  const categoriesData = dataCategory?.data?.categoryList ?? []

  return {
    revalidate: config.revalidate,
    props: {
      sliders: slidersData,
      banners: bannersData,
      footerBanners: footerBannersData,
      headerText: headerTextData,
      childCategories: {
        title: 'دسته‌بندهای',
        categories: categoriesData,
      },
    },
  }
}

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
  // ? Props
  const { banners, headerText, childCategories, footerBanners } = props
  const { generalSetting } = useAppSelector((state) => state.design)
  const { lastSeen } = useAppSelector((state) => state.lastSeen)

  // ? queries
  const { data: sliders, isLoading: isLoadingSliders, isFetching: isFetchingSliders } = useGetAllSlidersQuery()

  const { products: newProductsData, isFetching: isFetchingNew } = useGetProductsQuery(
    {
      sortBy: 'LastUpdated',
      sort: 'desc',
      inStock: '1',
      pageSize: 30,
      isActive: true,
    },
    {
      selectFromResult: ({ data, isFetching }) => ({
        products: data?.data?.pagination.data,
        isFetching,
      }),
    }
  )
  const { products: discountProductsData, isFetching: isFetchingDiscount } = useGetProductsQuery(
    {
      sortBy: 'Discount',
      inStock: '1',
      pageSize: 15,
      discount: true,
      suggestion: true,
      isActive: true,
      // sortBy: 'LastUpdated',
      // sort: "desc",
      // inStock: '1',
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
    },
    {
      selectFromResult: ({ data, isFetching }) => ({
        products: data?.data?.pagination.data,
        isFetching,
      }),
    }
  )

  // const {
  //   data: brandData,
  //   isLoading: isLoadingBrand,
  //   isFetching: isFetchingBrand,
  //   isError: isErrorBrand,
  // } = useGetBrandsQuery({
  //   page: 1,
  //   pageSize: 99999,
  //   isActiveSlider: true,
  // })
  const {
    data: storeBrandData,
    isLoading: isLoadingStoreBrand,
    isFetching: isFetchingBrand,
    isError: isErrorBrand,
  } = useGetStoreBrandListQuery()

  const {
    data: articleData,
    isLoading: isLoadingArticle,
    isError: isErrorArticle,
    isFetching: isFetchingArticle,
  } = useGetArticlesQuery({
    page: 1,
    pageSize: 99999,
    isCategory: true,
    isActive: true,
  })
  console.log(newProductsData, 'newProductsData')

  // ? Render(s)
  return (
    <ClientLayout>
      <main className="min-h-screen">
        <MetaTags
          title={generalSetting?.title || 'فروشگاه اینترنتی'}
          description={generalSetting?.shortIntroduction || 'توضیحاتی فروشگاه اینترنتی'}
          keywords={generalSetting?.googleTags || ' اینترنتی, فروشگاه'}
        />
        <div className="mx-auto py-4">
          <MainSlider data={sliders?.data ?? []} />

          {/* //  newest slider */}
          {newProductsData &&
            newProductsData.filter((item) => item.stockItems.every((item) => item.quantity !== 0)).length > 0 && (
              <div className="relative pt-28 sm:pt-0">
                <div className="w-full block  sm:hidden text-center px-3 line-clamp-2 overflow-hidden text-ellipsis  whitespace-nowrap -mt-20 text-lg text-gray-400 ">
                  جدید ترین های {generalSetting?.title}
                </div>
                <div className="flex w-full bg-slate-300 relative h-[340px] sm:h-[275px] mt-28">
                  <div className="hidden w-[38%] sm:block md:w-[20%]">
                    <div className="hidden sm:block h-[72px]">
                      <div className=" line-clamp-2 overflow-hidden text-ellipsis text-center -mt-20 text-lg text-gray-400  px-3 pt-4 w-full">
                        جدید ترین های {generalSetting?.title}
                      </div>
                    </div>
                    <div className="mt-10 flex justify-center">
                      <img className="w-[220px]" src="/images/NEW.webp" alt="offer" />
                    </div>
                    <p className="text-gray-500 font-normal text-md w-full text-center my-4 mb-5">به روز باش</p>
                    <div className="w-full  sm:flex justify-center hidden">
                      <Link href={`/products?sortBy=LastUpdated&sort=desc&inStock=1`}>
                        <Button className="bg-red-500 hover:bg-red-400 rounded-lg py-2 px-8 text-white">
                          نمایش همه
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="w-[100%] sm:w-[62%] md:w-[80%] -mt-20 ">
                    <NewSlider isFetching={isFetchingNew} products={newProductsData} />
                  </div>
                </div>
                <div className="w-full  sm:hidden justify-center flex absolute bottom-[105px]">
                  <Link href={`/products?sortBy=LastUpdated&sort=desc&inStock=1`}>
                    <Button className="bg-red-500 hover:bg-red-400 rounded-lg py-2 px-8 text-white">نمایش همه</Button>
                  </Link>
                </div>
                <hr className="pb-20 mx-8 border-t-2 mt-20" />
              </div>
            )}

          <CategoryList childCategories={childCategories} name={generalSetting?.title ?? ''} homePage />

          <LargeBanner data={banners} />
          {/* // Discount slider */}
          {/* <div className="relative w-full flex bg-slate-300">
            <div className="bg-[#dcb6db] w-full h-[410px] xs:h-[330px] sm:h-[360px] relative">
              <DiscountSlider />
            </div>
          </div> */}
          {/* //  discount slider */}
          {discountProductsData && discountProductsData.length > 0 && (
            <div className="pt-28 sm:pt-0 relative">
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
              <hr className="pb-0 mx-8 border-t-2 mt-20" />
            </div>
          )}

          {/* brand slider */}
          {/* {storeBrandData && storeBrandData.data && storeBrandData.data.length > 0 && (
            <div className="margin-brandSlider ">
              <BrandSlider brandData={storeBrandData.data} isFetching={isFetchingBrand} />
              <hr className="pb-8 mx-8 border-t-2 mt-6" />
            </div>
          )} */}
          {storeBrandData && storeBrandData.data && storeBrandData.data.length > 0 && (
            <div className="sm:margin-brandSlider pt-10 sm:pt-20">
              <BrandSlider brandData={storeBrandData.data} isFetching={isFetchingBrand} />
              <div
                className={`text-center ${storeBrandData.data.length > 3 ? ' mt-[130px]' : 'sm:mt-[20px] -mt-[30px]'}`}
              ></div>
              <hr className="pb-20 mx-8 border-t-2 mt-16 sm:mt-0" />
            </div>
          )}

          {/* best seller slider */}
          {bestSellingProductsData && bestSellingProductsData.length > 0 && (
            <div className="pt-28 sm:pt-0 relative">
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
              <hr className="pb-10 mx-8 border-t-2 mt-20" />
            </div>
          )}

          {/* Readable Article Place slider */}
          {articleData &&
            articleData.data &&
            articleData.data.data &&
            articleData.data.data.filter((x) => x.isActive).length > 0 && (
              <div className="sm:margin-brandSlider pt-4">
                <h1 className="w-full text-center text-gray-400 font-normal text-lg">خواندنی ها</h1>
                <ReadableArticlePlace isFetching={isFetchingArticle} articleData={articleData} />
                <div
                  className={`text-center ${
                    articleData.data.data.length > 3 ? ' mt-[180px]' : 'sm:mt-[20px] -mt-[30px]'
                  }`}
                >
                  <Link
                    href={`/articles`}
                    className="bg-red-500 hover:bg-red-400 rounded-lg py-2 px-8 text-white  margin-force"
                  >
                    نمایش همه
                  </Link>
                </div>
                <hr className="pb-20 mx-8 border-t-2 mt-16" />
              </div>
            )}

          {/* last seen slider
          {lastSeen.length > 0 && (
            <div className="pt-10 sm:pt-0 relative">
              <div className="w-full block text-center px-3 line-clamp-2 overflow-hidden text-ellipsis  sm:hidden whitespace-nowrap -mt-20 text-lg text-gray-400 ">
                بازدید های اخیر شما
              </div>
              <div className="flex w-full bg-slate-300 relative  h-[340px] sm:h-[275px] mt-28">
                <div className="hidden w-[38%] sm:block md:w-[20%]">
                  <div className="hidden sm:block">
                    <div className=" line-clamp-2 overflow-hidden text-ellipsis text-center -mt-20 text-lg text-gray-400  px-3 w-full">
                      بازدید های اخیر شما
                    </div>
                  </div>
                  <div className="mt-20 flex justify-center">
                    <img className="w-[220px]" src="/images/Recent Visited.webp" alt="offer" />
                  </div>
                  <p className="text-gray-500 font-normal text-md w-full text-center my-4 mb-5">
                    بازدید های اخیر رو اینجا ببین
                  </p>
                  <div className="w-full  sm:flex justify-center hidden">
                    <Link href={`/products`}>
                      <Button className="bg-red-500 hover:bg-red-400 rounded-lg py-2 px-8 text-white">نمایش همه</Button>
                    </Link>
                  </div>
                </div>
                <div className="w-[100%] sm:w-[62%] md:w-[80%] -mt-20">
                  <LastSeenSlider products={lastSeen} />
                </div>
              </div>
              <div className="w-full  sm:hidden justify-center flex absolute bottom-[150px]">
                <Link href={`/products`}>
                  <Button className="bg-red-500 hover:bg-red-400 rounded-lg py-2 px-8 text-white">نمایش همه</Button>
                </Link>
              </div>
              <hr className="pb-10 mx-8 border-t-2 mt-20" />
            </div>
          )} */}

          {/* article Banners  */}
          <ArticleBanners />
          <FooterBanner data={footerBanners} />
        </div>
      </main>
    </ClientLayout>
  )
}

export default Home
