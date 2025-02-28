import { Modal, Button, CustomCheckbox } from '@/components/ui'
import { ICategory, ICategoryForm, IRegisterForm, IReturnedForm, ITicketTypeForm } from '@/types'
import SizesCombobox from '../selectorCombobox/SizesCombobox'
import {
  useCreateCategoryMutation,
  useCreateFeatureMutation,
  useGetSizesQuery,
  useUpdateCategoryFeatureMutation,
  useUpdateCategoryMutation,
  useUpdateFeatureMutation,
  useUpsertRedirectsMutation,
  useUpsertReturnedMutation,
  useUpsertTicketTypeMutation,
} from '@/services'
import { useEffect, useRef, useState } from 'react'
import { HandleResponse } from '../shared'
import { CategoryFeatureForm } from '@/services/category/types'
import { Resolver, SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { categorySchema, normalSchema, singleSchema, ticketTypeSchema } from '@/utils'
import { ProductFeature } from '@/services/feature/types'
import { ITicketType } from '@/types/models/ITicketType.type'
import { IReturned } from '@/services/canceled/types'

interface Props {
  title: string
  returnedData?: IReturned
  isShow: boolean
  userType: number
  onClose: () => void
  refetch: () => void
  mode: 'create' | 'edit'
}

const ReturnedModal: React.FC<Props> = (props) => {
  const { isShow, onClose, refetch, title, returnedData, mode, userType } = props

  // ? States
  const [isActive, setIsActive] = useState(true)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [
    upsertReturned,
    {
      data: dataUpsert,
      isSuccess: isSuccessUpsert,
      isError: isErrorUpsert,
      error: errorUpsert,
      isLoading: isLoadingUpsert,
    },
  ] = useUpsertReturnedMutation()

  // ? Form Hook
  const {
    handleSubmit,
    formState: { errors: formErrors, isValid },
    register,
    setValue,
    reset,
  } = useForm<IReturnedForm>({
    resolver: yupResolver(normalSchema),
    defaultValues: {
      isActive: true,
    },
  })

  useEffect(() => {
    if (returnedData) {
      setIsActive(returnedData.isActive)
      reset({
        id: returnedData.id,
        title: returnedData.title,
        isActive: returnedData.isActive,
      })
    }
  }, [returnedData])
  useEffect(() => {
    if (isShow && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isShow])

  // ? Handler
  const handleIsActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    var isActive = e.target.checked
    setIsActive(isActive)
    setValue('isActive', isActive)
  }
  const onConfirm: SubmitHandler<IReturnedForm> = (data) => {
    if (data.id != undefined) {
      upsertReturned({
        id: data.id,
        title: data.title,
        isActive: data.isActive,
      })
    } else {
      upsertReturned({
        title: data.title,
        isActive: data.isActive,
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
      <Modal
        isShow={isShow}
        onClose={() => {
          onClose()
        }}
        effect="bottom-to-top"
      >
        <Modal.Content
          onClose={onClose}
          className="flex h-full flex-col z-[199] gap-y-5 bg-white py-5 pb-0 md:rounded-lg"
        >
          <Modal.Header notBar onClose={onClose}>
            <div className="text-start text-base flex gap-2">
              {' '}
              {title}
              <div className="text-sky-500">{returnedData?.title}</div>
            </div>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSubmit(onConfirm)} className="space-y-4 bg-white text-center md:rounded-lg w-full">
              <div className="flex items-center w-full gap-x-12 px-6">
                <div className="relative mb-3 w-full">
                  <input
                    type="text"
                    className="peer m-0 pr-3 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-transparent bg-clip-padding pl-3 py-4 text-xl font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:autofill:shadow-autofill dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]"
                    id="floatingInput"
                    placeholder="نام"
                    {...register('title')}
                    ref={(e) => {
                      register('title').ref(e)
                      inputRef.current = e
                    }}
                  />
                  <label
                    htmlFor="floatingInput"
                    className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
                  >
                    نام
                  </label>
                </div>
              </div>

              <div className="flex flex-col py-3 items-start gap-4 border mx-6 rounded-lg px-2">
                <label htmlFor={`isActive-${mode}`} className="flex items-center gap-x-2">
                  <CustomCheckbox
                    name={`isActive-${mode}`}
                    checked={isActive}
                    onChange={handleIsActiveChange}
                    label="وضعیت نمایش"
                    customStyle="bg-sky-500"
                  />
                </label>
              </div>

              <div className="flex flex-col md:flex-row gap-y-4 px-5 py-3 justify-between items-center gap-x-20 bg-[#f5f8fa]">
                {/* validation errors */}
                <div className="flex flex-col">
                  {formErrors.title && <p className="text-red-500 px-10">{formErrors.title.message}</p>}
                </div>
                <Button
                  type="submit"
                  className={`bg-sky-500 px-5 py-2.5 hover:bg-sky-600 ${!isValid ? 'bg-gray-300' : ''} `}
                  isLoading={isLoadingUpsert}
                >
                  {mode !== 'edit' ? 'انتشار' : 'بروزرسانی'}
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default ReturnedModal
