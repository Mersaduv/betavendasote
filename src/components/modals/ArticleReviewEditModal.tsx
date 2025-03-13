import { useState, useEffect } from 'react'

import { useUpsertArticleReviewsMutation } from '@/services'

import { articleReviewSchema, reviewSchema } from '@/utils'

import { SubmitHandler, useForm, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import { HandleResponse } from '@/components/shared'
import { Modal, DisplayError, Button } from '@/components/ui'

import type { IArticleReviewForm, IArticleReview } from '@/types'
import { UpsertArticleReview } from '@/services/review/types'
interface Props {
  reviewState: IArticleReview | null
  isShowReviewModal: boolean
  close: () => void
  client?: boolean
}

const ArticleReviewEditModal: React.FC<Props> = (props) => {
  // ? Props
  const { reviewState, isShowReviewModal, close, client } = props

  // ? State
  const [status, setStatus] = useState<number | null>(null)

  // ? Create Review Query
  const [createReview, { isSuccess, isLoading, data, isError, error }] = useUpsertArticleReviewsMutation()
  // ? Form Hook
  const {
    handleSubmit,
    register,
    formState: { errors: formErrors },
    reset,
    control,
    setFocus,
    getValues,
    setValue,
  } = useForm<IArticleReviewForm>({
    resolver: yupResolver(articleReviewSchema) as unknown as Resolver<IArticleReviewForm>,
    defaultValues: {
      userId: '',
      articleId: '',
      comment: '',
    },
  })

  useEffect(() => {
    if (reviewState) {
      reset({
        status: reviewState.status,
        userId: reviewState.userId,
        comment: reviewState.comment,
        articleId: reviewState.article.id,
      })
    }
  }, [reviewState])

  // ? Handlers
  const submitHander: SubmitHandler<IArticleReviewForm> = (data) => {
    const upsertArticleReview: UpsertArticleReview = {
      id: reviewState?.id,
      articleId: data?.articleId || '',
      comment: data.comment,
      status: status !== null && !client ? status : client ? 1 : undefined,
    }
    createReview(upsertArticleReview)
  }

  // ? Re-Renders
  //*    Use useEffect to set focus after a delay when the modal is shown
  useEffect(() => {
    if (isShowReviewModal) {
      const timeoutId = setTimeout(() => {
        setFocus('comment')
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [isShowReviewModal])

  // ? Render(s)
  return (
    <>
      {/* Handle Create Review Response */}
      {(isSuccess || isError) && (
        <HandleResponse
          isError={isError}
          isSuccess={isSuccess}
          error={error}
          message={data?.message}
          onSuccess={() => {
            close()
            reset()
          }}
          onError={() => {
            close()
            reset()
          }}
        />
      )}

      <Modal isShow={isShowReviewModal} onClose={close} effect="bottom-to-top">
        <Modal.Content
          onClose={close}
          className="flex flex-col gap-y-3 bg-white py-3 pl-2 pr-4 md:rounded-lg  md:h-fit h-full overflow-auto"
        >
          <Modal.Header onClose={close}>بررسی دیدگاه</Modal.Header>
          <Modal.Body>
            <form
              className="flex flex-1 flex-col justify-between gap-y-5 overflow-y-auto pl-4"
              onSubmit={handleSubmit(submitHander)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <h3 className="mr-4">{reviewState?.article.title}</h3>
                </div>
              </div>

              {/* comment */}
              <div className="space-y-31">
                <label className="text-xs text-gray-700 md:min-w-max lg:text-sm" htmlFor="comment">
                  متن نظر
                </label>
                <textarea className="input h-24 resize-none" id="comment" {...register('comment')} />
                <DisplayError errors={formErrors.comment} />
              </div>
              <div className="border-t-2 border- py-3 pb-0 flex gap-x-2 justify-end">
                {!client ? (
                  <>
                    <Button
                      type="submit"
                      className="bg-green-500 text-white w-[100px] py-2 rounded"
                      onClick={() => setStatus(2)}
                      isLoading={isLoading}
                    >
                      تایید
                    </Button>
                    <Button
                      type="submit"
                      className="bg-red-500 text-white w-[100px] py-2 rounded"
                      onClick={() => setStatus(3)}
                      isLoading={isLoading}
                    >
                      رد
                    </Button>
                  </>
                ) : (
                  <Button type="submit" className="bg-green-500 text-white py-2 rounded" isLoading={isLoading}>
                    بروز رسانی
                  </Button>
                )}
              </div>
            </form>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default ArticleReviewEditModal
