import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAppDispatch, useAppSelector, useDisclosure, useDisclosureWithData } from '@/hooks'
import { Tab } from '@headlessui/react'
import { Fragment } from 'react'
import { setTempColor, setTempSize, addToLastSeen, setTempObjectValue, setTempObjectValue2 } from '@/store'
import parse from 'html-react-parser'

import { ClientLayout } from '@/components/Layouts'
import {
  ProductBreadcrumb,
  ProductGallery,
  ProductColorSelector,
  ProductSizeSelector,
  ProductObjectValueSelector,
} from '@/components/product'
import { ReviewsList } from '@/components/review'
import { RecentVisitedSlider, SmilarProductsSlider } from '@/components/sliders'
import { AddToCartButton } from '@/components/cart'

import type { GetServerSideProps, NextPage } from 'next'
import type { EntityImage, IObjectValue, IProduct, IProductSizeInfo } from '@/types'
import { getProductByCategory, getProductBySlug, useGetProductsQuery } from '@/services'
import { Button } from '@/components/ui'
import { ProductScaleModal } from '@/components/modals'
import { BsHeart } from 'react-icons/bs'
import { BiShareAlt } from 'react-icons/bi'
import { TfiMenuAlt, TfiRulerAlt2 } from 'react-icons/tfi'
import { FaStar } from 'react-icons/fa'
import { RiMenu5Fill } from 'react-icons/ri'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { MetaTags } from '@/components/shared'
import Link from 'next/link'
import { GrHelpBook } from 'react-icons/gr'

interface Props {
  product: IProduct
  smilarProducts: {
    title: string
    products: IProduct[]
  }
}

const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ')
}

export const getServerSideProps: GetServerSideProps<Props, { slug: string }> = async ({ params }) => {
  const { data: product } = await getProductBySlug(params?.slug ?? '')

  if (!product) return { notFound: true }

  const productCategoryID = product.categoryId

  const { data } = await getProductByCategory(productCategoryID)
  const similarProduct = data?.filter((p: any) => p.id !== product.id)
  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
      smilarProducts: {
        title: 'کالاهای مشابه',
        products: JSON.parse(JSON.stringify(similarProduct)),
      },
    },
  }
}

