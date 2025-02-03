import type { ICart, ICategory, IProduct, IReview, IUser } from '@/types'
import { strict } from 'assert'

export interface ICategoryForm {
  id?: string | undefined
  name: string
  isActive: boolean
  isActiveProduct: boolean
  thumbnail?: File | null
  hasSizeProperty?: boolean
  mainCategoryId?: string
  mainId?: string
  parentCategoryId?: string
  level: number
}

export type ILoginForm = {
  mobileNumber: string
  password: string
}

export type IRegisterForm = {
  mobileNumber: string
  password: string
}

export type AddressFormBody = {
  id?: string
  userId: string
  fullName: string
  mobileNumber: string
  province: string
  city: string
  fullAddress: string
  postalCode: string
}

export interface IBrandForm {
  id?: string
  nameFa: string
  nameEn: string
  Thumbnail: File
  inSlider: boolean
  isActive: boolean
  description?: string
  isDeleted?: boolean
}

export interface IProductForm {
  Id: string
  Title: string
  stockTag?: string
  IsActive: boolean
  MainThumbnail: File | null
  Thumbnail?: File[] | null
  CategoryId: string
  Description: string
  IsFake: boolean
  status: 'New' | 'Used'
  productType: 'Product' | 'ProductFile'
  BrandId?: string
  FeatureValueIds?: string[]
  StockItems?: IStockItem[]
  ProductScale?: IProductScaleCreate
}

export interface IStockItem {
  id?: string
  stockId?: string
  isHidden?: boolean
  ImageStock?: File
  featureValueId?: string[]
  sizeId?: string
  quantity?: number
  price?: number
  discount?: number
  weight?: number
  purchasePrice?: number
  offerTime?: number | null
  minuteTime?: number
  secondTime?: number
  [key: string]: any
}

export interface IProductScaleCreate {
  columnSizes?: ISizeIds[]
  Rows: ISizeInfoModel[]
  productId?: string
}

export interface ISizeIds {
  id: string
  name: string
}

export interface ISizeInfoModel {
  id?: string
  idx?: string
  modelSizeId?: string
  scaleValues?: string[]
  productSizeValue?: string
  productSizeValueId?: string
}

export type IReviewForm = {
  userId: string
  productId: string
  rating: number
  positivePoints: {
    id: string
    title: string
  }[]
  negativePoints: {
    id: string
    title: string
  }[]
  comment: string
  Thumbnail: FileList
}

export type IOrderForm = {
  id: string
  orderNum: string
  status: number
  user: IUser
  address: string
  cart: ICart[]
  cancelOrder: string
  totalItems: number
  totalPrice: number
  orgPrice: number
  totalDiscount: number
  paymentMethod: string
  delivered: boolean
  paid: boolean
  purchaseInvoice?: FileList
}

export interface IProductSizeForm {
  id?: string | null
  sizeType: '0' | '1'
  productSizeValues: string[]
  thumbnail: File | null
  categoryIds: string[]
}

export interface IProductStatus {
  id: 'New' | 'Used'
  name: string
}
export interface IProductType {
  id: 'Product' | 'ProductFile'
  name: string
}

export interface IProductIsFake {
  id: 'true' | 'false'
  name: string
}

export interface ITextMarqueeForm {
  name?: string
  isActive: boolean
}

export interface ISliderForm {
  id?: string
  thumbnail?: File | null
  link: string
  category: string
  type: string
  isActive?: boolean
}
export interface IBannerForm {
  id?: string
  index: number
  thumbnail?: File | null
  link: string
  category: string
  type: string
  isActive?: boolean
}
export interface IArticleBannerForm {
  id?: string
  index: number
  articleId?: string
  isActive: boolean
}

export interface IFooterBannerForm {
  id?: string
  thumbnail?: File | null
  link: string
  category: string
  type: string
  isActive?: boolean
}

export interface IArticleForm {
  id?: string | undefined
  title: string
  isActive: boolean
  thumbnail: File | null
  place: number
  description: string
  categoryId: string
}

export interface IUserForm {
  id?: string | undefined
  userType: number
  roleId: string
  isActive: boolean
  thumbnail: File | null
  idCardThumbnail: File | null
  mobileNumber: string
  passCode: string
  //optional
  firstName: string
  familyName: string
  fatherName?: string
  telePhone?: string
  city: {
    id?: number
    name: string
    slug?: string
    province_id?: number
  }
  province: {
    id?: number
    name: string
    slug?: string
  }
  postalCode?: string
  firstAddress?: string
  secondAddress?: string
  birthDate?: string
  idNumber?: string
  nationalCode?: string
  bankAccountNumber?: string
  shabaNumber?: string
  note?: string

  // Supplier
  storeName?: string
  storeTelephone?: string
  storeAddress?: string
  bussinessLicenseNumber?: string
  // store setting
  isActiveAddProduct?: boolean
  isPublishProduct?: boolean
  isSelectedAsSpecialSeller?: boolean
  commissionType: number | null
  percentageValue?: string
  sellerPerformance?: string
  timelySupply?: string
  shippingCommitment?: string
  noReturns?: string
}

export interface IGeneralSettingForm {
  id?: string | undefined
  title: string
  shortIntroduction: string
  googleTags: string
}

export interface ILogosForm {
  id?: string
  orgThumbnail?: File | null
  faviconThumbnail?: File | null
}

export interface IDesignItemForm {
  id?: string
  title: string
  thumbnail?: File | null
  link: string
  type: string
  isActive?: boolean
  index: number
  created?: string
  lastUpdated?: string
}

export interface IRoleForm {
  id?: string
  title: string
  isActive: string
  permissions: Record<string, boolean>
}
export interface IRoleRequest {
  id?: string
  title: string
  isActive: boolean
  permissions: string[]
}

export interface MobileNumberFormValues {
  mobileNumber: string
  password?: string
}
