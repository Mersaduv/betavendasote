import Link from 'next/link'
import { useGetProductsQuery } from '@/services'

import { ProductDiscountTag, ProductPriceDisplay } from '@/components/product'
import { Button, ResponsiveImage } from '@/components/ui'

import type { ICategory, IProduct } from '@/types'
import { useAppSelector } from '@/hooks'
import dynamic from 'next/dynamic'
import 'owl.carousel/dist/assets/owl.carousel.css'
import 'owl.carousel/dist/assets/owl.theme.default.css'
import { TbRuler2 } from 'react-icons/tb'
import { Product } from '@/store'
interface Props {
  currentCategory?: ICategory
  products : Product[]
}
const OwlCarousel = dynamic(() => import('react-owl-carousel'), {
  ssr: false,
})

const LastSeenSlider: React.FC<Props> = (props) => {
  const { currentCategory,products } = props
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

  return (
    <>
      {/**************** There is a responsive issue here, which is why duplicate code was created *****************/}

    </>
  )
}

export default LastSeenSlider
