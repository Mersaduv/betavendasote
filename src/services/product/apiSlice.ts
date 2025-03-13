import baseApi from '@/services/baseApi'
import { generateQueryParams, getToken } from '@/utils'
import type {
  BulkRequest,
  GetProductResult,
  GetProductsQuery,
  GetProductsResult,
  IdQuery,
  MsgResult,
  SuggestionsResults,
} from './types'
import { ICategory, IEditPriceForm, IPagination, ISuggestionForm, QueryParams, ServiceResponse } from '@/types'
import { ISuggestion } from '@/types/models/ISuggestion.type'
import { IEditPrice } from '@/types/models/IEditPrice.type'

export const productApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<GetProductsResult, GetProductsQuery>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/product-list?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result?.data?.pagination.data
          ? [
              ...result.data?.pagination.data.map(({ id }) => ({
                type: 'Product' as const,
                id: id,
              })),
              'Product',
            ]
          : ['Product'],
    }),

    getSingleProduct: builder.query<GetProductResult, IdQuery>({
      query: ({ id }) => ({
        url: `/api/product/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Product', id: arg.id }],
    }),

    getProductByCategory: builder.query<GetProductResult, IdQuery>({
      query: ({ id }) => ({
        url: `/api/products/category/${id}`,
        method: 'GET',
      }),
    }),

    deleteProduct: builder.mutation<MsgResult, IdQuery>({
      query: ({ id }) => ({
        url: `/api/product/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    deleteTrashProduct: builder.mutation<MsgResult, IdQuery>({
      query: ({ id }) => {
        return {
          url: `/api/product/trash/${id}`,
          method: 'POST',
        }
      },
      invalidatesTags: ['Product'],
    }),

    restoreProduct: builder.mutation<MsgResult, IdQuery>({
      query: ({ id }) => {
        return {
          url: `/api/product/restore/${id}`,
          method: 'POST',
        }
      },
      invalidatesTags: ['Product'],
    }),

    createProduct: builder.mutation<ServiceResponse<string>, FormData>({
      query: (body) => ({
        url: `/api/product`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      }),
      invalidatesTags: ['Product', 'Category'],
    }),

    updateProduct: builder.mutation<ServiceResponse<string>, FormData>({
      query: (body) => ({
        url: `/api/product/update`,
        method: 'POST',
        body,
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: ['Product'],
    }),

    bulkUpdateProduct: builder.mutation<MsgResult, BulkRequest>({
      query: (body) => ({
        url: `/api/product/bulk-update`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
    }),

    getSuggestions: builder.query<ServiceResponse<SuggestionsResults>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/suggestions?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result && result.data && result.data.result && result.data.result.data
          ? [
              ...result.data?.result?.data?.map(({ id }) => ({
                type: 'Suggestion' as const,
                id: id,
              })),
              'Suggestion',
            ]
          : ['Suggestion'],
    }),

    upsertSuggestion: builder.mutation<ServiceResponse<string>, ISuggestionForm>({
      query: (body) => ({
        url: `/api/suggestion`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Suggestion'],
    }),

    deleteSuggestion: builder.mutation<MsgResult, IdQuery>({
      query: ({ id }) => ({
        url: `/api/suggestions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Suggestion'],
    }),

    upsertEditPrice: builder.mutation<ServiceResponse<string>, IEditPriceForm>({
      query: (body) => ({
        url: `/api/products/edit-price`,
        method: 'POST',
        body,
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: ['EditPrice'],
    }),

    getEditPrices: builder.query<ServiceResponse<IPagination<IEditPrice[]>>, QueryParams>({
      query: ({ ...params }) => {
        const queryParams = generateQueryParams(params)
        return {
          url: `/api/products/edit-prices?${queryParams}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result && result.data && result.data.data
          ? [
              ...result.data?.data?.map(({ id }) => ({
                type: 'EditPrice' as const,
                id: id,
              })),
              'EditPrice',
            ]
          : ['EditPrice'],
    }),

    deleteEditPrice: builder.mutation<MsgResult, IdQuery>({
      query: ({ id }) => ({
        url: `/api/products/edit-price/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EditPrice'],
    }),

    getEditPriceById: builder.query<ServiceResponse<IEditPrice>, IdQuery>({
      query: ({ id }) => ({
        url: `/api/product/edit-price/${id}`,
        method: 'GET',
      }),
      providesTags: (result) => [{ type: 'EditPrice', id: result?.data?.id }],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetSingleProductQuery,
  useDeleteProductMutation,
  useBulkUpdateProductMutation,
  useGetProductByCategoryQuery,
  useDeleteTrashProductMutation,
  useRestoreProductMutation,
  useGetSuggestionsQuery,
  useUpsertSuggestionMutation,
  useDeleteSuggestionMutation,
  useUpsertEditPriceMutation,
  useGetEditPricesQuery,
  useDeleteEditPriceMutation,
  useGetEditPriceByIdQuery,
} = productApiSlice
