// import {
//   IColumnFooter,
//   IDesignItemForm,
//   IGeneralSettingForm,
//   ILogosForm,
//   IRedirect,
//   ISloganFooter,
//   IStoreCategory,
//   ISupport,
// } from '@/types'
// import React, { useEffect, useState } from 'react'
// import { useForm, FormProvider, UseFormReturn } from 'react-hook-form'
// import { Button } from '../ui'
// import { GeneralSettingForm, LogoImagesForm } from '../ads'
// import {
//   useDeleteDesignItemsMutation,
//   useDeleteStoreCategoryMutation,
//   useGetDesignItemsQuery,
//   useGetGeneralSettingQuery,
//   useGetLogoImagesQuery,
//   useGetRedirectsQuery,
//   useGetSloganFooterQuery,
//   useGetStoreCategoriesQuery,
//   useGetSupportQuery,
//   useUpsertDesignItemsMutation,
//   useUpsertGeneralSettingMutation,
//   useUpsertLogoImagesMutation,
//   useUpsertRedirectsMutation,
//   useUpsertSloganFooterMutation,
//   useUpsertStoreCategoriesMutation,
//   useUpsertSupportMutation,
// } from '@/services'
// import { showAlert } from '@/store'
// import { useAppDispatch } from '@/hooks'
// import {
//   AdditionalForm,
//   DesignItemForm,
//   RedirectForm,
//   SloganFooterForm,
//   StoreCategoryForm,
//   SupportForm,
// } from '../designs'
// import { StoreCategoryBulkForm } from '@/services/design/types'

// const fetchImageAsFile = async (url: string): Promise<File> => {
//   try {
//     const response = await fetch(url)
//     if (!response.ok) {
//       console.error(`Failed to fetch image from `)
//     }
//     const blob = await response.blob()
//     const fileName = url.split('/').pop()
//     return new File([blob], fileName || 'image.jpg', { type: blob.type })
//   } catch (error) {
//     console.error(`Failed to fetch image from ${url}:`, error)
//     throw error
//   }
// }
// interface FormData {
//   generalSetting: IGeneralSettingForm
//   logoImages: ILogosForm
//   designItems: IDesignItemForm[]
//   storeCategories: IStoreCategory[]
//   sloganFooter: ISloganFooter
//   support: ISupport
//   redirects: IRedirect
//   columnFooters: IColumnFooter[]
// }

// const DesignForm: React.FC = () => {
//   // asset
//   const dispatch = useAppDispatch()
//   //states
//   // const [designItems, setDesignItems] = useState<IDesignItemForm[]>([])
//   const [deletedDesignItems, setDeletedDesignItems] = useState<IDesignItemForm[]>([])
//   const [listItems, setListItems] = useState<IDesignItemForm[]>([])
//   const [serviceItems, setServiceItems] = useState<IDesignItemForm[]>([])
//   const [socialMediaItems, setSocialMediaItems] = useState<IDesignItemForm[]>([])
//   const [storeCategories, setStoreCategories] = useState<IStoreCategory[]>([])
//   const [deletedStoreCategories, setDeletedStoreCategories] = useState<IStoreCategory[]>([])
//   const [articleRedirect, setArticleRedirect] = useState<IRedirect[]>([])
//   const [columnFooter, setColumnFooter] = useState<IColumnFooter[]>([])
//   const [deletedColumnFooter, setDeletedColumnFooter] = useState<IColumnFooter[]>([])
//   const [selectedMainFile, setMainSelectedFiles] = useState<any[]>([])
//   const [selectedFaviconFile, setFaviconFile] = useState<any[]>([])

//   const methods: UseFormReturn<FormData> = useForm<FormData>({
//     defaultValues: {
//       generalSetting: {
//         id: '',
//         title: '',
//         shortIntroduction: '',
//         googleTags: '',
//       },
//       logoImages: {},
//       designItems: [],
//       storeCategories: [],
//       sloganFooter: {},
//       redirects: {},
//       support: {},
//       columnFooters: [],
//     },
//   })

//   // Queries
//   const {
//     data: generalSettingData,
//     isLoading: isLoadingGeneralSetting,
//     isError: isErrorGeneralSetting,
//   } = useGetGeneralSettingQuery()

