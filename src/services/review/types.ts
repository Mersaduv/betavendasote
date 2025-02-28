import type { IPagination, IReview, IReviewForm, ServiceResponse } from '@/types'

export type MsgResult = { msg: string }
export type IdQuery = { id: string }

export type ReviewsResult = {
  reviewsLength: number
  pagination: IPagination<IReview[]>
}
export type GetReviewsResult = ServiceResponse<ReviewsResult>

export type GetArticleReviewsQuery = { id: string; page: number }

export type GetReviewsQuery = { page: number }
export type CreateReviewQuery = IReviewForm
export type CreateArticleReview = { comment: string; articleId: string }
export type ProductReviewsResult = {
  reviewsLength: number
  pagination: IPagination<IReview[]>
}
export type GetProductReviewsResult = ServiceResponse<ProductReviewsResult>

export type GetProductReviewsQuery = { id: string; page: number }
export type GetSingleReviewResult = ServiceResponse<IReview>
export type EditReviewQuery = { id: string; body: Partial<IReview> }
export type GetReviewsResultPagination = ServiceResponse<IPagination<IReview[]>>