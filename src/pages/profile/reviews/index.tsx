import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useState } from 'react'

import { useAppSelector, useDisclosure } from '@/hooks'

import { useRouter } from 'next/router'

import { EmptyCommentsList } from '@/components/emptyList'
import { ProfileLayout } from '@/components/Layouts'
import { ConfirmDeleteModal } from '@/components/modals'
import { HandleResponse, Header, MetaTags } from '@/components/shared'
import { PageContainer } from '@/components/ui'

import type { NextPage } from 'next'

const Reviews: NextPage = () => {
  // ? Assets
  const { query } = useRouter()
  const { generalSetting } = useAppSelector((state) => state.design)
  // ? Modals
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()

  // ? States
  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })

  // ? Queries
  //*    Delete Review
  // const [
  //   deleteReview,
  //   {
  //     isSuccess: isSuccessDelete,
  //     isError: isErrorDelete,
  //     error: errorDelete,
  //     data: dataDelete,
  //     isLoading: isLoadingDelete,
  //   },
  // ] = useDeleteReviewMutation()

  //*   Get Reviews
  // const { data, ...reviewsQueryProps } = useGetReviewsQuery({
  //   page: query.page ? +query.page : 1,
  // })

  // ? Handlers
  const deleteReviewHandler = (id: string) => {
    setDeleteInfo({ id })
    confirmDeleteModalHandlers.open()
  }

  const onConfirmDelete = () => {
    // deleteReview({ id: deleteInfo.id })
  }

  const onCancelDelete = () => {
    setDeleteInfo({ id: '' })
    confirmDeleteModalHandlers.close()
  }

  const onSuccessDelete = () => {
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
  }

  const onErrorDelete = () => {
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
  }

  // ? Render(s)
  return (
    <>
      <ConfirmDeleteModal
        title="دیدگاه‌"
        isLoading={false}
        isShow={isShowConfirmDeleteModal}
        onClose={confirmDeleteModalHandlers.close}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />

      {/* Handle Delete Response */}
      {/* {(isSuccessDelete || isErrorDelete) && (
        <HandleResponse
          isError={isErrorDelete}
          isSuccess={isSuccessDelete}
          error={errorDelete}
          message={dataDelete?.msg}
          onSuccess={onSuccessDelete}
          onError={onErrorDelete}
        />
      )} */}

      <main id="profileReviews">
        <MetaTags
          title={'پروفایل' + ' | ' + 'دیدکاه ها'}
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
            {/* <DataStateDisplay
              {...reviewsQueryProps}
              dataLength={data ? data.reviewsLength : 0}
              emptyComponent={<EmptyCommentsList />}
              loadingComponent={<ReveiwSkeleton />}
            >
              <div className="space-y-3 px-4 py-3 ">
                {data &&
                  data.reviews.map((item) => (
                    <ReveiwCard deleteReviewHandler={deleteReviewHandler} key={item._id} item={item} />
                  ))}
              </div>
              
            </DataStateDisplay> */}

            {/* {data && data.reviewsLength > 5 && (
              <div className="mx-auto py-4 lg:max-w-5xl">
                <Pagination pagination={data.pagination} section="profileReviews" client />
              </div>
            )} */}

            <EmptyCommentsList />
          </PageContainer>
        </ProfileLayout>
      </main>
    </>
  )
}

export default dynamic(() => Promise.resolve(Reviews), { ssr: false })
