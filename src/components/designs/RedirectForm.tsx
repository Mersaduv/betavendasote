import { useGetArticlesQuery } from '@/services'
import { IRedirect } from '@/types'
import { Controller, useFormContext } from 'react-hook-form'

interface Props {
  articleRedirect: IRedirect
  setArticleRedirect: React.Dispatch<React.SetStateAction<IRedirect>>
}
const RedirectForm: React.FC = () => {
  const { control, setValue } = useFormContext()
  const {
    data: articleData,
    isError,
    isFetching,
    isSuccess,
    refetch,
  } = useGetArticlesQuery({
    pageSize: 9999,
    isActive: true,
  })

  const handleArticleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedArticleId = event.target.value
    setValue('redirect.articleId', selectedArticleId)
  }

  return (
    <div className="flex flex-1">
      <div className="bg-white flex flex-col justify-between w-full rounded-md shadow-item">
        <div>
          <div className="flex justify-between items-center border-b p-5 px-6">
            <h3 className=" text-gray-600 whitespace-nowrap">ریدایرکت </h3>
          </div>
          <div className="flex flex-col sm:flex-row px-20 py-8 gap-4">
            <div className="sm:w-[80%] flex items-center justify-start pr-20">قوانین و حریم خصوصی</div>

            <div className="flex flex-col items-start p-1 w-full">
              <div className="flex flex-col gap-2 w-full">
                {/* category url */}
                <div className="flex gap-3 items-center">
                  <div className="flex border w-full rounded-lg">
                    <Controller
                      name="redirects.articleId"
                      control={control}
                      render={({ field }) => (
                        <select
                          className={`w-full h-[40px] cursor-pointer border-gray-200 text-sm focus:outline-none appearance-none border-none rounded-md`}
                          {...field}
                          onChange={(event) => {
                            field.onChange(event)
                            handleArticleChange(event)
                          }}
                        >
                          <option className="appearance-none text-sm" value="">
                            انتخاب کنید
                          </option>
                          {articleData?.data?.data?.map((article) => (
                            <option key={article.id} value={article.id}>
                              {article.title}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50  w-full rounded-b-lg px-8 py-2">
          <span className="font-normal text-[11px] pt-2">از بین مقالات, ریدایرکت مورد نظر را انتخاب کنید</span>
        </div>
      </div>
    </div>
  )
}

export default RedirectForm
