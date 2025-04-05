import React, { useEffect, useState } from 'react'
import { useForm, FormProvider, UseFormReturn } from 'react-hook-form'
import { ArticlesAdsForm, BannerForm, FooterBannerForm, SliderForm, TextMarqueeForm } from '../ads'
import { Button } from '../ui'
import {
  IArticleBannerForm,
  IArticleForm,
  IBannerForm,
  IDesignItemForm,
  IFooterBannerForm,
  ISlider,
  ISliderForm,
  IStoreBrand,
  IStoreCategory,
  ITextMarqueeForm,
} from '@/types'
import {
  useDeleteDesignItemsMutation,
  useDeleteSliderMutation,
  useDeleteStoreBrandMutation,
  useDeleteStoreCategoryMutation,
  useGetAllArticleBannersQuery,
  useGetAllBannersQuery,
  useGetAllFooterBannersQuery,
  useGetAllSlidersQuery,
  useGetArticlesQuery,
  useGetDesignItemsQuery,
  useGetHeaderTextQuery,
  useGetStoreBrandsQuery,
  useGetStoreCategoriesQuery,
  useUpsertArticleBannerMutation,
  useUpsertBannerMutation,
  useUpsertDesignItemsMutation,
  useUpsertFooterBannerMutation,
  useUpsertHeaderTextMutation,
  useUpsertSlidersMutation,
  useUpsertStoreBrandsMutation,
  useUpsertStoreCategoriesMutation,
} from '@/services'
import { IHeaderText } from '@/types/IHeaderText.type'
import { ArticleBannerBulkForm, StoreBrandBulkForm, StoreCategoryBulkForm } from '@/services/design/types'
import { HandleResponse } from '../shared'
import { useAppDispatch } from '@/hooks'
import { showAlert } from '@/store'
import { DesignItemForm, StoreBrandForm, StoreCategoryForm } from '../designs'

