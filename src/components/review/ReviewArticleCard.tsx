import { Minus, Plus } from '@/icons'
import moment from 'moment-jalaali'

import type { IArticleReview, IReview } from '@/types'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { FaStar, FaStarHalf } from 'react-icons/fa'

interface Props {
  item: IArticleReview
}

const ReviewArticleCard: React.FC<Props> = (props) => {
  // ? Props
  const { item } = props

  // ? Render(s)
  return (
    <article className="flex pt-3">
      <div className="flex-1 space-y-2 px-2.5 lg:px-2">
        <div className="border-b w-fit border-gray-100 flex items-center">
          <span className="text-xs">{item.userName === ' ' ? 'کاربر' : item.userName}</span>
          <span className="mx-2 inline-block h-[18px] w-[1px] rounded-full bg-gray-300" />
          <span className="farsi-digits text-base">{digitsEnToFa(moment(item.lastUpdated).format('jYYYY/jM/jD'))}</span>
        </div>
        <p className="pt-1 lg:text-base">{item.comment}</p>
      </div>
    </article>
  )
}

export default ReviewArticleCard
