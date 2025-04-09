import { Modal, Button, CustomCheckbox } from '@/components/ui'
import { ICategory, ICategoryForm } from '@/types'
import SizesCombobox from '../selectorCombobox/SizesCombobox'
import {
  useCreateCategoryMutation,
  useGetSizesQuery,
  useUpdateCategoryFeatureMutation,
  useUpdateCategoryMutation,
} from '@/services'
import { useEffect, useState } from 'react'
import { HandleResponse } from '../shared'
import { CategoryFeatureForm } from '@/services/category/types'
import { Resolver, SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { categorySchema } from '@/utils'
import { SelectParentCategoryCombobox } from '../selectorCombobox'
import { useAppDispatch } from '@/hooks'
import { setUpdated, showAlert } from '@/store'

interface Props {
  title: string
  category?: ICategory
  categoryParent: ICategory
  categoryList: ICategory[]
  isShow: boolean
  onClose: () => void
  refetch: () => void
}

const fetchImageAsFile = async (url: string): Promise<File> => {
  const response = await fetch(url)
  const blob = await response.blob()
  const fileName = url.split('/').pop()
  return new File([blob], fileName || 'image.jpg', { type: blob.type })
}

const SubCategoryUpdateModal: React.FC<Props> = (props) => {
  const { isShow, onClose, refetch, title, categoryList, category, categoryParent } = props
  const dispatch = useAppDispatch()
  const [stateCategoryData, setStateCategoryData] = useState<ICategoryForm>({
    level: 0,
    name: '',
    isActive: false,
  } as ICategoryForm)
  const [selectedFile, setSelectedFile] = useState<File[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null)
  const [parentCategory, setParentCategory] = useState<ICategory | undefined>(undefined)
  const [
    updateCategory,
    {
      data: dataUpdate,
      isSuccess: isSuccessUpdate,
      isError: isErrorUpdate,
      error: errorUpdate,
      isLoading: isLoadingUpdate,
    },
  ] = useUpdateCategoryMutation()

  // ? Assets
  const defaultValues: Partial<ICategoryForm> = {
    name: '',
    isActive: false, // Add default value for isActive
  }

  // ? Form Hook
  const {
    handleSubmit,
    formState: { errors: formErrors, isValid },
    register,
    setValue,
    reset,
  } = useForm<ICategoryForm>({
    resolver: yupResolver(categorySchema) as unknown as Resolver<ICategoryForm>,
    defaultValues,
  })

  useEffect(() => {
    setStateCategoryData({} as ICategoryForm)
    setSelectedFile([])
    const loadData = async () => {
      if (category) {
        var parentCategory = categoryList.filter((c) => c.id === category.parentCategoryId)[0]
        setParentCategory(parentCategory)
        setStateCategoryData({
          id: category.id,
          name: category.name,
          isActive: category.isActive ?? false, // Ensure isActive has a boolean value
          isActiveProduct: category.isActiveProduct ?? false, // Ensure isActive has a boolean value
          level: category.level,
          parentCategoryId: category.parentCategoryId,
          mainCategoryId: category.parentCategoryId,
          thumbnail: undefined,
        })
        if (category.imagesSrc) {
          const imageFile = await fetchImageAsFile(category.imagesSrc.imageUrl)
          if (imageFile) {
            setSelectedFile([imageFile])
          }

          if (category.parentCategory) setSelectedCategory(category.parentCategory)

          reset({
            id: category.id,
            name: category.name,
            isActive: category.isActive ?? false, // Ensure isActive has a boolean value
            isActiveProduct: category.isActiveProduct,
            parentCategoryId: category.parentCategoryId,
            mainCategoryId: category.parentCategoryId,
            level: category.level,
            thumbnail: imageFile,
          })
        }
      }
    }
    loadData()
  }, [category])

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // if (e.target.files) {
    //   setSelectedFile([...Array.from(e.target.files)])
    //   if ([...Array.from(e.target.files)].length > 0) {
    //     var ffff = e.target.files[0]
    //     setValue('thumbnail', ffff)
    //   } else {
    //     setValue('thumbnail', null)
    //   }
    // }
    const files = e.target.files
    if (files) {
      const validFiles: any[] = []
      const maxFileSize = 50 * 1024 // 30 KB
      const exactWidth = 200
      const exactHeight = 200

      // تبدیل FileList به آرایه
      Array.from(files).forEach((file) => {
        if (file.type !== 'image/png') {
          dispatch(
            showAlert({
              status: 'error',
              title: 'فرمت عکس ها می بایست png باشد',
            })
          )
          return
        }

        if (file.size > maxFileSize) {
          dispatch(
            showAlert({
              status: 'error',
              title: 'حجم عکس ها می بایست حداکثر 50 کیلوبایت باشد',
            })
          )
          return
        }

        const img = new Image()
        img.src = URL.createObjectURL(file)

        img.onload = () => {
          URL.revokeObjectURL(img.src)

          if (img.width !== exactWidth || img.height !== exactHeight) {
            dispatch(
              showAlert({
                status: 'error',
                title: 'سایز عکس ها می بایست 200*200 پیکسل باشد',
              })
            )
          } else {
            validFiles.push(file)
            setValue('thumbnail', file)
            setSelectedFile([...validFiles])
          }
        }
      })
    }
  }

  const handleCategorySelect = (category: ICategory) => {
    if (category) {
      setParentCategory(category)
      setValue('parentCategoryId', category.id)
    }
  }

  const onConfirm: SubmitHandler<ICategoryForm> = (data) => {
    const formData = new FormData()

    formData.append('Name', data.name)
    formData.append('IsActive', data.isActive.toString())
    formData.append('IsActiveProduct', data.isActiveProduct.toString())
    if (data.thumbnail) {
      formData.append('Thumbnail', data.thumbnail)
    }

    if (data.level) {
      formData.append('Level', data.level.toString())
    }

    if (data.parentCategoryId === undefined) {
      console.log('ParentCategoryId', data.parentCategoryId)
      console.log(categoryParent, 'categoryParent')

      formData.append('ParentCategoryId', categoryParent.id)
    } else {
      if (data.parentCategoryId) {
        formData.append('ParentCategoryId', data.parentCategoryId)
      }
    }

    if (data.id != undefined) {
      updateCategory(formData)
      formData.append('Id', data.id)
    }
    dispatch(setUpdated(true))
  }

  const handleIsActiveChange = (e: React.ChangeEvent<HTMLInputElement>, feild: string) => {
    var isActive = e.target.checked
    if (feild === 'isActive') {
      setStateCategoryData({
        ...stateCategoryData,
        isActive,
      })
      setValue('isActive', isActive)
    } else {
      setStateCategoryData({
        ...stateCategoryData,
        isActiveProduct: isActive,
      })
      setValue('isActiveProduct', isActive)
    }
  }
  return (
    <>
      {(isSuccessUpdate || isErrorUpdate) && (
        <HandleResponse
          isError={isErrorUpdate}
          isSuccess={isSuccessUpdate}
          error={errorUpdate}
          message={dataUpdate?.message}
          onSuccess={() => {
            onClose()
            refetch()
            setStateCategoryData({} as ICategoryForm)
            setSelectedFile([])
          }}
        />
      )}
      <Modal
        isShow={isShow}
        onClose={() => {
          onClose()
          // setStateCategoryData({} as ICategoryForm)
          // setSelectedMainFile([])
        }}
        effect="bottom-to-top"
      >
        <Modal.Content
          onClose={onClose}
          className="flex h-full flex-col z-[199] gap-y-5 bg-white py-5 pb-0 md:rounded-lg"
        >
          <Modal.Header notBar onClose={onClose}>
            <div className="text-start text-base flex gap-2">
              ویرایش <div className="text-sky-500"> {category?.name}</div>
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
                    placeholder="نام دسته"
                    {...register('name')}
                  />
                  <label
                    htmlFor="floatingInput"
                    className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
                  >
                    نام دسته
                  </label>
                </div>
              </div>

              <div className="flex py-3 items-center gap-x-12 border mx-6 rounded-lg px-2">
                <label htmlFor="isActive" className="flex items-center gap-x-2">
                  <CustomCheckbox
                    name="isActive"
                    checked={stateCategoryData.isActive}
                    onChange={(e) => handleIsActiveChange(e, 'isActive')}
                    label="وضعیت نمایش"
                    customStyle="bg-sky-500"
                  />
                </label>
              </div>

              <div className="flex py-3 items-center gap-x-12 border mx-6 rounded-lg px-2">
                <label htmlFor={`isActiveProduct-subUpdate`} className="flex items-center gap-x-2">
                  <CustomCheckbox
                    name={`isActiveProduct-subUpdate`}
                    checked={stateCategoryData.isActiveProduct}
                    onChange={(e) => handleIsActiveChange(e, 'isActiveProduct')}
                    label="اجازه ثبت محصول"
                    customStyle="bg-sky-500"
                  />
                </label>
              </div>

              <div className="flex py-3 pt-2 items-start gap-x-12 border mx-6 rounded-lg px-2">
                <div className="flex flex-col w-full">
                  <h3 className="text-start pb-2">محل قرارگیری دسته</h3>
                    {categoryList.length > 0 && (
                    <SelectParentCategoryCombobox
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      setParentCategory={setParentCategory}
                      categories={categoryList.filter((c) => c.name !== category?.name) ?? []}
                      onCategorySelect={handleCategorySelect}
                    />
                    )}
                </div>
              </div>

              <div className=" flex flex-col items-center justify-center">
                <input type="file" className="hidden" id="thumbnailSubUpdate" onChange={handleMainFileChange} />
                <label
                  htmlFor="thumbnailSubUpdate"
                  className="block w-fit  rounded-lg cursor-pointer text-sm font-normal"
                >
                  {selectedFile.length === 0 ? (
                    <img
                      className="w-[125px] h-[125px] rounded-md"
                      src="/images/other/product-placeholder.png"
                      alt="product-placeholder"
                    />
                  ) : (
                    <div className="text-sm shadow-item rounded-lg p-2 text-gray-600">
                      <img
                        src={URL.createObjectURL(selectedFile[0])}
                        alt={selectedFile[0].name}
                        className="w-[125px] object-contain h-[125px] rounded-md"
                      />
                    </div>
                  )}
                </label>
                <div className="text-xs mt-3">تصویر</div>
              </div>

              <div className="flex flex-col md:flex-row gap-y-4 px-5 py-3 justify-between items-center gap-x-20 bg-[#f5f8fa]">
                <div className="flex flex-col items-start">
                  <p className="text-xs text-gray-500 whitespace-nowrap ">سایز عکس میبایست 200*200 پیکسل باشد</p>
                  <p className="text-xs text-gray-500 whitespace-nowrap ">حجم عکس میبایست حداکثر 30 کیلوبایت باشد</p>
                  <p className="text-xs text-gray-500 whitespace-nowrap ">نوع عکس میبایست png باشد</p>
                </div>
                {/* validation errors */}
                <div className="flex flex-col">
                  {formErrors.name && <p className="text-red-500 px-10">{formErrors.name.message}</p>}

                  {formErrors.thumbnail && <p className="text-red-500 px-10">{formErrors.thumbnail?.message}</p>}
                </div>
                <Button
                  type="submit"
                  className={`bg-sky-500 px-5 py-2.5 hover:bg-sky-600 ${!isValid ? 'bg-gray-300' : ''} `}
                  isLoading={isLoadingUpdate}
                >
                  بروزرسانی
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default SubCategoryUpdateModal
