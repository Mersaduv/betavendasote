import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import https from 'https';
const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    // baseUrl: 'https://localhost:7004',
    baseUrl: 'https://45.159.150.230',
    // baseUrl: 'https://apivendamode.liara.run',
    timeout: 60000,
    fetchFn: (input, init) => {
      const customInit = { ...init, agent: new https.Agent({ rejectUnauthorized: false }) };
      return fetch(input, customInit);
    },
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
