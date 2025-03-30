import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    // baseUrl: 'https://localhost:7004',
    baseUrl: `${
      typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https' : 'http'
    }://45.159.150.230`,
    // baseUrl: 'https://apivendamode.liara.run',
    timeout: 60000,
  }),

  tagTypes: [
    'User',
    'Category',
    'Product',
    'Brand',
    'Review',
    'ArticleReview',
    'Order',
    'Canceled',
    'Returned',
    'Features',
    'FeatureValues',
    'ProductSize',
    'Size',
    'HeaderText',
    'Slider',
    'Banner',
    'FooterBrand',
    'Article',
    'ArticleBanner',
    'LogoImages',
    'GeneralSetting',
    'DesignItem',
    'StoreCategories',
    'SloganFooter',
    'Support',
    'Redirects',
    'Copyright',
    'ColumnFooter',
    'StoreBrands',
    'Permissions',
    'Roles',
    'TicketType',
    'Tickets',
    'TicketMessages',
    'Notification',
    'SmsMessage',
    'Suggestion',
    'EditPrice',
    'Costs',
  ],
  endpoints: (builder) => ({}),
})

export default apiSlice
