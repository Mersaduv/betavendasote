export interface ICoupon {
  id: string
  couponCode: string
  name: string
  description: string
  isActive: boolean
  limit: number
  startDate: string
  endDate: string
  discountRate: number
  minOrderAmount: number
  maxDiscountAmount: number
}
