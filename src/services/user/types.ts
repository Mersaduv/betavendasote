import type {
  AddressFormBody,
  IAddress,
  INotification,
  IPagination,
  IRole,
  ISmsMessage,
  ITicket,
  IUser,
  ProfileForm,
  ServiceResponse,
} from '@/types'

interface ResultBody {
  guid: string
}
export type MsgResult = ServiceResponse<ResultBody>
export type MsgResultSecond = ServiceResponse<boolean>
export interface IdQuery {
  id: string
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

export type GetUserAddressResult = ServiceResponse<IAddress>
export type GetUsersResult = ServiceResponse<IPagination<IUser[]>>
export type GetRolesResult = ServiceResponse<IPagination<IRole[]>>
export type GetTicketsResult = ServiceResponse<IPagination<ITicket[]>>
export type GetNotificationsResult = ServiceResponse<IPagination<INotification[]>>
export type GetSmsMessageResult = ServiceResponse<IPagination<ISmsMessage[]>>
