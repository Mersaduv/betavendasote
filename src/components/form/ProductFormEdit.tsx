import { ChangeEvent, ChangeEventHandler, Dispatch, Fragment, SetStateAction, useEffect, useRef, useState } from 'react'
import { SubmitHandler, useForm, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FaArrowDownLong } from 'react-icons/fa6'
import { Modal } from '@/components/ui'
import { PiUserDuotone } from 'react-icons/pi'
import { productSchema } from '@/utils'
import jalaali from 'jalaali-js'
import type {
  IProduct,
  ICategory,
  IProductForm,
  IBrand,
  IProductSizeInfo,
  IStockItem,
  IProductScaleCreate,
  ISizeInfoModel,
  IProductStatus,
  IProductIsFake,
  IProductType,
} from '@/types'
import { CategorySelector } from '../categories'
import {
  useDeleteTrashProductMutation,
  useGetAllCategoriesQuery,
  useGetBrandsQuery,
  useGetCategoriesTreeQuery,
  useGetFeatureValuesQuery,
  useGetFeaturesByCategoryQuery,
  useGetFeaturesQuery,
  useGetSingleCategoryQuery,
} from '@/services'
import TextEditor from './TextEditor'
import {
  AddFeatureCombobox,
  BrandCombobox,
  CategoryCombobox,
  FeatureCombobox,
  ProductTypeCombobox,
  StatusCombobox,
} from '../selectorCombobox'
import { Button } from '../ui'
import { useGetSizeByCategoryIdQuery } from '@/services/size/apiSlice'
import { digitsEnToFa, digitsFaToEn } from '@persian-tools/persian-tools'
import { useAppDispatch, useAppSelector, useDisclosure } from '@/hooks'
import { setStateStringSlice, setUpdated, showAlert } from '@/store'
import Link from 'next/link'
import { AiFillDelete } from 'react-icons/ai'
import { MdClose } from 'react-icons/md'
import { FeatureValue, ProductFeature, SizeDTO } from '@/services/feature/types'
import dynamic from 'next/dynamic'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { IoIosTimer } from 'react-icons/io'
import { HandleResponse, JalaliDatePicker } from '../shared'
import { ConfirmDeleteModal, InventoryLocationModal } from '../modals'
import { useRouter } from 'next/router'
import IsFakeCombobox from '../selectorCombobox/IsFakeCombobox'
import { BiCartDownload } from 'react-icons/bi'
import DateObject from 'react-date-object'
import persian from 'react-date-object/calendars/persian'
const generateUniqueId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
type Duration = 'none' | '1day' | '2days' | '3days' | '1week'
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

const formatTime = (totalHours: number, minutes?: number, seconds?: number) => {
  const hours = Math.floor(totalHours)
  const calculatedMinutes = minutes !== undefined ? minutes : Math.floor((totalHours % 1) * 60)
  const calculatedSeconds = seconds !== undefined ? seconds : Math.floor((((totalHours % 1) * 60) % 1) * 60)

  const padZero = (num: number) => num.toString().padStart(2, '0')

  const formattedTime = `${padZero(hours)}:${padZero(calculatedMinutes)}:${padZero(calculatedSeconds)}`
  return formattedTime
}

