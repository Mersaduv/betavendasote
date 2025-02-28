import baseApi from '@/services/baseApi'

import type {
  CreateArticleReview,
  CreateReviewQuery,
  EditReviewQuery,
  GetArticleReviewsQuery,
  GetProductReviewsQuery,
  GetProductReviewsResult,
  GetReviewsQuery,
  GetReviewsResult,
  GetSingleReviewResult,
  IdQuery,
  MsgResult,
} from './types'
import { IArticleReview, IPagination, IReview, QueryParams, ServiceResponse } from '@/types'
import { generateQueryParams, getToken } from '@/utils'

export const reviewApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query<ServiceResponse<IPagination<IReview[]>>, QueryParams>({
      query: ({ page }) => ({
        url: `/api/reviews?page=${page}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
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
        result?.data?.pagination.data
          ? [
              ...result.data?.pagination?.data.map(({ id }) => ({
                type: 'ArticleReview' as const,
                id: id,
              })),
              'ArticleReview',
            ]
          : ['ArticleReview'],
    }),

    getArticleReviews: builder.query<ServiceResponse<IPagination<IArticleReview[]>>, GetProductReviewsQuery>({
      query: ({ id, page }) => ({
        url: `/api/articleReviews/${id}?page=${page}&pageSize=5`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }) => ({
                type: 'ArticleReview' as const,
                id: id,
              })),
              'ArticleReview',
            ]
          : ['ArticleReview'],
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

    createArticleReviews: builder.mutation<ServiceResponse<boolean>, CreateArticleReview>({
      query: (body) => ({
        url: `/api/articleReviews`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['ArticleReview'],
    }),

    getProductReviews: builder.query<GetProductReviewsResult, GetProductReviewsQuery>({
      query: ({ id, page }) => ({
        url: `/api/reviews/${id}?page=${page}&pageSize=5`,
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
  }),
})

export const {
  useGetReviewsQuery,
  useGetSingleReviewQuery,
  useDeleteReviewMutation,
  useGetProductReviewsQuery,
  useEditReviewMutation,
  useCreateReviewMutation,
  useCreateArticleReviewsMutation,
  useGetAllArticleReviewsQuery,
  useGetArticleReviewsQuery,
} = reviewApiSlice
