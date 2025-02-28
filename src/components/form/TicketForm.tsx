import { ChangeEvent, Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react'

import { SubmitHandler, useForm, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FaArrowDownLong } from 'react-icons/fa6'
import { Button, Modal } from '@/components/ui'
import dynamic from 'next/dynamic'
import { IArticle, IArticleForm, ICategory, IColumnFooter, ITicketAdminForm } from '@/types'
import { articleFormValidationSchema } from '@/utils'
import {
  useDeleteTrashArticleMutation,
  useGetAllCategoriesQuery,
  useGetCategoriesTreeQuery,
  useGetColumnFootersQuery,
} from '@/services'
import { useAppDispatch, useAppSelector, useDisclosure } from '@/hooks'
import { setStateStringSlice, showAlert } from '@/store'
import jalaali from 'jalaali-js'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { PiUserDuotone } from 'react-icons/pi'
import { HandleResponse } from '../shared'
import { ConfirmDeleteModal } from '../modals'
import { useRouter } from 'next/router'
import Link from 'next/link'
const fetchImageAsFile = async (url: string): Promise<File> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
    }
    const blob = await response.blob()
    const fileName = url.split('/').pop()
    return new File([blob], fileName || 'image.jpg', { type: blob.type })
  } catch (error) {
    console.error(`Failed to fetch image from ${url}:`, error)
    throw error
  }
}

const extractChildCategories = (category: ICategory): ICategory[] => {
  let childCategories: ICategory[] = []
  if (category.childCategories && category.childCategories.length > 0) {
    category.childCategories.forEach((child) => {
      childCategories.push(child)
      childCategories = childCategories.concat(extractChildCategories(child))
    })
  }
  return childCategories
}
interface CreateTicketAdminFormProps {
  mode: 'create' | 'edit'
  createHandler: (data: FormData) => void
  updateHandler?: never
  selectedArticle?: never
  isLoadingCreate: boolean
  isLoadingUpdate?: never
}

interface EditTicketAdminFormProps {
  mode: 'edit'
  createHandler?: never
  updateHandler: (data: FormData) => void
  selectedArticle: IArticle
  isLoadingCreate?: never
  isLoadingUpdate: boolean
}

