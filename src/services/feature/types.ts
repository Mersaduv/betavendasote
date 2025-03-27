import { QueryParams } from '@/types'

export interface BaseClass<T> {
  id: T
  created: string
  updated: string
}
export type GetFeaturesQuery = QueryParams

export interface SizeDTO extends BaseClass<string> {
  name: string
  count: number | null
  description: string | null
  isDeleted?: boolean | null
}

export interface ProductSizeDTO extends BaseClass<string> {
  sizeType: string
  productSizeValues: ProductSizeValuesDTO[] | null
  imagesSrc: {
    id: string
    imageUrl: string
    placeholder: string | null
  }
}
export interface BaseClass<T> {
  id: T
  created: string
  updated: string
}

export interface ProductFeature extends BaseClass<string> {
  name: string
  values: FeatureValue[] | undefined
  count: number
  valueCount: number
  isDeleted: boolean
  productId: string | null
  categoryId: string | null
}

export interface ProductFeatureSize extends BaseClass<string> {
  name: string
  count: number
  values: SizeDTO[] | null
  valueCount: number
  isDeleted: boolean
  productId: string | null
}

export interface FeatureValue extends BaseClass<string> {
  name: string
  hexCode: string | null
  count: number | null
  description: string | null
  isDeleted: boolean
  productFeatureId: string | null
}

export interface GetCategoryFeaturesByCategory {
  productFeatures: ProductFeature[] | null
  productSizes: ProductSizeDTO[] | null
  sizeDTOs: SizeDTO[] | null
}

export interface GetCategoryFeaturesByCategoryOrAll {
  productFeatureSizes: ProductFeatureSize[] | null
  productFeatures: ProductFeature[] | null
}

export interface ProductFeatureUpdateDTO {
  id: string
  name: string
}
export interface ProductFeatureValueUpdateDTO {
  id: string
  name: string
  hexCode?: string
}

export interface FeatureValueDTO {
  id?: string
  name: string
  description?: string
  hexCode?: string
  productFeatureId?: string
}

export interface ProductFeatureCreateDTO {
  name: string
}

export interface ProductSizeValuesDTO {
  id: string
  name: string
  productSizeId: string
}
