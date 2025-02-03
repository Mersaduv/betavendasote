import type { IAddress, ICart, IOrder, IPagination, IUser, ServiceResponse } from '@/types'

export type MsgResult = ServiceResponse<string>
export type IdQuery = { id: string }
export type OrdersResult = {
  ordersLength: number
  pagination: IPagination<IOrderDTO[]>
}

export interface IOrderDTO {
  id: string
  orderNum: string
  status: number
  user: IUser
  address: IAddress
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

export type GetOrdersResult = ServiceResponse<OrdersResult>

export type GetOrdersQuery = { page: number; pageSize: number }
export type GetSingleOrderResult = { order: IOrder }
export type UpdateOrderQuery = { id: string; body: Partial<IOrder> }
export type PlaceOrderQuery = { id: string }
export type CreateOrderQuery = Partial<IOrder>

export type IOrderCanceledQuery = {
  status: number
  orderId: string
  itemID: string[]
  canceledId: string
}