//   const { data: logoImagesData, isLoading: isLoadingLogoImages, isError: isErrorLogoImages } = useGetLogoImagesQuery()
//   const {
//     data: storeCategoriesData,
//     isLoading: isLoadingStoreCategories,
//     isError: isErrorStoreCategories,
//   } = useGetStoreCategoriesQuery()

//   const {
//     data: designItemsData,
//     isLoading: isLoadingDesignItems,
//     isError: isErrorDesignItems,
//   } = useGetDesignItemsQuery()
//   const {
//     data: sloganFooterData,
//     isLoading: isLoadingSloganFooter,
//     isError: isErrorSloganFooter,
//   } = useGetSloganFooterQuery()

//   const { data: supportData, isLoading: isLoadingSupport, isError: isErrorSupport } = useGetSupportQuery()

//   const { data: redirectData, isLoading: isLoadingRedirect, isError: isErrorRedirect } = useGetRedirectsQuery()

//   // Upsert
//   const [
//     upsertRedirect,
//     {
//       isLoading: isUpsertLoadingRedirect,
//       isSuccess: isUpsertSuccessRedirect,
//       isError: isUpsertErrorRedirect,
//       error: upsertRedirectError,
//     },
//   ] = useUpsertRedirectsMutation()

//   const [
//     upsertSupport,
//     {
//       isLoading: isUpsertLoadingSupport,
//       isSuccess: isUpsertSuccessSupport,
//       isError: isUpsertErrorSupport,
//       error: upsertSupportError,
//     },
//   ] = useUpsertSupportMutation()

//   const [
//     upsertSloganFooter,
//     {
//       isLoading: isUpsertLoadingSloganFooter,
//       isSuccess: isUpsertSuccessSloganFooter,
//       isError: isUpsertErrorSloganFooter,
//       error: upsertSloganFooterError,
//     },
//   ] = useUpsertSloganFooterMutation()

//   const [
//     upsertGeneralSetting,
//     {
//       isLoading: isUpsertLoadingGeneralSetting,
//       isSuccess: isUpsertSuccessGeneralSetting,
//       isError: isUpsertErrorGeneralSetting,
//       error: upsertGeneralSettingError,
//     },
//   ] = useUpsertGeneralSettingMutation()

//   const [
//     upsertStoreCategory,
//     {
//       isLoading: isUpsertLoadingStoreCategory,
//       isSuccess: isUpsertSuccessStoreCategory,
//       isError: isUpsertErrorStoreCategory,
//       error: upsertStoreCategoryError,
//     },
//   ] = useUpsertStoreCategoriesMutation()

//   const [
//     upsertLogoImages,
//     {
//       isLoading: isUpsertLogoImagesSetting,
//       isSuccess: isUpsertSuccessLogoImages,
//       isError: isUpsertErrorLogoImages,
//       error: upsertLogoImagesError,
//     },
//   ] = useUpsertLogoImagesMutation()

//   const [
//     upsertDesignItems,
//     {
//       isLoading: isUpsertDesignItemsSetting,
//       isSuccess: isUpsertSuccessDesignItems,
//       isError: isUpsertErrorDesignItems,
//       error: upsertDesignItemsError,
//     },
//   ] = useUpsertDesignItemsMutation()

//   // ? Delete
//   const [
//     deleteDesignItem,
//     {
//       isSuccess: isSuccessDelete,
//       isError: isErrorDelete,
//       error: errorDelete,
//       data: dataDelete,
//       isLoading: isLoadingDelete,
//     },
//   ] = useDeleteDesignItemsMutation()

//   const [
//     deleteStoreCategory,
//     {
//       isSuccess: isSuccessDeleteStoreCategory,
//       isError: isErrorDeleteStoreCategory,
//       error: errorDeleteStoreCategory,
//       data: dataDeleteStoreCategory,
//       isLoading: isLoadingDeleteStoreCategory,
//     },
//   ] = useDeleteStoreCategoryMutation()

//   const onSubmit = async (data: FormData) => {
//     console.log(data, 'data all')

//     const promises = []

