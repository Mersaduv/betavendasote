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
import {
  INotification,
  INotificationForm,
  IPagination,
  IPermission,
  IRole,
  IRoleRequest,
  ISmsMessage,
  ISmsMessageForm,
  ITicket,
  ITicketMessage,
  ITicketTypeForm,
  ITicketUpdateStatus,
  IUser,
  QueryParams,
  ServiceResponse,
} from '@/types'
import { ITicketType } from '@/types/models/ITicketType.type'

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

    getTicketTypes: builder.query<ServiceResponse<IPagination<ITicketType[]>>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/users/ticket-type?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }) => ({
                type: 'TicketType' as const,
                id: id,
              })),
              'TicketType',
            ]
          : ['TicketType'],
    }),

    getTickets: builder.query<ServiceResponse<IPagination<ITicket[]>>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/users/tickets?${queryParams}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }) => ({
                type: 'Tickets' as const,
                id: id,
              })),
              'Tickets',
            ]
          : ['Tickets'],
    }),

    getNotifications: builder.query<ServiceResponse<IPagination<INotification[]>>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/users/notifications?${queryParams}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }) => ({
                type: 'Notification' as const,
                id: id,
              })),
              'Notification',
            ]
          : ['Notification'],
    }),

    getSmsMessage: builder.query<ServiceResponse<IPagination<ISmsMessage[]>>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/users/sms-messages?${queryParams}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }) => ({
                type: 'SmsMessage' as const,
                id: id,
              })),
              'SmsMessage',
            ]
          : ['SmsMessage'],
    }),

    getSingleSmsMessage: builder.query<ServiceResponse<ISmsMessage>, IdQuery>({
      query: ({ id }) => ({
        url: `/api/user/sms-messages/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'SmsMessage', id: arg.id }],
    }),

    createSmsMessage: builder.mutation<ServiceResponse<string>, ISmsMessageForm>({
      query: (body) => ({
        url: '/api/user/sms-message',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['SmsMessage'],
    }),

    updateSmsMessage: builder.mutation<ServiceResponse<string>, ISmsMessageForm>({
      query: (body) => ({
        url: '/api/user/update-sms-message',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['SmsMessage'],
    }),

    createNotification: builder.mutation<ServiceResponse<string>, INotificationForm>({
      query: (body) => ({
        url: '/api/user/notification',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['Notification'],
    }),

    deleteNotification: builder.mutation<ServiceResponse<boolean>, IdQuery>({
      query: ({ id }) => ({
        url: `/api/user/notification/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: ['Notification'],
    }),

    deleteSmsMessage: builder.mutation<ServiceResponse<boolean>, IdQuery>({
      query: ({ id }) => ({
        url: `/api/user/sms-message/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: ['SmsMessage'],
    }),

    getTicketMessages: builder.query<ServiceResponse<IPagination<ITicketMessage[]>>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/users/tickets?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }) => ({
                type: 'Tickets' as const,
                id: id,
              })),
              'Tickets',
            ]
          : ['Tickets'],
    }),

    upsertTicket: builder.mutation<ServiceResponse<boolean>, FormData>({
      query: (body) => ({
        url: '/api/user/ticket',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['Tickets'],
    }),

    upsertTicketMessage: builder.mutation<ServiceResponse<boolean>, FormData>({
      query: (body) => ({
        url: '/api/user/ticket-message',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['Tickets'],
    }),

    upsertTicketType: builder.mutation<ServiceResponse<string>, ITicketTypeForm>({
      query: (body) => ({
        url: '/api/user/ticket-type',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['TicketType'],
    }),

    deleteTicketType: builder.mutation<ServiceResponse<boolean>, IdQuery>({
      query: ({ id }) => ({
        url: `/api/user/ticket-type/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TicketType'],
    }),

    getTicket: builder.query<ServiceResponse<ITicket>, IdQuery>({
      query: ({ id }) => ({
        url: `/api/users/ticket/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'Tickets', id: arg.id }],
    }),

    updateTicketStatus: builder.mutation<ServiceResponse<boolean>, ITicketUpdateStatus>({
      query: (body) => ({
        url: '/api/user/update-ticket-status',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['Tickets'],
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
  useGetRoleQuery,
  useGetTicketTypesQuery,
  useUpsertTicketTypeMutation,
  useDeleteTicketTypeMutation,
  useGetTicketMessagesQuery,
  useGetTicketsQuery,
  useUpsertTicketMutation,
  useUpsertTicketMessageMutation,
  useGetTicketQuery,
  useUpdateTicketStatusMutation,
  useCreateNotificationMutation,
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useCreateSmsMessageMutation,
  useGetSmsMessageQuery,
  useDeleteSmsMessageMutation,
  useGetSingleSmsMessageQuery,
  useUpdateSmsMessageMutation,
} = userApiSlice
