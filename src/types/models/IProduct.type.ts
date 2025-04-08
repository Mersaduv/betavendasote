import { SizeDTO } from '@/services/feature/types'
import { ISizeInfoModel } from '../forms.type'
import { IBrand } from './IBrand.type'
import { ICategory } from './ICategory.type'

export interface IProduct {
  id: string
  title: string
  stockTag?: string
  mainImageSrc: {
    id: string
    imageUrl: string
    placeholder: string
  }
  imagesSrc?: {
    id: string
    imageUrl: string
    placeholder: string
  }[]
  code: string
  slug: string
  price: number
  isFake: boolean
  isActive: boolean
  date: any
  parsedDate: string | null
  publishTime: boolean
  isDeleted: boolean
  status: number
  productType: number
  brandId?: string
  brandName?: string
  brandData: IBrand
  inStock: number
  productSizeInfo?: IProductSizeInfo
  productFeatureInfo?: IProductFeatureInfo
  // productScale?:
  description: string
  guideDescription: string
  inventoryLocation: string
  discount: number
  categoryList?: string[]
  categoryLevels?: ICategoryLevel[]
  parentCategories: CategoryWithAllParents
  stockItems: GetStockItems[]
  categoryId: string
  size?: string[]
  sold?: number
  rating?: number
  reviewCount?: number
  created?: string
  lastUpdated?: string
}

export interface GetStockItems {
  id?: string
  stockId?: string
  isHidden: boolean
  imagesSrc?: {
    id: string
    imageUrl: string
    placeholder: string
  }[]
  featureValueId?: string[]
  sizeId?: string
  idx?: string
  quantity: number
  price: number
  weight: number
  purchasePrice: number
  discount: number
  discountRemainingTime?: string
  [key: string]: any
}

export interface CategoryWithAllParents {
  category: ICategory
  parentCategories: ICategory[]
}

export interface IProductSizeInfo {
  sizeType: '0' | '1'
  columns?: SizeDTO[] | null
  rows?: ISizeInfoModel[]
  imagesSrc?: {
    id: string
    imageUrl: string
    placeholder: string
  }
}

export interface IProductFeatureInfo {
  productSizeInfo?: IProductSizeInfo[]
  colorDTOs?: IColorDTO[]
  featureValueInfos?: IObjectValue[]
}

export interface IColorDTO {
  id: string
  name: string
  hexCode: string
}

export interface IObjectValue {
  id: string
  title: string
  value?: { id: string; name: string }[]
}

export interface ICategoryLevel {
  id: string
  name: string
  slug: string
  url: string
  imagesSrc?: {
    id: string
    imageUrl: string
    placeholder: string
  }[]
  parentCategoryId?: number
  level: number
}

export interface EntityImage {
  id: string
  imageUrl: string
  placeholder: string
}
