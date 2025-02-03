import { IPagination, QueryParams, ServiceResponse } from '@/types'

export interface ICanceled {
  id: string
  title: string
  isActive: boolean
  created: string
  updated: string
}
export interface IReturned {
  id: string
  title: string
  isActive: boolean
  created: string
  updated: string
}
export type MsgResult = ServiceResponse<boolean>
export type IdQuery = { id: string }
export type GetCanceledsQuery = QueryParams

export type GetCanceledsResult = ServiceResponse<IPagination<ICanceled[]>>
export type GetAllCanceledsResult = ServiceResponse<ICanceled[]>
export type GetSingleCanceledResult = ServiceResponse<ICanceled>

export type CreateCanceledQuery = {
  title: string
  isActive: boolean
}

export type UpdateCanceledQuery = {
  id: string
  title: string
  isActive: boolean
}
