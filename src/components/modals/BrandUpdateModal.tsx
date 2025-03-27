// import { Modal, Button, CustomCheckbox } from '@/components/ui'
// import {
//   useCreateBrandMutation,
//   useCreateFeatureValueMutation,
//   useCreateSizeMutation,
//   useUpdateBrandMutation,
//   useUpdateFeatureValueMutation,
//   useUpdateSizeMutation,
// } from '@/services'
// import { useEffect, useState } from 'react'
// import { HandleResponse } from '../shared'
// import { Resolver, SubmitHandler, useForm } from 'react-hook-form'
// import { yupResolver } from '@hookform/resolvers/yup'
// import { brandSchema, singleSchema } from '@/utils'
// import { FeatureValue, FeatureValueDTO, ProductFeature, SizeDTO } from '@/services/feature/types'
// import { IBrand, IBrandForm } from '@/types'

// interface Props {
//   title: string
//   brand?: IBrand
//   isShow: boolean
//   onClose: () => void
//   refetch: () => void
// }
// const fetchImageAsFile = async (url: string): Promise<File> => {
//   const response = await fetch(url)
//   const blob = await response.blob()
//   const fileName = url.split('/').pop()
//   return new File([blob], fileName || 'image.jpg', { type: blob.type })
// }

// const BrandUpdateModal: React.FC<Props> = (props) => {
//   const { isShow, onClose, refetch, title, brand } = props
//   const [isActive, setIsActive] = useState(false)
//   const [isSlider, setIsSlider] = useState(false)
//   const [selectedFile, setSelectedFile] = useState<File[]>([])

//   const [
//     createBrand,
//     {
//       data: dataCreate,
//       isSuccess: isSuccessCreate,
//       isError: isErrorCreate,
//       error: errorCreate,
//       isLoading: isLoadingCreate,
//     },
//   ] = useCreateBrandMutation()

//   const [
//     updateBrand,
//     {
//       data: dataUpdate,
//       isSuccess: isSuccessUpdate,
//       isError: isErrorUpdate,
//       error: errorUpdate,
//       isLoading: isLoadingUpdate,
//     },
//   ] = useUpdateBrandMutation()

//   const {
//     handleSubmit,
//     formState: { errors: formErrors, isValid },
//     register,
//     setValue,
//     reset,
//   } = useForm<IBrandForm>({
//     resolver: yupResolver(brandSchema) as unknown as Resolver<IBrandForm>,
//   })

//   useEffect(() => {
//     const loadData = async () => {
//       if (brand) {
//         setIsSlider(brand.inSlider)
//         setIsActive(brand.isActive)
//         if (brand.imagesSrc) {
//           const imageFile = await fetchImageAsFile(brand.imagesSrc.imageUrl)
//           if (imageFile) {
//             setSelectedFile([imageFile])
//           }

//           reset({
//             id: brand.id,
//             name: brand.name,
//             isActive: brand.isActive,
//             inSlider: brand.inSlider,
//             description: brand.description,
//             isDeleted: brand.isDelete,
//             Thumbnail: imageFile,
//           })
//         }
//       }
//     }
//     loadData()
//   }, [brand])

//   // ? Handlers
//   const onConfirm: SubmitHandler<IBrandForm> = (data) => {
//     const formData = new FormData()

//     formData.append('Name', data.name)
//     formData.append('Thumbnail', data.Thumbnail)
//     formData.append('InSlider', data.inSlider.toString())
//     formData.append('IsActive', data.isActive.toString())

//     if (data.description) {
//       formData.append('Description', data.description)
//     }
//     if (data.id !== undefined) {
//       formData.append('Id', data.id)
//       updateBrand(formData)
//     } else {
//       createBrand(formData)
//     }
//   }

//   const handleIsActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     var isActive = e.target.checked
//     setIsActive(isActive)
//     setValue('isActive', isActive)
//   }

//   const handleIsSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     var isSlide = e.target.checked
//     setIsSlider(isSlide)
//     setValue('inSlider', isSlide)
//   }

//   const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setSelectedFile([...Array.from(e.target.files)])
//       if ([...Array.from(e.target.files)].length > 0) {
//         var file = e.target.files[0]
//         setValue('Thumbnail', file)
//       }
//     }
//   }
//   console.log(formErrors)

//   return (
//     <>
//       {(isSuccessCreate || isErrorCreate) && (
//         <HandleResponse
//           isError={isErrorCreate}
//           isSuccess={isSuccessCreate}
//           error={errorCreate}
//           message={dataCreate?.message}
//           onSuccess={() => {
//             reset()
//             onClose()
//             refetch()
//           }}
//         />
//       )}

//       {(isSuccessUpdate || isErrorUpdate) && (
//         <HandleResponse
//           isError={isErrorUpdate}
//           isSuccess={isSuccessUpdate}
//           error={errorUpdate}
//           message={dataUpdate?.message}
//           onSuccess={() => {
//             reset()
//             onClose()
//             refetch()
//           }}
//         />
//       )}