const addCommas = (num: string | number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
const removeKeys = (item: IStockItem) => {
  const { id, imagesSrc, productId, created, idx, lastUpdated, ...rest } = item
  return rest
}

interface EditProductFormProps {
  mode: 'edit'
  updateHandle: (data: FormData) => void
  selectedProduct?: IProduct
  isLoadingUpdate: boolean
}

type Props = EditProductFormProps

export interface SelectedCategories {
  categorySelected?: ICategory
}

const initialSelectedCategories = {
  categorySelected: {} as ICategory,
}

interface PropTable {
  features: ProductFeature[]
  sizeList: SizeDTO[]
  setStateSizeFeature: Dispatch<SetStateAction<SizeDTO[]>>
  setStateFeature: Dispatch<SetStateAction<ProductFeature[]>>
  setStateStockItems: Dispatch<SetStateAction<IStockItem[]>>
  setProductSizeScale: Dispatch<SetStateAction<IProductSizeInfo>>
  selectedFiles: File[]
  rowsData: CurrentRow[]
  newRows: CurrentRow[]
  isSecondRequest: boolean
  setIsSecondRequest: Dispatch<SetStateAction<boolean>>
}

interface PropSetStockImage {
  index: number
  selectedFiles: File[]
  selectedStockFiles: { file: File | null; index: number | null } | null
  setSelectedStockFiles: (file: File, index: number) => void
  isShow?: boolean
  onClose?: () => void
  open?: () => void
}

interface CurrentRow {
  [key: string]: any
  sizeId?: string
  isHidden?: boolean
  featureValueId?: string[]
  price?: number
  weight?: number
  purchasePrice?: number
  quantity?: number
}
const CustomEditor = dynamic(() => import('@/components/form/TextEditor'), { ssr: false })
const ProductFormEdit: React.FC<Props> = (props) => {
  // ? Props
  const { mode, isLoadingUpdate, updateHandle, selectedProduct } = props
  const isUpdated = useAppSelector((state) => state.stateUpdate.isUpdated)
  const dispatch = useAppDispatch()
  // ? States
  const [isShowInventoryLocationModal, inventoryLocationModalHandlers] = useDisclosure()
  const [inventoryLocationState, setInventoryLocationState] = useState<string>('')
  const [guideDescriptionState, setGuideDescriptionState] = useState<string>('')
  const [date, setDate] = useState<any>()
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false)
  const datePickerRef = useRef<any>(null)
  const [isDetailsSkip, setIsDetailsSkip] = useState(true)
  const [isProductScale, setIsProductScale] = useState(false)
  const [isStock, setIsStock] = useState(false)
  const [isFeaturesSkip, setIsFeaturesSkip] = useState(false)
  const [isRemoveProductSize, setIsRemoveProductSize] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategories>(initialSelectedCategories)
  const [mainCategories, setMainCategories] = useState<ICategory[]>([])
  const [childCategories, setChildCategories] = useState<ICategory[]>([])
  const [selectedMainFile, setMainSelectedFiles] = useState<File[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [stateBrand, setStateBrand] = useState<IBrand | null>(null)
  const [stateStockItems, setStateStockItems] = useState<IStockItem[]>([])
  const [stateFeatureListForTable, setStateFeatureListForTable] = useState<ProductFeature[]>([])
  const [stateFeature, setStateFeature] = useState<ProductFeature[]>([])
  const [stateSizeFeature, setStateSizeFeature] = useState<SizeDTO[]>([])
  const [selectedMainFeature, setMainSelectedFeatures] = useState<ProductFeature>()
  const [selectedAddFeature, setSelectedAddFeature] = useState<ProductFeature[]>([])
  const [stateFeatureData, setStateFeatureData] = useState<ProductFeature[]>([])
  const [stateFeatureDataByCategory, setStateFeatureDataByCategory] = useState<ProductFeature[]>([])
  const [productSizeScale, setProductSizeScale] = useState<IProductSizeInfo>({
    sizeType: '0', // provide a default value for sizeType
    rows: [],
    columns: null,
    imagesSrc: undefined,
  })
  // edit state
  const [singleCategoryId, setSingleCategoryId] = useState<string>()
  const [selectedMainCategory, setSelectedMainCategory] = useState<ICategory | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<IBrand | null>(null)
  const [stateColorData, setStateColorData] = useState<FeatureValue[]>()
  const [stateFeatureValueData, setStateFeatureValueData] = useState<FeatureValue[]>()
  const [stateSizeData, setStateSizeData] = useState<SizeDTO[]>()
  const [productSizeScaleData, setProductSizeScaleData] = useState<ISizeInfoModel[]>()
  const [productScaleCreate, setProductScaleCreate] = useState<IProductScaleCreate>()
  const [shamsiDate, setShamsiDate] = useState('')
  const [updateShamsiDate, setUpdateShamsiDate] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<IProductStatus | null>({ id: 'New', name: 'آکبند' })
  const [selectedProductType, setSelectedProductType] = useState<IProductType | null>({
    id: 'Product',
    name: 'کالا برای فروش',
  })
  const [isFake, setIsFake] = useState<IProductIsFake | null>({ id: 'false', name: 'محصول اصل' })
  const [isSecondRequest, setIsSecondRequest] = useState(false)
  const [rowsData, setRowsData] = useState<CurrentRow[]>([])
  const [textEditor, setTextEditor] = useState<any>()
  const newRows: CurrentRow[] = []
  //state management
  const { userInfo } = useAppSelector((state) => state.auth)
  const { query, back, push } = useRouter()
  const { generalSetting } = useAppSelector((state) => state.design)
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
  } = useForm<IProductForm>({
    resolver: yupResolver(productSchema) as unknown as Resolver<IProductForm>,
    defaultValues: {
      IsActive: true,
    },
  })
  useEffect(() => {
    if (selectedProduct && selectedProduct.date) {
      console.log(selectedProduct.created, 'selectedProduct.created example =  2024-08-11T08:05:09.49494Z')

      const gregorianDateString = selectedProduct.date
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

    if (selectedProduct && selectedProduct.lastUpdated) {
      const gregorianDateString = selectedProduct.lastUpdated
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
  }, [selectedProduct])

  const { productScales, refetch: refetchProductScales } = useGetSizeByCategoryIdQuery(
    {
      categoryId: selectedCategories?.categorySelected?.id as string,
    },
    {
      selectFromResult: ({ data }) => ({
        productScales: data?.data,
      }),
    }
  )

  useEffect(() => {
    // console.log(productScales, 'productScales  - productScales')

    if (productScales) {
      // if (productSizeScale?.columns) {
      setProductSizeScale({
        sizeType: productScales.sizeType,
        rows:
          productScales.productSizeValues?.map((productSizeValue) => ({ productSizeValue: productSizeValue.name })) ||
          [],
        columns: [],
        imagesSrc: productScales.imagesSrc,
      })
      // console.log(productSizeScale , "productSizeScale data");
      // }
    }
  }, [productScales])

  useEffect(() => {
    if (!isCalendarOpen) {
      setDate(new DateObject().setCalendar(persian))
    }
  }, [isCalendarOpen])
  //؟ all Features Query
  const { data: allFeatures, refetch: refetchAllFeature } = useGetFeaturesQuery(
    { pageSize: 999999 },
    {
      selectFromResult: ({ data, isLoading }) => ({
        data: data?.data?.data,
        isLoading,
      }),
    }
  )

  // ? Get Categories Query
  const { categoriesData, refetch: refetchCategoryData } = useGetAllCategoriesQuery(
    { pageSize: 999999, isActive: true },
    {
      selectFromResult: ({ data }) => ({
        categoriesData: data?.data?.data,
      }),
    }
  )

  const singleCategoryQueryEnabled = singleCategoryId !== undefined
  const { data: singleCategoryData, refetch: refetchSingleCategoryData } = useGetSingleCategoryQuery(
    { id: singleCategoryId! },
    { skip: !singleCategoryQueryEnabled }
  )

  useEffect(() => {
    if (categoriesData) {
      const mainCats = categoriesData.filter((category) => category.level === 0)
      setMainCategories(mainCats)
    }
  }, [categoriesData])

  // ? Queries
  //*   Get Details
  const { data: features, refetch: refetchFeatures } = useGetFeaturesByCategoryQuery(
    selectedCategories?.categorySelected?.id as string,
    {
      skip: isDetailsSkip,
    }
  )

  useEffect(() => {
    if (isSecondRequest) {
      console.log(isSecondRequest, features, 'isSecondRequest ,features')
      setStateFeature([])
      setStateSizeFeature([])
      setStateStockItems([])
      setStateFeatureValueData([])
      setStateColorData([])
      setRowsData([])
      setStateSizeData([])
      if (features?.data?.productFeatures) {
        setStateFeatureDataByCategory(features.data.productFeatures)
      }
    }
  }, [features, isSecondRequest])

  // if (stateFeatureDataByCategory) {
  //   console.log(stateFeatureDataByCategory)
  // }

  // ? Queries
  //*   Get Brands
  const { data: brandData, refetch: refetchBrandData } = useGetBrandsQuery({
    page: 1,
    pageSize: 200,
    categoryId: selectedCategories?.categorySelected?.id,
  })

  // Queries
  //* Get Feature
  const {
    data: featureData,
    isLoading: isLoadingFeature,
    refetch: refetchFeatureData,
  } = useGetFeaturesQuery(
    {
      pageSize: 200,
    },
    {
      selectFromResult: ({ data, isLoading }) => ({
        data: data?.data?.data,
        isLoading,
      }),
    }
  )
  // Queries
  //* Get Feature Values
  const {
    data: featureValueData,
    isLoading: isLoadingFeatureValue,
    refetch: refetchFeatureValueData,
  } = useGetFeatureValuesQuery({ pageSize: 200 })
  // ? Re-Renders
  //*   Select Category To Fetch Details
  useEffect(() => {
    if (selectedCategories?.categorySelected?.id) {
      setIsDetailsSkip(false)
      // setIsProductScale(false)
      setStateFeature([])
      setStateSizeFeature([])
      setValue('CategoryId', selectedCategories?.categorySelected?.id)
    }
  }, [selectedCategories?.categorySelected?.id])

  useEffect(() => {
    if (isFake !== null) {
      let isFakeData = isFake.id === 'true' ? true : false
      setValue('IsFake', isFakeData)
    }
  }, [isFake, setValue])

  useEffect(() => {
    const loadSimpleData = async () => {
      if (selectedProduct && mode === 'edit') {
        const {
          title,
          description,
          isActive,
          categoryId,
          brandId,
          productFeatureInfo,
          isFake,
          productSizeInfo,
          stockItems: stockItemsData,
          brandData,
          date: dateData,
          parsedDate,
          publishTime,
          stockTag,
          inventoryLocation,
          guideDescription,
        } = selectedProduct
        console.log(selectedProduct, 'selectedProduct')

        setIsActive(isActive ? 'true' : 'false')

        if (selectedProduct.status === 0) {
          setSelectedStatus({ id: 'New', name: 'آکبند' })
        } else {
          setSelectedStatus({ id: 'Used', name: 'کارکرده' })
        }
        setIsCalendarOpen(parsedDate === null || !publishTime ? false : true)
        // if (selectedProduct.productType === 0) {
        setSelectedProductType({ id: 'Product', name: 'کالا برای فروش' })
        // } else {
        //   setSelectedProductType({ id: 'ProductFile', name: 'فایل برای فروش' })
        // }

        if (isFake) {
          setIsFake({ id: 'true', name: 'محصول غیر اصل' })
        } else {
          setIsFake({ id: 'false', name: 'محصول اصل' })
        }

        setProductSizeScaleData(
          productSizeInfo?.rows?.map((row) => ({
            id: row.idx,
            modelSizeId: row.id ?? '',
            scaleValues: row.scaleValues,
            productSizeValue: row.productSizeValue ?? '',
            productSizeValueId: row.idx,
          })) || []
        )

        setSingleCategoryId(categoryId)

        setRowsData(
          stockItemsData?.map((stock) => {
            const fixedProperties = {
              sizeId: stock.sizeId,
              isHidden: stock.isHidden,
              featureValueId: stock.featureValueId,
              id: stock.stockId,
              stockId: stock.stockId,
              imagesSrc: stock.imagesSrc,
              idx: stock.idx,
              quantity: stock.quantity,
              price: stock.price,
              weight: stock.weight,
              purchasePrice: stock.purchasePrice,
              discount: stock.discount,
              discountRemainingTime: stock.discountRemainingTime,
            }

            const dynamicProperties = Object.keys(stock).reduce((acc: { [key: string]: any }, key) => {
              if (!fixedProperties.hasOwnProperty(key)) {
                acc[key] = stock[key]
              }
              return acc
            }, {})

            return {
              ...fixedProperties,
              ...dynamicProperties,
            }
          }) || []
        )
        console.log(stockItemsData, 'stockItemsData - stockItemsData')

        const colorDTOsIds = productFeatureInfo?.colorDTOs?.map((color) => color.id) || []
        const featureValueIds =
          productFeatureInfo?.featureValueInfos?.flatMap((feature) => feature?.value?.map((val) => val.id)) || []
        const featureValuesIds = [...colorDTOsIds, ...featureValueIds]

        if (features?.data?.productFeatures) {
          setStateFeatureDataByCategory(features?.data?.productFeatures)
        }

        const filteredFeatureValueData = featureValueData?.data?.data?.filter((featureValue) =>
          featureValueIds.includes(featureValue.id)
        )

        const filteredFeatureValueDataColor = featureValueData?.data?.data?.filter((featureValue) =>
          colorDTOsIds.includes(featureValue.id)
        )

        const stockSizeIds = stockItemsData.map((item) => item.sizeId)
        const filteredSizeDTOs = features?.data?.sizeDTOs?.filter((size) => stockSizeIds.includes(size.id))

        if (filteredFeatureValueData) {
          setStateFeatureValueData(filteredFeatureValueData)
        }
        if (filteredFeatureValueDataColor) {
          setStateColorData(filteredFeatureValueDataColor)
        }
        if (filteredSizeDTOs) {
          setStateSizeData(filteredSizeDTOs)
        }

        if (dateData) {
          setDate(dateData)
        }

        setSelectedBrand(brandData)
        setTextEditor(description)
        setGuideDescriptionState(guideDescription)
        setInventoryLocationState(inventoryLocation)
        setValue('InventoryLocation', inventoryLocation)
        reset({
          Id: selectedProduct.id,
          Title: title,
          stockTag: stockTag,
          Description: description,
          GuideDescription: guideDescription,
          InventoryLocation: inventoryLocation,
          IsActive: isActive,
          CategoryId: categoryId,
          BrandId: brandId,
          FeatureValueIds: featureValuesIds,
          IsFake: isFake,
          status: selectedProduct.status === 0 ? 'New' : 'Used',
          productType: selectedProduct.productType === 0 ? 'Product' : 'ProductFile',
        })
      }
    }

    const loadImages = async () => {
      if (selectedProduct && mode === 'edit') {
        const { imagesSrc, mainImageSrc } = selectedProduct

        const mainImageFile = await fetchImageAsFile(mainImageSrc.imageUrl)
        if (mainImageFile) {
          setMainSelectedFiles([mainImageFile])
        }

        const imageFiles = await Promise.all(imagesSrc!.map((image) => fetchImageAsFile(image.imageUrl)))
        setSelectedFiles(imageFiles)

        reset((prevState) => ({
          ...prevState,
          MainThumbnail: mainImageFile,
          Thumbnail: imageFiles,
        }))
      }
    }

    if (!isSecondRequest) {
      loadSimpleData()
      // .then(loadImages);
      loadImages()
    }
  }, [selectedProduct, features])

  useEffect(() => {
    if (selectedStatus) {
      setValue('status', selectedStatus.id)
    }
  }, [selectedStatus])

  // useEffect(() => {
  //   if (inventoryLocationState) {
  //     setValue('InventoryLocation', inventoryLocationState)
  //   }
  // }, [inventoryLocationState])

  useEffect(() => {
    // Set selected category
    if (singleCategoryData) {
      const mainCategory: ICategory[] | undefined = singleCategoryData?.data?.parentCategories?.filter(
        (c) => c.level == 0
      )
      setSelectedCategories({ categorySelected: singleCategoryData.data || ({} as ICategory) })
      setChildCategories(singleCategoryData.data?.parentCategoriesTree || [])
      setSelectedMainCategory(mainCategory![0])
    }
  }, [singleCategoryData])

  // ? Handlers
  const editedCreateHandler: SubmitHandler<IProductForm> = (data) => {
    console.log(data, 'datadata')

    const formData = new FormData()
    formData.append('Id', data.Id)
    formData.append('Title', data.Title)
    formData.append('StockTag', data.stockTag ?? '')
    formData.append('IsActive', data.IsActive.toString())
    if (data.MainThumbnail) {
      formData.append('MainThumbnail', data.MainThumbnail)
    }

    if (data.Thumbnail && data.Thumbnail.length > 0) {
      data.Thumbnail.forEach((file, index) => {
        formData.append('Thumbnail', file)
      })
    }
    if (data) {
      console.log(data, data.status, 'selectedStatus,data.status')
    }
    formData.append('Status', data.status)

    formData.append('CategoryId', data.CategoryId)
    formData.append('GuideDescription', guideDescriptionState)
    formData.append('InventoryLocation', inventoryLocationState)
    formData.append('Description', textEditor)
    formData.append('IsFake', data.IsFake.toString())
    if (data.BrandId) {
      formData.append('BrandId', data.BrandId)
    }
    if (data.FeatureValueIds) {
      data.FeatureValueIds.forEach((id) => {
        formData.append('FeatureValueIds', id)
      })
    }

    if (data.StockItems) {
      console.log(data.StockItems, 'data.StockItems')

      const stockItemsWithoutFile = data.StockItems.map((item) => {
        const { thumbnailsStock, ...rest } = item

        rest.price = rest.price ?? 0
        rest.discount = rest.discount ?? 0
        rest.purchasePrice = rest.purchasePrice ?? 0
        rest.weight = rest.weight ?? 0
        rest.quantity = rest.quantity ?? 0

        return rest
      })

      formData.append('StockItems', JSON.stringify(stockItemsWithoutFile))

      data.StockItems.forEach((item, index) => {
        if (item.imageStock) {
          formData.append(`ImageStock_${item.stockId || index}`, item.imageStock)
        }
      })
    }
    if (data.ProductScale) {
      formData.append('ProductScale', JSON.stringify(data.ProductScale))
    }
    if (!isCalendarOpen) {
      setDate(new DateObject().setCalendar(persian))
      formData.append('Date', digitsEnToFa(new DateObject().setCalendar(persian).format('HH:mm:ss - YYYY/MM/DD')))
    } else {
      if (date !== undefined) formData.append('Date', date)
    }
    if (mode == 'edit') {
      updateHandle(formData)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles: any[] = []
      const maxFileSize = 70 * 1024 // 70 KB
      const exactWidth = 700
      const exactHeight = 700

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
                title: 'سایز عکس ها می بایست 700*700 پیکسل باشد',
              })
            )
          } else {
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
        }
      })
    }
  }

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles: any[] = []
      const maxFileSize = 70 * 1024 // 70 KB
      const exactWidth = 700
      const exactHeight = 700

      // تبدیل FileList به آرایه
      Array.from(files).forEach((file) => {
        if (file.type !== 'image/jpeg') {
          dispatch(
            showAlert({
              status: 'error',
              title: 'فرمت عکس ها می بایست jpg باشد',
            })
          )
          return // استفاده از return به جای continue در داخل forEach
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
          URL.revokeObjectURL(img.src) // پاک کردن URL پس از بارگذاری تصویر

          if (img.width !== exactWidth || img.height !== exactHeight) {
            dispatch(
              showAlert({
                status: 'error',
                title: 'سایز عکس ها می بایست 700*700 پیکسل باشد',
              })
            )
          } else {
            validFiles.push(file)
            setValue('MainThumbnail', file)
            setMainSelectedFiles([...validFiles])
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
      'Thumbnail',
      ((getValues('Thumbnail') as File[]) || []).filter((_, i) => i !== index)
    )
  }

  // onSelect Combobox selector
  const handleMainCategorySelect = (category: ICategory) => {
    setSelectedCategories({} as SelectedCategories)
    setChildCategories(category?.childCategories || ([] as ICategory[]))
  }

  const handleBrandSelect = (brand: IBrand) => {
    if (brand) {
      setValue('BrandId', brand.id)
    }
    setStateBrand(brand || ({} as IBrand))
  }

  const handleFeatureSelect = (features: SizeDTO[] | ProductFeature) => {
    if (Array.isArray(features)) {
      setStateSizeFeature((prevState) => {
        const newState = prevState.filter((item) => features.some((feature) => feature.id === item.id))
        features.forEach((feature) => {
          if (!newState.some((item) => item.id === feature.id)) {
            newState.push(feature)
          }
        })
        setProductSizeScale(
          (prevState): IProductSizeInfo => ({
            ...prevState,
            columns: newState,
          })
        )
        return newState
      })
    } else {
      setStateFeature((prevState) => {
        const featureExists = prevState.some((item) => item.id === features.id)

        if (!featureExists) {
          return [...prevState, features]
        } else {
          return prevState
            .map((item) => {
              if (item.id === features.id) {
                return { ...item, values: features.values }
              }
              return item
            })
            .filter((item) => item.values && item.values.length > 0)
        }
      })
    }
  }

  useEffect(() => {
    if (stateSizeFeature.length > 0) {
      setIsProductScale(true)
    } else {
      setIsProductScale(false)
    }
  }, [stateSizeFeature])

  useEffect(() => {
    if (stateFeature.length > 0) {
      setIsStock(true)
    } else {
      setIsStock(false)
    }
    // console.log(stateFeature, stateSizeFeature)
  }, [stateFeature])

  useEffect(() => {
    if (stateFeature) {
      const featureValueIds = stateFeature.flatMap((feature) => feature.values ?? []).map((value) => value.id)
      setValue('FeatureValueIds', featureValueIds)
    }
  }, [stateFeature])

  // useEffect(() => {
  //   if (selectedMainFile.length > 0) {
  //     console.log(selectedMainFile, 'selectedMainFile - selectedMainFile')
  //     setValue('MainThumbnail',selectedMainFile[0])
  //   }
  // }, [selectedMainFile.length])

  const handleMainFeatureSelect = (newFeatures: ProductFeature) => {
    setMainSelectedFeatures(newFeatures || ({} as ProductFeature))
  }

  const handleAddFeature = () => {
    const newFeature = selectedMainFeature ?? ({} as ProductFeature)

    // Check if the feature already exists in stateFeatureDataByCategory
    const existingFeatureInState = stateFeatureDataByCategory.find((feature) => feature.id === newFeature.id)

    if (!existingFeatureInState) {
      setStateFeatureDataByCategory((prevFeatures) => [...prevFeatures, newFeature])

      // Filter out the newly added feature from stateFeatureData
      setStateFeatureData((prevStateFeatures) =>
        prevStateFeatures.filter((stateFeature) => stateFeature.id !== newFeature.id)
      )
    }
  }

  const handleRemoveFeatureToAddOnStateFeatureData = (feature: ProductFeature) => {
    setStateFeatureData((prevFeatures) => [...prevFeatures, feature])
    setStateFeatureDataByCategory((prevFeatures) => prevFeatures.filter((f) => f.id !== feature.id))
  }

  const handleRemoveProductSize = () => {
    setIsRemoveProductSize((prev) => !prev)
  }

  useEffect(() => {
    if (allFeatures && stateFeatureDataByCategory) {
      const filteredData = allFeatures.filter(
        (allFeature) => !stateFeatureDataByCategory?.some((feature) => feature.id === allFeature.id)
      )
      setStateFeatureData(filteredData)
    }
  }, [allFeatures, features]) ///..................................................................................................................................

  useEffect(() => {
    if (stateFeatureDataByCategory) {
      // console.log(stateFeatureDataByCategory, 'stateFeatureDataByCategory', stateFeatureData, 'stateFeatureData')
    }
  }, [stateFeatureDataByCategory.length])

  useEffect(() => {
    if (stateStockItems) {
      const filteredStockItems = stateStockItems.map((item: IStockItem) => removeKeys(item))
      console.log(filteredStockItems, 'filteredStockItems', stateStockItems, 'stateStockItems')
      setValue('StockItems', filteredStockItems)
    }
  }, [stateStockItems])

  useEffect(() => {
    if (productSizeScale) {
      // console.log(productSizeScaleData, 'productSizeScaleData-map')
      if (productSizeScaleData && productSizeScaleData?.length > 0) {
        const sortedProductSizeScaleData = productSizeScaleData?.sort((a, b) => Number(a.id) - Number(b.id))
        setProductScaleCreate({
          columnSizes: productSizeScale?.columns?.map((col) => ({ id: col.id, name: col.name })),
          Rows: sortedProductSizeScaleData.map((item) => ({
            id: item.id ?? '',
            idx: item.idx ?? '',
            productSizeValue: item.productSizeValue ?? '',
            productSizeValueId: item.productSizeValueId ?? '',
            scaleValues: item.scaleValues ?? [],
          })),
        })
      } else {
        setProductScaleCreate({
          columnSizes: productSizeScale?.columns?.map((col) => ({ id: col.id, name: col.name })),
          Rows:
            productSizeScale?.rows?.map((row, rowIndex) => ({
              id: rowIndex.toString(),
              idx: rowIndex.toString(),
              scaleValues: productSizeScale?.columns?.map(() => ''),
              productSizeValue: row.productSizeValue ?? '',
              productSizeValueId: rowIndex.toString(),
            })) || [],
        })
      }
    }
  }, [productSizeScale])

  useEffect(() => {
    setValue('ProductScale', productScaleCreate)
  }, [productScaleCreate])

  // Function to handle input changes
  const handleChange = (rowIndex: number, colIndex: number, value: any) => {
    if (!isNaN(value) || value === '') {
      setProductScaleCreate((prevValues) => {
        const updatedRows = (prevValues?.Rows || []).map((row, idx) => {
          if (idx === rowIndex) {
            return {
              ...row,
              scaleValues: row.scaleValues ? [...row.scaleValues] : [],
            }
          }
          return row
        })
        if (updatedRows[rowIndex]?.scaleValues) {
          updatedRows[rowIndex].scaleValues![colIndex] = value
        }
        return { ...prevValues, Rows: updatedRows }
      })
    }
  }

  const handleDeleteProduct = () => {}
  if (features?.data?.sizeDTOs || stateFeatureDataByCategory) {
    // console.log(stateFeatureDataByCategory, features?.data?.sizeDTOs)
  }

  useEffect(() => {
    if (isUpdated) {
      // Ensure that queries have been executed before attempting to refetch them
      if (productScales) refetchProductScales()
      if (allFeatures) refetchAllFeature()
      if (categoriesData) refetchCategoryData()
      if (features) refetchFeatures()
      if (brandData) refetchBrandData()
      if (singleCategoryData) refetchSingleCategoryData()
      if (featureValueData) refetchFeatureValueData()

      dispatch(setUpdated(false))
    }
  }, [
    isUpdated,
    dispatch,
    refetchProductScales,
    refetchAllFeature,
    refetchCategoryData,
    refetchFeatures,
    refetchBrandData,
    refetchSingleCategoryData,
    refetchFeatureValueData,
    productScales,
    allFeatures,
    categoriesData,
    features,
    brandData,
    singleCategoryData,
    featureValueData,
  ])
  const [isActive, setIsActive] = useState('false')

  const handleChangeStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIsActive(event.target.value)
  }
  //*   Delete Handlers
  const [
    deleteTrashProduct,
    {
      isSuccess: isSuccessTrashDelete,
      isError: isErrorTrashDelete,
      error: errorTrashDelete,
      data: dataTrashDelete,
      isLoading: isLoadingTrashDelete,
    },
  ] = useDeleteTrashProductMutation()
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
    deleteTrashProduct({ id: deleteTrashInfo.id })
  }

  const onSuccess = () => {
    confirmTrashDeleteModalHandlers.close()
    setDeleteTrashInfo({ id: '' })
    dispatch(setStateStringSlice({ name: 'deletedProducts' }))
    push(`/admin/products`)
  }
  const onError = () => {
    confirmTrashDeleteModalHandlers.close()
    setDeleteTrashInfo({ id: '' })
  }

  const toggleCalendar = () => {
    if (isCalendarOpen) {
      datePickerRef.current.closeCalendar()
    } else {
      datePickerRef.current.openCalendar()
    }
    setIsCalendarOpen((prev) => !prev)
  }
  const handleChangeInventoryLocation = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInventoryLocationState(e.target.value)
  }

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
        title="محصول"
        isLoading={isLoadingTrashDelete}
        isShow={isShowConfirmTrashDeleteModal}
        onClose={confirmTrashDeleteModalHandlers.close}
        onCancel={onCancel}
        onConfirm={onConfirmTrashDelete}
      />
      <section>
        <InventoryLocationModal
          isShow={isShowInventoryLocationModal}
          onClose={inventoryLocationModalHandlers.close}
          inventoryLocationState={inventoryLocationState}
          onChange={handleChangeInventoryLocation}
        />
        <form className="flex gap-4 flex-col p-7 px-4 mx-2" onSubmit={handleSubmit(editedCreateHandler)}>
          {/* register title , isActive */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-1">
              <div className="bg-white w-full rounded-md shadow-item">
                <h3 className="border-b p-6 text-gray-600 flex gap-2">
                  ویرایش محصول : <div className="text-sky-500">{selectedProduct?.title}</div>
                </h3>
                <div className="flex flex-col">
                  <div className="flex px-10 py-6 pb-0 flex-col xs:flex-row">
                    <label
                      htmlFor=""
                      className="flex items-center justify-center xs:py-0 py-2 h-[44px] rounded-l-none rounded-md bg-[#f5f8fa]  gap-1 w-[180px]"
                    >
                      {/* <img className="w-5 h-5" src="/assets/svgs/duotone/barcode.svg" alt="" /> */}
                      <BiCartDownload className="w-7 h-7 text-gray-400 " />
                      <span className="whitespace-nowrap text-center mr-2 pl-2">نوع محصول</span>
                    </label>
                    <ProductTypeCombobox
                      selectedProductType={selectedProductType}
                      setSelectedProductType={setSelectedProductType}
                    />
                  </div>
                  <div className="flex flex-col xs:flex-row px-10 py-10 pb-0 pt-6">
                    <label
                      htmlFor="title"
                      className="flex items-center xs:py-0 py-2 justify-center px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                    >
                      <img className="w-5 h-5" src="/assets/svgs/duotone/text.svg" alt="" />
                      <span className="whitespace-nowrap text-center w-[113px]">نام محصول</span>
                    </label>
                    <input
                      className="w-full border rounded-r-none border-gray-200 rounded-md "
                      type="text"
                      id="title"
                      {...register('Title')}
                    />
                  </div>
                  <div className="flex flex-col xs:flex-row px-10 py-10 pt-6">
                    <div className="flex items-center xs:py-0 py-2 justify-center px-3 rounded-l-none rounded-md bg-[#f5f8fa]">
                      <img className="w-5 h-5" src="/assets/svgs/duotone/barcode.svg" alt="" />
                      <span className="whitespace-nowrap text-center w-[113px]">کد محصول</span>
                    </div>
                    <div className="w-full py-2 border text-center  bg-[#f5f8fa] rounded-r-none rounded-md ">
                      {digitsEnToFa(selectedProduct?.code ?? '')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-1">
              <div className="bg-white w-full rounded-md shadow-item">
                <div className="border-b p-5 flex justify-between  items-center">
                  <h3 className=" text-gray-600">وضعیت محصول</h3>
                  <div className="flex gap-2">
                    <Link href={`/products/${selectedProduct?.slug}`}>
                      <Button className="p-0  text-xs  w-20 py-2 bg-blue-500 hover:bg-blue-600">نمایش</Button>
                    </Link>
                    <Button
                      onClick={() => handleDeleteTrash(selectedProduct?.id ?? '')}
                      className="p-0  text-xs  w-20 py-2 bg-red-500 hover:bg-red-600"
                    >
                      زباله دان
                    </Button>
                  </div>
                </div>
                <div className="flex- flex-col">
                  <div className="flex flex-col xs:flex-row px-10  pb-0 pt-6">
                    <div className="flex items-center  justify-center px-3 rounded-l-none rounded-md bg-[#f5f8fa] h-[42px]">
                      <PiUserDuotone className="w-5 h-5 opacity-50" />
                      <span className="whitespace-nowrap text-center w-[113px]">انتشار توسط</span>
                    </div>
                    <div className="w-full text-sm py-2 whitespace-nowrap border-r flex items-center justify-center bg-[#f5f8fa] rounded-r-none rounded-md ">
                      {generalSetting?.title} - {userInfo?.fullName}
                    </div>
                  </div>
                  {/* {isCalendarOpen ? <div className="flex flex-1 px-10 py-10 pt-3  pb-3 flex-col xs:flex-row">
                    <label
                      onClick={toggleCalendar}
                      htmlFor="date"
                      className="flex items-center cursor-pointer justify-center  py px-3  mdx:rounded-l-none rounded-t-md mdx:rounded-md bg-[#f5f8fa]  gap-1 mdx:w-[207px]"
                    >
                      <img className="w-5 h-5  opacity-50" src="/assets/svgs/duotone/calendar-days.svg" alt="" />
                      <span className="whitespace-nowrap text-center w-[113px] ">زمان انتشار</span>
                    </label>

                    <div className={`${isCalendarOpen ? 'block w-full' : 'hidden'}`}>
                      <JalaliDatePicker setDate={setDate} date={date} datePickerRef={datePickerRef} />
                    </div>
                  </div> :           } */}

                  {selectedProduct?.parsedDate !== null && selectedProduct?.publishTime !== false ? (
                    <div className="flex flex-1 px-10 pt-6 flex-col mdx:flex-row">
                      <label
                        onClick={toggleCalendar}
                        htmlFor="date"
                        className="flex items-center cursor-pointer justify-center  px-3  mdx:rounded-l-none rounded-t-md mdx:rounded-md bg-[#abd7ff]  gap-1 mdx:w-[160px]"
                      >
                        <img className="w-5 h-5  opacity-50" src="/assets/svgs/duotone/calendar-days.svg" alt="" />
                        <span className="whitespace-nowrap text-center w-[113px]">زمان انتشار</span>
                      </label>
                      <div className={`${isCalendarOpen ? 'block w-full' : 'hidden'}`}>
                        <JalaliDatePicker setDate={setDate} date={date} datePickerRef={datePickerRef} />
                      </div>
                      <div
                        className={`${
                          isCalendarOpen
                            ? 'hidden'
                            : 'border h-[42px] w-full rounded-l-md flex justify-center items-center'
                        }`}
                      >
                        فوری{' '}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-1 px-10  pt-6  flex-col mdx:flex-row">
                      <label
                        htmlFor="date"
                        className="flex items-center justify-center  py px-3  mdx:rounded-l-none rounded-t-md mdx:rounded-md bg-[#f5f8fa] h-[42px]  gap-1 w-[202px]"
                      >
                        <img className="w-5 h-5  opacity-50" src="/assets/svgs/duotone/calendar-days.svg" alt="" />
                        <span className="whitespace-nowrap text-center w-[113px]"> انتشار</span>
                      </label>
                      <div className="w-full py-2 border-r flex justify-center items-center text-sm  bg-[#f5f8fa] rounded-r-none rounded-md ">
                        {digitsEnToFa(selectedProduct.date)}
                      </div>
                    </div>
                  )}

                  {/* <div className="flex flex-col xs:flex-row px-10 py-10 pb-0 pt-0">
                    <div className="flex items-center xs:py-0 py-2 justify-center px-3 rounded-l-none rounded-md bg-[#f5f8fa]">
                      <img className="w-5 h-5  opacity-50" src="/assets/svgs/duotone/calendar-days.svg" alt="" />
                      <span className="whitespace-nowrap text-center w-[133px]">زمان انتشار</span>
                    </div>
                    <div className="w-full py-2 border-r text-center text-sm  bg-[#f5f8fa] rounded-r-none rounded-md ">
                      {digitsEnToFa(shamsiDate)}
                    </div>
                  </div> */}
                  {/* <div className="flex flex-1 px-10 py-10 pt-3  pb-3 flex-col xs:flex-row">
                    <label
                      onClick={toggleCalendar}
                      htmlFor="date"
                      className="flex items-center cursor-pointer justify-center  py px-3  mdx:rounded-l-none rounded-t-md mdx:rounded-md bg-[#f5f8fa]  gap-1 mdx:w-[207px]"
                    >
                      <img className="w-5 h-5  opacity-50" src="/assets/svgs/duotone/calendar-days.svg" alt="" />
                      <span className="whitespace-nowrap text-center w-[113px] ">زمان انتشار</span>
                    </label>

                    {isCalendarOpen ?
                    <div className={`${isCalendarOpen ? 'block w-full' : 'hidden'}`}>
                      <JalaliDatePicker setDate={setDate} date={date} datePickerRef={datePickerRef} />
                    </div> :  
                      <div className="w-full py-2 border-r text-center text-sm  bg-[#f5f8fa] rounded-r-none rounded-md ">
                        {digitsEnToFa(shamsiDate)}
                      </div>
                  }
                  </div> */}

                  <div className="flex flex-col xs:flex-row px-10 pt-6  h-[42px] pb-0">
                    <div className="flex items-center xs:py-0 py-2 justify-center px-3 rounded-l-none rounded-md bg-[#f5f8fa] h-[42px]">
                      <img className="w-5 h-5 opacity-50" src="/assets/svgs/duotone/calendar-days.svg" alt="" />
                      <span className="whitespace-nowrap text-center w-[133px]"> ویرایش</span>
                    </div>
                    <div className="w-full text-sm  py-2 border-r flex items-center justify-center  bg-[#f5f8fa] rounded-r-none rounded-md h-[42px] gap-3">
                      {digitsEnToFa(updateShamsiDate)} <div>توسط {userInfo?.fullName}</div>
                    </div>
                  </div>
                  <div className="flex px-10 py-10 mt-2 flex-col xs:flex-row">
                    <label className="flex items-center justify-center xs:py-0 py-2 px-3 rounded-l-none rounded-md bg-[#f5f8fa] h-[42px]">
                      <img className="w-5 h-5" src="/assets/svgs/duotone/eye.svg" alt="" />
                      <span className="whitespace-nowrap text-center w-[133px]">وضعیت</span>
                    </label>
                    <select
                      className={`w-full text-center rounded-md rounded-r-none border border-gray-300 ${
                        isActive === 'true' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                      id="isActive"
                      value={isActive}
                      {...register('IsActive', { onChange: handleChangeStatus })}
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
              </div>
            </div>
          </div>
          {/*register image and category  */}
          <div className="flex flex-col md:flex-row gap-4  h-auto ">
            <div className=" bg-white   rounded-md shadow-item  md:w-[30%]">
              <div className="flex flex-1 md:max-w-[370px]h-[583px] overflow-auto ">
                <div className="bg-white rounded-md w-full overflow-auto h-full ">
                  <h3 className="border-b p-6 text-gray-600">دسته بندی محصول</h3>
                  <div className="flex px-6 py-10 pt-6">
                    {mode === 'edit' && (
                      <div className="w-full">
                        <CategoryCombobox
                          selectedMainCategory={selectedMainCategory}
                          setSelectedMainCategory={setSelectedMainCategory}
                          mainCategories={mainCategories}
                          onCategorySelect={handleMainCategorySelect}
                        />
                        <CategorySelector
                          setSelectedCategories={setSelectedCategories}
                          selectedCategories={selectedCategories}
                          categories={childCategories}
                          setIsSecondRequest={setIsSecondRequest}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-1 relative">
              <div className="bg-white  flex-col w-full h-full rounded-md shadow-item">
                <h3 className="border-b p-6 text-gray-600">تصویر محصول</h3>
                {/* negare  */}
                <div className="flex justify-center mt-8">
                  <div className="">
                    <input
                      type="file"
                      className="hidden"
                      id="MainThumbnail"
                      onChange={handleMainFileChange}
                      accept="image/jpeg"
                    />
                    <label htmlFor="MainThumbnail" className="block cursor-pointer p-6 text-sm font-normal">
                      <h3 className="font-bold text-center mb-6">تصویر نگاره</h3>
                      {selectedMainFile.length > 0 ? (
                        selectedMainFile.map((file: any, index: number) => (
                          <div key={index} className="text-sm shadow-item rounded-lg p-2 text-gray-600">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-[200px] h-[200px] object-contain  rounded-md"
                            />
                          </div>
                        ))
                      ) : (
                        <img
                          className="w-[200px] h-[200px] rounded-md"
                          src="/images/other/product-placeholder.png"
                          alt="product-placeholder"
                        />
                      )}
                    </label>
                  </div>
                </div>
                <div className="flex flex-col justify-between h-fit py-10 pt-6 pb-0 ">
                  {/* drag files  */}
                  <div className="mt-4">
                    {/* Thumbnail upload */}
                    <div className="mb-6">
                      <h3 className="font-medium text-center mb-6">گالری محصول</h3>
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
                            <div>برای انتخاب عکس و فیلم کلیک کنید </div>
                          )}
                        </label>
                      </div>
                    </div>
                    <div className="bg-gray-50 bottom-0 w-full  rounded-b-lg px-8 flex flex-col pb-2">
                      <span className="font-normal text-[11px] pt-2">حجم عکس ها می بایست حداکثر 70 کیلوبایت باشد</span>
                      <span className="font-normal text-[11px]">سایز عکس ها می بایست 700*700 پیکسل باشد</span>
                      <span className="font-normal text-[11px]">فرمت عکس ها می بایست jpg باشد</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {!isDetailsSkip && (
            <>
              {/*is show  add product descriptions*/}
              <div className="flex flex-1">
                <div className="bg-white w-full rounded-md shadow-item">
                  <h3 className="border-b p-6 text-gray-600">توضیحات محصول</h3>
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
                    <span className="font-normal text-[11px] pt-2">توضیحات مربوط به محصول را وارد کنید</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-1">
                <div className="bg-white w-full rounded-md shadow-item">
                  <h3 className="border-b p-6 text-gray-600">راهنمای استفاده از محصول</h3>
                  {/* <CustomEditor textEditor={textEditor} setTextEditor={setTextEditor} /> */}
                  <CustomEditor
                    value={guideDescriptionState}
                    onChange={(event: any, editor: any) => {
                      const data = editor.getData()
                      setGuideDescriptionState(data)
                    }}
                    placeholder=""
                  />
                  <div className="bg-gray-50 bottom-0 w-full  rounded-b-lg px-8 flex flex-col pb-2">
                    <span className="font-normal text-[11px] pt-2">
                      توضیحات مربوط به نحوه استفاده از محصول را وارد کنید
                    </span>
                  </div>
                </div>
              </div>
              {/* is show Product features,size,brand */}
              <div className="flex flex-1">
                <div className="bg-white w-full rounded-md shadow-item">
                  <h3 className="border-b p-6 text-gray-600">ویژگی محصول</h3>
                  {/*select isFake , brand and feature*/}
                  <div className="flex mt-8 md:justify-center px-3 md:px-0 mb-10">
                    <div className="space-y-9 flex flex-col ">
                      {/* <div className="flex gap-10">
                        <label htmlFor="IsFake" className="w-[95px]  font-normal text-gray-600 text-sm  cursor-pointer">
                          محصول غیر اصل
                        </label>
                        <input
                          id="isFake"
                          {...register('IsFake')}
                          className="bg-[#f7f8fa] border border-gray-300  cursor-pointer checked:text-2xl outline-none ring-0 rounded-md w-[24px] h-[24px] "
                          type="checkbox"
                        />
                      </div> */}

                      {/* selector*/}
                      <div className="flex flex-col md:flex-row  md:items-center md:gap-10 gap-2">
                        <label
                          htmlFor="BrandId"
                          className="w-[95px] font-normal  text-gray-600 text-sm  cursor-pointer"
                        >
                          انتخاب برند{' '}
                        </label>
                        {brandData?.data?.data && (
                          <BrandCombobox
                            selectedBrand={selectedBrand}
                            setSelectedBrand={setSelectedBrand}
                            brands={brandData?.data?.data ?? []}
                            onBrandSelect={handleBrandSelect}
                          />
                        )}
                      </div>

                      <div className="flex flex-col md:flex-row  md:items-center md:gap-10 gap-2">
                        <label
                          htmlFor="BrandId"
                          className="w-[95px] font-normal  text-gray-600 text-sm  cursor-pointer"
                        >
                          اصالت کالا{' '}
                        </label>
                        <IsFakeCombobox selectedStatus={isFake} setSelectedStatus={setIsFake} />
                      </div>
                      <div className="flex flex-col md:flex-row  md:items-center md:gap-10 gap-2">
                        <label
                          htmlFor="BrandId"
                          className="w-[95px] font-normal  text-gray-600 text-sm  cursor-pointer"
                        >
                          وضعیت محصول{' '}
                        </label>
                        <StatusCombobox selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus} />
                      </div>
                    </div>
                  </div>
                  {/* feature */}

                  <div
                    style={{ background: 'rgba(169, 243, 252,0.2)' }}
                    className={`px-2 py-4 flex flex-col space-y-8 mb-6 mx-7 rounded-xl ${
                      stateFeatureDataByCategory.length === 0 && features?.data?.sizeDTOs?.length === 0 && 'invisible'
                    }`}
                  >
                    {stateFeatureDataByCategory &&
                      stateFeatureDataByCategory
                        ?.filter((feature) => feature.name === 'رنگ')
                        .map((feature) => {
                          const filteredFeature = {
                            ...feature,
                            values: feature.values?.filter((value) => value.hexCode !== null) ?? [],
                          }
                          return (
                            <div
                              className="flex items-center flex-col xs:flex-row w-full gap-2 xs:gap-5"
                              key={feature.id}
                            >
                              <div className="text-gray-600 text-sm w-[250px] px-2"> {filteredFeature.name} </div>
                              <div className="w-full">
                                <FeatureCombobox
                                  stateColorData={stateColorData}
                                  onFeatureSelect={handleFeatureSelect}
                                  features={filteredFeature}
                                />
                              </div>
                            </div>
                          )
                        })}

                    {features?.data?.sizeDTOs && features.data.sizeDTOs.length > 0 && (
                      <div className="flex items-center flex-col xs:flex-row w-full gap-2 xs:gap-5">
                        <div className="text-gray-600 text-sm w-[250px] px-2"> سایزبندی </div>
                        <div className="w-full">
                          <FeatureCombobox
                            onFeatureSelect={handleFeatureSelect}
                            sizeList={features.data.sizeDTOs ?? []}
                            stateSizeData={stateSizeData}
                          />
                        </div>
                      </div>
                    )}
                    {stateFeatureDataByCategory &&
                      stateFeatureDataByCategory
                        ?.filter((feature) => feature.name !== 'رنگ')
                        .map((feature) => {
                          const filteredFeature = {
                            ...feature,
                            values: feature.values?.filter((value) => value.hexCode == null) ?? [],
                          }
                          return (
                            <div
                              className="flex items-center flex-col xs:flex-row w-full gap-2 xs:gap-5"
                              key={feature.id}
                            >
                              <div className="text-gray-600 text-sm w-[250px] px-2"> {filteredFeature.name} </div>
                              <div className="w-full">
                                <FeatureCombobox
                                  stateFeatureValueData={stateFeatureValueData?.filter(
                                    (value) => value.productFeatureId === feature.id
                                  )}
                                  onFeatureSelect={handleFeatureSelect}
                                  features={filteredFeature}
                                  setStateFeatureValueData={setStateFeatureValueData}
                                />
                              </div>
                            </div>
                          )
                        })}
                  </div>
                </div>
              </div>
              <div className=" flex flex-col gap-4">
                {/* is show product scale  */}
                {!productScales ? (
                  <div className="flex flex-1">
                    <div className="bg-white w-full rounded-md shadow-item overflow-auto">
                      <h3 className="border-b p-6 text-gray-600">اندازه ها</h3>
                      <div className="flex justify-center  text-xs mx-auto mt-6 items-start mdx:flex-row gap-x-6 pb-4 px-7">
                        {/* table  */}
                        برای این دسته بندی, اندازه تعریف نشده است
                        {/* image  */}
                      </div>
                    </div>
                  </div>
                ) : !isProductScale ? (
                  <div className="flex flex-1">
                    <div className="bg-white w-full rounded-md shadow-item overflow-auto">
                      <h3 className="border-b p-6 text-gray-600">اندازه ها</h3>
                      <div className="flex justify-center  text-xs mx-auto mt-6 items-start mdx:flex-row gap-x-6 pb-4 px-7">
                        {/* table  */}
                        برای وارد کردن اندازه ها, مقدار سایز بندی در ویژگی محصول را وارد کنید
                        {/* image  */}
                      </div>
                    </div>
                  </div>
                ) : productScales ? (
                  <div className="flex flex-1">
                    <div className="bg-white w-full rounded-md shadow-item overflow-auto">
                      <h3 className="border-b p-6 text-gray-600">اندازه ها</h3>
                      <div className="flex flex-col-reverse  mx-auto mt-6 items-start mdx:flex-row gap-x-6 pb-4 px-7">
                        {/* table  */}
                        <div className="flex flex-col items-start flex-1 pt-3 mdx:w-auto w-full overflow-auto">
                          <table className="table-auto border-collapse w-full">
                            <thead className="bg-[#8fdcff]">
                              <tr>
                                <th className=" px-4 py-2"></th>
                                {productSizeScale?.columns?.map((column) => (
                                  <th key={column.id} className="px-4 py-2 w-[135px] font-normal">
                                    {column.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="">
                              {productSizeScale?.rows?.map((row, rowIndex) => (
                                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : ''}>
                                  <td className="px-4 py-2 h-[60.5px] whitespace-nowrap">{row.productSizeValue}</td>
                                  {productSizeScale?.columns?.map((column, colIndex) => (
                                    <td key={colIndex} className="px-4 py-2 font-normal">
                                      <input
                                        inputMode="numeric"
                                        dir="ltr"
                                        type="text"
                                        className=" appearance-none border border-gray-200 rounded-lg text-center"
                                        value={digitsEnToFa(
                                          productScaleCreate?.Rows![rowIndex].scaleValues![colIndex] || ''
                                        )}
                                        onChange={(e) => handleChange(rowIndex, colIndex, digitsFaToEn(e.target.value))}
                                        onBlur={(e) => {
                                          const currentValue =
                                            productScaleCreate?.Rows![rowIndex].scaleValues![colIndex] ?? ''
                                          e.target.value = digitsEnToFa(currentValue)
                                        }}
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {/* image  */}
                        <div className=" mdx:w-fit flex justify-center w-full mdx:mb-0 pt-3 mb-4">
                          <div className="rounded-lg  shadow-product w-[400px] h-[400px]">
                            <img
                              className="w-full h-full rounded-lg"
                              src={productSizeScale.imagesSrc?.imageUrl}
                              alt="عکس اندازه محصول"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-100 bottom-0 w-full  rounded-b-lg px-8 flex flex-col pb-2">
                        <span className="font-normal text-[11px] pt-2">
                          اندازه ها را به{' '}
                          <span className="text-[11px] text-[#f1416c]">
                            {productSizeScale.sizeType == '0' ? 'سانتیمتر' : 'میلیمتر'}
                          </span>{' '}
                          وارد کنید
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* is show Product features, quantity, price , discount */}
                <div className="flex flex-1">
                  <div className="bg-white w-full rounded-md shadow-item mb-2">
                    <div className="flex items-center border-b p-2 pr-6">
                      <h3 className=" text-gray-600 w-full">تعداد و قیمت محصول</h3>
                      <Button
                        onClick={inventoryLocationModalHandlers.open}
                        className="p-0 px-2 text-xs py-2 bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
                      >
                        موقعیت کالا در انبار
                      </Button>
                    </div>
                    <Table
                      features={stateFeature}
                      sizeList={stateSizeFeature}
                      setStateStockItems={setStateStockItems}
                      selectedFiles={selectedFiles}
                      setStateFeature={setStateFeature}
                      setStateSizeFeature={setStateSizeFeature}
                      setProductSizeScale={setProductSizeScale}
                      rowsData={rowsData}
                      newRows={newRows}
                      setIsSecondRequest={setIsSecondRequest}
                      isSecondRequest={isSecondRequest}
                    />
                    <div className="bg-gray-50 bottom-0 w-full  rounded-b-lg px-8 flex flex-col pb-2">
                      <div className="font-normal text-[11px] pt-2 flex gap-1">
                        قیمت ها را به <div className="text-red-600">تومان</div> وارد کنید
                      </div>
                      <div className="font-normal text-[11px] pt-2 flex gap-1">
                        وزن محصول را به <div className="text-red-600">گرم</div> وارد کنید
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {/* validation errors */}
          <div className="flex flex-col">
            {formErrors.Title && <p className="text-red-500 px-10">{formErrors.Title.message}</p>}

            {formErrors.CategoryId && <p className="text-red-500 px-10">{formErrors.CategoryId?.message}</p>}

            {formErrors.MainThumbnail && <p className="text-red-500 px-10">{formErrors.MainThumbnail?.message}</p>}

            {formErrors.Thumbnail && <p className="text-red-500 px-10">{formErrors.Thumbnail?.message}</p>}

            {formErrors.StockItems && (
              <div className="text-red-500 px-10">
                {Array.isArray(formErrors.StockItems) &&
                  formErrors.StockItems.map((stockItem, index) => (
                    <div key={index}>
                      {stockItem?.quantity && (
                        <div>
                          شناسه {'1' + index} {stockItem.quantity.message}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {formErrors.StockItems && (
              <div className="text-red-500 px-10">
                {Array.isArray(formErrors.StockItems) &&
                  formErrors.StockItems.map((stockItem, index) => (
                    <div key={index}>
                      {stockItem?.price && (
                        <div>
                          شناسه {'1' + index} {stockItem.price.message}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div className="flex justify-end w-full">
            {' '}
            <Button
              // disabled={!isValid}
              type="submit"
              className={` px-11 py-3 ${!isValid ? 'bg-gray-300' : ''} hover:bg-[#e90088c4]  mb-10 float-start`}
              isLoading={isLoadingUpdate}
            >
              بروزرسانی
            </Button>
          </div>
        </form>
      </section>
    </>
  )
}

const Table: React.FC<PropTable> = (props) => {
  const {
    features,
    sizeList,
    setStateStockItems,
    selectedFiles,
    setStateFeature,
    setStateSizeFeature,
    rowsData,
    newRows,
    isSecondRequest,
    setIsSecondRequest,
  } = props
  const [featuresAndSizeSelected, setFeaturesAndSizeSelected] = useState<ProductFeature[]>([])
  const [isShowSetImageStockModal, setImageStockModalHandlers] = useDisclosure()
  const [selectedStockFiles, setSelectedStockFiles] = useState<{ file: File | null; index: number | null }[]>([])
  const [stockItems, setStockItems] = useState<IStockItem[]>([])
  const [currentRowIndex, setCurrentRowIndex] = useState<number | null>(null)
  const [defaultRow, setDefaultRow] = useState<CurrentRow>({ id: 11 })
  const [rows, setRows] = useState<CurrentRow[]>([])
  const [isPriceEditable, setIsPriceEditable] = useState(true)
  const [isDiscountEditable, setIsDiscountEditable] = useState(true)
  const [isSelectedColumn, setIsSelectedComlumn] = useState(false)

  const dispatch = useAppDispatch()

  let combinedFeatures: ProductFeature[]
  let idCounter = 10
  useEffect(() => {
    // console.log(
    //   features,
    //   'features-features-features-features-features',
    //   sizeList,
    //   'sizeList-sizeListsizeList-sizeList-sizeList',
    //   featuresAndSizeSelected,
    //   'featuresAndSizeSelected - featuresAndSizeSelected'
    // )
    if (features.length > 0 || sizeList.length > 0) {
      combinedFeatures =
        sizeList.length > 0
          ? [
              ...features.filter((f) => f.values?.length ?? 0 > 0),
              {
                name: 'سایزبندی',
                values: sizeList.map((size) => ({
                  name: size.name,
                  hexCode: null,
                  count: null,
                  description: null,
                  isDeleted: false,
                  productFeatureId: null,
                  id: size.id,
                  created: size.created,
                  updated: size.updated,
                })),
                valueCount: 0,
                count: 0,
                isDeleted: false,
                productId: null,
                categoryId: generateUniqueId(),
                id: generateUniqueId(),
                created: '2024-06-30T09:50:46.827222Z',
                updated: '2024-06-30T09:50:46.827222Z',
              },
            ]
          : [...features.filter((f) => f.values?.length ?? 0 > 0)]
      setFeaturesAndSizeSelected(combinedFeatures)
      // console.log(combinedFeatures , "combinedFeatures--combinedFeatures--combinedFeatures");

      const createRows = (index = 0, currentRow: CurrentRow = { featureValueId: [] }) => {
        if (index === combinedFeatures.length) {
          newRows.push({ id: idCounter++, ...currentRow })
          return
        }

        combinedFeatures[index]?.values?.forEach((value) => {
          let updatedRow = { ...currentRow, [combinedFeatures[index].name]: value.name }

          if (combinedFeatures[index].name === 'سایزبندی') {
            updatedRow.sizeId = value.id
          } else {
            updatedRow.featureValueId = [...(updatedRow.featureValueId || []), value.id]
          }

          createRows(index + 1, updatedRow)
        })
      }

      if (combinedFeatures.length > 0) {
        // const allValuesEmpty = combinedFeatures.every((feature) => feature.values.length > 1)
        // const allRowsData = rowsData.every((feature) => feature.price === 0 && feature.quantity === 0)
        // console.log(allValuesEmpty, 'allValuesEmpty')

        // if (allValuesEmpty && rowsData.length === 1) {
        //   newRows.push(defaultRow)
        // }
        createRows()
      } else {
        newRows.push(defaultRow)
      }

      // console.log(newRows, 'inline new rows')
      // console.log(combinedFeatures, 'combinedFeatures-combinedFeatures-combinedFeatures')

      setRows(newRows)
    } else {
      setFeaturesAndSizeSelected([])
      setRows([defaultRow])
    }
  }, [features, sizeList])

  //.........................
  useEffect(() => {
    if (rowsData) {
      // newRows.push(rowsData)
      console.log('rowsData', rowsData)
      setStockItems(rowsData.sort((a, b) => a.id - b.id))
    }
  }, [rowsData])
  //............................................................................................................................

  useEffect(() => {
    const convertImagesToFiles = async () => {
      if (stockItems.length > 1) {
        // ایجاد یک نسخه کپی از stockItems برای جلوگیری از حلقه بی‌نهایت
        const updatedStockItems = [...stockItems]

        const filePromises = stockItems.map(async (item, index) => {
          if (item.imagesSrc && item.imagesSrc.length > 0) {
            const files = await Promise.all(
              item.imagesSrc.map(async (image: { imageUrl: string }) => {
                const file = await fetchImageAsFile(image.imageUrl)

                // به روزرسانی مستقیم کپی stockItems
                updatedStockItems[index] = { ...item, imageStock: file }

                return { file, index }
              })
            )

            return files.length > 0 ? files[0] : null
          } else {
            if (item.imageStock && item.imageStock.name) {
              const file = { file: item.imageStock, index }
              console.log(file, 'const file = { file: item.imageStock, index: index }')
              return file
            } else {
              return null
            }
          }
        })

        const selectedFilesWithIds = await Promise.all(filePromises)
        console.log(selectedFilesWithIds, 'selectedFilesWithIds')

        // اینجا setStockItems یکبار و در پایان فراخوانی می‌شود
        setStockItems(updatedStockItems)
        setSelectedStockFiles(selectedFilesWithIds)
      }
    }

    convertImagesToFiles()
  }, [stockItems.length])

  ///................

  const handleInputChange = (index: number, field: string, value: any) => {
    const numericValue = Number(digitsFaToEn(value.replace(/,/g, '')))
    if (!isNaN(numericValue) || value === '') {
      const updatedStockItems = [...stockItems]
      const item = updatedStockItems[index]
      const itemPrice = Number(item.price)

      if (field === 'discount' && itemPrice === 0) {
        dispatch(
          showAlert({
            status: 'error',
            title: 'ابتدا قیمت اصلی محصول را وارد کنید',
          })
        )
        return
      }
      if (field === 'discount' && numericValue > itemPrice) {
        dispatch(
          showAlert({
            status: 'error',
            title: 'تخفیف باید کمتر از قیمت باشد',
          })
        )
        return
      }

      updatedStockItems[index] = {
        ...item,
        [field]: numericValue,
      }

      setStockItems(updatedStockItems)
    }
  }

  const handleCheckboxChange = (field: string, checked: boolean) => {
    if (field === 'price') {
      setIsPriceEditable(!checked)
    } else if (field === 'discount') {
      setIsDiscountEditable(!checked)
    }

    const updatedStockItems = stockItems.map((item, index) => ({
      ...item,
      [field]: checked ? stockItems[0][field] : item[field],
    }))

    setStockItems(updatedStockItems)
  }

  useEffect(() => {
    const initialStockItems = rows.map((row) => {
      const dynamicProperties: any = {}
      for (const key in row) {
        if (key !== 'id' && key !== 'featureValueId' && key !== 'sizeId') {
          dynamicProperties[key] = row[key]
        }
      }
      // Find matching rowData by stockId
      const matchingRowData = rowsData.find((data) => data.id === row.id)
      var offerTimeHour, offerMinute, offerSecond
      if (matchingRowData?.discountRemainingTime) {
        const timeParts = matchingRowData.discountRemainingTime.split(':')
        offerTimeHour = parseInt(timeParts[0], 10) // Extract hours and convert to number
        offerMinute = parseInt(timeParts[1], 10) // Extract minutes and convert to number
        offerSecond = parseInt(timeParts[2], 10) // Extract seconds and convert to number
      }
      return {
        stockId: row.id,
        featureValueId: row.featureValueId || [],
        sizeId: row.sizeId || undefined,
        price: matchingRowData ? matchingRowData.price : null,
        discount: matchingRowData ? matchingRowData.discount : null,
        purchasePrice: matchingRowData ? matchingRowData.purchasePrice : null,
        weight: matchingRowData ? matchingRowData.weight : null,
        quantity: matchingRowData ? matchingRowData.quantity : null,
        isHidden: matchingRowData?.isHidden ?? false,
        imageStock: matchingRowData?.imageStock,
        imagesSrc: matchingRowData?.imagesSrc,
        offerTime: offerTimeHour,
        minuteTime: offerMinute,
        secondTime: offerSecond,
        ...dynamicProperties,
      }
    })
    console.log(initialStockItems, 'initialStockItems', stockItems, 'stockItems', rows, 'rows', rowsData, 'rowsData')

    // if (stockItems.length < 0) {

    setStockItems(initialStockItems)
    // }
  }, [rows, featuresAndSizeSelected])

  useEffect(() => {
    if (stockItems) {
      setStateStockItems(stockItems)
      console.log(stockItems, ' final -- stockItemsstockItems ')
    }
  }, [stockItems])

  const [shouldHideHeader, setShouldHideHeader] = useState(false)

  useEffect(() => {
    const checkFeatures = () => {
      const result = featuresAndSizeSelected.every(
        (feature) => feature?.values?.length === 1 || feature?.values?.length === 0
      )
      // console.log(result, 'result', featuresAndSizeSelected, 'featuresAndSizeSelected')

      setShouldHideHeader(result)
    }

    checkFeatures()
  }, [featuresAndSizeSelected])
  const handleImageClick = (index: number) => {
    setCurrentRowIndex(index)
    setImageStockModalHandlers.open()
  }

  const handleImageSelect = (file: File, index: number) => {
    if (currentRowIndex !== null) {
      const updatedSelectedStockFiles = [...selectedStockFiles]

      updatedSelectedStockFiles[currentRowIndex] = { file, index }

      setSelectedStockFiles(updatedSelectedStockFiles)

      const updatedStockItems = stockItems.map((item, itemIndex) => {
        if (itemIndex === currentRowIndex) {
          return { ...item, imageStock: file }
        }

        return item
      })
      setStockItems(updatedStockItems)
    }
  }
  if (rowsData) {
    // console.log(rowsData, 'rowsData')
  }

  const handleRemoveRow = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    console.log(stockItems, 'stockItems')

    const updatedStockItems = stockItems.map((item, i) => {
      if (i === index) {
        return { ...item, isHidden: checked }
      }
      return item
    })

    setStockItems(updatedStockItems)
    // const updatedStockItems = stockItems.filter((_, i) => i !== index)
    // setStockItems(updatedStockItems)

    // const updatedSelectedStockFiles = selectedStockFiles.filter((_, i) => i !== index)
    // setSelectedStockFiles(updatedSelectedStockFiles)

    // const updatedRows = rows.filter((_, i) => i !== index)
    // setRows(updatedRows)

    // const remainingFeatureValueIds = updatedRows.flatMap((row) => row.featureValueId || [])
    // const remainingSizeIds = updatedRows.map((row) => row.sizeId).filter((sizeId) => sizeId)

    // const updatedFeaturesAndSizeSelected = featuresAndSizeSelected
    //   .map((feature) => {
    //     if (feature.name === 'سایزبندی') {
    //       const updatedValues = feature?.values?.filter((value) => remainingSizeIds.includes(value.id))
    //       return { ...feature, values: updatedValues }
    //     } else {
    //       const updatedValues = feature?.values?.filter((value) => remainingFeatureValueIds.includes(value.id))
    //       return { ...feature, values: updatedValues }
    //     }
    //   })
    //   .filter((feature) => feature?.values?.length! > 0)

    // setFeaturesAndSizeSelected(updatedFeaturesAndSizeSelected)

    // // به‌روزرسانی stateFeature و stateSizeFeature
    // setStateFeature((prevFeatures) => {
    //   return prevFeatures
    //     .map((feature) => {
    //       const updatedValues = feature?.values?.filter((value) => remainingFeatureValueIds.includes(value.id))
    //       return { ...feature, values: updatedValues }
    //     })
    //     .filter((feature) => feature?.values?.length! > 0)
    // })

    // setStateSizeFeature((prevSizes) => {
    //   return prevSizes.filter((size) => remainingSizeIds.includes(size.id))
    // })

    // setProductSizeScale((prevScale) => {
    //   return prevScale.columns?.filter((size) => remainingSizeIds.includes(size.id))
    // })
    // console.log(updatedFeaturesAndSizeSelected, 'Updated features and sizes')
  }

  const handleMenuItemClick = (index: number, duration: Duration): void => {
    let hours: number | null

    switch (duration) {
      case 'none':
        hours = null
        break
      case '1day':
        hours = 24
        break
      case '2days':
        hours = 48
        break
      case '3days':
        hours = 72
        break
      case '1week':
        hours = 7 * 24
        break
      default:
        hours = null
    }

    const updatedStockItems = [...stockItems]
    updatedStockItems[index] = {
      ...updatedStockItems[index],
      offerTime: hours,
      minuteTime: 0,
      secondTime: 0,
    }

    setStockItems(updatedStockItems)
  }
  console.log(stockItems, 'stockItems - checked')

  return (
    <div className="px-4 py-10 pt-3">
      <table className="table-auto w-full  overflow-x-scroll bg-white  border-gray-200">
        {!shouldHideHeader && (
          <thead>
            <tr className="bg-[#8fdcff]">
              <th className="px-4 whitespace-nowrap py-2 font-normal">تصویر</th>
              <th className="px-4 whitespace-nowrap py-2 font-normal">شناسه</th>
              {featuresAndSizeSelected.map(
                (feature) =>
                  feature?.values?.length! > 1 && (
                    <th key={feature.id} className="px-4 whitespace-nowrap py-2 font-normal">
                      {feature.name}
                    </th>
                  )
              )}
              <th className="px-4 whitespace-nowrap py-2 font-normal">
                <div className="flex items-center justify-center gap-1">
                  <div>قیمت خرید</div>
                  <div title="تکرار مبلغ خرید" className="py-2 px-1 cursor-pointer">
                    <FaArrowDownLong
                      onClick={() => handleCheckboxChange('purchasePrice', true)}
                      className="text-gray-400 hover:border border-gray-400"
                    />
                  </div>
                </div>
              </th>
              <th className="px-4 whitespace-nowrap py-2 font-normal">
                <div className="flex items-center justify-center gap-1">
                  <div>وزن</div>
                  <div title="تکرار وزن" className="py-2 px-1 cursor-pointer">
                    <FaArrowDownLong
                      onClick={() => handleCheckboxChange('weight', true)}
                      className="text-gray-400 hover:border border-gray-400"
                    />
                  </div>
                </div>
              </th>
              <th className="px-4 whitespace-nowrap py-2 font-normal">موجودی</th>
              <th className="px-4 whitespace-nowrap py-2 font-normal">
                <div className="flex items-center  justify-center gap-1">
                  <div>
                    قیمت فروش
                    {/* <input
                      className="bg-gray-200 border-gray-400 focus:outline-0 focus:ring-0 text-2xl w-5  h-5 mr-1 cursor-pointer focus:border-none rounded appearance-none checked:bg-[#e90089]"
                      type="checkbox"
                      onChange={(e) => handleCheckboxChange('price', e.target.checked)}
                    /> */}
                  </div>{' '}
                  <div title="تکرار مبلغ" className="py-2 px-1 cursor-pointer ">
                    <FaArrowDownLong
                      onClick={() => handleCheckboxChange('price', true)}
                      className="text-gray-400 hover:border border-gray-400"
                    />
                  </div>
                </div>
              </th>
              <th className="px-4 whitespace-nowrap  py-2 font-normal">
                <div className="flex items-center justify-center gap-1">
                  <div>
                    فروش فوق العاده
                    {/* <input
                      className="bg-gray-200 border-gray-400 focus:outline-0 focus:ring-0 text-2xl w-5  h-5 mr-1 cursor-pointer focus:border-none rounded appearance-none checked:bg-[#e90089]"
                      type="checkbox"
                      onChange={(e) => handleCheckboxChange('discount', e.target.checked)}
                    /> */}
                  </div>{' '}
                  {/* <FaArrowDownLong className="text-gray-400" /> */}
                </div>{' '}
              </th>
              {!shouldHideHeader && <th className="px-4 whitespace-nowrap py-2 font-normal text-center">وضعیت</th>}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, idx) => {
            return (
              <tr
                key={row.id}
                className={` ${idx % 2 !== 0 ? 'bg-gray-50' : ''} ${shouldHideHeader ? '' : 'border-b'}`}
              >
                {!shouldHideHeader && (
                  <Fragment>
                    <td className="w-[50px] h-[50px] bg-center py-2 pr-2">
                      {selectedStockFiles[idx] ? (
                        <img
                          onClick={() => handleImageClick(idx)}
                          className="w-[50px] h-[50px] rounded-lg cursor-pointer bg-center"
                          src={URL.createObjectURL(selectedStockFiles[idx]?.file!)}
                          alt={selectedStockFiles[idx]?.file?.name}
                        />
                      ) : (
                        <img
                          onClick={() => handleImageClick(idx)}
                          className="w-[50px] h-[50px] rounded-lg cursor-pointer bg-center"
                          src="/images/other/product-placeholder.png"
                          alt="product-placeholder"
                        />
                      )}
                      {/* <DialogSetStockItemImage
                            isShow={isShowSetImageStockModal}
                            open={setImageStockModalHandlers.open}
                            setSelectedStockFiles={handleImageSelect}
                            selectedFiles={selectedFiles}
                            selectedStockFiles={selectedFile?.file || null}
                            onClose={setImageStockModalHandlers.close}
                            index={idx}
                          /> */}
                    </td>
                    <td className="px-4 whitespace-nowrap text-center py-2">{digitsEnToFa(row.id.toString())}</td>
                    {featuresAndSizeSelected.map(
                      (feature) =>
                        feature?.values?.length! > 1 && (
                          <td key={feature.id} className="px-4 whitespace-nowrap text-center py-2">
                            {digitsEnToFa(row[feature.name].toString())}
                          </td>
                        )
                    )}
                  </Fragment>
                )}
                <td className="px-4 text-center py-2">
                  {shouldHideHeader ? (
                    <div className="relative mb-3 w-full">
                      <input
                        dir="ltr"
                        type="text"
                        className="peer m-0 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-transparent bg-clip-padding pr-0 pl-3 py-4 text-xl font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:autofill:shadow-autofill dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]"
                        id="floatingInput"
                        placeholder="قیمت خرید"
                        onChange={(e) => handleInputChange(idx, 'purchasePrice', digitsFaToEn(e.target.value))}
                        value={digitsEnToFa(addCommas(stockItems[idx]?.purchasePrice || ''))}
                      />
                      <label
                        htmlFor="floatingInput"
                        className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
                      >
                        قیمت خرید
                      </label>
                    </div>
                  ) : (
                    <input
                      dir="ltr"
                      type="text"
                      placeholder=""
                      value={digitsEnToFa(addCommas(stockItems[idx]?.purchasePrice || ''))}
                      onChange={(e) => handleInputChange(idx, 'purchasePrice', digitsFaToEn(e.target.value))}
                      className={`w-36 h-9 rounded-lg text-center border border-gray-300`}
                    />
                  )}
                </td>
                <td className="px-4 text-center py-2">
                  {shouldHideHeader ? (
                    <div className="relative mb-3 w-full">
                      <input
                        dir="ltr"
                        type="text"
                        className="peer m-0 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-transparent bg-clip-padding pr-0 pl-3 py-4 text-xl font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:autofill:shadow-autofill dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]"
                        id="floatingInput"
                        placeholder="وزن"
                        onChange={(e) => handleInputChange(idx, 'weight', digitsFaToEn(e.target.value))}
                        value={digitsEnToFa(addCommas(stockItems[idx]?.weight || ''))}
                      />
                      <label
                        htmlFor="floatingInput"
                        className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
                      >
                        وزن
                      </label>
                    </div>
                  ) : (
                    <input
                      dir="ltr"
                      type="text"
                      placeholder=""
                      value={digitsEnToFa(addCommas(stockItems[idx]?.weight || ''))}
                      onChange={(e) => handleInputChange(idx, 'weight', digitsFaToEn(e.target.value))}
                      className={`w-36 h-9 rounded-lg text-center border border-gray-300`}
                    />
                  )}
                </td>
                <td className="px-4 whitespace-nowrap text-center py-2">
                  {shouldHideHeader ? (
                    <div className="relative mb-3">
                      <input
                        dir="ltr"
                        type="text"
                        className="peer m-0 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-transparent bg-clip-padding pr-0 pl-3 py-4 text-xl font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:autofill:shadow-autofill dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]"
                        id="floatingInput"
                        placeholder="موجودی انبار"
                        value={digitsEnToFa(stockItems[idx]?.quantity || 0)}
                        onChange={(e) => handleInputChange(idx, 'quantity', digitsFaToEn(e.target.value))}
                        onFocus={(e) => (e.target.value = digitsEnToFa(stockItems[idx]?.quantity || ''))}
                        onBlur={(e) => (e.target.value = digitsEnToFa(stockItems[idx]?.quantity || 0))}
                      />
                      <label
                        htmlFor="floatingInput"
                        className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
                      >
                        موجودی انبار
                      </label>
                    </div>
                  ) : (
                    <input
                      dir="ltr"
                      type="text"
                      placeholder=""
                      value={digitsEnToFa(stockItems[idx]?.quantity || 0)}
                      onChange={(e) => handleInputChange(idx, 'quantity', digitsFaToEn(e.target.value))}
                      className="w-36 h-9 rounded-lg text-center border border-gray-300"
                      onFocus={(e) => (e.target.value = digitsEnToFa(stockItems[idx]?.quantity || ''))}
                      onBlur={(e) => (e.target.value = digitsEnToFa(stockItems[idx]?.quantity || 0))}
                    />
                  )}
                </td>
                <td className="px-4 text-center py-2">
                  {shouldHideHeader ? (
                    <div className="relative mb-3">
                      <input
                        dir="ltr"
                        type="text"
                        className="peer m-0 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-transparent bg-clip-padding pr-0 pl-3 py-4 text-xl font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:autofill:shadow-autofill dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]"
                        id="floatingInput"
                        placeholder="قیمت فروش"
                        onChange={(e) => handleInputChange(idx, 'price', digitsFaToEn(e.target.value))}
                        value={digitsEnToFa(addCommas(stockItems[idx]?.price || ''))}
                      />
                      <label
                        htmlFor="floatingInput"
                        className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
                      >
                        قیمت فروش
                      </label>
                    </div>
                  ) : (
                    <input
                      dir="ltr"
                      type="text"
                      placeholder=""
                      value={digitsEnToFa(addCommas(stockItems[idx]?.price || ''))}
                      onChange={(e) => handleInputChange(idx, 'price', digitsFaToEn(e.target.value))}
                      className={`w-36 h-9 rounded-lg text-center  border border-gray-300`}
                    />
                  )}
                </td>
                <td className="px-4 text-center py-5">
                  {shouldHideHeader ? (
                    <div className="relative mb-3 flex items-center">
                      <input
                        dir="ltr"
                        type="text"
                        className="peer m-0 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-transparent bg-clip-padding pr-0 pl-3 py-4 text-xl font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:autofill:shadow-autofill dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]"
                        id="floatingInput"
                        placeholder="فروش فوق العاده"
                        onChange={(e) => handleInputChange(idx, 'discount', digitsFaToEn(e.target.value))}
                        value={digitsEnToFa(addCommas(stockItems[idx]?.discount || ''))}
                      />
                      <label
                        htmlFor="floatingInput"
                        className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
                      >
                        فروش فوق العاده
                      </label>
                      <Menu as="div" className="relative inline-block text-left">
                        <div>
                          <MenuButton
                            // title={stockItems[idx]?.offerTime?.toString()}
                            className={`inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-900 ${
                              stockItems[idx]?.discount === 0 ||
                              stockItems[idx]?.discount === undefined ||
                              stockItems[idx]?.discount === null
                                ? 'cursor-not-allowed'
                                : ''
                            }`}
                            disabled={
                              stockItems[idx]?.discount === 0 ||
                              stockItems[idx]?.discount === undefined ||
                              stockItems[idx]?.discount === null
                            }
                          >
                            {/* {!stockItems[idx]?.offerTime && <div>text</div>} */}
                            {stockItems[idx]?.offerTime === undefined ? (
                              <IoIosTimer
                                title="اعتبار تخفیف"
                                aria-hidden="true"
                                className={`h-7 w-7 ${
                                  stockItems[idx]?.discount === 0 || stockItems[idx]?.discount === undefined
                                    ? 'text-gray-400'
                                    : stockItems[idx]?.offerTime !== undefined
                                    ? 'text-green-400 hover:text-green-300'
                                    : 'text-sky-500 hover:text-sky-400'
                                }`}
                              />
                            ) : (
                              <div className="tooltip-container text-sm text-gray-600 text-center cursor-pointer">
                                <IoIosTimer
                                  aria-hidden="true"
                                  className={`h-7 w-7 ${
                                    stockItems[idx]?.discount === 0 || stockItems[idx]?.discount === undefined
                                      ? 'text-gray-400'
                                      : stockItems[idx]?.offerTime !== null
                                      ? 'text-green-400 hover:text-green-300'
                                      : 'text-sky-500 hover:text-sky-400'
                                  }`}
                                />
                                {stockItems[idx]?.offerTime !== null && (
                                  <span className="tooltip-text2">
                                    <div dir="ltr" className="">
                                      {digitsEnToFa(formatTime(stockItems[idx]?.offerTime || 0))}
                                    </div>
                                  </span>
                                )}
                              </div>
                            )}
                          </MenuButton>
                        </div>

                        {!(stockItems[idx]?.discount === 0 || stockItems[idx]?.discount === undefined) && (
                          <MenuItems
                            transition
                            className="absolute left-0 z-[500] -top-52 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none"
                          >
                            <div className="py-1">
                              <MenuItem>
                                <div
                                  onClick={() => handleMenuItemClick(idx, 'none')}
                                  className="block cursor-pointer hover:bg-slate-50 px-4 py-2 text-sm text-start text-gray-700 border-b"
                                >
                                  هیچکدام
                                </div>
                              </MenuItem>
                              <MenuItem>
                                <div
                                  onClick={() => handleMenuItemClick(idx, '1day')}
                                  className="block cursor-pointer hover:bg-slate-50 px-4 py-2 text-sm text-start text-gray-700 border-b"
                                >
                                  {digitsEnToFa(1)} روز
                                </div>
                              </MenuItem>
                              <MenuItem>
                                <div
                                  onClick={() => handleMenuItemClick(idx, '2days')}
                                  className="block cursor-pointer hover:bg-slate-50 px-4 py-2 text-sm text-start text-gray-700 border-b"
                                >
                                  {digitsEnToFa(2)} روز
                                </div>
                              </MenuItem>
                              <MenuItem>
                                <div
                                  onClick={() => handleMenuItemClick(idx, '3days')}
                                  className="block cursor-pointer hover:bg-slate-50 px-4 py-2 text-sm text-start text-gray-700 border-b"
                                >
                                  {digitsEnToFa(3)} روز
                                </div>
                              </MenuItem>
                              <MenuItem>
                                <div
                                  onClick={() => handleMenuItemClick(idx, '1week')}
                                  className="block cursor-pointer hover:bg-slate-50 px-4 py-2 text-sm text-start text-gray-700"
                                >
                                  {digitsEnToFa(1)} هفته
                                </div>
                              </MenuItem>
                            </div>
                          </MenuItems>
                        )}
                      </Menu>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <input
                        dir="ltr"
                        type="text"
                        placeholder=""
                        value={digitsEnToFa(addCommas(stockItems[idx]?.discount || ''))}
                        onChange={(e) => handleInputChange(idx, 'discount', digitsFaToEn(e.target.value))}
                        className={`w-36 h-9 rounded-lg text-center border border-gray-300`}
                      />
                      <Menu as="div" className="relative inline-block text-left">
                        <div>
                          <MenuButton
                            // title={stockItems[idx]?.offerTime?.toString()}
                            className={`inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-900 ${
                              stockItems[idx]?.discount === 0 ||
                              stockItems[idx]?.discount === undefined ||
                              stockItems[idx]?.discount === null
                                ? 'cursor-not-allowed'
                                : ''
                            }`}
                            disabled={
                              stockItems[idx]?.discount === 0 ||
                              stockItems[idx]?.discount === undefined ||
                              stockItems[idx]?.discount === null
                            }
                          >
                            {/* {!stockItems[idx]?.offerTime && <div>text</div>} */}
                            {stockItems[idx]?.offerTime === undefined ? (
                              <IoIosTimer
                                title="اعتبار تخفیف"
                                aria-hidden="true"
                                className={`h-7 w-7 ${
                                  stockItems[idx]?.discount === 0 ||
                                  stockItems[idx]?.discount === undefined ||
                                  stockItems[idx]?.discount === null
                                    ? 'text-gray-400'
                                    : stockItems[idx]?.offerTime !== undefined
                                    ? 'text-green-400 hover:text-green-300'
                                    : 'text-sky-500 hover:text-sky-400'
                                }`}
                              />
                            ) : (
                              <div className="tooltip-container text-sm text-gray-600 text-center cursor-pointer">
                                <IoIosTimer
                                  aria-hidden="true"
                                  className={`h-7 w-7 ${
                                    stockItems[idx]?.discount === 0 ||
                                    stockItems[idx]?.discount === undefined ||
                                    stockItems[idx]?.discount === null
                                      ? 'text-gray-400'
                                      : stockItems[idx]?.offerTime !== null
                                      ? 'text-green-400 hover:text-green-300'
                                      : 'text-sky-500 hover:text-sky-400'
                                  }`}
                                />
                                {stockItems[idx]?.offerTime !== null && (
                                  <span className="tooltip-text">
                                    <div dir="ltr" className="">
                                      {digitsEnToFa(formatTime(stockItems[idx]?.offerTime || 0))}
                                    </div>
                                  </span>
                                )}
                              </div>
                            )}
                          </MenuButton>
                        </div>

                        {!(stockItems[idx]?.discount === 0 || stockItems[idx]?.discount === undefined) && (
                          <MenuItems
                            transition
                            className="absolute left-0 z-[500] -top-52 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none"
                          >
                            <div className="py-1">
                              <MenuItem>
                                <div
                                  onClick={() => handleMenuItemClick(idx, 'none')}
                                  className="block cursor-pointer hover:bg-slate-50 px-4 py-2 text-sm text-start text-gray-700 border-b"
                                >
                                  هیچکدام
                                </div>
                              </MenuItem>
                              <MenuItem>
                                <div
                                  onClick={() => handleMenuItemClick(idx, '1day')}
                                  className="block cursor-pointer hover:bg-slate-50 px-4 py-2 text-sm text-start text-gray-700 border-b"
                                >
                                  {digitsEnToFa(1)} روز
                                </div>
                              </MenuItem>
                              <MenuItem>
                                <div
                                  onClick={() => handleMenuItemClick(idx, '2days')}
                                  className="block cursor-pointer hover:bg-slate-50 px-4 py-2 text-sm text-start text-gray-700 border-b"
                                >
                                  {digitsEnToFa(2)} روز
                                </div>
                              </MenuItem>
                              <MenuItem>
                                <div
                                  onClick={() => handleMenuItemClick(idx, '3days')}
                                  className="block cursor-pointer hover:bg-slate-50 px-4 py-2 text-sm text-start text-gray-700 border-b"
                                >
                                  {digitsEnToFa(3)} روز
                                </div>
                              </MenuItem>
                              <MenuItem>
                                <div
                                  onClick={() => handleMenuItemClick(idx, '1week')}
                                  className="block cursor-pointer hover:bg-slate-50 px-4 py-2 text-sm text-start text-gray-700"
                                >
                                  {digitsEnToFa(1)} هفته
                                </div>
                              </MenuItem>
                            </div>
                          </MenuItems>
                        )}
                      </Menu>
                    </div>
                  )}
                </td>
                {!shouldHideHeader && (
                  <td>
                    {/* <Button
                      onClick={() => handleRemoveRow(idx)}
                      className="bg-white ml-4 hover:bg-red-600 hover:text-white text-red-600 text-sm border border-red-600 px-4 py-1.5"
                    >
                      حذف
                    </Button> */}
                    <div dir="ltr" className="flex justify-center">
                      <label htmlFor={`switch-${idx}`} className="h-6 relative inline-block">
                        <input
                          id={`switch-${idx}`}
                          type="checkbox"
                          checked={stockItems[idx]?.isHidden ?? false}
                          className="w-11 h-0 cursor-pointer inline-block focus:outline-0 dark:focus:outline-0 border-0 dark:border-0 focus:ring-offset-transparent dark:focus:ring-offset-transparent focus:ring-transparent dark:focus:ring-transparent focus-within:ring-0 dark:focus-within:ring-0 focus:shadow-none dark:focus:shadow-none after:absolute before:absolute after:top-0 before:top-0 after:block before:inline-block before:rounded-full after:rounded-full after:content-[''] after:w-5 after:h-5 after:mt-0.5 after:ml-0.5 after:shadow-md after:duration-100 before:content-[''] before:w-10 before:h-full before:shadow-[inset_0_0_#000] after:bg-white dark:after:bg-gray-50 before:bg-gray-300 dark:before:bg-gray-600 before:checked:bg-sky-500 checked:after:duration-300 checked:after:translate-x-4 disabled:after:bg-opacity-75 disabled:cursor-not-allowed disabled:checked:before:bg-opacity-40"
                          onChange={(e) => handleRemoveRow(idx, e)}
                        />
                      </label>
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      {currentRowIndex !== null && (
        <DialogSetStockItemImage
          isShow={isShowSetImageStockModal}
          open={setImageStockModalHandlers.open}
          setSelectedStockFiles={handleImageSelect}
          selectedFiles={selectedFiles}
          selectedStockFiles={selectedStockFiles[currentRowIndex] || null}
          onClose={setImageStockModalHandlers.close}
          index={currentRowIndex}
        />
      )}
    </div>
  )
}

const DialogSetStockItemImage = (props: PropSetStockImage) => {
  const { isShow, onClose, selectedFiles, setSelectedStockFiles, open, selectedStockFiles, index } = props
  const [selectItem, setSelectItem] = useState<File>()

  const handleSelect = () => {
    console.log(index, 'DialogSetStockItemImage')

    if (selectItem != undefined) {
      setSelectedStockFiles(selectItem, index)
    }
    if (typeof onClose === 'function') {
      onClose()
    }
  }

  return (
    <>
      <Modal isShow={isShow!} onClose={onClose!} effect="ease-out">
        <Modal.Content
          onClose={onClose!}
          className="flex h-full max-h-[640px] overflow-auto flex-col gap-y-5 bg-white px-5 py-5 md:rounded-lg "
        >
          <Modal.Header notBar onClose={onClose!}>
            گالری
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col w-full">
              {selectedFiles.length > 0 ? (
                <div className="flex flex-wrap gap-6 mt-4 px-8">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectItem(file)}
                      className="text-sm text-gray-600 cursor-pointer "
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className={`${
                          selectItem == file ? 'border-2 border-[#e90089]' : ''
                        } w-[85px] h-[95px] object-cover  rounded-lg shadow-product`}
                      />
                    </div>
                  ))}
                  <div className="border-t-2 gap-2 border-gray-200 py-3 lg:pb-0 flex justify-end  my-2 w-full">
                    <button
                      type="button"
                      className="bg-[#009ef7] text-white rounded-lg px-5 py-3"
                      onClick={handleSelect}
                    >
                      ذخیره{' '}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-center text-red-600">عکسی در گالری محصول وجود ندارد !</div>
              )}
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default ProductFormEdit
