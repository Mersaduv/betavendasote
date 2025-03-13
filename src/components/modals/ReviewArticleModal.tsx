import { useState, useRef, useEffect } from 'react'

import { nanoid } from '@reduxjs/toolkit'

import { articleReviewSchema, ratingStatus, reviewSchema } from '@/utils'

import { SubmitHandler, useFieldArray, useForm, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import { useDisclosure } from '@/hooks'

import { ArrowLeft, Comment, Delete, Minus, Plus } from '@/icons'
import { HandleResponse } from '@/components/shared'
import { Modal, TextField, DisplayError, SubmitModalButton, Button, ResponsiveImage } from '@/components/ui'

import type { IArticleReviewForm, IReviewForm } from '@/types'
import { FaStar } from 'react-icons/fa'
import { useUpsertArticleReviewsMutation } from '@/services'

interface Props {
  articleTitle: string
  articleID: string
  articleImg: {
    id: string
    imageUrl: string
    placeholder: string
  }[]
}

const ReviewArticleModal: React.FC<Props> = (props) => {
  // ? Props
  const { articleTitle, articleID, articleImg } = props

  // ? State
  const [isShowReviewModal, reviewModalHandlers] = useDisclosure()

  // ? Form Hook
  const {
    handleSubmit,
    register,
    formState: { errors: formErrors },
    reset,
    control,
    setFocus,
  } = useForm<IArticleReviewForm>({
    resolver: yupResolver(articleReviewSchema) as unknown as Resolver<IArticleReviewForm>,
    defaultValues: {
      articleId: articleID,
      comment: '',
    },
  })

  // ? Create Review Query
  const [createReview, { isSuccess, isLoading, data, isError, error }] = useUpsertArticleReviewsMutation()

  // ? Handlers
  const submitHander: SubmitHandler<IArticleReviewForm> = (data) => {
    createReview({ articleId: articleID, comment: data.comment })
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
            reviewModalHandlers.close()
            reset()
          }}
          onError={() => {
            reviewModalHandlers.close()
            reset()
          }}
        />
      )}

      <Button type="button" onClick={reviewModalHandlers.open} className="flex items-center px-3 rounded py-2">
        <span className="text-sm text-white">دیدگاه خود را بنویسید</span>
      </Button>

      <Modal isShow={isShowReviewModal} onClose={reviewModalHandlers.close} effect="bottom-to-top">
        <Modal.Content
          onClose={reviewModalHandlers.close}
          className="flex h-full flex-col gap-y-3 bg-white py-3 pl-2 pr-4 md:rounded-lg "
        >
          <Modal.Header onClose={reviewModalHandlers.close}>ثبت دیدگاه</Modal.Header>
          <Modal.Body>
            <form
              className="flex flex-1 flex-col justify-between gap-y-5 overflow-y-auto pl-4"
              onSubmit={handleSubmit(submitHander)}
            >
              <div className="flex items-center justify-around">
                <div className="flex justify-start gap-4 w-full items-center">
                  <ResponsiveImage
                    dimensions="w-24 h-24 md:h-32 md:w-32"
                    src={articleImg[0].imageUrl}
                    blurDataURL={articleImg[0].placeholder}
                    alt={articleTitle}
                    imageStyles="object-contain"
                  />
                  <h3>{articleTitle}</h3>
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

              <div className="border-t-2 border- py-3 lg:pb-0 ">
                <SubmitModalButton isLoading={isLoading}>ثبت دیدگاه</SubmitModalButton>
              </div>
            </form>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default ReviewArticleModal
