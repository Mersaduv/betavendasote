import baseApi from '@/services/baseApi'

import { generateQueryParams, getToken } from '@/utils'

import type {
  CreateCategoryQuery,
  GetAllCategoriesResult,
  GetCategoriesQuery,
  GetCategoriesResult,
  GetSingleCategoryResult,
  GetSubCategoriesQuery,
  GetSubCategoriesResult,
  IdAndQuery,
  IdQuery,
  MsgResult,
  UpdateCategoryBrands,
  UpdateCategoryFeature,
  UpdateCategoryQuery,
} from './types'
import { ICategory, ServiceResponse } from '@/types'

export const categoryApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<GetCategoriesResult, void>({
      query: () => ({
        url: '/api/categories',
        method: 'GET',
      }),
      providesTags: (result) =>
        result?.data?.categoryDTO
          ? [
              ...result?.data?.categoryDTO.map(({ id }) => ({
                type: 'Category' as const,
                id: id,
              })),
              'Category',
            ]
          : ['Category'],
    }),

    getAllCategories: builder.query<GetAllCategoriesResult, GetCategoriesQuery>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/all-categories?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result?.data?.data.map(({ id }) => ({
                type: 'Category' as const,
                id: id,
              })),
              'Category',
            ]
          : ['Category'],
    }),

    getCategoriesTree: builder.query<ServiceResponse<ICategory[]>, void>({
      query: () => ({
        url: '/api/categories-tree',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result?.data.map(({ id }) => ({
                type: 'Category' as const,
                id: id,
              })),
              'Category',
            ]
          : ['Category'],
    }),

    getSingleCategory: builder.query<GetSingleCategoryResult, IdQuery>({
      query: ({ id }) => ({
        url: `/api/category/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Category', id: arg.id }],
    }),

    getSubCategories: builder.query<GetSubCategoriesResult, GetSubCategoriesQuery>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/category/subCategories?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result?.data?.children
          ? [
              ...result?.data?.children.map(({ id }) => ({
                type: 'Category' as const,
                id: id,
              })),
              'Category',
            ]
          : ['Category'],
    }),

    getParenSubCategories: builder.query<ServiceResponse<ICategory[]>, IdAndQuery>({
      query: ({ id, query }) => {
        const queryParams = generateQueryParams(query)
        return {
          url: `/api/category/parentSub/${id}?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result?.data.map(({ id }) => ({
                type: 'Category' as const,
                id: id,
              })),
              'Category',
            ]
          : ['Category'],
    }),

    updateCategory: builder.mutation<MsgResult, FormData>({
      query: (body) => ({
        url: `/api/category/update`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['Category'],
    }),

    createCategory: builder.mutation<MsgResult, FormData>({
      query: (body) => ({
        url: `/api/category`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['Category'],
    }),

    updateCategoryFeature: builder.mutation<ServiceResponse<boolean>, UpdateCategoryFeature>({
      query: (data) => {
        return {
          url: '/api/category/feature-update',
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      },
      invalidatesTags: ['Features'],
    }),

    deleteCategory: builder.mutation<MsgResult, IdQuery>({
      query: ({ id }) => ({
        url: `/api/category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category', 'Article'],
    }),

    updateCategoryBrands: builder.mutation<MsgResult, UpdateCategoryBrands>({
      query: (data) => {
        return {
          url: '/api/category/category-brands',
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      },
      invalidatesTags: ['Category'],
    }),
  }),
})

export const {
  useGetParenSubCategoriesQuery,
  useGetCategoriesQuery,
  useGetAllCategoriesQuery,
  useGetSingleCategoryQuery,
  useGetSubCategoriesQuery,
  useGetCategoriesTreeQuery,
  useUpdateCategoryFeatureMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryBrandsMutation,
} = categoryApiSlice