const SingleProduct: NextPage<Props> = (props) => {
  // ? Props
  const { product, smilarProducts } = props
  console.log(smilarProducts, ' smilarProducts')

  // ? Assets
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { lastSeen } = useAppSelector((state) => state.lastSeen)

  // ? States
  const [lastSeenData, setLastSeenData] = useState<IProduct[]>([])
  const { generalSetting } = useAppSelector((state) => state.design)
  const { featureObjectValues } = useAppSelector((state) => state.objectValue)

  // ? Queries
  const { products: productDataLastSeen, isFetching: isFetchingLastSeen } = useGetProductsQuery(
    {
      pageSize: 9999, //
      isActive: true,
    },
    {
      selectFromResult: ({ data, isFetching }) => ({
        products: data?.data?.pagination.data,
        isFetching,
      }),
    }
  )

  useEffect(() => {
    if (productDataLastSeen) {
      const updatedLastSeenData = productDataLastSeen.map((item) => {
        const lastSeenItem = lastSeen.find((itemLastSeen) => itemLastSeen.productID === item.id)

        if (lastSeenItem) {
          return {
            ...item,
            created: lastSeenItem.lastTime, // جایگزینی created با lastTime
          }
        }

        return item
      })

      setLastSeenData(updatedLastSeenData)
    }
  }, [productDataLastSeen, lastSeen])
  // ? initial color or size
  // useEffect(() => {
  //   if (product?.productSizeInfo?.columns != undefined) {
  //     dispatch(setTempSize(product?.productSizeInfo?.columns![0]!))
  //   }
  //   if (product.productFeatureInfo?.colorDTOs != undefined) {
  //     dispatch(setTempColor(product.productFeatureInfo?.colorDTOs![0]!))
  //   }
  //   if (product.productFeatureInfo?.colorDTOs == undefined && product?.productSizeInfo?.columns == undefined) {
  //     dispatch(setTempColor(null))
  //     dispatch(setTempSize(null))
  //   }
  // }, [router.query.id])

  useEffect(() => {
    if (product.productFeatureInfo?.colorDTOs?.length! > 0) {
      dispatch(setTempColor(product.productFeatureInfo?.colorDTOs![0]!))
    }
    if (product?.productSizeInfo?.columns?.length! > 0) {
      dispatch(setTempSize(product?.productSizeInfo?.columns![0]!))
    }
    if (product?.productFeatureInfo?.featureValueInfos?.length! > 0) {
      product?.productFeatureInfo?.featureValueInfos?.forEach((feature) => {
        if (feature?.value && feature.value.length > 0) {
          const val = feature.value[0] // اولین مقدار موجود برای
          dispatch(
            setTempObjectValue2({
              id: feature.id,
              title: feature.title,
              value: [{ id: val.id, name: val.name }],
            })
          )
        }
      })
    }
    // if (product?.productFeatureInfo?.featureValueInfos?.length! > 0) {
    //   var val = product?.productFeatureInfo?.featureValueInfos![0]!.value![0]!
    //   dispatch(
    //     setTempObjectValue({
    //       id: product?.productFeatureInfo?.featureValueInfos![0]!.id,
    //       title: product?.productFeatureInfo?.featureValueInfos![0]!.title,
    //       value: [val],
    //     } as IObjectValue)
    //   )
    // }
  }, [product?.productFeatureInfo, router.query.id])

  const { tempSize, tempColor, tempObjectValue } = useAppSelector((state) => state.cart)
  // ? Add To LastSeen
  useEffect(() => {
    dispatch(
      addToLastSeen({
        productID: product.id,
        lastTime: new Date().toISOString(),
      })
    )
  }, [product.id])

  // modal
  const [isOpen, selectedAddress, { open, close }] = useDisclosureWithData()
  const [isShowModal, modalHandlers] = useDisclosure()

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const halfStar = rating % 1 !== 0
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-xl text-[#FFD700]" />)
    }

    if (halfStar) {
      stars.push(<FaStar key="half" className="text-xl text-[#FFD700]" />)
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-xl text-[#eee]" />)
    }

    return stars
  }
  const addMainImageToList = (mainImageSrc: EntityImage, imagesSrcList: EntityImage[]) => {
    return [mainImageSrc, ...imagesSrcList]
  }
  const updatedImagesSrcList = addMainImageToList(product.mainImageSrc, product.imagesSrc ?? [])

  const hasFeature =
    product.inStock > 0 &&
    ((product.productFeatureInfo?.colorDTOs?.length || 0) > 0 ||
      (product.productFeatureInfo?.featureValueInfos?.length || 0) > 0)

  const hasDescription = product.description && product.description.trim().length > 0

  const hasGuide = product.guideDescription && product.guideDescription.trim().length > 0

  const hasSizeInfo = product.productSizeInfo?.columns && product.productSizeInfo.columns.length > 0

  // آرایه‌ای از تب‌های معتبر با ساختار داده‌ای دلخواه:
  const tabsData = []

  // تب ویژگی محصول:
  if (hasFeature) {
    tabsData.push({
      label: (
        <>
          <TfiMenuAlt className="-mr-2 ml-1" />
          ویژگی محصول
        </>
      ),
      renderPanel: (
        <div className="text-gray-700">
          <div className="w-full flex mb-6">
            {product.productSizeInfo?.columns && product.productSizeInfo.columns.length > 0 && (
              <div className="text-[#9e9e9e]  sm:text-base w-[150px]">سایزبندی</div>
            )}
            <div className="flex items-center">
              {product.productSizeInfo?.columns?.map((size, index) => (
                <div key={size.id} className="flex items-center">
                  <div className="text-sm">{size.name}</div>
                  {product?.productSizeInfo?.columns && index <  product?.productSizeInfo?.columns.length - 1 && <div className="text-red-600 mx-1">|</div>}
                </div>
              ))}
            </div>
          </div>
          {product.inStock > 0 &&product.productFeatureInfo?.colorDTOs&& product.productFeatureInfo?.colorDTOs?.length > 0 && (
            <div className="w-full flex">
              <div className="text-[#9e9e9e]  sm:text-base w-[150px]">رنگ</div>
              {product.productFeatureInfo.colorDTOs.map((color, index) => (
                <div key={color.id} className="flex items-center">
                  <div className="whitespace-nowrap text-sm">{color.name}</div>
                  {product.productFeatureInfo?.colorDTOs && index < product.productFeatureInfo.colorDTOs.length - 1 && (
                    <div className="text-red-600 mx-1">|</div>
                  )}
                </div>
              ))}
            </div>
          )}
          {product.inStock > 0 && product.productFeatureInfo?.featureValueInfos&&
            product.productFeatureInfo?.featureValueInfos?.length > 0 &&
            product.productFeatureInfo.featureValueInfos.map((item) => (
              <div key={item.id} className="w-full flex mt-6">
                <div className="text-[#9e9e9e]  sm:text-base w-[150px]">{item.title}</div>
                {item.value?.map((itemValue, index) => (
                  <div key={itemValue.id} className="flex items-center">
                    <div className="whitespace-nowrap text-sm">{itemValue.name}</div>
                    {item.value && index < item.value.length - 1 && <div className="text-red-600 mx-1">|</div>}
                  </div>
                ))}
              </div>
            ))}
        </div>
      ),
    })
  }

  // تب توضیحات:
  if (hasDescription) {
    tabsData.push({
      label: (
        <>
          <RiMenu5Fill className="-mr-2 ml-1" />
          توضیحات
        </>
      ),
      renderPanel: (
        <div className="border rounded-lg">
          <div
            className="ck ck-content ck-editor__editable ck-rounded-corners ck-editor__editable_inline ck-blurred max-h-[500px]"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      ),
    })
  }

  // تب راهنمای استفاده:
  if (hasGuide) {
    tabsData.push({
      label: (
        <>
          <GrHelpBook className="-mr-2 ml-1" />
          راهنمای استفاده
        </>
      ),
      renderPanel: (
        <div className="border rounded-lg">
          <div
            className="ck ck-content ck-editor__editable ck-rounded-corners ck-editor__editable_inline ck-blurred max-h-[500px]"
            dangerouslySetInnerHTML={{ __html: product.guideDescription }}
          />
        </div>
      ),
    })
  }

  // تب راهنمای سایز:
  if (hasSizeInfo) {
    tabsData.push({
      label: (
        <>
          <TfiRulerAlt2 className="-mr-2 ml-1" />
          راهنمای سایز
        </>
      ),
      renderPanel: (
        <>
          {product.productSizeInfo?.columns && product.productSizeInfo.columns.length > 0 && (
            <div className="flex flex-col-reverse items-center sm:flex-row gap-x-6 pb-4 px-5">
              <div className="flex flex-col flex-1">
                <div className="text-center sm:text-start">
                  <span className="font-normal">
                    - تلورانس اندازه گیری تا {digitsEnToFa('5%')} طبیعی است <br /> - اعداد بر حسب{' '}
                    <span className="text-red-600">
                      {product.productSizeInfo.sizeType === '0' ? 'سانتیمتر' : 'میلیمتر'}
                    </span>{' '}
                    میباشد
                  </span>
                </div>
                <table className="table-auto mt-4 border-collapse w-full">
                  <thead className="bg-[#8fdcff]">
                    <tr>
                      <th className="px-4 py-2 text-start">اندازه</th>
                      {product.productSizeInfo.columns.map((column) => (
                        <th key={column.id} className="px-4 py-2 w-[135px] font-normal">
                          {column.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.productSizeInfo.rows?.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-100' : ''}>
                        <td className="px-4 py-2">{row.productSizeValue}</td>
                        {product.productSizeInfo?.columns?.map((column, colIndex) => (
                          <td key={colIndex} className="px-4 py-2 font-normal">
                            <div className="border h-9 w-full flex justify-center farsi-digits items-center pr-1 rounded-md bg-white">
                              {row.scaleValues?.[colIndex] || ''}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-lg shadow-product w-[400px] h-[400px]">
                <img
                  className="w-full h-full rounded-lg"
                  src={product.productSizeInfo.imagesSrc?.imageUrl}
                  alt="عکس اندازه محصول"
                />
              </div>
            </div>
          )}
        </>
      ),
    })
  }

  // ? Render(s)
  return (
    <>
      <MetaTags
        title={generalSetting?.title + ' | ' + `خرید ${product.title}` || 'فروشگاه اینترنتی'}
        description={generalSetting?.shortIntroduction + product.title || 'توضیحاتی فروشگاه اینترنتی'}
        keywords={generalSetting?.googleTags || ' اینترنتی, فروشگاه'}
      />
      <ClientLayout>
        <main className="mx-auto space-y-4 py-4 lg:max-w-[1550px] lg:mt-4 sm:mt-4 md:mt-6  -mt-20">
          <div className="flex items-center mr-6">
            <div className="text-sm text-gray-400">دسته بندی محصول:</div>{' '}
            <ProductBreadcrumb categoryLevels={product.parentCategories ?? []} isAdminTable />
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex lg:justify-start justify-end ml-4 lg:ml-0 mb-4 lg:mb-0">
              <div className="flex lg:flex-col items-center shadow-product h-fit rounded-lg mr-4">
                <div
                  className="py-2 lg:py-5 px-4 lg:px-2 cursor-pointer hover:bg-slate-50 rounded-lg"
                  title="افزودن به علاقه مندی ها"
                >
                  <BsHeart className="text-xl" />
                </div>
                <div
                  className="py-2 lg:py-5 px-4 lg:px-2 cursor-pointer hover:bg-slate-50 rounded-lg"
                  title="اشتراک گذاری"
                >
                  <BiShareAlt className="icon" />
                </div>
              </div>
            </div>
            <ProductGallery
              images={product.imagesSrc && product.imagesSrc.length > 0 ? updatedImagesSrcList : [product.mainImageSrc]}
              discount={product.discount}
              inStock={product.inStock}
              productName={product.title}
            />

            <div className="flex px-3 flex-col w-full ml-8 mr-10">
              <div className="border-b-2 py-2 flex justify-between items-center sm:min-h-[52px]">
                <div className="flex">
                  <div className="text-gray-400 text-sm md:text-base">نام محصول :</div>
                  <div className="mr-1  text-sm md:text-base">{product.title}</div>
                </div>
                {product.status !== 0 && <div className="bg-[#f7d439] text-xs px-1.5 p-1 rounded-3xl">کارکرده</div>}
              </div>

              <div className="border-b-2 py-2 flex h-[52px]  items-center">
                <div className="text-gray-400 text-sm md:text-base">کد محصول :</div>
                <div className="mr-1  text-sm md:text-base">{product.code}</div>
              </div>

              {product.brandName && (
                <div className="border-b-2 py-2 flex justify-between items-center h-[52px]">
                  <div className="flex">
                    <div className="text-gray-400 text-sm md:text-base">برند محصول :</div>
                    <div className="mr-1 text-sm md:text-base flex gap-1">
                      {product.brandData.nameFa + ' - '}
                      <div className="text-gray-400">{product.brandData.nameEn}</div>
                    </div>
                  </div>
                  {product.isFake && <div className="bg-[#f7d439] text-xs px-1.5 p-1 rounded-3xl">غیر اصل</div>}
                </div>
              )}

              {product.productSizeInfo?.columns?.length! > 0 && (
                <div className="border-b-2 py-2 flex items-center  sm:min-h-[52px] relative">
                  <div className="flex flex-col flex-wrap sm:flex-row gap-2 sm:gap-0  w-1/3">
                    <div className="flex ">
                      <div className="text-gray-400 text-sm md:text-base whitespace-nowrap">سایزبندی :</div>
                      <div className="mr-1  text-sm  md:text-base">{tempSize?.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-2.5">
                      <ProductSizeSelector sizes={product.productSizeInfo?.columns ?? []} />
                    </div>
                    <Button onClick={modalHandlers.open} className="p-2 text-xs rounded whitespace-nowrap  left-0">
                      راهنمای سایز
                    </Button>
                  </div>
                </div>
              )}

              {product.productFeatureInfo?.colorDTOs?.length! > 0 && (
                <div className="border-b-2 pt-1 items-center  flex sm:min-h-[52px] ">
                  <div className="flex flex-col  sm:flex-row gap-2 sm:gap-0   w-full">
                    <div className="flex w-1/3">
                      <div className="text-gray-400 text-sm md:text-base whitespace-nowrap">رنگ :</div>
                      <div className="mr-1 whitespace-nowrap  text-sm  md:text-base">{tempColor?.name}</div>
                    </div>
                    <div className="mr-1 mb-2 sm:mb-0">
                      <ProductColorSelector colors={product.productFeatureInfo?.colorDTOs ?? []} />
                    </div>
                  </div>
                </div>
              )}

              {/* {product.productFeatureInfo?.featureValueInfos?.length! > 0 && (
                <div className="border-b-2 pt-1 items-center flex sm:h-[52px]">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between w-[44%]">
                    <div className="flex">
                      <div className="text-gray-400 text-sm md:text-base whitespace-nowrap">
                        {tempObjectValue?.title} :
                      </div>
                      <div className="mr-1 whitespace-nowrap  text-sm  md:text-base">
                        {tempObjectValue?.value ? tempObjectValue?.value![0].name : null}
                      </div>
                    </div>
                    <div className="mr-1 mb-2 sm:mb-0">
                      <ProductObjectValueSelector objectValues={product.productFeatureInfo?.featureValueInfos ?? []} />
                    </div>
                  </div>
                </div>
              )} */}
              {product.productFeatureInfo?.featureValueInfos?.map((feature) => {
                const selectedValue = featureObjectValues[feature.id] // Get the selected value for this feature

                return (
                  <div key={feature.id} className="border-b-2  items-center  flex sm:min-h-[52px] ">
                    <div className="flex flex-col items-center sm:flex-row gap-2 sm:gap-0   w-full">
                      <div className="flex w-1/3">
                        <div className="text-gray-400 text-sm md:text-base whitespace-nowrap ">
                          {selectedValue?.title} :
                        </div>
                        <div className="mr-1 whitespace-nowrap text-sm md:text-base">
                          {selectedValue?.value ? selectedValue.value[0].name : null}
                        </div>
                      </div>
                      {feature.value && (
                        <div className="mr-1 mb-2 sm:mb-0">
                          <ProductObjectValueSelector
                            feature={feature}
                            objectValues={feature.value.map((item) => ({ id: item.id, title: item.name }))}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              <div className="z-[99]">
                {product.inStock > 0 ? (
                  <AddToCartButton product={product} />
                ) : (
                  <div className="w-full flex justify-center pt-20">
                    {' '}
                    <Button className="btn bg-gray-300 text-sm xs:px-12 whitespace-nowrap xs:text-base md:w-1/2 ">
                      اتمام موجودی
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <ProductScaleModal
              isShow={isShowModal}
              productSizeInfo={product.productSizeInfo ?? ({} as IProductSizeInfo)}
              onClose={modalHandlers.close}
            />
          </div>

          {/* product features tabs :  */}
          <div className="w-full px-2 sm:py-16 sm:px-0 pt-28 sm:pb-0">
            {tabsData.length !== 0 && (
              <Tab.Group className="sm:mx-4 mx-0">
                <Tab.List className="flex justify-center xs:justify-start xs:flex-nowrap flex-wrap gap-3 rounded-md bg-[#f7f5f8] border p-4">
                  {tabsData.map((tab, index) => (
                    // به جای Tab as={Fragment} از کامپوننت Tab به همراه تابع رندر استفاده می‌کنیم
                    <Tab key={index} as={Fragment}>
                      {({ selected }) => (
                        <button
                          className={classNames(
                            'w-36 rounded flex items-center justify-center py-2.5 text-sm sm:text-base font-light',
                            selected ? 'text-white bg-[#3F3A42] shadow' : 'bg-[#f7f5f8] text-[#6b6b6b] border'
                          )}
                        >
                          {tab.label}
                        </button>
                      )}
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels className="mt-2">
                  {tabsData.map((tab, index) => (
                    <Tab.Panel key={index} className={classNames('bg-white rounded-xl p-3', 'bg-opacity-100')}>
                      {tab.renderPanel}
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              </Tab.Group>
            )}
          </div>

          {/* reviews */}
          <div className={`w-full px-2  sm:px-0 ${tabsData.length === 0 ? '' : 'pt-28 sm:py-16'} pb-6`}>
            <Tab.Group className="sm:mx-4 mx-0">
              <Tab.List className="flex relative justify-center xs:justify-start sm2:flex-nowrap flex-wrap gap-3 rounded-md bg-[#f7f5f8] border p-4">
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={classNames(
                        'w-40 rounded flex gap-1 items-center justify-center whitespace-nowrap py-2.5 text-sm sm:text-base  font-light  ',
                        selected ? 'text-white bg-[#3F3A42] shadow ' : 'bg-[#f7f5f8] text-[#6b6b6b] border'
                      )}
                    >
                      دیدگاه کاربران{' '}
                      <span className={`${selected ? 'text-white' : ' text-[#6b6b6b]'} mr-0.5`}>
                        ({digitsEnToFa(`${product.reviewCount}`)})
                      </span>
                    </button>
                  )}
                </Tab>
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={classNames(
                        'w-36 rounded flex gap-1 items-center justify-center whitespace-nowrap py-2.5 text-sm sm:text-base  font-light  ',
                        selected ? 'text-white bg-[#3F3A42] shadow ' : 'bg-[#f7f5f8] text-[#6b6b6b] border'
                      )}
                    >
                      پرسش و پاسخ
                      <span className={`${selected ? 'text-white' : ' text-[#6b6b6b]'} mr-0.5`}>
                        ({digitsEnToFa(`0`)})
                      </span>
                    </button>
                  )}
                </Tab>

                <div className="whitespace-nowrap flex items-center gap-3 mdx:mr-64">
                  <div className="font-light">میانگین امتیاز این محصول</div>
                  <div className="flex gap-1">{renderStars(product.rating ?? 0)}</div>
                </div>
              </Tab.List>
              <Tab.Panels className="mt-2">
                <Tab.Panel>
                  <ReviewsList numReviews={product.reviewCount ?? 0} product={product} />
                </Tab.Panel>
                <Tab.Panel>در اینجا پرسش و پاسخ قرار میگیرد</Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>

          {/* <div className="relative w-full flex pt-28">
            <div className="bg-[#dee2e6] w-full h-[410px] xs:h-[330px] sm:h-[360px] relative">
              <SmilarProductsSlider products={smilarProducts.products} isFetching={false} />
            </div>
          </div> */}
          {/* <div className="relative w-full flex pt-28">
            <div className="bg-[#dee2e6] w-full h-[410px] xs:h-[330px] sm:h-[360px] relative">
              <RecentVisitedSlider lastSeenProduct={{ products: lastSeen, title: 'بازدید های اخیر' }} />
            </div>
          </div> */}
        </main>
        {/* //  smilarProducts slider */}
        {smilarProducts &&
          smilarProducts.products.filter((item) => item.stockItems.every((item) => item.quantity !== 0)).length > 0 && (
            <div className="relative pt-28 sm:pt-0">
              <hr className="pb-10 mx-8 border-t-2 mt-20" />
              <div className="w-full block  sm:hidden text-center px-3 line-clamp-2 overflow-hidden text-ellipsis  whitespace-nowrap -mt-20 text-lg text-gray-400 ">
                محصولات مشابه
              </div>
              <div className="flex w-full bg-slate-300 relative h-[340px] sm:h-[275px] mt-28">
                <div className="hidden w-[38%] sm:block md:w-[20%]">
                  <div className="hidden sm:block h-[72px]">
                    <div className=" line-clamp-2 overflow-hidden text-ellipsis text-center -mt-20 text-lg text-gray-400  px-3 pt-4 w-full">
                      محصولات مشابه
                    </div>
                  </div>
                  <div className="mt-10 flex justify-center">
                    <img className="w-[220px]" src="/images/Similar.webp" alt="offer" />
                  </div>
                  <p className="text-gray-500 font-normal text-md w-full text-center my-4 mb-5">
                    محصولات مشابه را اینجا ببین
                  </p>
                  <div className="w-full  sm:flex justify-center hidden">
                    <Link href={`/products?sortBy=LastUpdated&sort=desc&inStock=1`}>
                      <Button className="bg-red-500 hover:bg-red-400 rounded-lg py-2 px-8 text-white">نمایش همه</Button>
                    </Link>
                  </div>
                </div>
                <div className="w-[100%] sm:w-[62%] md:w-[80%] -mt-20 ">
                  <SmilarProductsSlider products={smilarProducts.products} isFetching={false} />
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
        {/* last seen slider */}
        {lastSeenData.length > 0 && (
          <div className="pt-10 sm:pt-0 relative pb-10">
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
                <RecentVisitedSlider products={lastSeenData} isFetching={isFetchingLastSeen} />
              </div>
            </div>
            <div className="w-full  sm:hidden justify-center flex absolute bottom-[150px]">
              <Link href={`/products`}>
                <Button className="bg-red-500 hover:bg-red-400 rounded-lg py-2 px-8 text-white">نمایش همه</Button>
              </Link>
            </div>
          </div>
        )}
      </ClientLayout>
    </>
  )
}

export default SingleProduct