//     // ? delete Design Items
//     if (deletedDesignItems.length > 0) {
//       promises.push(
//         Promise.all(
//           deletedDesignItems.map((deletedDesign) => {
//             if (deletedDesign.id) {
//               return deleteDesignItem(deletedDesign.id)
//             }
//           })
//         )
//       )
//     }

//     // ? delete Store Category
//     if (deletedStoreCategories.length > 0) {
//       promises.push(
//         Promise.all(
//           deletedStoreCategories.map((deletedStoreCategory) => {
//             if (deletedStoreCategory.id) {
//               return deleteStoreCategory(deletedStoreCategory.id)
//             }
//           })
//         )
//       )
//     }

//     // redirects
//     if (data.redirects) {
//       const upsertRedirectPromise = (async () => {
//         const upsertData: IRedirect = {
//           id: data.redirects.id || undefined,
//           articleId: data.redirects.articleId,
//           // copyright: data.redirects.copyright,
//         }
//         await upsertRedirect(upsertData)
//       })()
//       promises.push(upsertRedirectPromise)
//     }

//     // support
//     if (data.support) {
//       const upsertSupportPromise = (async () => {
//         const upsertData: ISupport = {
//           id: data.support.id || undefined,
//           contactAndSupport: data.support.contactAndSupport,
//           address: data.support.address,
//         }
//         await upsertSupport(upsertData)
//       })()
//       promises.push(upsertSupportPromise)
//     }

//     // slogan Footer
//     if (data.sloganFooter) {
//       const upsertSloganFooterPromise = (async () => {
//         const upsertData: ISloganFooter = {
//           id: data.sloganFooter.id || undefined,
//           headline: data.sloganFooter.headline,
//           introductionText: data.sloganFooter.introductionText,
//         }
//         await upsertSloganFooter(upsertData)
//       })()
//       promises.push(upsertSloganFooterPromise)
//     }

//     // General Setting
//     const upsertGeneralSettingPromise = (async () => {
//       if (data.generalSetting) {
//         const upsertData = {
//           id: data.generalSetting.id || undefined,
//           title: data.generalSetting.title,
//           shortIntroduction: data.generalSetting.shortIntroduction,
//           googleTags: data.generalSetting.googleTags,
//         }
//         await upsertGeneralSetting(upsertData)
//       }
//     })()
//     promises.push(upsertGeneralSettingPromise)

//     // logo images
//     const upsertLogoImagesPromise = (async () => {
//       if (data.logoImages) {
//         const formLogoImagesData = new FormData()
//         if (data.logoImages.id) formLogoImagesData.append('id', data.logoImages.id)
//         if (data.logoImages.orgThumbnail) formLogoImagesData.append('OrgThumbnail', data.logoImages.orgThumbnail)
//         if (data.logoImages.faviconThumbnail)
//           formLogoImagesData.append('FaviconThumbnail', data.logoImages.faviconThumbnail)

//         await upsertLogoImages(formLogoImagesData)
//       }
//     })()
//     promises.push(upsertLogoImagesPromise)

//     // design items
//     const upsertDesignItemsPromise = (async () => {
//       if (data.designItems && data.designItems.length > 0) {
//         const formSliderData = new FormData()
//         data.designItems.forEach((designItem, index) => {
//           if (designItem.id !== undefined && designItem.id !== '')
//             formSliderData.append(`DesignItems[${index}].Id`, designItem.id)
//           formSliderData.append(`DesignItems[${index}].Title`, designItem.title)
//           formSliderData.append(`DesignItems[${index}].Thumbnail`, designItem.thumbnail!)
//           formSliderData.append(`DesignItems[${index}].Link`, designItem.link)
//           formSliderData.append(`DesignItems[${index}].Type`, designItem.type)
//           formSliderData.append(`DesignItems[${index}].Index`, designItem.index.toString())
//         })

//         await upsertDesignItems(formSliderData)
//       }
//     })()
//     promises.push(upsertDesignItemsPromise)

//     // store Categories items
//     if (data.storeCategories && data.storeCategories.length > 0) {
//       const upsertStoreCategoryPromise = (async () => {
//         const storeCategories: IStoreCategory[] = data.storeCategories.map((storeCategory, index) => ({
//           id: storeCategory.id || undefined,
//           categoryId: storeCategory.categoryId || undefined,
//         }))

