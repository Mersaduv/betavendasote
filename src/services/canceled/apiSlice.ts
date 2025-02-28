import baseApi from '@/services/baseApi'
import { generateQueryParams } from '@/utils'
import {
  CreateCanceledQuery,
  GetAllCanceledsResult,
  GetCanceledsQuery,
  GetCanceledsResult,
  GetSingleCanceledResult,
  IdQuery,
  IReturned,
  MsgResult,
  UpdateCanceledQuery,
} from './types'
import { ICanceledForm, IPagination, IReturnedForm, QueryParams, ServiceResponse } from '@/types'

export const canceledApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCanceleds: builder.query<GetAllCanceledsResult, void>({
      query: () => ({
        url: '/api/allCanceleds',
        method: 'GET',
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Canceled' as const,
                id: id,
              })),
              'Canceled',
            ]
          : ['Canceled'],
    }),

    getCanceleds: builder.query<GetCanceledsResult, GetCanceledsQuery>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/canceled-orders?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: ['Canceled'],
    }),

    getReturneds: builder.query<ServiceResponse<IPagination<IReturned[]>>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/returned-orders?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: ['Returned'],
    }),

    getSingleCanceled: builder.query<GetSingleCanceledResult, IdQuery>({
      query: ({ id }) => ({
        url: `/api/canceled-orders/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Canceled', id: arg.id }],
    }),

    upsertCanceled: builder.mutation<MsgResult, ICanceledForm>({
      query: (body) => ({
        url: '/api/canceled-orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Canceled'],
    }),

    upsertReturned: builder.mutation<MsgResult, IReturnedForm>({
      query: (body) => ({
        url: `/api/returned-orders`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Returned'],
    }),

    updateCanceled: builder.mutation<MsgResult, UpdateCanceledQuery>({
      query: ({ id, ...data }) => ({
        url: `/api/canceled-orders/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Canceled', id: arg.id }],
    }),

    deleteCanceled: builder.mutation<MsgResult, IdQuery>({
      query: ({ id }) => ({
        url: `/api/canceled-orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Canceled', id: arg.id }],
    }),
    deleteReturned: builder.mutation<MsgResult, IdQuery>({
      query: ({ id }) => ({
        url: `/api/returned-orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Returned'],
    }),
  }),
})

export const {
  useGetAllCanceledsQuery,
  useGetCanceledsQuery,
  useGetSingleCanceledQuery,
  useUpdateCanceledMutation,
  useDeleteCanceledMutation,
  useGetReturnedsQuery,
  useUpsertReturnedMutation,
  useDeleteReturnedMutation,
  useUpsertCanceledMutation
} = canceledApiSlice