//       <Modal isShow={isShow} onClose={onClose} effect="bottom-to-top">
//         <Modal.Content
//           onClose={onClose}
//           className="flex h-full flex-col z-[199] gap-y-5 bg-white py-5 pb-0 md:rounded-lg"
//         >
//           <Modal.Header notBar onClose={onClose}>
//             <div className="text-start text-base">{title} برند</div>
//           </Modal.Header>
//           <Modal.Body>
//             <form onSubmit={handleSubmit(onConfirm)} className="space-y-4 bg-white text-center md:rounded-lg">
//               <div className="flex justify-between flex-col sm:flex-row">
//                 <div className="flex flex-col flex-1">
//                   <div className="flex items-center w-full gap-x-12 px-6">
//                     <div className="relative mb-3 w-full">
//                       <input
//                         type="text"
//                         className="peer m-0 pr-3 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-transparent bg-clip-padding pl-3 py-4 text-xl font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:autofill:shadow-autofill dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]"
//                         id="floatingInput"
//                         placeholder="نام"
//                         {...register('name')}
//                       />
//                       <label
//                         htmlFor="floatingInput"
//                         className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
//                       >
//                         نام
//                       </label>
//                     </div>
//                   </div>

//                   <div className="flex items-center w-full gap-x-12 px-6">
//                     <div className="relative mb-3 w-full">
//                       <input
//                         type="text"
//                         className="peer m-0 pr-3 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-transparent bg-clip-padding pl-3 py-4 text-xl font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:autofill:shadow-autofill dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]"
//                         id="floatingInput"
//                         placeholder="توضیحات"
//                         {...register('description')}
//                       />
//                       <label
//                         htmlFor="floatingInput"
//                         className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
//                       >
//                         توضیحات
//                       </label>
//                     </div>
//                   </div>

//                   <div className="flex flex-col py-3 items-start gap-4 border mx-6 rounded-lg px-2">
//                     <label htmlFor="isActive" className="flex items-center gap-x-2">
//                       <CustomCheckbox
//                         name="isActive"
//                         checked={isActive}
//                         onChange={handleIsActiveChange}
//                         label="وضعیت نمایش"
//                         customStyle="bg-sky-500"
//                       />
//                     </label>

//                     <label htmlFor="isSlider" className="flex items-center gap-x-2">
//                       <CustomCheckbox
//                         name="isSlider"
//                         checked={isSlider}
//                         onChange={handleIsSliderChange}
//                         label="نمایش در اسلایدر"
//                         customStyle="bg-sky-500"
//                       />
//                     </label>
//                   </div>
//                 </div>
//                 {/* thumbnail  */}
//                 <div className="sm:w-1/3 mt-8 sm:mt-0 flex justify-center w-full">
//                   <div className=" flex flex-col items-center justify-center">
//                     <input
//                       type="file"
//                       className="hidden"
//                       id={`${brand !== undefined ? 'thumbnailBrandUpdate' : 'thumbnailBrandCreate'}`}
//                       onChange={handleMainFileChange}
//                     />
//                     <label
//                       htmlFor={`${brand !== undefined ? 'thumbnailBrandUpdate' : 'thumbnailBrandCreate'}`}
//                       className="block w-fit  rounded-lg cursor-pointer text-sm font-normal"
//                     >
//                       {selectedFile.length === 0 ? (
//                         <img
//                           className="w-[185px] h-[185px] rounded-md"
//                           src="/images/other/product-placeholder.png"
//                           alt="product-placeholder"
//                         />
//                       ) : (
//                         <div className="text-sm shadow-item rounded-lg p-2 text-gray-600">
//                           <img
//                             src={URL.createObjectURL(selectedFile[0])}
//                             alt={selectedFile[0].name}
//                             className="w-[185px] object-contain h-[185px] rounded-md"
//                           />
//                         </div>
//                       )}
//                     </label>
//                     <div className="text-xs mt-3">تصویر</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-col md:flex-row gap-y-4 px-5 py-3 justify-between items-center gap-x-20 bg-[#f5f8fa]">
//                 <div className="flex flex-col">
//                   {formErrors.name && <p className="text-red-500 px-10">{formErrors.name.message}</p>}
//                 </div>
//                 <Button
//                   type="submit"
//                   className={`bg-sky-500 px-5 py-2.5 hover:bg-sky-600 ${
//                     !isValid ? 'bg-gray-300' : 'hover:text-black'
//                   } `}
//                   isLoading={isLoadingCreate || isLoadingUpdate}
//                 >
//                   {title === 'افزودن' ? 'انتشار ' : 'ذخیره'}
//                 </Button>
//               </div>
//             </form>
//           </Modal.Body>
//         </Modal.Content>
//       </Modal>
//     </>
//   )
// }

// export default BrandUpdateModal

 