//         const jsonData: StoreCategoryBulkForm = {
//           storeCategories: storeCategories,
//         }

//         await upsertStoreCategory(jsonData)
//       })()
//       promises.push(upsertStoreCategoryPromise)
//     }

//     await Promise.all(promises)
//   }

//   // load data
//   useEffect(() => {
//     const loadAllData = async () => {
//       const logoImages = logoImagesData?.data
//         ? await Promise.all(
//             logoImagesData.data.map(async (logoImage) => {
//               const imageMainFile = logoImage.orgImage ? await fetchImageAsFile(logoImage.orgImage.imageUrl) : null
//               const imageFaviconFile = logoImage.faviconImage
//                 ? await fetchImageAsFile(logoImage.faviconImage.imageUrl)
//                 : null

//               return {
//                 id: logoImage.id,
//                 orgThumbnail: imageMainFile,
//                 faviconThumbnail: imageFaviconFile,
//               }
//             })
//           )
//         : []

//       const listItems: IDesignItemForm[] = []
//       const serviceItems: IDesignItemForm[] = []
//       const socialMediaItems: IDesignItemForm[] = []

//       if (designItemsData?.data) {
//         await Promise.all(
//           designItemsData.data.map(async (designItem) => {
//             const imageFile = designItem.image ? await fetchImageAsFile(designItem.image.imageUrl) : null
//             const item: IDesignItemForm = {
//               id: designItem.id,
//               thumbnail: imageFile,
//               title: designItem.title,
//               link: designItem.link,
//               type: designItem.type,
//               index: designItem.index,
//               created: designItem.created,
//               lastUpdated: designItem.lastUpdated,
//             }

//             if (designItem.type === 'lists') listItems.push(item)
//             else if (designItem.type === 'services') serviceItems.push(item)
//             else if (designItem.type === 'socialMedia') socialMediaItems.push(item)
//           })
//         )
//       }

//       setListItems(listItems)
//       setServiceItems(serviceItems)
//       setSocialMediaItems(socialMediaItems)

//       if (logoImages.length > 0) {
//         setMainSelectedFiles(logoImages[0].orgThumbnail ? [logoImages[0].orgThumbnail] : [])
//         setFaviconFile(logoImages[0].faviconThumbnail ? [logoImages[0].faviconThumbnail] : [])
//       }

//       if (storeCategoriesData?.data) {
//         setStoreCategories(storeCategoriesData.data)
//       }

//       methods.reset({
//         generalSetting: generalSettingData?.data
//           ? {
//               id: generalSettingData.data.id || '',
//               title: generalSettingData.data.title || '',
//               shortIntroduction: generalSettingData.data.shortIntroduction || '',
//               googleTags: generalSettingData.data.googleTags || '',
//             }
//           : {},
//         logoImages: logoImages.length > 0 ? logoImages[0] : {},
//         storeCategories: storeCategoriesData?.data || [],
//         sloganFooter: sloganFooterData?.data || {},
//         support: supportData?.data || {},
//         redirects: redirectData?.data || {},
//       })
//     }

//     loadAllData()
//   }, [
//     generalSettingData,
//     sloganFooterData,
//     redirectData,
//     supportData,
//     logoImagesData,
//     designItemsData,
//     storeCategoriesData,
//     methods,
//   ])

//   // handle success alert
//   useEffect(() => {
//     let alertMessage = 'عملیات بروزرسانی با موفقیت انجام شد'

//     const errors = []

//     if (isUpsertErrorGeneralSetting) {
//       errors.push('به‌روزرسانی متن هدر')
//     }

//     if (errors.length > 0) {
//       alertMessage += ` (خطا در: ${errors.join(', ')})`
//     }

//     if (isUpsertSuccessGeneralSetting) {
//       dispatch(
//         showAlert({
//           status: errors.length > 0 ? 'warning' : 'success',
//           title: alertMessage,
//         })
//       )
//     }
//   }, [isUpsertSuccessGeneralSetting])
//   const handleAddDesignItem = (type: string) => {
//     let newItem: IDesignItemForm

