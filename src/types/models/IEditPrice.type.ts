import { ICategory } from './ICategory.type'

export interface IEditPrice {
  id: string
  categories: ICategory[]
  isActive: boolean
  productType: number
  action: number
  percentageValue: number
  priceValue: number
  created: string
  updated: string
}
