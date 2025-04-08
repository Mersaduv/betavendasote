import { ITextMarqueeForm } from '@/types'
import { profileFormSchema, textMarqueeSchema } from '@/utils'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'

import { useFormContext, Controller } from 'react-hook-form'
import { ControlledCheckbox } from '../ui'

const GeneralSettingForm: React.FC = () => {
  const { control } = useFormContext()

  return (
    <div className="flex flex-1">
      <div className="bg-white flex flex-col justify-between w-full rounded-md shadow-item">
        <div>
          <div className="flex justify-between items-center border-b p-5 px-6">
            <h3 className=" text-gray-600 whitespace-nowrap">معرفی سایت</h3>
          </div>
          <div className="flex flex-col px-10 py-10 pt-6 gap-4">
            <Controller
              name="generalSetting.title"
              control={control}
              render={({ field }) => (
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="نام سایت"
                    {...field}
                    className={`peer m-0 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-clip-padding px-3 py-4 text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]`}
                    id="floatingTitle"
                  />
                  <label
                    htmlFor="floatingTitle"
                    className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
                  >
                    نام سایت
                  </label>
                </div>
              )}
            />

            <Controller
              name="generalSetting.shortIntroduction"
              control={control}
              render={({ field }) => (
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="معرفی کوتاه"
                    {...field}
                    className={`peer m-0 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-clip-padding px-3 py-4 text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]`}
                    id="floatingIntroduction"
                  />
                  <label
                    htmlFor="floatingIntroduction"
                    className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
                  >
                    معرفی کوتاه
                  </label>
                </div>
              )}
            />

            <Controller
              name="generalSetting.googleTags"
              control={control}
              render={({ field }) => (
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="تگ کنسول گوگل"
                    {...field}
                    className={`peer m-0 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-clip-padding px-3 py-4 text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]`}
                    id="floatingGoogleTags"
                  />
                  <label
                    htmlFor="floatingGoogleTags"
                    className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
                  >
                    تگ کنسول گوگل
                  </label>
                </div>
              )}
            />
          </div>
        </div>
        <div className="bg-gray-50 h-[56px] w-full rounded-b-lg px-8 flex flex-col ">
          <span className="font-normal text-[11px] pt-2">اطلاعات مربوط به سایت را وارد کنید</span>
        </div>
      </div>
    </div>
  )
}

export default GeneralSettingForm
