import { SizeDTO } from '@/services/feature/types'
import { IColorDTO, IObjectValue } from './models/IProduct.type'

export default interface ICart {
  itemID: string
  productID: string
  productCode: string
  productCategory: string
  name: string
  slug: string
  price: number
  discount: number
  inStock: number
  sold: number
  cancelOrder: ICanceled | null
  color: IColorDTO | null
  size: SizeDTO | null
  features: IObjectValue | null
  img: {
    id: string
    imageUrl: string
    placeholder: string
  }
  quantity: number
}

interface ICanceled {
  id: string
  title: string
  isActive: string
}
