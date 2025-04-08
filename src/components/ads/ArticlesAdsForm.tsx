import { IArticle, IArticleBannerForm, IArticleForm } from '@/types'
import { ControlledCheckbox } from '../ui'
import { useAppDispatch } from '@/hooks'
import { useFormContext } from 'react-hook-form'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { useGetArticlesQuery } from '@/services'
import { ArticleCombobox } from '../selectorCombobox'
import { useEffect, useState } from 'react'

interface ArticleFormProps {
  articleBanners: IArticleBannerForm[]
  setArticleBanners: React.Dispatch<React.SetStateAction<IArticleBannerForm[]>>
}

const ArticlesAdsForm: React.FC<ArticleFormProps> = ({ articleBanners, setArticleBanners }) => {
  const { control, setValue, getValues, watch } = useFormContext()
  const [selectedArticles, setSelectedArticles] = useState<(IArticle | null)[]>([])

  const {
    data: articleData,
    isLoading: isLoadingArticle,
    isError: isErrorArticle,
  } = useGetArticlesQuery({
    page: 1,
    pageSize: 99999,
  })

  useEffect(() => {
    if (articleBanners.length > 0 && articleData?.data?.data) {
      const initializedSelectedArticles = articleBanners.map(
        (articleBanner) => articleData?.data?.data?.find((article) => article.id === articleBanner.articleId) || null
      )
      setSelectedArticles(initializedSelectedArticles)
    }
  }, [articleBanners, articleData])

  useEffect(() => {
    // const articleBannerWithId = articleBanners.filter((banner) =>  banner.id !== '')
    console.log(articleBanners, 'articleBanners -- articleBanners', articleBanners, 'articleBannerWithId')
    setValue('articleBanners', articleBanners)
  }, [articleBanners, setValue])

  const handleArticleSelect = (article: IArticle, index: number) => {
    if (!article) return

    const updatedSelectedArticles = [...selectedArticles]
    const updatedArticleBanners = [...articleBanners]

    if (article.title === 'انتخاب کنید') {
      updatedArticleBanners[index] = { ...updatedArticleBanners[index], articleId: '' }
    } else {
      updatedSelectedArticles[index] = article
      updatedArticleBanners[index] = { ...updatedArticleBanners[index], articleId: article.id }
    }

    setSelectedArticles(updatedSelectedArticles)
    setArticleBanners(updatedArticleBanners)
  }

  return (
    <div className="flex flex-1">
      <div className="bg-white w-full rounded-md shadow-item">
        <div className="flex justify-between items-center border-b p-5 px-6">
          <h3 className=" text-gray-600 whitespace-nowrap"> مقالات</h3>
          <ControlledCheckbox name="articleBannersIsActive" control={control} label="وضعیت نمایش" />
        </div>
        <div className="px-2 sm:px-4 md:px-8 grid sm:grid-cols-2 gap-4 py-6 justify-center">
          {articleBanners.map((articleBanner, index) => (
            <div className='w-full flex justify-center' key={index} >
              <div className="flex w-2/3 flex-col justify-center items-center gap-3">
                <span className="text-center">بنر {digitsEnToFa(articleBanner.index)}</span>
                <ArticleCombobox
                  articles={articleData?.data?.data ?? []}
                  selectedArticle={selectedArticles[index]}
                  setSelectedArticle={(article) => handleArticleSelect(article as IArticle, index)}
                  onArticleSelect={(article) => handleArticleSelect(article as IArticle, index)}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 bottom-0 w-full rounded-b-lg px-8 flex flex-col pb-2">
          <span className="font-normal text-[11px]  pt-2">مقاله مورد نظر رابرای نمایش در صفحه اصلی انتخاب کنید</span>
        </div>
      </div>
    </div>
  )
}

export default ArticlesAdsForm
