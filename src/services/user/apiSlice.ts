import baseApi from '@/services/baseApi'

import type {
  AddUserAddressQuery,
  EditUserQuery,
  GetQuery,
  GetUserAddressResult,
  IdQuery,
  MsgResult,
  MsgResultSecond,
} from './types'
import { generateQueryParams, getToken } from '@/utils'
import { IPagination, IPermission, IRole, IRoleRequest, IUser, QueryParams, ServiceResponse } from '@/types'

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
      invalidatesTags: ['User'],
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
      invalidatesTags: ['User'],
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
      invalidatesTags: ['User'],
    }),

    updateLastActivity: builder.query<MsgResultSecond, void>({
      query: () => ({
        url: `/api/user/update-activity`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        await queryFulfilled
        dispatch(userApiSlice.util.invalidateTags(['User']))
      },
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

    getUsers: builder.query<ServiceResponse<IPagination<IUser[]>>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/users?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }) => ({
                type: 'User' as const,
                id: id,
              })),
              'User',
            ]
          : ['User'],
    }),

    getUser: builder.query<ServiceResponse<IUser>, IdQuery>({
      query: ({ id }) => ({
        url: `/api/user/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'User', id: arg.id }],
    }),

    upsertUser: builder.mutation<ServiceResponse<string>, FormData>({
      query: (body) => ({
        url: '/api/user',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['User'],
    }),

    deleteUser: builder.mutation<ServiceResponse<boolean>, IdQuery>({
      query: ({ id }) => ({
        url: `/api/user/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    deleteTrashUser: builder.mutation<ServiceResponse<boolean>, IdQuery>({
      query: ({ id }) => {
        return {
          url: `/api/user/trash/${id}`,
          method: 'POST',
        }
      },
      invalidatesTags: ['User'],
    }),

    restoreUser: builder.mutation<ServiceResponse<boolean>, IdQuery>({
      query: ({ id }) => {
        return {
          url: `/api/user/restore/${id}`,
          method: 'POST',
        }
      },
      invalidatesTags: ['User'],
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

    upsertRole: builder.mutation<ServiceResponse<string>, IRoleRequest>({
      query: (body) => ({
        url: '/api/role',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['Roles'],
    }),

    deleteRole: builder.mutation<ServiceResponse<boolean>, IdQuery>({
      query: ({ id }) => ({
        url: `/api/role/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),

    getRole: builder.query<ServiceResponse<IRole>, string>({
      query: (id) => ({
        url: `/api/role/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Roles', id: arg }],
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
  useGetUserQuery,
  useGetUsersQuery,
  useDeleteTrashUserMutation,
  useRestoreUserMutation,
  useDeleteUserMutation,
  useLazyUpdateLastActivityQuery,
  useUpsertRoleMutation,
  useDeleteRoleMutation,
  useGetRoleQuery
} = userApiSlice
