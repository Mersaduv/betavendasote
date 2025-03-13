import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useState } from 'react'

import { useAppSelector, useDisclosure } from '@/hooks'

import { useRouter } from 'next/router'

import { EmptyCommentsList } from '@/components/emptyList'
import { ProfileLayout } from '@/components/Layouts'
import { ArticleReviewEditModal, ConfirmDeleteModal, ReviewEditModal } from '@/components/modals'
import { DataStateDisplay, HandleResponse, Header, MetaTags } from '@/components/shared'
import { PageContainer } from '@/components/ui'

import type { NextPage } from 'next'
import { useDeleteArticleReviewMutation, useDeleteReviewMutation, useGetClientReviewsQuery } from '@/services'
import { ReveiwSkeleton } from '@/components/skeleton'
import { ClientReviewCard, ReviewCard } from '@/components/review'
import { Pagination } from '@/components/navigation'
import { IClientReview } from '@/services/review/types'
import { IArticleReview, IReview } from '@/types'

const Reviews: NextPage = () => {
  // ? Assets
  const { query } = useRouter()
  const { generalSetting } = useAppSelector((state) => state.design)
  // ? Modals
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()
  const [isShowReviewModal, reviewModalHandlers] = useDisclosure()
  const [reviewState, setReviewState] = useState<IClientReview | null>(null)

  // ? States
  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })

  // ? Queries
  //*    Delete Review
  const [
    deleteReview,
    {
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
      data: dataDelete,
      isLoading: isLoadingDelete,
    },
  ] = useDeleteReviewMutation()

  const [
    deleteArticleReview,
    {
      isSuccess: isSuccessDeleteArticleReview,
      isError: isErrorDeleteArticleReview,
      error: errorDeleteArticleReview,
      data: dataDeleteArticleReview,
      isLoading: isLoadingDeleteArticleReview,
    },
  ] = useDeleteArticleReviewMutation()

  //*   Get Reviews
  const { data, ...reviewsQueryProps } = useGetClientReviewsQuery({
    page: query.page ? +query.page : 1,
    pageSize: 8,
  })

  // ? Handlers
  const deleteReviewHandler = (item: IClientReview) => {
    setReviewState(item)
    setDeleteInfo({ id: item.id })
    confirmDeleteModalHandlers.open()
  }

  const deleteArticleReviewHandler = (item: IClientReview) => {
    setReviewState(item)
    setDeleteInfo({ id: item.id })
    confirmDeleteModalHandlers.open()
  }

  const onConfirmDelete = () => {
    if (reviewState?.reviewType === 'ArticleReview') {
      deleteArticleReview({ id: deleteInfo.id })
    } else {
      deleteReview({ id: deleteInfo.id })
    }
  }

  const onCancelDelete = () => {
    setDeleteInfo({ id: '' })
    confirmDeleteModalHandlers.close()
    setReviewState(null)
  }

  const onSuccessDelete = () => {
    confirmDeleteModalHandlers.close()
    setReviewState(null)
    setDeleteInfo({ id: '' })
  }

  const onErrorDelete = () => {
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
    setReviewState(null)
  }

  // ? Render(s)
  return (
    <>
      {reviewState?.reviewType === 'ArticleReview' ? (
        <ArticleReviewEditModal
          reviewState={reviewState as IArticleReview}
          isShowReviewModal={isShowReviewModal}
          close={reviewModalHandlers.close}
          client
        />
      ) : (
        <ReviewEditModal
          reviewState={reviewState as IReview}
          isShowReviewModal={isShowReviewModal}
          close={reviewModalHandlers.close}
          client
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        deleted
        title="دیدگاه‌"
        isLoading={false}
        isShow={isShowConfirmDeleteModal}
        onClose={confirmDeleteModalHandlers.close}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />

      {(isSuccessDeleteArticleReview || isErrorDeleteArticleReview) && (
        <HandleResponse
          isError={isErrorDeleteArticleReview}
          isSuccess={isSuccessDeleteArticleReview}
          error={errorDeleteArticleReview}
          message={dataDeleteArticleReview?.msg}
          onSuccess={onSuccessDelete}
          onError={onErrorDelete}
        />
      )}

      {/* Handle Delete Response */}
      {(isSuccessDelete || isErrorDelete) && (
        <HandleResponse
          isError={isErrorDelete}
          isSuccess={isSuccessDelete}
          error={errorDelete}
          message={dataDelete?.msg}
          onSuccess={onSuccessDelete}
          onError={onErrorDelete}
        />
      )}

      <main id="profileReviews">
        <MetaTags
          title={'پروفایل' + ' | ' + 'دیدگاه ها'}
          description={generalSetting?.shortIntroduction || 'توضیحاتی فروشگاه اینترنتی'}
          keywords={generalSetting?.googleTags || ' اینترنتی, فروشگاه'}
        />
        <Header />

        <ProfileLayout isProfile>
          <PageContainer title="دیدگاه‌ها">
            <div>
              <div className="flex mt-3 px-4 text-sm md:text-base mx-3 border border-[#e90089] rounded-md py-2 justify-between items-center bg-[#fde5f3] text-[#e90089]">
                {' '}
                <h3 className="px-3 py-2.5">{'دیدگاه‌ها'}</h3>
              </div>
            </div>
            <DataStateDisplay
              {...reviewsQueryProps}
              dataLength={data && data.data && data.data.totalCount ? data.data.totalCount : 0}
              emptyComponent={<EmptyCommentsList />}
              loadingComponent={<ReveiwSkeleton />}
            >
              <div className="space-y-3 px-4 py-3 ">
                {data &&
                  data.data &&
                  data.data.data &&
                  data.data.data.map((item) => (
                    <ClientReviewCard
                      deleteReviewHandler={deleteReviewHandler}
                      deleteArticleReviewHandler={deleteArticleReviewHandler}
                      key={item.id}
                      item={item}
                      open={reviewModalHandlers.open}
                      setReviewState={setReviewState}
                    />
                  ))}
              </div>
            </DataStateDisplay>

            {data && data.data && data.data.data && data.data.data.length > 0 && (
              <div className="mx-auto py-4 lg:max-w-5xl">
                <Pagination pagination={data.data} section="profileReviews" client />
              </div>
            )}
          </PageContainer>
        </ProfileLayout>
      </main>
    </>
  )
}

export default dynamic(() => Promise.resolve(Reviews), { ssr: false })
