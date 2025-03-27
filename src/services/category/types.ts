import type { ICategoriesList, ICategory, ICategoryForm, IPagination, QueryParams, ServiceResponse } from '@/types'

export type MsgResult = ServiceResponse<boolean>
export type IdQuery = { id: string | undefined; isActive?: boolean }
export type IdAndQuery = { id: string | undefined; query: QueryParams }
export type GetCategoriesQuery = QueryParams
export type CategoriesResult = {
  categoryDTO: ICategory[]
  categoryList: ICategory[]
}
export type SubCategoryResult = {
  category: ICategory
  children: ICategory[] | []
}
export type CategoryFeatureForm = {
  categoryId: string
  featureIds?: string[] | null
  categorySizes?: CategorySizeDTO
  hasSizeProperty?: boolean
}
export type CategorySizeDTO = {
  ids?: string[] | null
  sizeIds?: string[] | null
}

export type GetCategoriesResult = ServiceResponse<CategoriesResult>
export type GetAllCategoriesResult = ServiceResponse<IPagination<ICategory[]>>

export type GetCategoriesTreeResult = ServiceResponse<ICategory[]>

export type GetSingleCategoryResult = ServiceResponse<ICategory>
export type UpdateCategoryQuery = ICategoryForm
export type CreateCategoryQuery = ICategoryForm
export type UpdateCategoryFeature = CategoryFeatureForm
export type GetSubCategoriesQuery = { id?: string; slug?: string }
export type GetSubCategoriesResult = ServiceResponse<SubCategoryResult>
export type UpdateCategoryBrands = {
  categoryId: string
  brandIds?: string[] | null
}
