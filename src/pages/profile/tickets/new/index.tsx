import { ProfileLayout } from '@/components/Layouts'
import { HandleResponse, Header, MetaTags } from '@/components/shared'
import { Button, DisplayError, PageContainer, TextField } from '@/components/ui'
import { useAppSelector, useDisclosure } from '@/hooks'
import { Plus } from '@/icons'
import { useGetTicketsQuery, useGetTicketTypesQuery, useUpsertTicketMutation } from '@/services'
import type { NextPage } from 'next'
import Head from 'next/head'
import moment from 'moment-jalaali'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm, Resolver, Controller, SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { ITicketForm } from '@/types'
import { ticketFormValidationSchema } from '@/utils'
import { MdClose } from 'react-icons/md'
const NewTickets: NextPage = () => {
  // ? Assets
  const { query, push } = useRouter()
  const { generalSetting } = useAppSelector((state) => state.design)
  const [isShowTicketModal, ticketModalHandlers] = useDisclosure()
  const [ticketType, setTicketType] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  // ? Queries
  const { data: ticketTypeData } = useGetTicketTypesQuery({ page: 1, pageSize: 99 })
  // ? Create Ticket
  const [createTicket, { isSuccess, isLoading, data, isError, error }] = useUpsertTicketMutation()
  // ? Form Hook
  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors: formErrors, isValid },
  } = useForm<ITicketForm>({
    resolver: yupResolver(ticketFormValidationSchema) as unknown as Resolver<ITicketForm>,
  })

  const SubmitHandler: SubmitHandler<ITicketForm> = (data) => {
    const formData = new FormData()

    formData.append('TicketTypeId', data.ticketTypeId)
    formData.append('Message', data.message)
    formData.append('Subject', data.subject)
    formData.append('UserType', '1')
    formData.append('IsCreator', JSON.stringify(true))
    if (data.thumbnail && data.thumbnail.length > 0) {
      Array.from(data.thumbnail).forEach((file) => {
        formData.append('Thumbnail', file)
      })
    }
    createTicket(formData)
  }

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

  const handleToggleDetails = (id: string) => {
    push(`/profile/tickets/${id}`)
  }

  const handleChangeUserType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTicketType(event.target.value)
  }

  return (
    <main id="profileTickets">
      {(isSuccess || isError) && (
        <HandleResponse
          isError={isError}
          isSuccess={isSuccess}
          error={error}
          message={data?.message}
          onSuccess={() => {
            setSelectedFiles([])
            reset()
            push('/profile/tickets')
          }}
          onError={() => {
            setSelectedFiles([])
            reset()
          }}
        />
      )}
      <MetaTags
        title={'پروفایل' + ' | ' + 'تیکت های پشتیبانی'}
        description={generalSetting?.shortIntroduction || 'توضیحاتی فروشگاه اینترنتی'}
        keywords={generalSetting?.googleTags || ' اینترنتی, فروشگاه'}
      />
      <Header />
      <ProfileLayout isProfile>
        <PageContainer title="">
          <div>
            <div className="flex mt-3 px-4 text-sm md:text-base mx-3 border border-[#e90089] rounded-md py-2 justify-between items-center bg-[#fde5f3] text-[#e90089]">
              {' '}
              <h3 className="px-3 py-2.5">{'تیکت جدید'}</h3>
            </div>

            <form onSubmit={handleSubmit(SubmitHandler)} className="px-4 mt-10">
              <div className="w-2/3">
                <label htmlFor={`ticket-type`} className="block mb-1 text-gray-900">
                  نوع تیکت را انتخاب کنید
                </label>
                <select
                  id={`ticket-type`}
                  className="bg-gray-50 border border-gray-300 w-full text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  value={ticketType}
                  {...register('ticketTypeId', { onChange: handleChangeUserType })}
                >
                  <option value="">انتخاب مرجوعی خرید</option>
                  {ticketTypeData?.data?.data?.map((ticketType) => (
                    <option key={ticketType.id} value={ticketType.id}>
                      {ticketType.name}
                    </option>
                  ))}
                </select>
                <DisplayError errors={formErrors.ticketTypeId} />
              </div>

              <div className="mt-5 w-2/3">
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      classStyle={`bg-white rounded-md`}
                      isUserForm
                      {...field}
                      control={control}
                      errors={formErrors.subject}
                      label="عنوان تیکت را وارد کنید"
                    />
                  )}
                />
              </div>

              <div className="">
                <label className=" text-gray-700 md:min-w-max lg:text-sm" htmlFor="message">
                  محتوای تیکت را وارد کنید
                </label>
                <textarea
                  className="input mt-1 h-24 resize-none bg-white rounded-md border border-gray-200"
                  id="message"
                  {...register('message')}
                />
                <DisplayError errors={formErrors.message} />
              </div>

              <div className="border border-dashed border-[#009ef7] bg-[#f1faff] rounded text-center">
                <input type="file" multiple className="hidden" id="Thumbnail" onChange={handleFileChange} />
                <label htmlFor="Thumbnail" className="block cursor-pointer p-6 py-8 text-sm font-normal">
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
                    <div className="text-base">عکس ها را اینجا بکشید یا برای انتخاب کلیک کنید </div>
                  )}
                </label>
              </div>

              <div className="flex justify-end mt-4">
                <Button type="submit" className="bg-blue-600">
                  ارسال
                </Button>
              </div>
            </form>
          </div>
        </PageContainer>
      </ProfileLayout>
    </main>
  )
}

export default NewTickets
