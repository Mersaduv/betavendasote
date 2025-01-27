import { UserTypes, IRole } from '@/types'

export interface IUserSpecification {
  userId: string
  userType: UserTypes
  role: IRole
  isActive: boolean
  gender: 'آقا' | 'بانو'
  imageScr: {
    id: string
    imageUrl: string
    placeholder: string
  } | null
  idCardImageSrc: {
    id: string
    imageUrl: string
    placeholder: string
  } | null
  mobileNumber: string
  passCode: string
  firstName: string
  familyName: string
  fatherName: string
  telePhone: string
  city: {
    id: number
    name: string
    slug: string
    province_id: number
  }
  province: {
    id: number
    name: string
    slug: string
  }
  postalCode: string
  firstAddress: string
  secondAddress: string
  birthDate: string
  idNumber: string
  nationalCode: string
  bankAccountNumber: string
  shabaNumber: string
  email: string
  note: string

  // Supplier
  storeName?: string
  storeTelephone?: string
  storeAddress?: string
  bussinessLicenseNumber?: string
  // store setting
  isActiveAddProduct?: boolean
  isPublishProduct?: boolean
  isSelectedAsSpecialSeller?: boolean
  commissionType?: number | null
  percentageValue?: string
  sellerPerformance?: string
  timelySupply?: string
  shippingCommitment?: string
  noReturns?: string

  created: string | null
  lastUpdated: string | null
}