interface FormData {
  sliders: ISliderForm[]
  slidersIsActive: boolean
  storeCategoryIsActive: boolean
  storeCategories: IStoreCategory[]
  storeBrandIsActive: boolean
  storeBrands: IStoreBrand[]
  textMarquee: IHeaderText
  bannersIsActive: boolean
  footerBannersIsActive: boolean
  articleBannersIsActive: boolean
  articleBanners: IArticleBannerForm[]
  banners: IBannerForm[]
  footerBanners: IFooterBannerForm[]
  designItems: IDesignItemForm[]
}
const MainPageAdsForm: React.FC = () => {
  //states :
  const [sliders, setSliders] = useState<ISliderForm[]>([])
  const [deletedSliders, setDeletedSliders] = useState<ISliderForm[]>([])
  const [storeCategories, setStoreCategories] = useState<IStoreCategory[]>([])
  const [deletedStoreCategories, setDeletedStoreCategories] = useState<IStoreCategory[]>([])
  const [storeBrands, setStoreBrands] = useState<IStoreBrand[]>([])
  const [deletedStoreBrands, setDeletedStoreBrands] = useState<IStoreBrand[]>([])
  const [banners, setBanners] = useState<IBannerForm[]>([])
  const [articleBanners, setArticleBanners] = useState<IArticleBannerForm[]>([])
  const [footerBanner, setFooterBanner] = useState<IFooterBannerForm[]>([])
  const [listItems, setListItems] = useState<IDesignItemForm[]>([])
  const [deletedDesignItems, setDeletedDesignItems] = useState<IDesignItemForm[]>([])
  const dispatch = useAppDispatch()
  // Queries
  const {
    data: designItemsData,
    isLoading: isLoadingDesignItems,
    isError: isErrorDesignItems,
    refetch: designItemRefetch,
  } = useGetDesignItemsQuery()
  const {
    data: storeCategoriesData,
    isLoading: isLoadingStoreCategories,
    isError: isErrorStoreCategories,
    refetch: storeCategoriesRefetch,
  } = useGetStoreCategoriesQuery()
  const {
    data: storeBrandsData,
    isLoading: isLoadingStoreBrands,
    isError: isErrorStoreBrands,
    refetch: storeBrandsRefetch,
  } = useGetStoreBrandsQuery()

  const {
    data: headerTextData,
    isLoading: isLoadingHeaderText,
    isError: isErrorHeaderText,
    refetch: headerTextRefetch,
  } = useGetHeaderTextQuery()
  const {
    data: sliderData,
    isLoading: isLoadingSlider,
    isError: isErrorSlider,
    refetch: sliderRefetch,
  } = useGetAllSlidersQuery()
  const {
    data: bannerData,
    isLoading: isLoadingBanner,
    isError: isErrorBanner,
    refetch: bannerRefetch,
  } = useGetAllBannersQuery()
  const {
    data: articleBannerData,
    isLoading: isLoadingArticleBanner,
    isError: isErrorArticleBanner,
    refetch: articleBannerRefetch,
  } = useGetAllArticleBannersQuery()
  const {
    data: articleData,
    isLoading: isLoadingArticle,
    isError: isErrorArticle,
    refetch: articleRefetch,
  } = useGetArticlesQuery({
    page: 1,
    pageSize: 99999,
  })

  const {
    data: footerBannerData,
    isLoading: isLoadingFooterBanner,
    isError: isErrorFooterBanner,
    refetch: footerBannerRefetch,
  } = useGetAllFooterBannersQuery()

  // Upsert
  const [
    upsertDesignItems,
    {
      isLoading: isUpsertDesignItemsSetting,
      isSuccess: isUpsertSuccessDesignItems,
      isError: isUpsertErrorDesignItems,
      error: upsertDesignItemsError,
    },
  ] = useUpsertDesignItemsMutation()
  const [
    upsertStoreCategory,
    {
      isLoading: isUpsertLoadingStoreCategory,
      isSuccess: isUpsertSuccessStoreCategory,
      isError: isUpsertErrorStoreCategory,
      error: upsertStoreCategoryError,
    },
  ] = useUpsertStoreCategoriesMutation()
  const [
    upsertStoreBrand,
    {
      isLoading: isUpsertLoadingStoreBrand,
      isSuccess: isUpsertSuccessStoreBrand,
      isError: isUpsertErrorStoreBrand,
      error: upsertStoreBrandError,
    },
  ] = useUpsertStoreBrandsMutation()
  const [
    upsertHeaderText,
    {
      isLoading: isUpsertLoadingHeaderText,
      isSuccess: isUpsertSuccessHeaderText,
      isError: isUpsertErrorHeaderText,
      error: upsertHeaderTextError,
    },
  ] = useUpsertHeaderTextMutation()

  const [
    upsertSlider,
    {
      isLoading: isUpsertLoadingSlider,
      isSuccess: isUpsertSuccessSlider,
      isError: isUpsertErrorSlider,
      error: upsertSliderError,
    },
  ] = useUpsertSlidersMutation()

  const [
    upsertBanner,
    {
      isLoading: isUpsertLoadingBanner,
      isSuccess: isUpsertSuccessBanner,
      isError: isUpsertErrorBanner,
      error: upsertBannerError,
    },
  ] = useUpsertBannerMutation()

  const [
    upsertArticleBanner,
    {
      isLoading: isUpsertLoadingArticleBanner,
      isSuccess: isUpsertSuccessArticleBanner,
      isError: isUpsertErrorArticleBanner,
      error: upsertArticleBannerError,
    },
  ] = useUpsertArticleBannerMutation()

  const [
    upsertFooterBanner,
    {
      isLoading: isUpsertLoadingFooterBanner,
      isSuccess: isUpsertSuccessFooterBanner,
      isError: isUpsertErrorFooterBanner,
      error: upsertFooterBannerError,
    },
  ] = useUpsertFooterBannerMutation()

  //*    Delete
  const [
    deleteStoreCategory,
    {
      isSuccess: isSuccessDeleteStoreCategory,
      isError: isErrorDeleteStoreCategory,
      error: errorDeleteStoreCategory,
      data: dataDeleteStoreCategory,
      isLoading: isLoadingDeleteStoreCategory,
    },
  ] = useDeleteStoreCategoryMutation()
  const [
    deleteStoreBrand,
    {
      isSuccess: isSuccessDeleteStoreBrand,
      isError: isErrorDeleteStoreBrand,
      error: errorDeleteStoreBrand,
      data: dataDeleteStoreBrand,
      isLoading: isLoadingDeleteStoreBrand,
    },
  ] = useDeleteStoreBrandMutation()
  const [
    deleteSlider,
    {
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
      data: dataDelete,
      isLoading: isLoadingDelete,
    },
  ] = useDeleteSliderMutation()
  const [
    deleteDesignItem,
    {
      isSuccess: isSuccessDesignItemDelete,
      isError: isErrorDesignItemDelete,
      error: errorDesignItemDelete,
      data: dataDesignItemDelete,
      isLoading: isLoadingDesignItemDelete,
    },
  ] = useDeleteDesignItemsMutation()

  const handleAllRefetch = () => {
    designItemRefetch()
    storeCategoriesRefetch()
    storeBrandsRefetch()
    headerTextRefetch()
    sliderRefetch()
    bannerRefetch()
    articleBannerRefetch()
    articleRefetch()
    footerBannerRefetch()
  }

  useEffect(() => {
    if (isUpsertSuccessDesignItems) handleAllRefetch()
    if (isUpsertSuccessStoreCategory) handleAllRefetch()
    if (isUpsertSuccessStoreBrand) handleAllRefetch()
    if (isUpsertSuccessHeaderText) handleAllRefetch()
    if (isUpsertSuccessSlider) handleAllRefetch()
    if (isUpsertSuccessBanner) handleAllRefetch()
    if (isUpsertSuccessArticleBanner) handleAllRefetch()
    if (isUpsertSuccessFooterBanner) handleAllRefetch()

    if (isSuccessDeleteStoreCategory) handleAllRefetch()
    if (isSuccessDeleteStoreBrand) handleAllRefetch()
    if (isSuccessDelete) handleAllRefetch()
    if (isSuccessDesignItemDelete) handleAllRefetch()
  }, [
    isUpsertSuccessDesignItems,
    isUpsertSuccessStoreCategory,
    isUpsertSuccessStoreBrand,
    isUpsertSuccessHeaderText,
    isUpsertSuccessSlider,
    isUpsertSuccessBanner,
    isUpsertSuccessArticleBanner,
    isUpsertSuccessFooterBanner,
    isSuccessDeleteStoreCategory,
    isSuccessDeleteStoreBrand,
    isSuccessDelete,
    isSuccessDesignItemDelete,
  ])
  const fetchImageAsFile = async (url: string): Promise<File> => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        console.error(`Failed to fetch image from `)
        handleAllRefetch()
      }
      const blob = await response.blob()
      const fileName = url.split('/').pop()
      return new File([blob], fileName || 'image.jpg', { type: blob.type })
    } catch (error) {
      console.error(`Failed to fetch image from ${url}:`, error)
      handleAllRefetch()
      throw error
    }
  }
  const methods: UseFormReturn<FormData> = useForm<FormData>({
    defaultValues: {
      textMarquee: {
        id: '',
        name: '',
        isActive: false,
      },
      designItems: [],
      storeCategories: [],
      storeBrands: [],
      slidersIsActive: false,
      bannersIsActive: false,
      storeCategoryIsActive: false,
      storeBrandIsActive: false,
      footerBannersIsActive: false,
      articleBannersIsActive: false,
      sliders: [],
      banners: [],
      articleBanners: [],
      footerBanners: [],
    },
  })

  useEffect(() => {
    if (banners.length === 0) {
      setBanners([
        { index: 1, id: '', thumbnail: null, link: '', category: '', type: 'link' },
        { index: 2, id: '', thumbnail: null, link: '', category: '', type: 'link' },
        { index: 3, id: '', thumbnail: null, link: '', category: '', type: 'link' },
        { index: 4, id: '', thumbnail: null, link: '', category: '', type: 'link' },
      ])
    }
  }, [banners])

  useEffect(() => {
    if (articleBanners.length === 0) {
      setArticleBanners([
        { index: 1, id: '', articleId: '', isActive: false },
        { index: 2, id: '', articleId: '', isActive: false },
        { index: 3, id: '', articleId: '', isActive: false },
        { index: 4, id: '', articleId: '', isActive: false },
      ])
    }
  }, [articleBanners])

  useEffect(() => {
    if (footerBanner.length === 0) {
      setFooterBanner([{ id: '', thumbnail: null, link: '', category: '', type: 'link', isActive: false }])
    }
  }, [footerBanner])

  // load data
  useEffect(() => {
    const loadSliderImages = async () => {
      if (sliderData?.data) {
        return await Promise.all(
          sliderData.data.map(async (slider) => {
            const imageFile = slider.image && (await fetchImageAsFile(slider.image.imageUrl))
            return {
              id: slider.id,
              thumbnail: imageFile,
              category: slider.categoryId,
              link: slider.link,
              type: slider.type,
              isActive: slider.isActive,
            }
          })
        )
      }
      return []
    }

    const loadDesignItemImages = async () => {
      if (designItemsData?.data) {
        return await Promise.all(
          designItemsData.data
            .filter((item) => item.type === 'lists')
            .map(async (designItem) => {
              const imageFile = designItem.image ? await fetchImageAsFile(designItem.image.imageUrl) : null
              return {
                id: designItem.id,
                thumbnail: imageFile,
                title: designItem.title,
                link: designItem.link,
                type: designItem.type,
                index: designItem.index,
                created: designItem.created,
                lastUpdated: designItem.lastUpdated,
              }
            })
        )
      }
      return []
    }

    const loadBannerImages = async () => {
      if (bannerData?.data) {
        return await Promise.all(
          bannerData.data.map(async (banner) => {
            const imageFile = banner.image && (await fetchImageAsFile(banner.image.imageUrl))
            return {
              id: banner.id,
              index: banner.index,
              thumbnail: imageFile,
              category: banner.categoryId,
              link: banner.link,
              type: banner.type,
              isActive: banner.isActive,
            }
          })
        )
      }
      return []
    }

    const loadArticleBanners = async () => {
      if (articleBannerData?.data) {
        return await Promise.all(
          articleBannerData.data.map(async (articleBanner) => ({
            id: articleBanner.id,
            index: articleBanner.index,
            isActive: articleBanner.isActive,
            articleId: articleBanner.articleId,
          }))
        )
      }
      return []
    }

    const loadFooterBannerImages = async () => {
      if (footerBannerData?.data) {
        return await Promise.all(
          footerBannerData.data.map(async (banner) => {
            const imageFile = banner.image && (await fetchImageAsFile(banner.image.imageUrl))
            return {
              id: banner.id,
              thumbnail: imageFile,
              category: banner.categoryId,
              link: banner.link,
              type: banner.type,
              isActive: banner.isActive,
            }
          })
        )
      }
      return []
    }

    const loadAllData = async () => {
      const [slidersWithFiles, bannersWithFiles, articleBanners, footerBannersWithFiles, listItems] = await Promise.all(
        [loadSliderImages(), loadBannerImages(), loadArticleBanners(), loadFooterBannerImages(), loadDesignItemImages()]
      )
      if (storeCategoriesData?.data) {
        setStoreCategories(storeCategoriesData.data)
      }
      if (storeBrandsData?.data) {
        setStoreBrands(storeBrandsData.data)
      }
      setListItems(listItems)
      methods.reset({
        textMarquee: {
          id: headerTextData?.data?.id || '',
          name: headerTextData?.data?.name || '',
          isActive: headerTextData?.data?.isActive || false,
        },
        storeCategories: storeCategoriesData?.data || [],
        storeBrands: storeBrandsData?.data || [],
        storeCategoryIsActive:
          storeCategoriesData?.data && storeCategoriesData?.data?.length > 0
            ? storeCategoriesData.data[0].isActive
            : false,
        storeBrandIsActive:
          storeBrandsData?.data && storeBrandsData?.data?.length > 0 ? storeBrandsData.data[0].isActive : false,
        sliders: slidersWithFiles,
        slidersIsActive: sliderData?.data && sliderData?.data?.length > 0 ? sliderData.data[0].isActive : false,
        banners: bannersWithFiles,
        bannersIsActive: bannerData?.data && bannerData?.data?.length > 0 ? bannerData.data[0].isActive : false,
        footerBanners: footerBannersWithFiles,
        footerBannersIsActive:
          footerBannerData?.data && footerBannerData?.data?.length > 0 ? footerBannerData.data[0].isActive : false,
        articleBanners: articleBanners,
        articleBannersIsActive:
          articleBannerData?.data && articleBannerData?.data?.length > 0 ? articleBannerData.data[0].isActive : false,
      })

      setSliders(slidersWithFiles)
      setArticleBanners((prev) => {
        return prev.map((defaultArticleBanner) => {
          const newArticleBanner = articleBanners.find(
            (articleBanner) => articleBanner.index === defaultArticleBanner.index
          )
          return newArticleBanner ? newArticleBanner : defaultArticleBanner
        })
      })
      setBanners((prevBanners) =>
        prevBanners.map((defaultBanner) => {
          const newBanner = bannersWithFiles.find((banner) => banner.index === defaultBanner.index)
          return newBanner ? newBanner : defaultBanner
        })
      )
      setFooterBanner(footerBannersWithFiles)
    }

    loadAllData()
  }, [
    headerTextData,
    sliderData,
    bannerData,
    footerBannerData,
    storeBrandsData,
    storeCategoriesData,
    designItemsData,
    methods,
  ])

  const onSubmit = async (data: FormData) => {
    console.log(data, 'data all')
    const promises = []

    // ? delete Design Items
    if (deletedDesignItems.length > 0) {
      promises.push(
        Promise.all(
          deletedDesignItems.map((deletedDesign) => {
            if (deletedDesign.id) {
              return deleteDesignItem(deletedDesign.id)
            }
          })
        )
      )
    }

    // sliders items
    if (deletedSliders.length > 0) {
      const deleteSlidersPromise = Promise.all(
        deletedSliders.map((slider) => {
          if (slider.id) {
            return deleteSlider(slider.id)
          }
        })
      )
      promises.push(deleteSlidersPromise)
    }

    if (data.sliders && data.sliders.length > 0) {
      const upsertSlidersPromise = (async () => {
        console.log(data.sliders, 'data.sliders')
        const formSliderData = new FormData()
        data.sliders.forEach((slider, index) => {
          if (slider.id !== undefined && slider.id !== '') formSliderData.append(`Sliders[${index}].Id`, slider.id)
          if (slider.category != null) formSliderData.append(`Sliders[${index}].CategoryId`, slider.category)
          formSliderData.append(`Sliders[${index}].Thumbnail`, slider.thumbnail!)
          formSliderData.append(`Sliders[${index}].Link`, slider.link)
          formSliderData.append(`Sliders[${index}].Type`, slider.type)
          formSliderData.append(`Sliders[${index}].IsActive`, data.slidersIsActive.toString())
        })

        await upsertSlider(formSliderData)
      })()
      promises.push(upsertSlidersPromise)
    }

    // text header
    if (data.textMarquee) {
      const upsertHeaderTextPromise = (async () => {
        const upsertData = {
          id: data.textMarquee.id || undefined,
          name: data.textMarquee.name,
          isActive: data.textMarquee.isActive,
        }
        await upsertHeaderText(upsertData)
      })()
      promises.push(upsertHeaderTextPromise)
    }

    // delete Store Category
    if (deletedStoreCategories.length > 0) {
      const deleteStoreCategoriesPromise = Promise.all(
        deletedStoreCategories.map((deletedStoreCategory) => {
          if (deletedStoreCategory.id) {
            return deleteStoreCategory(deletedStoreCategory.id)
          }
        })
      )
      promises.push(deleteStoreCategoriesPromise)
    }

    // delete Store Brand
    if (deletedStoreBrands.length > 0) {
      const deleteStoreBrandsPromise = Promise.all(
        deletedStoreBrands.map((deletedStoreBrand) => {
          if (deletedStoreBrand.id) {
            return deleteStoreBrand(deletedStoreBrand.id)
          }
        })
      )
      promises.push(deleteStoreBrandsPromise)
    }

    // banner items
    if (data.banners && data.banners.length > 0) {
      const upsertBannersPromise = (async () => {
        console.log(data.banners, 'data.banners')
        const formBannerData = new FormData()
        data.banners.forEach((banner, index) => {
          if (banner.id !== undefined && banner.id !== '') formBannerData.append(`Banners[${index}].Id`, banner.id)
          if (banner.category !== null) formBannerData.append(`Banners[${index}].CategoryId`, banner.category)
          formBannerData.append(`Banners[${index}].Index`, banner.index.toString())
          formBannerData.append(`Banners[${index}].Thumbnail`, banner.thumbnail!)
          formBannerData.append(`Banners[${index}].Link`, banner.link)
          formBannerData.append(`Banners[${index}].Type`, banner.type)
          formBannerData.append(`Banners[${index}].IsActive`, data.bannersIsActive.toString())
        })

        await upsertBanner(formBannerData)
      })()
      promises.push(upsertBannersPromise)
    }

    // articleBanners items
    if (data.articleBanners && data.articleBanners.length > 0) {
      const upsertArticleBannersPromise = (async () => {
        const articleBanners: IArticleBannerForm[] = data.articleBanners.map((articleBanner, index) => ({
          id: articleBanner.id || undefined,
          articleId: articleBanner.articleId || undefined,
          index: articleBanner.index,
          isActive: data.articleBannersIsActive,
        }))

        const jsonData: ArticleBannerBulkForm = {
          articleBanners: articleBanners,
        }

        await upsertArticleBanner(jsonData)
      })()
      promises.push(upsertArticleBannersPromise)
    }

    // footer banner items
    if (data.footerBanners && data.footerBanners.length > 0) {
      const upsertFooterBannerPromise = (async () => {
        console.log(data.footerBanners, 'data.footerBanners')

        var banner = data.footerBanners
        const formFooterBannerData = new FormData()
        if (banner[0].id !== undefined) formFooterBannerData.append('Id', banner[0].id)
        if (banner[0].category !== null && banner[0].id !== '') {
          formFooterBannerData.append('CategoryId', banner[0].category)
        }
        formFooterBannerData.append('Thumbnail', banner[0].thumbnail!)
        formFooterBannerData.append('Link', banner[0].link)
        formFooterBannerData.append('Type', banner[0].type)
        formFooterBannerData.append('IsActive', data.footerBannersIsActive.toString())

        await upsertFooterBanner(formFooterBannerData)
      })()
      promises.push(upsertFooterBannerPromise)
    }

    // store Categories items
    if (data.storeCategories && data.storeCategories.length > 0) {
      const upsertStoreCategoryPromise = (async () => {
        const storeCategories: IStoreCategory[] = data.storeCategories.map((storeCategory, index) => ({
          id: storeCategory.id || undefined,
          categoryId: storeCategory.categoryId || undefined,
          isActive: data.storeCategoryIsActive,
        }))

        const jsonData: StoreCategoryBulkForm = {
          storeCategories: storeCategories,
        }

        await upsertStoreCategory(jsonData)
      })()
      promises.push(upsertStoreCategoryPromise)
    }

    // store Brands items
    if (data.storeBrands && data.storeBrands.length > 0) {
      const upsertStoreBrandPromise = (async () => {
        const storeBrands: IStoreBrand[] = data.storeBrands.map((storeBrand, index) => ({
          id: storeBrand.id || undefined,
          brandId: storeBrand.brandId || undefined,
          isActive: data.storeBrandIsActive,
        }))

        const jsonData: StoreBrandBulkForm = {
          storeBrands: storeBrands,
        }

        await upsertStoreBrand(jsonData)
      })()
      promises.push(upsertStoreBrandPromise)
    }

    // design items
    const upsertDesignItemsPromise = (async () => {
      if (data.designItems && data.designItems.length > 0) {
        const formSliderData = new FormData()
        data.designItems.forEach((designItem, index) => {
          if (designItem.id !== undefined && designItem.id !== '')
            formSliderData.append(`DesignItems[${index}].Id`, designItem.id)
          formSliderData.append(`DesignItems[${index}].Title`, designItem.title)
          formSliderData.append(`DesignItems[${index}].Thumbnail`, designItem.thumbnail!)
          formSliderData.append(`DesignItems[${index}].Link`, designItem.link)
          formSliderData.append(`DesignItems[${index}].Type`, designItem.type)
          formSliderData.append(`DesignItems[${index}].Index`, designItem.index.toString())
        })

        await upsertDesignItems(formSliderData)
      }
    })()
    promises.push(upsertDesignItemsPromise)

    await Promise.all(promises)
  }

  // handle success alert
  useEffect(() => {
    let alertMessage = 'عملیات بروزرسانی با موفقیت انجام شد'

    const errors = []

    if (isUpsertErrorHeaderText) {
      errors.push('به‌روزرسانی متن هدر')
    }
    if (isUpsertErrorDesignItems) {
      errors.push('به‌روزرسانی  فهرست')
    }
    if (isUpsertErrorSlider) {
      errors.push('به‌روزرسانی اسلایدر')
    }
    if (isUpsertErrorBanner) {
      errors.push('به‌روزرسانی بنر')
    }
    if (isUpsertErrorStoreCategory) {
      errors.push('به‌روزرسانی دسته بندی')
    }
    if (isUpsertErrorStoreBrand) {
      errors.push('به‌روزرسانی برند')
    }
    if (isUpsertErrorFooterBanner) {
      errors.push('به‌روزرسانی بنر فوتر')
    }
    if (isUpsertErrorArticleBanner) {
      errors.push('به‌روزرسانی بنر مقاله')
    }

    if (errors.length > 0) {
      alertMessage += ` (خطا در: ${errors.join(', ')})`
    }

    if (
      isUpsertSuccessHeaderText ||
      isUpsertSuccessDesignItems ||
      isUpsertSuccessSlider ||
      isUpsertSuccessBanner ||
      isUpsertSuccessFooterBanner ||
      isUpsertSuccessArticleBanner ||
      isUpsertSuccessStoreCategory ||
      isUpsertSuccessStoreBrand ||
      isUpsertErrorHeaderText ||
      isUpsertErrorSlider ||
      isUpsertErrorBanner ||
      isUpsertErrorFooterBanner ||
      isUpsertErrorArticleBanner ||
      isUpsertErrorStoreCategory ||
      isUpsertErrorStoreCategory ||
      isUpsertErrorDesignItems
    ) {
      dispatch(
        showAlert({
          status: errors.length > 0 ? 'warning' : 'success',
          title: alertMessage,
        })
      )
    }
  }, [
    isUpsertSuccessHeaderText,
    isUpsertSuccessStoreBrand,
    isUpsertSuccessSlider,
    isUpsertSuccessBanner,
    isUpsertSuccessFooterBanner,
    isUpsertSuccessArticleBanner,
    isUpsertSuccessStoreCategory,
    isUpsertSuccessDesignItems,
    isUpsertErrorHeaderText,
    isUpsertErrorSlider,
    isUpsertErrorBanner,
    isUpsertErrorFooterBanner,
    isUpsertErrorArticleBanner,
    isUpsertErrorStoreCategory,
    isUpsertErrorStoreCategory,
    isUpsertErrorDesignItems,
  ])

  const showAlertForMaxItems = (type: string) => {
    const title = type === 'lists' ? 'فهرست ها' : type === 'services' ? 'سرویس ها' : 'شبکه های اجتماعی'
    dispatch(
      showAlert({
        status: 'error',
        title: `حداکثر تعداد ${title} 6 عدد می‌باشد`,
      })
    )
  }

  const handleAddDesignItem = (type: string) => {
    let newItem: IDesignItemForm

    switch (type) {
      case 'lists':
        if (listItems.length === 6) {
          showAlertForMaxItems(type)
          return
        }
        newItem = {
          id: '',
          thumbnail: null,
          link: '',
          title: '',
          type: type,
          isActive: false,
          index: listItems.length,
          created: new Date().toISOString(),
        }
        setListItems([...listItems, newItem])
        break

      default:
        break
    }
  }

  const isFormSubmitting =
    isUpsertLoadingStoreCategory ||
    isUpsertLoadingHeaderText ||
    isUpsertLoadingSlider ||
    isUpsertLoadingBanner ||
    isUpsertLoadingArticleBanner ||
    isUpsertLoadingFooterBanner ||
    isUpsertLoadingStoreBrand ||
    isUpsertDesignItemsSetting

  if (isLoadingSlider || isLoadingBanner || isLoadingDesignItems) return <div>loadingComponent..</div>
  return (
    <>
      <FormProvider {...methods}>
        <form className="space-y-5 mb-2 mx-3" onSubmit={methods.handleSubmit(onSubmit)}>
          {/* 1. متن متحرک */}
          <TextMarqueeForm />
          <DesignItemForm
            type="lists"
            designItems={listItems}
            setDesignItems={setListItems}
            setDeletedDesignItems={setDeletedDesignItems}
            onAddDesignItem={() => handleAddDesignItem('lists')}
          />
          {/* 2. اسلایدر اصلی */}
          <SliderForm sliders={sliders} setSliders={setSliders} setDeletedSliders={setDeletedSliders} />
          <StoreCategoryForm
            setDeletedStoreCategories={setDeletedStoreCategories}
            setStoreCategories={setStoreCategories}
            storeCategories={storeCategories}
          />
          {/* 3.  بنر*/}
          <BannerForm banners={banners} setBanners={setBanners} />
          <StoreBrandForm
            setDeletedStoreBrands={setDeletedStoreBrands}
            setStoreBrands={setStoreBrands}
            storeBrands={storeBrands}
          />
          {/* 4.بنر مقالات  */}
          <ArticlesAdsForm articleBanners={articleBanners} setArticleBanners={setArticleBanners} />
          {/* 5. بنر فوتر  */}
          <FooterBannerForm banners={footerBanner} setBanners={setFooterBanner} />
          <div className="w-full flex justify-end mt-6">
            <Button
              isLoading={isFormSubmitting}
              type="submit"
              className="bg-[#e90089] px-5 py-2.5 hover:bg-[#e90088bb]"
            >
              {'بروزسانی'}
            </Button>
          </div>
        </form>
      </FormProvider>

      {/* {(isUpsertSuccessHeaderText || isUpsertErrorHeaderText) && (
        <HandleResponse
          isError={isUpsertErrorHeaderText}
          isSuccess={isUpsertSuccessHeaderText}
          error={upsertHeaderTextError}
          onSuccess={() => {
            // هر کار دیگری که پس از موفقیت‌آمیز بودن عملیات می‌خواهید انجام دهید
          }}
        />
      )}

      {(isUpsertSuccessSlider || isUpsertErrorSlider) && (
        <HandleResponse
          isError={isUpsertErrorSlider}
          isSuccess={isUpsertSuccessSlider}
          error={upsertSliderError}
          message={isUpsertSuccessSlider ? 'اسلایدر با موفقیت بروزرسانی شد!' : undefined}
          onSuccess={() => {
            // هر کار دیگری که پس از موفقیت‌آمیز بودن عملیات می‌خواهید انجام دهید
          }}
        />
      )} */}
    </>
  )
}

export default MainPageAdsForm
