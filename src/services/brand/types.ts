import { IBrand, IBrandForm, ICoupon, IPagination, QueryParams, ServiceResponse } from '@/types'

export type MsgResult = ServiceResponse<boolean>
export type IdQuery = { id: string }
export type GetBrandsQuery = QueryParams

export type GetBrandsResult = ServiceResponse<IPagination<IBrand[]>>
export type GetAllBrandsResult = ServiceResponse<IBrand[]>
export type GetSingleBrandResult = ServiceResponse<IBrand>

export type CreateBrandQuery = IBrandForm
export type UpdateBrandQuery = IBrandForm
