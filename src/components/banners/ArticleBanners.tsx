import { ResponsiveImage } from '@/components/ui'
import { useGetAllArticleBannersQuery, useGetArticlesQuery } from '@/services'

import type { IArticle, IBanner } from '@/types'
import Link from 'next/link'
import { useMemo } from 'react'
const ArticleBanners: React.FC = () => {
  const {
    data: articleBannerData,
    isLoading: isLoadingArticleBanner,
    isError: isErrorArticleBanner,
  } = useGetAllArticleBannersQuery()

  const {
    data: articlesData,
    isLoading: isLoadingArticle,
    isError: isErrorArticle,
  } = useGetArticlesQuery({
    pageSize: 9999,
  })

  const articleBannerSort = useMemo(() => {
    if (!articleBannerData?.data) return []
    return [...articleBannerData.data].sort((a, b) => a.index - b.index)
  }, [articleBannerData])

  const articleSlugMap = useMemo<Record<string, string>>(() => {
    if (!articlesData?.data?.data) return {} as Record<string, string>
    return articlesData.data?.data?.reduce((acc: Record<string, string>, article: IArticle) => {
      acc[article.id] = article.slug
      return acc
    }, {} as Record<string, string>)
  }, [articlesData])

  const getArticleSlugById = (articleId: string): string => {
    return articleSlugMap[articleId] || 'اسلک موجود نیست'
  }

  if (!articleBannerSort.length || articleBannerSort.filter((x) => x.isActive).length === 0) return null

  return (
    <>
      <div className="grid max-w-[1370px] grid-cols-1 xs2:grid-cols-2 gap-4 justify-center px-4 mx-auto">
        {articleBannerSort.slice(0, 4).map((articleBanner, index) => (
          <Link href={`/articles/${getArticleSlugById(articleBanner.articleId)}`} className="relative" key={articleBanner.id}>
            <div
              className={`rounded-lg p-[13px]  absolute bottom-[30px] ${
                index % 2 === 0 ? 'right-0 rounded-r-none' : 'left-0 rounded-l-none'
              } bg-[#f7f7f5] shadow-article-banner${index % 2 === 0 ? '' : '-l'}`}
            >
              <div className="line-clamp-1 overflow-hidden text-ellipsis max-w-96">{articleBanner.title}</div>
            </div>
            <img
              className="h-auto max-w-full rounded-lg shadow-item"
              src={articleBanner.imagesSrc?.imageUrl}
              alt={articleBanner.title}
            />
          </Link>
        ))}
      </div>
      <hr className="pb-0 mx-8 border-t-2 mt-20" />
    </>
  )
}

export default ArticleBanners
