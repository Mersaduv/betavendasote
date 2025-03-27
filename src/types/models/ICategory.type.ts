import { CategorySizeDTO } from '@/services/category/types'
import { IBrand } from './IBrand.type'

export interface ICategory {
  id: string
  name: string
  slug: string
  imagesSrc?: {
    id: string
    imageUrl: string
    placeholder: string
  } | null
  parentCategoryId?: string
  level: number
  count: number
  subCategoryCount: number
  featureCount: number
  featureIds: string[]
  sizeCount: number
  productSizeCount: number
  productSizeId: string[]
  categorySizes?: CategorySizeDTO
  brandCount: number
  isActive: boolean
  isActiveProduct: boolean
  isDeleted: boolean
  hasSizeProperty: boolean
  brands: IBrand[]
  parentCategory?: ICategory
  parentCategories?: ICategory[]
  parentCategoriesTree?: ICategory[]
  childCategories?: ICategory[]
  categories?: ICategory[]
  created: string
  lastUpdated: string
}
