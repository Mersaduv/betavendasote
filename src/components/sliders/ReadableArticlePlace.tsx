import Link from 'next/link'
import { useGetArticlesQuery, useGetProductsQuery } from '@/services'

import { ProductPriceDisplay } from '@/components/product'
import { Button, ResponsiveImage } from '@/components/ui'

import type { ICategory } from '@/types'
import { useAppSelector } from '@/hooks'
import dynamic from 'next/dynamic'
import 'owl.carousel/dist/assets/owl.carousel.css'
import 'owl.carousel/dist/assets/owl.theme.default.css'
import { TbRuler2 } from 'react-icons/tb'
import { GetArticlesResult } from '@/services/design/types'
interface Props {
  currentCategory?: ICategory
  articleData: GetArticlesResult
  isFetching: boolean
}
const OwlCarousel = dynamic(() => import('react-owl-carousel'), {
  ssr: false,
})

const ReadableArticlePlace: React.FC<Props> = (props) => {
  const { currentCategory, articleData, isFetching } = props
  const { generalSetting } = useAppSelector((state) => state.design)

  const carouselOptions = {
    margin: 10,
    nav: true,
    startPosition:
      articleData && articleData.data && articleData.data?.data
        ? articleData.data.data.filter((x) => x.isActive).length - 1
        : 0,
    responsive: {
      0: {
        items: 2,
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
  return (
    <>
      <div className="new-products-slider-containers  relative w-full ">
        <OwlCarousel
          className="new-products-slider owl-carousel owl-theme d-inline-block owl-loaded owl-drag"
          {...carouselOptions}
          dir="ltr"
        >
          {articleData?.data?.data &&
            [...articleData?.data?.data]
              .sort((a, b) => {
                const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0
                const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0
                return dateA - dateB
              })
              ?.filter((x) => x.isActive)
              .map((article) => {
                return (
                  <div
                    key={article.id}
                    title={article.title}
                    className="w-[150px] sm:w-[280px] z-50  rounded-lg mb-2 bg-white"
                  >
                    <a target="_blank" href={`/articles/${article.slug}`} className="blank w-full ">
                      <div className="slide-content  py-6">
                        <img
                          src={article.image.imageUrl}
                          alt={article.title}
                          className="rounded-lg transition duration-300 ease-in-out transform hover:scale-110 shadow-item"
                        />
                        <p
                          dir="rtl"
                          className="text-center text-gray-500 line-clamp-1 overflow-hidden text-ellipsis mt-4"
                        >
                          {article.title}
                        </p>
                      </div>
                    </a>
                  </div>
                )
              })}
        </OwlCarousel>
      </div>
    </>
  )
}

export default ReadableArticlePlace
