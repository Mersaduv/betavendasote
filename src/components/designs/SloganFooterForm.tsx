
import { useFormContext, Controller } from 'react-hook-form'
import { useState } from 'react'
import dynamic from 'next/dynamic'
const CustomEditor = dynamic(() => import('@/components/form/TextEditor'), { ssr: false })
const SloganFooterForm: React.FC = () => {
  const { control } = useFormContext()
  // ? States
  const [content, setContent] = useState<string>('')
  return (
    <div className="flex flex-1">
      <div className="bg-white w-full rounded-md shadow-item">
        <div className="flex justify-between items-center border-b p-6">
          <h3 className=" text-gray-600 whitespace-nowrap">شعار فوتر</h3>
        </div>
        <div className="flex flex-col xs:flex-row px-[18px] py-2 pt-6">
          <Controller
            name="sloganFooter.headline"
            control={control}
            render={({ field }) => (
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="تیتر"
                  {...field}
                  className={`peer m-0 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-clip-padding px-3 py-4 text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]`}
                  id="floatingTitle"
                />
                <label
                  htmlFor="floatingTitle"
                  className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
                >
                  تیتر
                </label>
              </div>
            )}
          />
        </div>
        <Controller
          name="sloganFooter.introductionText"
          control={control}
          render={({ field }) => (
            <CustomEditor
              value={field.value}
              onChange={(event: any, editor: any) => {
                console.log(field , "fieldfieldfieldfield");
                
                const data = editor.getData()
                field.onChange(data)
              }}
              placeholder=""
            />
          )}
        />
      </div>
    </div>
  )
}

export default SloganFooterForm
