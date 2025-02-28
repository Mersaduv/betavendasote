import { useState, useRef, useEffect } from 'react'

import { nanoid } from '@reduxjs/toolkit'
import { useCreateReviewMutation } from '@/services'

import { ratingStatus, reviewSchema } from '@/utils'

import { SubmitHandler, useFieldArray, useForm, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import { useDisclosure } from '@/hooks'

import { ArrowLeft, Comment, Delete, Minus, Plus } from '@/icons'
import { HandleResponse } from '@/components/shared'
import { Modal, TextField, DisplayError, SubmitModalButton, Button, ResponsiveImage } from '@/components/ui'

import type { IReviewForm } from '@/types'
import { FaStar } from 'react-icons/fa'
import { MdClose } from 'react-icons/md'

interface Props {
  productTitle: string
  prdouctID: string
  productImg: {
    id: string
    imageUrl: string
    placeholder: string
  }[]
}

const ReviewModal: React.FC<Props> = (props) => {
  // ? Props
  const { productTitle, prdouctID, productImg } = props

  // ? Refs
  const positiveRef = useRef<HTMLInputElement | null>(null)
  const negativeRef = useRef<HTMLInputElement | null>(null)

  // ? State
  const [rating, setRating] = useState(1)
  const [hoverRating, setHoverRating] = useState(0)
  const [isShowReviewModal, reviewModalHandlers] = useDisclosure()

  // ? Create Review Query
  const [createReview, { isSuccess, isLoading, data, isError, error }] = useCreateReviewMutation()
  const [selectedFiles, setSelectedFiles] = useState<any[]>([])
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
  } = useForm<IReviewForm>({
    resolver: yupResolver(reviewSchema) as unknown as Resolver<IReviewForm>,
    defaultValues: {
      userId: '',
      productId: '',
      rating: 1,
      positivePoints: [],
      negativePoints: [],
      comment: '',
    },
  })

  const {
    fields: positivePointsFields,
    append: appentPositivePoint,
    remove: removePositivePoint,
  } = useFieldArray({
    name: 'positivePoints',
    control,
  })

  const {
    fields: negativePointsFields,
    append: appendNegativePoint,
    remove: removeNegativePoint,
  } = useFieldArray({
    name: 'negativePoints',
    control,
  })


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles: any[] = []

      Array.from(files).forEach((file) => {
        const img = new Image()
        img.src = URL.createObjectURL(file)

        img.onload = () => {
          URL.revokeObjectURL(img.src)

          validFiles.push(file)
          if (validFiles.length === Array.from(files).length) {
            setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles])
            if (validFiles.length > 0) {
              setValue('Thumbnail', ((getValues('Thumbnail') as File[]) || []).concat(validFiles))
            } else {
              setValue('Thumbnail', [])
            }
          }
        }
      })
    }
  }

  // ? Handlers
  const handleAddPositivePoint = () => {
    if (positiveRef.current && positiveRef.current.value !== '') {
      appentPositivePoint({ id: nanoid(), title: positiveRef.current.value })
      positiveRef.current.value = ''
    }
  }

  const handleAddNegativePoint = () => {
    if (negativeRef.current && negativeRef.current.value !== '') {
      appendNegativePoint({ id: nanoid(), title: negativeRef.current.value })
      negativeRef.current.value = ''
    }
  }

  const submitHander: SubmitHandler<IReviewForm> = (data) => {
    const formData = new FormData()

    formData.append('productId', prdouctID)
    formData.append('rating', rating.toString())
    formData.append('comment', data.comment)

    formData.append('positivePoints', data.positivePoints.map((point) => JSON.stringify(point, null, '\t')).join(','))
    formData.append('negativePoints', data.negativePoints.map((point) => JSON.stringify(point, null, '\t')).join(','))

    if (data.Thumbnail && data.Thumbnail.length > 0) {
      Array.from(data.Thumbnail).forEach((file) => {
        formData.append('ProductThumbnails', file)
      })
    }
    createReview(formData)
  }

  const handleDelete = (index: number) => {
    setSelectedFiles((prevFiles) => {
      const updatedFiles = [...prevFiles]
      updatedFiles.splice(index, 1)
      return updatedFiles
    })

    setValue(
      'Thumbnail',
      ((getValues('Thumbnail') as File[]) || []).filter((_, i) => i !== index)
    )
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
            setRating(1)
            setSelectedFiles([])
          }}
          onError={() => {
            reviewModalHandlers.close()
            reset()
            setRating(1)
            setSelectedFiles([])
          }}
        />
      )}

      <Button type="button" onClick={reviewModalHandlers.open} className="flex items-center px-3 rounded py-2">
        <span className="text-sm text-white">دیدگاه خود را بنویسید</span>
      </Button>

      <Modal isShow={isShowReviewModal} onClose={reviewModalHandlers.close} effect="bottom-to-top">
        <Modal.Content
          onClose={reviewModalHandlers.close}
          className="flex h-full flex-col gap-y-3 bg-white py-3 pl-2 pr-4 md:rounded-lg lg:h-[793px] overflow-auto"
        >
          <Modal.Header onClose={reviewModalHandlers.close}>ثبت دیدگاه</Modal.Header>
          <Modal.Body>
            <form
              className="flex flex-1 flex-col justify-between gap-y-5 overflow-y-auto pl-4"
              onSubmit={handleSubmit(submitHander)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <ResponsiveImage
                    dimensions="w-24 h-24 md:h-32 md:w-32"
                    src={productImg[0].imageUrl}
                    blurDataURL={productImg[0].placeholder}
                    alt={productTitle}
                    imageStyles="object-contain"
                  />
                  <h3 className="mr-4">{productTitle}</h3>
                </div>
                <div>
                  <div className="my-2 text-center">
                    <span className="text-sm text-black">امتیاز دهید!:‌</span>
                    <span className="px-1 text-sm text-sky-500">{ratingStatus[hoverRating || rating]}</span>
                  </div>
                  <div className="flex justify-center">
                    {Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <FaStar
                          key={index}
                          onClick={() => setRating(index + 1)}
                          onMouseEnter={() => setHoverRating(index + 1)}
                          onMouseLeave={() => setHoverRating(0)}
                          className={`cursor-pointer text-2xl ${
                            (hoverRating || rating) > index ? 'text-[#FFD700]' : 'text-[#eee]'
                          }`}
                        />
                      ))}
                  </div>
                </div>
              </div>

              {/* positivePoints */}
              <div className="space-y-1">
                <div className="space-y-1">
                  <label className="text-xs text-gray-700 md:min-w-max lg:text-sm" htmlFor="positivePoints">
                    نکات مثبت
                  </label>
                  <div className="input flex items-center">
                    <input
                      className="flex-1 bg-transparent focus:ring-0 border-none outline-none"
                      type="text"
                      name="positivePoints"
                      id="positivePoints"
                      ref={positiveRef}
                    />
                    <button
                      className="border border-green-500 rounded-full p-1"
                      onClick={handleAddPositivePoint}
                      type="button"
                    >
                      <Plus className="icon text-green-500" />
                    </button>
                  </div>
                </div>
                {positivePointsFields.length > 0 && (
                  <div className="space-y-1">
                    {positivePointsFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-x-4 px-3 bg-gray-100 py-2 rounded-lg">
                        <Plus className="icon text-green-500" />
                        <span className="ml-auto">{field.title}</span>
                        <button>
                          <Delete
                            className="icon hover:text-red-600 text-gray-500"
                            onClick={() => removePositivePoint(index)}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* negativePoints */}
              <div className="space-y-1">
                <div className="space-y-1">
                  <label className="text-xs text-gray-700 md:min-w-max lg:text-sm" htmlFor="negativePoints">
                    نکات منفی
                  </label>
                  <div className="input flex items-center">
                    <input
                      className="flex-1 bg-transparent focus:ring-0 border-none outline-none"
                      type="text"
                      name="negativePoints"
                      id="negativePoints"
                      ref={negativeRef}
                    />
                    <button
                      className="border border-red-500 rounded-full p-1"
                      onClick={handleAddNegativePoint}
                      type="button"
                    >
                      <Plus className="icon text-red-500" />
                    </button>
                  </div>
                </div>

                {negativePointsFields.length > 0 && (
                  <div className="space-y-1">
                    {negativePointsFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-x-4 px-3 bg-gray-100 py-2 rounded-lg">
                        <Minus className="icon text-red-500" />
                        <span className="ml-auto">{field.title}</span>
                        <button>
                          <Delete
                            className="icon  hover:text-red-600 text-gray-500"
                            onClick={() => removeNegativePoint(index)}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* comment */}
              <div className="space-y-31">
                <label className="text-xs text-gray-700 md:min-w-max lg:text-sm" htmlFor="comment">
                  متن نظر
                </label>
                <textarea className="input h-24 resize-none" id="comment" {...register('comment')} />
                <DisplayError errors={formErrors.comment} />
              </div>

              {/* Thumbnail upload */}
              <div className="border border-dashed border-[#009ef7] bg-[#f1faff] rounded text-center">
                <input type="file" multiple className="hidden" id="Thumbnail" onChange={handleFileChange} />
                <label htmlFor="Thumbnail" className="block cursor-pointer p-6 text-sm font-normal">
                  {selectedFiles.length > 0 ? (
                    <div className="flex flex-wrap gap-5 mt-0 px-8">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="text-sm text-gray-600 relative cursor-default">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-[80px] h-[88px] object-cover rounded-lg shadow-product"
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 shadow-product hover:bg-red-500 hover:text-white bg-gray-50 p-0.5 rounded-full text-gray-500"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              handleDelete(index)
                            }}
                          >
                            <MdClose className="text-base" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>برای انتخاب عکس کلیک کنید </div>
                  )}
                </label>
              </div>
              <div className="border-t-2 border- py-3 pb-0  ">
                <SubmitModalButton isLoading={isLoading}>ثبت دیدگاه</SubmitModalButton>
              </div>
            </form>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default ReviewModal
