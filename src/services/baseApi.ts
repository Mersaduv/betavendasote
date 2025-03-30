import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${
      typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https' : 'http'
    }://45.159.150.230`,
    timeout: 60000,
  }),

  tagTypes: ['User', 'Category', 'Product', 'Brand', 'Review'],
  endpoints: (builder) => ({}),
})

export default apiSlice
