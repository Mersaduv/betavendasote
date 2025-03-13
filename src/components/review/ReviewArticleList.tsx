import { useRouter } from 'next/router'

import { EmptyComment } from '@/components/emptyList'
import { ReviewArticleModal, ReviewModal } from '@/components/modals'
import { DataStateDisplay } from '@/components/shared'
import { ReveiwSkeleton } from '@/components/skeleton'
import { ReviewArticleCard, ReviewProductCard } from '@/components/review'
import { Pagination } from '@/components/navigation'

import { useGetAllArticleReviewsQuery, useGetArticleReviewsQuery, useGetProductReviewsQuery } from '@/services'
import { IArticle, IPagination, IProduct, IReview } from '@/types'

interface Props {
  numReviews: number
  article: IArticle
}

const ReviewArticleList: React.FC<Props> = (props) => {
  // ? Props
  const { numReviews, article } = props

  // ? Assets
  const { query } = useRouter()
  const page = query.page ? +query.page : 1

  // ? Get Article-Reviews Query
  const { data: articleReviewData, ...articlesReviewQueryProps } = useGetArticleReviewsQuery(
    {
      id: article.id,
      page,
      status: '2',
    },
    { skip: !(numReviews > 0) }
  )

  // ? Render(s)
  return (
    <>
      <section className="space-y-4 p-3 max-w-[1550px] mx-auto" id="_articleReviews">
        <div className=" ">
          <div className="mb-4">
            <ReviewArticleModal articleTitle={article.title} articleID={article.id} articleImg={[article.image]} />
          </div>

          <DataStateDisplay
            {...articlesReviewQueryProps}
            dataLength={
              articleReviewData && articleReviewData?.data && articleReviewData?.data?.totalCount
                ? articleReviewData?.data?.totalCount
                : 0
            }
            emptyComponent={<EmptyComment />}
            loadingComponent={<ReveiwSkeleton />}
          >
            <div className="space-y-2 divide-y-2 py-3 sm:px-2 lg:px-6">
              {articleReviewData?.data?.data?.map((item) => (
                <ReviewArticleCard item={item} key={item.id} />
              ))}
            </div>
          </DataStateDisplay>

          {(articleReviewData === undefined || articleReviewData && articleReviewData?.data && articleReviewData?.data?.totalCount === 0) && (
            <p className="mt-6 text-red-800">اولین نفری باشید که دیدگاه خود را میگذارد.</p>
          )}
          {articleReviewData &&
            articleReviewData?.data &&
            articleReviewData?.data?.totalCount > 2 &&
            articleReviewData.data && (
              <Pagination pagination={articleReviewData.data} section="_articleReviews" client />
            )}
        </div>
      </section>
    </>
  )
}

export default ReviewArticleList
