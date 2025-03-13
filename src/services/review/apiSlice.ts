import baseApi from '@/services/baseApi'

import type {
  CreateReviewQuery,
  EditReviewQuery,
  GetArticleReviewsQuery,
  GetProductReviewsQuery,
  GetProductReviewsResult,
  GetReviewsQuery,
  GetReviewsResult,
  GetSingleReviewResult,
  IClientReview,
  IdQuery,
  MsgResult,
  UpsertArticleReview,
} from './types'
import { IArticleReview, IPagination, IReview, QueryParams, ServiceResponse } from '@/types'
import { generateQueryParams, getToken } from '@/utils'

export const reviewApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query<ServiceResponse<IPagination<IReview[]>>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/reviews?${queryParams}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data?.data?.map(({ id }) => ({
                type: 'Review' as const,
                id: id,
              })),
              'Review',
            ]
          : ['Review'],
    }),

    getAllArticleReviews: builder.query<GetReviewsResult, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/all-articleReviews?${queryParams}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data?.data.map(({ id }) => ({
                type: 'Review' as const,
                id: id,
              })),
              'Review',
            ]
          : ['Review'],
    }),

    getArticleReviews: builder.query<ServiceResponse<IPagination<IArticleReview[]>>, GetArticleReviewsQuery>({
      query: ({ id, page, status }) => ({
        url: `/api/articleReviews/${id}?page=${page}&status=${status}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }) => ({
                type: 'Review' as const,
                id: id,
              })),
              'Review',
            ]
          : ['Review'],
    }),

    createReview: builder.mutation<ServiceResponse<boolean>, FormData>({
      query: (body) => ({
        url: `/api/reviews`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['Review'],
    }),

    upsertArticleReviews: builder.mutation<ServiceResponse<boolean>, UpsertArticleReview>({
      query: (body) => ({
        url: `/api/articleReviews`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['Review'],
    }),

    getProductReviews: builder.query<GetProductReviewsResult, GetProductReviewsQuery>({
      query: ({ id, page, status }) => ({
        url: `/api/reviews/${id}?page=${page}&pageSize=5&status=${status}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result?.data?.pagination.data
          ? [
              ...result.data?.pagination.data.map(({ id }) => ({
                type: 'Review' as const,
                id: id,
              })),
              'Review',
            ]
          : ['Review'],
    }),

    getSingleReview: builder.query<GetSingleReviewResult, IdQuery>({
      query: ({ id }) => ({
        url: `/api/review/${id}`,
        method: 'GET',
      }),
      providesTags: (result, err, arg) => [{ type: 'Review', id: arg.id }],
    }),

    deleteReview: builder.mutation<MsgResult, IdQuery>({
      query: ({ id }) => ({
        url: `/api/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review'],
    }),

    deleteArticleReview: builder.mutation<MsgResult, IdQuery>({
      query: ({ id }) => ({
        url: `/api/articleReviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review'],
    }),

    editReview: builder.mutation<MsgResult, EditReviewQuery>({
      query: ({ id, body }) => ({
        url: `/api/reviews/${id}`,
        method: 'PATCH',
        body,
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: (result, err, arg) => [{ type: 'Review', id: arg.id }],
    }),

    getClientReviews: builder.query<ServiceResponse<IPagination<IClientReview[]>>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/reviews/client-reviews?${queryParams}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data?.data.map(({ id }) => ({
                type: 'Review' as const,
                id: id,
              })),
              'Review',
            ]
          : ['Review'],
    }),
  }),
})

export const {
  useGetReviewsQuery,
  useGetSingleReviewQuery,
  useDeleteReviewMutation,
  useGetProductReviewsQuery,
  useEditReviewMutation,
  useCreateReviewMutation,
  useUpsertArticleReviewsMutation,
  useGetAllArticleReviewsQuery,
  useGetArticleReviewsQuery,
  useGetClientReviewsQuery,
  useDeleteArticleReviewMutation,
} = reviewApiSlice
