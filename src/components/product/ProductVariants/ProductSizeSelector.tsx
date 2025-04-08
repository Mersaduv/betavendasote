import { setTempSize } from '@/store'

import { formatNumber } from '@/utils'

import { useAppDispatch, useAppSelector } from '@/hooks'
import { SizeDTO } from '@/services/feature/types'

interface Props {
  sizes: SizeDTO[]
}

const ProductSizeSelector: React.FC<Props> = (props) => {
  // ? Props
  const { sizes } = props

  // ? Assets
  const dispatch = useAppDispatch()

  // ? Store
  const { tempSize } = useAppSelector((state) => state.cart)

  // ? Render(s)
  return (
    <div className="flex flex-wrap gap-2.5">
      {sizes.map((item) => (
        <div className={`${tempSize?.id === item.id ? 'border-b-2 pb-1 border-red-600' : ''}`}>
          <button
            type="button"
            key={item.id}
            onClick={() => dispatch(setTempSize(item))}
            className={`border cursor-pointer   font-semibold flex pt-0.5 items-center justify-center rounded-md text-gray-500 border-gray-400 h-7 px-1`}
          >
            {item.name}
          </button>
        </div>
      ))}
    </div>
  )
}

export default ProductSizeSelector
