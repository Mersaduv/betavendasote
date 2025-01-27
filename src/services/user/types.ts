import type { AddressFormBody, IAddress, IPagination, IRole, IUser, ProfileForm, ServiceResponse } from '@/types'

interface ResultBody {
  guid: string
}
export type MsgResult = ServiceResponse<ResultBody>
export type MsgResultSecond = ServiceResponse<boolean>
export interface IdQuery {
  id:string
}

export type GetQuery = {
  page: number
  pageSize?: number
}
export type EditUserQuery = {
  body: ProfileForm
}
export type GetUserInfoResult = Exclude<IUser, 'password'>

// address
export type AddUserAddressQuery = {
  body: Omit<IAddress, 'id' | 'userId'>
}

export type GetUserAddressResult =ServiceResponse<IAddress>
export type GetUsersResult = ServiceResponse<IPagination<IUser[]>>
export type GetRolesResult = ServiceResponse<IPagination<IRole[]>>