//     switch (type) {
//       case 'lists':
//         if (listItems.length === 6) {
//           showAlertForMaxItems(type)
//           return
//         }
//         newItem = {
//           id: '',
//           thumbnail: null,
//           link: '',
//           title: '',
//           type: type,
//           isActive: false,
//           index: listItems.length,
//         }
//         setListItems([...listItems, newItem])
//         break

//       case 'services':
//         if (serviceItems.length === 6) {
//           showAlertForMaxItems(type)
//           return
//         }
//         newItem = {
//           id: '',
//           thumbnail: null,
//           link: '',
//           title: '',
//           type: type,
//           isActive: false,
//           index: serviceItems.length,
//         }
//         setServiceItems([...serviceItems, newItem])
//         break

//       case 'socialMedia':
//         if (socialMediaItems.length === 6) {
//           showAlertForMaxItems(type)
//           return
//         }
//         newItem = {
//           id: '',
//           thumbnail: null,
//           link: '',
//           title: '',
//           type: type,
//           isActive: false,
//           index: socialMediaItems.length,
//         }
//         setSocialMediaItems([...socialMediaItems, newItem])
//         break

//       default:
//         break
//     }
//   }

//   const showAlertForMaxItems = (type: string) => {
//     const title = type === 'lists' ? 'فهرست ها' : type === 'services' ? 'سرویس ها' : 'شبکه های اجتماعی'
//     dispatch(
//       showAlert({
//         status: 'error',
//         title: `حداکثر تعداد ${title} 6 عدد می‌باشد`,
//       })
//     )
//   }

//   const isFormSubmitting = isUpsertLoadingGeneralSetting || isUpsertLogoImagesSetting || isUpsertDesignItemsSetting
//   return (
//     <>
//       <FormProvider {...methods}>
//         <form className="space-y-5 mb-2 mx-3" onSubmit={methods.handleSubmit(onSubmit)}>
//           {/* 1. تنظیمات عمومی */}
//           <div className="flex flex-col sm:flex-row gap-4">
//             <GeneralSettingForm />
//             <LogoImagesForm
//               selectedFaviconFile={selectedFaviconFile}
//               setFaviconFile={setFaviconFile}
//               selectedMainFile={selectedMainFile}
//               setMainSelectedFiles={setMainSelectedFiles}
//             />
//           </div>
//           <DesignItemForm
//             type="lists"
//             designItems={listItems}
//             setDesignItems={setListItems}
//             setDeletedDesignItems={setDeletedDesignItems}
//             onAddDesignItem={() => handleAddDesignItem('lists')}
//           />
//           <DesignItemForm
//             type="services"
//             designItems={serviceItems}
//             setDesignItems={setServiceItems}
//             setDeletedDesignItems={setDeletedDesignItems}
//             onAddDesignItem={() => handleAddDesignItem('services')}
//           />
//           <DesignItemForm
//             type="socialMedia"
//             designItems={socialMediaItems}
//             setDesignItems={setSocialMediaItems}
//             setDeletedDesignItems={setDeletedDesignItems}
//             onAddDesignItem={() => handleAddDesignItem('socialMedia')}
//           />

//           <StoreCategoryForm
//             setDeletedStoreCategories={setDeletedStoreCategories}
//             setStoreCategories={setStoreCategories}
//             storeCategories={storeCategories}
//           />

//           <SloganFooterForm />

//           <SupportForm />
//           <AdditionalForm
//             columnFooters={columnFooter}
//             setColumnFooter={setColumnFooter}
//             setDeletedColumnFooter={setDeletedColumnFooter}
//           />
//           <RedirectForm />
//           <div className="w-full flex justify-end mt-6">
//             <Button
//               isLoading={isFormSubmitting}
//               type="submit"
//               className="bg-[#e90089] px-5 py-2.5 hover:bg-[#e90088bb]"
//               // disabled={isFormSubmitting}
//             >
//               {'بروزسانی'}
//             </Button>
//           </div>
//         </form>
//       </FormProvider>
//     </>
//   )
// }
// export default DesignForm
