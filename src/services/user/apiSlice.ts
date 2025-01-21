import baseApi from '@/services/baseApi'

import type {
  AddUserAddressQuery,
  EditUserQuery,
  GetQuery,
  GetUserAddressResult,
  MsgResult,
  MsgResultSecond,
} from './types'
import { generateQueryParams, getToken } from '@/utils'
import { IPagination, IPermission, IRole, QueryParams, ServiceResponse } from '@/types'

export const userApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    editUser: builder.mutation<MsgResult, EditUserQuery>({
      query: ({ body }) => ({
        url: '/api/user',
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
    }),

    addUserAddress: builder.mutation<MsgResultSecond, AddUserAddressQuery>({
      query: ({ body }) => ({
        url: '/api/address',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
    }),

    editUserAddress: builder.mutation<MsgResultSecond, AddUserAddressQuery>({
      query: ({ body }) => ({
        url: '/api/address',
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
    }),

    getUserAddressInfo: builder.query<GetUserAddressResult, GetQuery>({
      query: ({ page }) => ({
        url: `/api/addresses?page=${page}&pagesize=5`,
        method: 'GET',
      }),
    }),

    deleteUserAddress: builder.mutation<ServiceResponse<boolean>, string>({
      query: (id) => ({
        url: `/api/address/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
    }),

    // editUser: builder.mutation<MsgResult, EditUserQuery>({
    //   query: ({ body }) => ({
    //     url: '/api/user',
    //     method: 'PUT',
    //     headers: {
    //       Authorization: `Bearer ${getToken()}`,
    //     },
    //     body,
    //   }),
    //   invalidatesTags: ['User'],
    // }),

    upsertUser: builder.mutation<ServiceResponse<boolean>, FormData>({
      query: (body) => ({
        url: '/api/user',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
    }),

    getRoles: builder.query<ServiceResponse<IPagination<IRole[]>>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/roles?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }) => ({
                type: 'Roles' as const,
                id: id,
              })),
              'Roles',
            ]
          : ['Roles'],
    }),

    getPermissions: builder.query<ServiceResponse<IPagination<IPermission[]>>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/permissions?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }) => ({
                type: 'Permissions' as const,
                id: id,
              })),
              'Permissions',
            ]
          : ['Permissions'],
    }),
  }),
})

export const {
  useDeleteUserAddressMutation,
  useEditUserMutation,
  useGetUserAddressInfoQuery,
  useAddUserAddressMutation,
  useEditUserAddressMutation,
  useUpsertUserMutation,
  useGetPermissionsQuery,
  useGetRolesQuery,
} = userApiSlice
