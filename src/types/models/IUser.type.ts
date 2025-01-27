import { IAddress, IUserSpecification } from '@/types'

export interface IUser {
  id: string
  imageSrc: {
    id: string
    imageUrl: string
    placeholder: string
  } | null
  mobileNumber: string
  fullName: string
  role: string | null
  lastActivity: string | null
  orderCount: number
  city: string | null
  wallet: boolean
  isActive: boolean
  isDeleted: boolean
  userSpecification: IUserSpecification
  addresses: IAddress[]
  created: string | null
  lastUpdated: string | null
}