type Props = CreateTicketAdminFormProps | EditTicketAdminFormProps
const CustomEditor = dynamic(() => import('@/components/form/TextEditor'), { ssr: false })
const TicketAdminForm: React.FC<Props> = (props) => {
  // ? Props
  const { mode, createHandler, isLoadingCreate, isLoadingUpdate, updateHandler, selectedArticle } = props
  const { generalSetting } = useAppSelector((state) => state.design)
  // assets
  const dispatch = useAppDispatch()
  const { query, back, push } = useRouter()
  // States
  const [isActive, setIsActive] = useState('true')
  const [place, setPlace] = useState('')
  const [allCategories, setAllCategories] = useState<ICategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [selectedMainFile, setMainSelectedFiles] = useState<any[]>([])
  const [textEditor, setTextEditor] = useState<string>('')
  const [shamsiDate, setShamsiDate] = useState('')
  const [updateShamsiDate, setUpdateShamsiDate] = useState('')
  const [author, setAuthor] = useState('')

  // ? Queries
  // ? Get Categories Query
  const { categoriesData } = useGetAllCategoriesQuery(
    { pageSize: 999999, isActive: true },
    {
      selectFromResult: ({ data }) => ({
        categoriesData: data?.data,
      }),
    }
  )

  const {
    data: columnFootersData,
    isLoading: isLoadingColumnFooter,
    isError: isErrorColumnFooter,
  } = useGetColumnFootersQuery()

  useEffect(() => {
    if (selectedArticle && selectedArticle.created) {
      console.log(selectedArticle.created, 'selectedArticle.created example =  2024-08-11T08:05:09.49494Z')

      const gregorianDateString = selectedArticle.created
      const gregorianDate = new Date(gregorianDateString)
      if (!isNaN(gregorianDate.getTime())) {
        // Convert to Jalali Date
        const jalaliDate = jalaali.toJalaali(
          gregorianDate.getFullYear(),
          gregorianDate.getMonth() + 1,
          gregorianDate.getDate()
        )

        // Extract time
        const hours = gregorianDate.getHours()
        const minutes = gregorianDate.getMinutes()
        const seconds = gregorianDate.getSeconds()

        // Format Jalali Date with time
        setShamsiDate(` ${hours}:${minutes}:${seconds} - ${jalaliDate.jy}/${jalaliDate.jm}/${jalaliDate.jd}`)
      }
    }

    if (selectedArticle && selectedArticle.lastUpdated) {
      const gregorianDateString = selectedArticle.lastUpdated
      const gregorianDate = new Date(gregorianDateString)
      if (!isNaN(gregorianDate.getTime())) {
        // Convert to Jalali Date
        const jalaliDate = jalaali.toJalaali(
          gregorianDate.getFullYear(),
          gregorianDate.getMonth() + 1,
          gregorianDate.getDate()
        )

        // Extract time
        const hours = gregorianDate.getHours()
        const minutes = gregorianDate.getMinutes()
        const seconds = gregorianDate.getSeconds()

        // Format Jalali Date with time
        setUpdateShamsiDate(`${hours}:${minutes}:${seconds} - ${jalaliDate.jy}/${jalaliDate.jm}/${jalaliDate.jd}`)
      }
    }
  }, [selectedArticle?.created])

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
  } = useForm<ITicketAdminForm>({
    resolver: yupResolver(ticketAdminFormValidationSchema) as unknown as Resolver<ITicketAdminForm>,
  })

  useEffect(() => {
    if (categoriesData) {
      let allCats: ICategory[] = []
      categoriesData.data?.forEach((category: ICategory) => {
        allCats.push(category)
        allCats = allCats.concat(extractChildCategories(category))
      })
      setAllCategories(allCats)
    }
  }, [categoriesData])

  //*   Set Article Details On Edit Mode
  useEffect(() => {
    const loadData = () => {
      if (selectedArticle && mode === 'edit') {
        const { id, author, categoryId, code, description, image, isActive, isDeleted, place, title } = selectedArticle
        console.log(selectedArticle, 'selectedArticle')
        setAuthor(author)
        setIsActive(isActive ? 'true' : 'false')
        setPlace(place.toString())
        setTextEditor(description)
        setSelectedCategory(categoryId)
        reset({
          id,
          title,
          description,
          categoryId,
          place,
        })
      }
    }
    const loadMedia = async () => {
      if (selectedArticle && mode === 'edit') {
        const { image } = selectedArticle

        const mainImageFile = await fetchImageAsFile(image.imageUrl)
        if (mainImageFile) {
          setMainSelectedFiles([mainImageFile])
        }
        reset((prevState) => ({
          ...prevState,
          thumbnail: mainImageFile,
        }))
      }
    }

    loadData()
    loadMedia()
  }, [selectedArticle])

  const editedCreateHandler: SubmitHandler<ITicketAdminForm> = (data) => {
    const formData = new FormData()

    formData.append('Title', data.title)
    formData.append('IsActive', isActive.toString())
    if (data.thumbnail) {
      formData.append('Thumbnail', data.thumbnail)
    }
    if (data.categoryId !== undefined) {
      formData.append('CategoryId', data.categoryId ?? '')
    }

    formData.append('Description', textEditor)
    if (mode === 'edit' && selectedArticle !== undefined) {
      formData.append('Id', selectedArticle.id)
      console.log(data, '==========data')
      updateHandler(formData)
    } else {
      createHandler(formData)
    }
  }
  const handleChangeStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIsActive(event.target.value)
  }
  const handleChangePlace = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(event.target.value, 'event.target.value')

    setPlace(event.target.value)
  }
  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoryId = event.target.value
    setValue('categoryId', selectedCategoryId)
    setSelectedCategory(selectedCategoryId !== '' ? selectedCategoryId : undefined)
  }
  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles: any[] = []
      const maxFileSize = 70 * 1024 // 70 KB
      const exactWidth = 1000
      const exactHeight = 650

      Array.from(files).forEach((file) => {
        if (file.type !== 'image/jpeg') {
          dispatch(
            showAlert({
              status: 'error',
              title: 'فرمت عکس ها می بایست jpg باشد',
            })
          )
          return
        }

        if (file.size > maxFileSize) {
          dispatch(
            showAlert({
              status: 'error',
              title: 'حجم عکس ها می بایست حداکثر 70 کیلوبایت باشد',
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
                title: 'سایز عکس ها می بایست 650*1000 پیکسل باشد',
              })
            )
          } else {
            validFiles.push(file)
            setValue('thumbnail', file, { shouldValidate: true })
            setMainSelectedFiles([...validFiles])
          }
        }
      })
    }
  }
  if (formErrors) {
    console.log(formErrors, 'formErrors')
  }
  //*   Delete Handlers
  const [
    deleteTrashArticle,
    {
      isSuccess: isSuccessTrashDelete,
      isError: isErrorTrashDelete,
      error: errorTrashDelete,
      data: dataTrashDelete,
      isLoading: isLoadingTrashDelete,
    },
  ] = useDeleteTrashArticleMutation()
  const [isShowConfirmTrashDeleteModal, confirmTrashDeleteModalHandlers] = useDisclosure()
  const [deleteTrashInfo, setDeleteTrashInfo] = useState({
    id: '',
  })
  const handleDeleteTrash = (id: string) => {
    setDeleteTrashInfo({ id })
    confirmTrashDeleteModalHandlers.open()
  }

  const onCancel = () => {
    setDeleteTrashInfo({ id: '' })
    confirmTrashDeleteModalHandlers.close()
  }

  const onConfirmTrashDelete = () => {
    deleteTrashArticle({ id: deleteTrashInfo.id })
  }

  const onSuccess = () => {
    confirmTrashDeleteModalHandlers.close()
    setDeleteTrashInfo({ id: '' })
    dispatch(setStateStringSlice({ name: 'deletedArticles' }))
    push(`/admin/articles`)
  }
  const onError = () => {
    confirmTrashDeleteModalHandlers.close()
    setDeleteTrashInfo({ id: '' })
  }

  const titleWatch = watch('title')
  const thumbnailWatch = watch('thumbnail')
  return (
    <>
      {/* Handle Delete Product Response */}
      {(isSuccessTrashDelete || isErrorTrashDelete) && (
        <HandleResponse
          isError={isErrorTrashDelete}
          isSuccess={isSuccessTrashDelete}
          error={errorTrashDelete}
          message={dataTrashDelete?.message}
          onSuccess={onSuccess}
          onError={onError}
        />
      )}
      <ConfirmDeleteModal
        title="مقاله"
        isLoading={isLoadingTrashDelete}
        isShow={isShowConfirmTrashDeleteModal}
        onClose={confirmTrashDeleteModalHandlers.close}
        onCancel={onCancel}
        onConfirm={onConfirmTrashDelete}
      />
      <section>
        <form className="flex gap-4 flex-col p-7 px-4 mx-2" onSubmit={handleSubmit(editedCreateHandler)}>
          {/* register title , isActive  , place, category ,and Thumbnail*/}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-1">
              <div className="bg-white w-full rounded-md shadow-item">
                <h3 className="border-b p-6 text-gray-600 flex gap-2">
                  {mode === 'edit' ? 'ویرایش مقاله' : 'مقاله جدید '}{' '}
                  <div className="text-sky-500">{selectedArticle?.title}</div>
                </h3>
                <div className="flex flex-col">
                  {/* title  */}
                  <div className="flex flex-col xs:flex-row px-10 py-10 pb-0 pt-6">
                    <label
                      htmlFor="title"
                      className="flex items-center xs:py-0 py-2 justify-center px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                    >
                      <img className="w-5 h-5" src="/assets/svgs/duotone/text.svg" alt="" />
                      <span className="whitespace-nowrap text-center w-[113px]">عنوان مقاله</span>
                    </label>
                    <input
                      className="w-full border rounded-r-none border-gray-200 rounded-md "
                      type="text"
                      id="title"
                      {...register('title')}
                    />
                  </div>
                  {mode === 'edit' && (
                    <div className="flex flex-col xs:flex-row px-10 pb-0 pt-6">
                      <div className="flex items-center xs:py-0 py-2 justify-center px-3 rounded-l-none rounded-md bg-[#f5f8fa]">
                        <img className="w-5 h-5" src="/assets/svgs/duotone/barcode.svg" alt="" />
                        <span className="whitespace-nowrap text-center w-[113px]">کد مقاله</span>
                      </div>
                      <div className="w-full py-2 border text-center  bg-[#f5f8fa] rounded-r-none rounded-md ">
                        {digitsEnToFa(selectedArticle?.code ?? '')}
                      </div>
                    </div>
                  )}

                  {/* place of display  */}
                  {/* <div className="flex px-10 py-6 flex-col xs:flex-row">
                    <label
                      htmlFor="isActive"
                      className="flex items-center justify-center xs:py-0 py-2 px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                    >
                      <img className="w-5 h-5" src="/assets/svgs/duotone/eye.svg" alt="" />
                      <span className="whitespace-nowrap text-center w-[113px]">جایگاه نمایش</span>
                    </label>
                    <select
                      className={`w-full text-center rounded-md rounded-r-none border border-gray-300`}
                      id="place"
                      value={place}
                      {...register('place', { onChange: handleChangePlace })}
                    >
                      <option value="0" className={''}>
                        انتخاب کنید{' '}
                      </option>
                      <option value="1" className={''}>
                        خواندنی ها
                      </option> */}
                  {/* <option value="2" className={''}>
                        فروش در
                      </option>
                      <option value="3" className={''}>
                        با
                      </option>
                      <option value="4" className={''}>
                        خرید از
                      </option> */}
                  {/* {columnFootersData?.data &&
                        columnFootersData.data.map((columnFooter, index) => {
                          return (
                            <option key={index} value={`${columnFooter.index}`} className={''}>
                              {columnFooter.name}
                            </option>
                          )
                        })}
                    </select>
                  </div> */}
                  {/*select category  */}
                  <div className="flex px-10 py-6 pt-6 flex-col xs:flex-row">
                    <label
                      htmlFor="place"
                      className="flex items-center justify-center xs:py-0 py-2 px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                    >
                      <img className="w-5 h-5" src="/assets/svgs/duotone/bars.svg" alt="" />
                      <span className="whitespace-nowrap text-center w-[113px]">انتخاب دسته</span>
                    </label>
                    <select
                      className="w-full text-center rounded-md rounded-r-none border border-gray-300"
                      name="انتخاب"
                      id="place"
                      value={selectedCategory || ''}
                      onChange={handleCategoryChange}
                    >
                      <option className="appearance-none text-sm" value="">
                        انتخاب کنید
                      </option>
                      {allCategories?.map((category) => (
                        <option
                          className={category.level === 0 ? 'text-blue-600' : ''}
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Thumbnail article  */}
                  <div className="flex justify-center">
                    <div className="">
                      <input
                        type="file"
                        className="hidden"
                        id="MainThumbnail"
                        onChange={handleMainFileChange}
                        accept="image/jpeg"
                      />
                      <label htmlFor="MainThumbnail" className="block cursor-pointer p-6 pt-3 pb-7 text-sm font-normal">
                        <h3 className="font-bold text-center mb-4">تصویر نمایه</h3>
                        {selectedMainFile.length > 0 ? (
                          selectedMainFile.map((file: any, index: number) => (
                            <div key={index} className="text-sm shadow-item rounded-lg p-2 text-gray-600">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-[180px] h-[180px] object-contain  rounded-md"
                              />
                            </div>
                          ))
                        ) : (
                          <img
                            className="w-[180px] h-[180px] rounded-md"
                            src="/images/other/product-placeholder.png"
                            alt="product-placeholder"
                          />
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="bg-gray-50 bottom-0 w-full  rounded-b-lg px-8 flex flex-col pb-2">
                    <span className="font-normal text-[11px] pt-2">سایز عکس می بایست 650*1000 پیکسل باشد</span>
                    <span className="font-normal text-[11px]">حجم عکس میبایست حداکثر 70 کیلوبایت باشد</span>
                    <span className="font-normal text-[11px]">فرمت عکس می بایست jpg باشد.</span>
                  </div>
                </div>
              </div>
            </div>
            {/* is active  */}
            <div className="flex flex-1">
              <div className="bg-white w-full rounded-md shadow-item">
                <div className={`flex items-center justify-between border-b p-6 ${mode === "edit" ? "py-5" : "py-6"} `}>
                  <h3 className=" text-gray-600">وضعیت مقاله</h3>
                  {mode === 'edit' && (
                    <div className="flex gap-2">
                      <Link href={`/articles/${selectedArticle?.slug}`}>
                        <Button className="p-0  text-xs  w-20 py-2 bg-blue-500 hover:bg-blue-600">نمایش</Button>
                      </Link>
                      <Button
                        onClick={() => handleDeleteTrash(selectedArticle?.id ?? '')}
                        className="p-0  text-xs  w-20 py-2 bg-red-500 hover:bg-red-600"
                      >
                        زباله دان
                      </Button>
                    </div>
                  )}
                </div>

                {/* is active select */}
                {mode === 'edit' ? (
                  <div className="flex flex-col space-y-6">
                    <div className="flex flex-col xs:flex-row px-10 py-10 pb-0 pt-6">
                      <div className="flex items-center xs:py-0 py-2 justify-center px-3 rounded-l-none rounded-md bg-[#f5f8fa] h-[42px]">
                        <PiUserDuotone className="w-5 h-5 opacity-50" />
                        <span className="whitespace-nowrap text-center w-[113px]">انتشار توسط</span>
                      </div>
                      <div className="w-full text-sm py-2 border-r text-center  bg-[#f5f8fa] rounded-r-none rounded-md ">
                        {author}
                      </div>
                    </div>
                    <div className="flex flex-col xs:flex-row px-10 py-10 pb-0 pt-0">
                      <div className="flex items-center xs:py-0 py-2 justify-center px-3 rounded-l-none rounded-md bg-[#f5f8fa]  h-[42px]">
                        <img className="w-5 h-5  opacity-50" src="/assets/svgs/duotone/calendar-days.svg" alt="" />
                        <span className="whitespace-nowrap text-center w-[133px]">زمان انتشار</span>
                      </div>
                      <div className="w-full py-2 border-r text-center text-sm  bg-[#f5f8fa] rounded-r-none rounded-md ">
                        {digitsEnToFa(shamsiDate)}
                      </div>
                    </div>
                    <div className="flex flex-col xs:flex-row px-10 py-10 pb-0 pt-0">
                      <div className="flex items-center xs:py-0 py-2 justify-center px-3 rounded-l-none rounded-md bg-[#f5f8fa]  h-[42px]">
                        <img className="w-5 h-5 opacity-50" src="/assets/svgs/duotone/calendar-days.svg" alt="" />
                        <span className="whitespace-nowrap text-center w-[133px]"> ویرایش</span>
                      </div>
                      <div className="w-full text-sm  py-2 border-r text-center  bg-[#f5f8fa] rounded-r-none rounded-md ">
                        {digitsEnToFa(updateShamsiDate)} توسط {author}
                      </div>
                    </div>
                    <div className={`flex px-10 py-10 ${mode === 'edit' ? 'pt-0' : 'pt-6'}  flex-col xs:flex-row`}>
                      <label
                        htmlFor="title"
                        className="flex items-center justify-center xs:py-0 py-2 px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                      >
                        <img className="w-5 h-5" src="/assets/svgs/duotone/eye.svg" alt="" />
                        <span className="whitespace-nowrap text-center w-[113px]">وضعیت</span>
                      </label>
                      <select
                        className={`w-full text-center rounded-md rounded-r-none border border-gray-300 ${
                          isActive === 'true' ? 'bg-green-100' : 'bg-red-100'
                        }`}
                        id="isActive"
                        value={isActive}
                        {...register('isActive', { onChange: handleChangeStatus })}
                      >
                        <option value="false" className={isActive !== 'false' ? 'bg-white' : ''}>
                          غیر فعال
                        </option>
                        <option value="true" className={isActive !== 'true' ? 'bg-white' : ''}>
                          فعال
                        </option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="flex px-10 py-10 pt-6 flex-col xs:flex-row">
                    <label
                      htmlFor="isActive"
                      className="flex items-center justify-center xs:py-0 py-2 px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                    >
                      <img className="w-5 h-5" src="/assets/svgs/duotone/eye.svg" alt="" />
                      <span className="whitespace-nowrap text-center w-[113px]">وضعیت</span>
                    </label>
                    <select
                      className={`w-full text-center rounded-md rounded-r-none border border-gray-300 ${
                        isActive === 'true' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                      id="isActive"
                      value={isActive}
                      {...register('isActive', { onChange: handleChangeStatus })}
                    >
                      <option value="false" className={isActive !== 'false' ? 'bg-white' : ''}>
                        غیر فعال
                      </option>
                      <option value="true" className={isActive !== 'true' ? 'bg-white' : ''}>
                        فعال
                      </option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/*is show  add product descriptions*/}
          <div className="flex flex-1">
            <div className="bg-white w-full rounded-md shadow-item">
              <h3 className="border-b p-6 text-gray-600">متن مقاله</h3>
              {/* <CustomEditor textEditor={textEditor} setTextEditor={setTextEditor} /> */}
              <CustomEditor
                value={textEditor}
                onChange={(event: any, editor: any) => {
                  const data = editor.getData()
                  setTextEditor(data)
                }}
                placeholder=""
              />
              <div className="bg-gray-50 bottom-0 w-full  rounded-b-lg px-8 flex flex-col pb-2">
                <span className="font-normal text-[11px] pt-2">...</span>
              </div>
            </div>
          </div>

          {/* validation errors */}
          {/* <div className="flex flex-col"> */}
          {/* {formErrors.title && <p className="text-red-500 px-10">{formErrors.title.message}</p>} */}

          {/* {formErrors.categoryId && <p className="text-red-500 px-10">{formErrors.categoryId?.message}</p>} */}

          {/* {formErrors.thumbnail && <p className="text-red-500 px-10">{formErrors.thumbnail?.message}</p>} */}
          {/* </div> */}
          {/* validation errors */}
          <div className="flex justify-end w-full">
            <div className="flex flex-col">
              <p className={`text-red-500 h-5 px-10  visible`}>
                {formErrors.title
                  ? formErrors.title.message
                  : titleWatch !== ''
                  ? ''
                  : 'وارد کردن نام مقاله الزامی است'}
              </p>

              <p className={`text-red-500 h-5 px-10 visible `}>
                {formErrors.thumbnail ? formErrors.thumbnail.message : thumbnailWatch ? '' : 'تصویر نمایه الزامی است'}
              </p>
            </div>
            <div className=" w-fit">
              {' '}
              <Button
                isLoading={isLoadingCreate || isLoadingUpdate}
                type="submit"
                className={` px-11 py-3 ${!isValid ? 'bg-gray-300' : 'hover:bg-[#e90088c4] '}  `}
              >
                {mode === 'edit' ? 'بروزرسانی' : 'انتشار'}
              </Button>
            </div>
          </div>

          {/* <div className="flex justify-end w-full">
            {' '}
            <Button type="submit" className={`w-0 px-11 py-3 hover:bg-[#e90088b0] mb-10 float-start`}>
              {mode === 'edit' ? 'بروزرسانی' : 'انتشار'}
            </Button>
          </div> */}
        </form>
      </section>
    </>
  )
}

export default TicketAdminForm
