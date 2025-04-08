import { IBannerForm, ICategory, IFooterBannerForm } from '@/types'

import { useFormContext } from 'react-hook-form'
import { ControlledCheckbox } from '../ui'
import { useEffect, useState } from 'react'
import { useGetAllCategoriesQuery, useGetCategoriesTreeQuery } from '@/services'
import { useAppDispatch } from '@/hooks'
import { showAlert } from '@/store'
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
interface FooterBannerFormProps {
  banners: IFooterBannerForm[]
  setBanners: React.Dispatch<React.SetStateAction<IFooterBannerForm[]>>
}

const FooterBannerForm: React.FC<FooterBannerFormProps> = ({ banners, setBanners }) => {
  const { control, setValue, getValues, watch } = useFormContext()
  const dispatch = useAppDispatch()
  const [allCategories, setAllCategories] = useState<ICategory[]>([])

  // ? Get Categories Query
  const { categoriesData } = useGetAllCategoriesQuery(
    { pageSize: 999999, isActive: true },
    {
      selectFromResult: ({ data }) => ({
        categoriesData: data?.data,
      }),
    }
  )

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

  useEffect(() => {
    const bannersWithThumbnail = banners.filter((banner) => banner.thumbnail !== null)
    setValue('footerBanners', bannersWithThumbnail)
  }, [banners, setValue])

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    // const newBanners = [...banners]
    // if (e.target.files && e.target.files[0]) {
    //   newBanners[index].thumbnail = e.target.files[0]
    // } else {
    //   newBanners[index].thumbnail = null
    // }
    // setBanners(newBanners)
    const newBanners = [...banners]
    const files = e.target.files

    if (files) {
      const validFiles: any[] = []
      const maxFileSize = 150 * 1024 // 150 KB
      const exactWidth = 1900
      const exactHeight = 350

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
              title: 'حجم عکس ها می بایست حداکثر 150 کیلوبایت باشد',
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
                title: 'سایز عکس ها می بایست 350*1900 پیکسل باشد',
              })
            )
          } else {
            validFiles.push(file)
            newBanners[index].thumbnail = file
            setBanners(newBanners)
          }
        }
      })
    } else {
      newBanners[index].thumbnail = null
      setBanners(newBanners)
    }
  }

  const handleInputChange = (index: number, name: string, value: string) => {
    const newBanners = [...banners]
    newBanners[index].link = value
    setBanners(newBanners)
  }

  const handleRadioChange = (index: number, value: string) => {
    const newBanners = [...banners]
    newBanners[index].type = value
    setBanners(newBanners)
  }

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>, index: number) => {
    const selectedCategoryId = event.target.value
    const newBanners = [...banners]
    newBanners[index].category = selectedCategoryId
    setBanners(newBanners)
  }

  return (
    <div className="flex flex-1">
      <div className="bg-white w-full rounded-md shadow-item">
        <div className="flex justify-between items-center border-b p-5 px-6">
          <h3 className=" text-gray-600 whitespace-nowrap">بنر پایین</h3>
          <ControlledCheckbox name="footerBannersIsActive" control={control} label="وضعیت نمایش" />
        </div>
        <div className="w-full px-6">
          <div className="">
            {banners.map((banner, index) => (
              <div key={index} className="w-full flex rounded-lg justify-between relative py-8">
                <div className="flex gap-4 flex-col justify-center items-center sm:flex-row sm:justify-between sm:items-center w-full">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor={`footer-banner-file-${index}`}
                      className="flex justify-center items-center cursor-pointer text-sm font-normal"
                    >
                      {banner.thumbnail ? (
                        <img
                          src={URL.createObjectURL(banner.thumbnail)}
                          alt="banner Item"
                          className=" h-[125px] object-cover rounded-md"
                        />
                      ) : (
                        <img
                          className="w-[285px] h-[125px] rounded-md"
                          src="/images/other/product-placeholder.png"
                          alt="product-placeholder"
                        />
                      )}
                    </label>
                    <input
                      type="file"
                      id={`footer-banner-file-${index}`}
                      className="hidden"
                      onChange={(e) => handleFileChange(index, e)}
                      accept="image/jpeg"
                    />
                  </div>
                  <div className="flex flex-col items-center sm:items-start lg:items-center gap-2 w-1/2">
                    {/* url link */}
                    <div className="flex gap-3 items-center ">
                      <div className="flex items-center">
                        <input
                          className="focus:ring-1 cursor-pointer"
                          type="radio"
                          id={`footer-banner-link-${banner.id}`}
                          name={`type-${index}`}
                          value="link"
                          checked={banner.type === 'link'}
                          onChange={() => handleRadioChange(index, 'link')}
                        />
                      </div>
                      <div className="relative w-full">
                        <input
                          type="text"
                          placeholder="پیوند"
                          value={banner.link}
                          onChange={(e) => handleInputChange(index, 'link', e.target.value)}
                          className={`peer m-0 block rounded-lg h-[50px] w-full border border-solid ${
                            banner.type !== 'link' ? 'bg-gray-50 border-gray-100' : 'border-gray-300'
                          } bg-clip-padding px-3 py-4 text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:autofill:shadow-autofill dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]`}
                          id="floatingInput"
                          disabled={banner.type !== 'link'}
                        />
                        <label
                          htmlFor="floatingInput"
                          className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
                        >
                          پیوند
                        </label>
                      </div>
                    </div>
                    {/* category url */}
                    <div className="flex gap-3 items-center w-full max-w-[237px]">
                      <div className="flex items-center">
                        <input
                          className="focus:ring-1 cursor-pointer"
                          type="radio"
                          id={`footer-banner-category-${banner.id}`}
                          name={`footer-banner-type-${index}`}
                          value="category"
                          checked={banner.type === 'category'}
                          onChange={() => handleRadioChange(index, 'category')}
                        />
                      </div>
                      <div className="flex flex-1 border w-full rounded-lg">
                        <select
                          className={`w-full h-[50px] cursor-pointer ${
                            banner.type !== 'category' ? 'bg-gray-50 border-gray-100' : 'border-gray-300'
                          } footer-banner-selector text-sm focus:outline-none appearance-none border-none rounded-lg`}
                          name="انتخاب"
                          id="footer-banner-select"
                          value={banner.category !== null ? banner.category : ''}
                          onChange={(e) => handleCategoryChange(e, index)}
                          disabled={banner.type !== 'category'}
                        >
                          <option className="appearance-none text-sm" value="">
                          انتخاب دسته بندی
                          </option>
                          {allCategories?.map((category) => (
                            <option
                              key={category.id}
                              value={category.id}
                              className={category.level === 0 ? 'text-blue-600' : ''}
                            >
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 bottom-0 w-full rounded-b-lg px-8 flex flex-col pb-2">
          <span className="font-normal text-[11px] pt-2">سایز تصویر میبایست 350*1900 پیکسل باشد</span>
          <span className="font-normal text-[11px]">حجم تصویر میبایست حداکثر 150 کیلوبایت باشد</span>
          <span className="font-normal text-[11px]">فرمت عکس می بایست jpg باشد</span>
        </div>
      </div>
    </div>
  )
}

export default FooterBannerForm
