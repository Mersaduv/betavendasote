import { ITextMarqueeForm } from '@/types'
import { profileFormSchema, textMarqueeSchema } from '@/utils'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'

import { useFormContext, Controller } from 'react-hook-form'
import { ControlledCheckbox } from '../ui'
import dynamic from 'next/dynamic'
const CustomEditor = dynamic(() => import('@/components/form/TextEditor'), { ssr: false })
const CopyrightForm: React.FC = () => {
  const { control } = useFormContext()

  return (
    <div className="flex flex-1">
      <div className="bg-white flex flex-col justify-between w-full rounded-md shadow-item">
        <div>
          <div className="flex justify-between items-center border-b p-5 px-6">
            <h3 className=" text-gray-600 whitespace-nowrap">کپی رایت</h3>
          </div>
          <div className="flex flex-col  py-10 pt-6 gap-4">
            <Controller
              name="copyright.name"
              control={control}
              render={({ field }) => (
                <div className="relative px-[18px] w-full">
                  <input
                    type="text"
                    placeholder="کپی رایت"
                    {...field}
                    className={`peer m-0 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-clip-padding px-3 py-4 text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] `}
                    id="floatingCopyright"
                  />
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CopyrightForm
