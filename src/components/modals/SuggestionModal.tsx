import { Modal, Button } from '@/components/ui'
import {
  useCreateFeatureValueMutation,
  useCreateSizeMutation,
  useUpdateFeatureValueMutation,
  useUpdateSizeMutation,
  useUpsertSuggestionMutation,
} from '@/services'
import { useEffect, useRef, useState } from 'react'
import { HandleResponse } from '../shared'
import { SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { singleSchema, suggestionSchema } from '@/utils'
import { ISuggestion } from '@/types'
import { addDays, differenceInDays } from 'date-fns'

interface Props {
  suggestion: ISuggestion | null
  isShow: boolean
  onClose: () => void
  refetch: () => void
}

const SuggestionModal: React.FC<Props> = (props) => {
  const { isShow, onClose, refetch, suggestion } = props
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [
    upsertSuggestion,
    {
      data: dataUpsert,
      isSuccess: isSuccessUpsert,
      isError: isErrorUpsert,
      error: errorUpsert,
      isLoading: isLoadingUpsert,
    },
  ] = useUpsertSuggestionMutation()

  const {
    handleSubmit,
    formState: { errors: formErrors, isValid },
    register,
    setValue,
    reset,
  } = useForm<{ id?: string; productCode: string; expireTime: number }>({
    resolver: yupResolver(suggestionSchema),
  })

  useEffect(() => {
    if (suggestion) {
      const expireDate = new Date(suggestion.expireTime) // تاریخ انقضا از suggestion
      const today = new Date() // تاریخ فعلی
      const days = differenceInDays(expireDate, today) // اختلاف به روز

      // پیدا کردن نزدیک‌ترین مقدار مجاز (1, 2, 3, 7)
      const options = [1, 2, 3, 7]
      const closestDays = options.reduce((prev, curr) =>
        Math.abs(curr - days) < Math.abs(prev - days) ? curr : prev
      )

      reset({
        id: suggestion.id,
        productCode: suggestion.products.code,
        expireTime: closestDays, // تنظیم تعداد روزهای نزدیک‌تر
      })
    }
  }, [suggestion, reset])
  useEffect(() => {
    if (isShow && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isShow])
  const onConfirm: SubmitHandler<{ id?: string; productCode: string; expireTime: number }> = (data) => {
    if (data.id != undefined) {
      upsertSuggestion({
        id: data.id,
        productCode: data.productCode,
        expireTime: data.expireTime,
      })
    } else {
      upsertSuggestion({
        productCode: data.productCode,
        expireTime: data.expireTime,
      })
    }
  }

  return (
    <>
      {(isSuccessUpsert || isErrorUpsert) && (
        <HandleResponse
          isError={isErrorUpsert}
          isSuccess={isSuccessUpsert}
          error={errorUpsert}
          message={dataUpsert?.message}
          onSuccess={() => {
            reset()
            onClose()
            refetch()
          }}
        />
      )}
      <Modal isShow={isShow} onClose={onClose} effect="bottom-to-top">
        <Modal.Content
          onClose={onClose}
          className="flex h-full flex-col z-[199] gap-y-5 bg-white py-5 pb-0 md:rounded-lg"
        >
          <Modal.Header notBar onClose={onClose}>
            {/* <div className="text-start text-base flex gap-2">
              {' '}
              {title} <div className='text-sky-500'>{size?.name}</div>
            </div> */}
            <div className="text-start text-base flex gap-2"> پیشنهاد شگفت انگیز</div>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSubmit(onConfirm)} className="space-y-4 bg-white text-center md:rounded-lg w-full">
              <div className='flex'>
                <div className="flex items-center w-full gap-x-12 px-2 pr-4">
                  <div className="relative mb-3 w-full">
                    <input
                      type="text"
                      className="peer m-0 pr-3 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-transparent bg-clip-padding pl-3 py-4 text-xl font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:autofill:shadow-autofill dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]"
                      id="floatingInput"
                      placeholder="کد محصول"
                      {...register('productCode')}
                      ref={(e) => {
                        register('productCode').ref(e)
                        inputRef.current = e
                      }}
                    />
                    <label
                      htmlFor="floatingInput"
                      className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
                    >
                      کد محصول
                    </label>
                  </div>
                </div>

                <div className="flex items-center w-full gap-x-12 px-2 pl-4">
                  <div className="relative mb-3 w-full">
                    <select
                      className="block w-full text-gray-500 border border-gray-200 rounded-lg pl-3 pr-3 py-3  font-normal leading-tight transition duration-200 ease-linear focus:border-primary focus:outline-none"
                      id="expireTimeSelect"
                      {...register('expireTime')}
                    >
                      <option value="" className="appearance-none text-gray-500">
                        مدت زمان نمایش
                      </option>
                      <option value="1">1 روز</option>
                      <option value="2">2 روز</option>
                      <option value="3">3 روز</option>
                      <option value="7">1 هفته</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-y-4 px-5 py-4 justify-between items-center gap-x-20 bg-[#f5f8fa]">
                <div className="flex flex-col">
                  {formErrors.productCode && <p className="text-red-500 px-10">{formErrors.productCode.message}</p>}
                  {formErrors.expireTime && <p className="text-red-500 px-10">{formErrors.expireTime.message}</p>}
                </div>
                <Button
                  type="submit"
                  className={`bg-sky-500 px-5 py-2.5 hover:bg-sky-600 ${!isValid ? 'bg-gray-300' : ''} `}
                  isLoading={isLoadingUpsert}
                >
                  {suggestion ? 'بروزرسانی' : 'انتشار'}
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default SuggestionModal
