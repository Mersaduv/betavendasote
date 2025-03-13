import type { IArticle, IArticleReview, IPagination, IProduct, IReview, IReviewForm, ServiceResponse } from '@/types'

export type MsgResult = { msg: string }
export type IdQuery = { id: string }

export type ReviewsResult = {
  reviewsLength: number
  pagination: IPagination<IReview[]>
}
export type GetReviewsResult = ServiceResponse<IPagination<IArticleReview[]>>

export type GetReviewsQuery = { page: number }
export type CreateReviewQuery = IReviewForm
export type UpsertArticleReview = { id?: string; comment: string; articleId: string; status?: number }
export type ProductReviewsResult = {
  reviewsLength: number
  pagination: IPagination<IReview[]>
}
export type GetProductReviewsResult = ServiceResponse<ProductReviewsResult>

export type GetProductReviewsQuery = { id: string; page: number; pageSize?: number; status: string }
export type GetArticleReviewsQuery = { id: string; page: number; pageSize?: number; status: string }
export type GetSingleReviewResult = ServiceResponse<IReview>
export type EditReviewQuery = { id: string; body: Partial<IReview> }
export type GetReviewsResultPagination<T> = ServiceResponse<IPagination<T>>
export interface IClientReview {
  id: string
  userId: string
  comment: string
  status: number
  userName: string
  mobileNumber: string
  created: string
  lastUpdated: string
  reviewType: 'Review' | 'ArticleReview'

  productId?: string
  title?: string
  rating?: number
  positivePoints?: { id: string; title: string }[]
  negativePoints?: { id: string; title: string }[]
  productImageUrl?: { id: string; imageUrl: string; placeholder: string }
  imageUrls?: { id: string; imageUrl: string; placeholder: string }[]
  product?: IProduct

  article?: IArticle
}
