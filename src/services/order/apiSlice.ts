import baseApi from '@/services/baseApi'

import type {
  CreateOrderQuery,
  GetOrdersQuery,
  GetOrdersResult,
  GetSingleOrderResult,
  IOrderCanceledQuery,
  IdQuery,
  MsgResult,
  PlaceOrderQuery,
  UpdateOrderQuery,
} from './types'
import { getToken } from '@/utils'
import { QueryParams, ServiceResponse } from '@/types'

export const orderApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<GetOrdersResult, QueryParams>({
      query: ({ page, pageSize }) => ({
        url: `/api/orders?page=${page}&pageSize=${pageSize}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: (result, error, arg) =>
        result?.data?.pagination.data
          ? [
              ...result.data?.pagination.data.map(({ id }) => ({
                type: 'Order' as const,
                id: id,
              })),
              'Order',
            ]
          : ['Order'],
    }),

    getSingleOrder: builder.query<GetSingleOrderResult, IdQuery>({
      query: ({ id }) => ({
        url: `/api/order/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'Order', id: arg.id }],
    }),

    updateOrderCanceled: builder.mutation<MsgResult, IOrderCanceledQuery>({
      query: (body) => ({
        url: `/api/order/update-canceled`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Order', id: arg.orderId }],
    }),

    updateOrderReturned: builder.mutation<ServiceResponse<boolean>, FormData>({
      query: (body) => ({
        url: `/api/order/update-returned`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['Order'],
    }),

    updateOrder: builder.mutation<MsgResult, UpdateOrderQuery>({
      query: ({ id, body }) => ({
        url: `/api/order/update`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Order', id: arg.id }],
    }),

    placeOrder: builder.mutation<ServiceResponse<boolean>, PlaceOrderQuery>({
      query: ({ id }) => ({
        url: `/api/order/place/${id}`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Order', id: arg.id }],
    }),

    createOrder: builder.mutation<MsgResult, FormData>({
      query: (body) => ({
        url: '/api/order',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['Order'],
    }),
  }),
})

export const {
  useGetOrdersQuery,
  useGetSingleOrderQuery,
  useUpdateOrderMutation,
  useCreateOrderMutation,
  useUpdateOrderCanceledMutation,
  usePlaceOrderMutation,
  useUpdateOrderReturnedMutation
} = orderApiSlice
