import type { IUser, IProduct } from '@/types'

export interface IReview {
  id: string
  userId: string
  productId: string
  title: string
  userName: string
  rating: number
  comment: string
  mobileNumber: string
  status: number
  positivePoints: {
    id: string
    title: string
  }[]
  negativePoints: {
    id: string
    title: string
  }[]
  product: IProduct
  created: string
  lastUpdated: string
}
