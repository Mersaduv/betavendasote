import { IArticle } from './IArticle.type'

export interface IArticleReview {
  id: string
  comment: string
  status: number
  userName: string
  mobileNumber: string
  userId: string
  article: IArticle
  lastUpdated: string
  created: string
}
