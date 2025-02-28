import { useState, useRef, useEffect } from 'react'

import { nanoid } from '@reduxjs/toolkit'
import { useCreateReviewMutation, useUpsertTicketMessageMutation } from '@/services'

import { ratingStatus, reviewSchema, ticketMessageSchema } from '@/utils'

import { SubmitHandler, useFieldArray, useForm, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import { useDisclosure } from '@/hooks'

import { ArrowLeft, Comment, Delete, Minus, Plus } from '@/icons'
import { HandleResponse } from '@/components/shared'
import { Modal, TextField, DisplayError, SubmitModalButton, Button, ResponsiveImage } from '@/components/ui'

import type { IReviewForm, ITicketMessageForm } from '@/types'
import { FaStar } from 'react-icons/fa'
import { MdClose } from 'react-icons/md'

interface Props {
  ticketId: string
  isCreator: boolean
  isRecipient: boolean
}

const TicketMessageModal: React.FC<Props> = (props) => {
  // ? Props
  const { ticketId, isCreator, isRecipient } = props

  // ? State
  const [isShowTicketMessageModal, ticketMessageModalHandlers] = useDisclosure()
  // ? Form Hook
  const {
    handleSubmit,
    register,
    formState: { errors: formErrors },
    reset,
    setFocus,
    getValues,
    setValue,
  } = useForm<ITicketMessageForm>({
    resolver: yupResolver(ticketMessageSchema) as unknown as Resolver<ITicketMessageForm>,
  })

  // ? Create Query
  const [createTicketMessage, { isSuccess, isLoading, data, isError, error }] = useUpsertTicketMessageMutation()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  //   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     if (e.target.files) {
  //       setSelectedFiles([...Array.from(e.target.files)])
  //       setValue('thumbnail', [...Array.from(e.target.files)])
  //     }
  //   }

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
              setValue('thumbnail', ((getValues('thumbnail') as File[]) || []).concat(validFiles))
            } else {
              setValue('thumbnail', [])
            }
          }
        }
      })
    }
  }
  const handleDelete = (index: number) => {
    setSelectedFiles((prevFiles) => {
      const updatedFiles = [...prevFiles]
      updatedFiles.splice(index, 1)
      return updatedFiles
    })

    setValue(
      'thumbnail',
      ((getValues('thumbnail') as File[]) || []).filter((_, i) => i !== index)
    )
  }
  // ? Handlers
  const submitHander: SubmitHandler<ITicketMessageForm> = (data) => {
    const formData = new FormData()
    formData.append('TicketId', ticketId)
    formData.append('Message', data.message)
    formData.append('IsCreator', isCreator.toString())
    formData.append('IsRecipient', isRecipient.toString())

    if (data.thumbnail && data.thumbnail.length > 0) {
      Array.from(data.thumbnail).forEach((file) => {
        formData.append('Thumbnail', file)
      })
    }
    createTicketMessage(formData)
  }
  // ? Re-Renders
  //*    Use useEffect to set focus after a delay when the modal is shown
  useEffect(() => {
    if (isShowTicketMessageModal) {
      const timeoutId = setTimeout(() => {
        setFocus('message')
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [isShowTicketMessageModal])

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
            ticketMessageModalHandlers.close()
            setSelectedFiles([])
            reset()
          }}
          onError={() => {
            ticketMessageModalHandlers.close()
            setSelectedFiles([])
            reset()
          }}
        />
      )}

      <div
        onClick={ticketMessageModalHandlers.open}
        className="text-sm mb-1 bg-gray-100 cursor-pointer hover:bg-[#fde5f3] w-fit px-4 py-2 rounded-full text-gray-500"
      >
        ارسال پاسخ
      </div>

      <Modal
        isShow={isShowTicketMessageModal}
        onClose={() => {
          setSelectedFiles([])
          ticketMessageModalHandlers.close()
        }}
        effect="bottom-to-top"
      >
        <Modal.Content
          onClose={() => {
            setSelectedFiles([])
            ticketMessageModalHandlers.close()
          }}
          className="flex h-full flex-col gap-y-3 bg-white py-3 pl-2 pr-4 md:rounded-lg  overflow-auto"
        >
          <Modal.Header
            onClose={() => {
              setSelectedFiles([])
              ticketMessageModalHandlers.close()
            }}
          >
            ارسال پاسخ
          </Modal.Header>
          <Modal.Body>
            <form
              className="flex flex-1 flex-col justify-between gap-y-5 overflow-y-auto pl-4"
              onSubmit={handleSubmit(submitHander)}
            >
              {/* comment */}
              <div className="space-y-31">
                <label className="text-xs text-gray-700 md:min-w-max lg:text-sm" htmlFor="comment">
                  محتوای تیکت را وارد کنید
                </label>
                <textarea className="input h-24 resize-none" id="comment" {...register('message')} />
                <DisplayError errors={formErrors.message} />
              </div>

              {/* Thumbnail upload */}
              <div className="border mx-8 border-dashed border-[#009ef7] bg-[#f1faff] rounded text-center">
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

              <div className="border-t-2 border- py-3 pb-0  flex justify-end">
                <div className="flex justify-end">
                  <SubmitModalButton isLoading={isLoading}>ارسال پاسخ</SubmitModalButton>
                </div>
              </div>
            </form>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default TicketMessageModal
