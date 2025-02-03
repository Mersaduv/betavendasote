import type { IUser, ICart, IAddress } from '@/types'

export interface IOrder {
  id: string
  orderNum: string
  status: number
  user: IUser
  address: string
  cart: ICart[]
  giftWrapped: number
  deliveryCost: number
  bankAccountNumber: string
  trackingNum: string
  totalItems: number
  totalPrice: number
  orgPrice: number
  totalDiscount: number
  paymentMethod: string
  delivered: boolean
  paid: boolean
  isDeleted: boolean
  purchaseInvoice?: {
    id: string
    imageUrl: string
    placeholder: string
  }
  dateOfPayment: string
  updated: string
}
