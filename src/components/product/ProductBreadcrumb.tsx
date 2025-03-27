import { useAppSelector } from '@/hooks'
import type { CategoryWithAllParents, ICategory, ICategoryLevel, IProduct } from '@/types'
import Link from 'next/link'

interface Props {
  categoryLevels?: CategoryWithAllParents
  categoryLevelProductList?: ICategory
  isAdmin?: boolean
  isAdminTable?: boolean
  isSelector?: boolean
}

const ProductBreadcrumb: React.FC<Props> = ({
  categoryLevels,
  isAdmin,
  isSelector,
  categoryLevelProductList,
  isAdminTable,
}) => {
  const { generalSetting } = useAppSelector((state) => state.design)
  // ? Render(s)
  return (
    <>
      {isSelector ? (
        <div className={` ${isAdmin ? '' : 'pr-2 '}flex items-center`}>
          {categoryLevels?.parentCategories
            ?.filter((x) => x.level !== 0)
            .map((category, index) => (
              <div key={category.id}>
                <Link
                  href={`/products?categorySlug=${category.slug}`}
                  className="inline-block p-1 text-sm text-gray-500 font-light"
                >
                  {category.name}
                </Link>
                {index < categoryLevels.parentCategories.length - 1 && '>'}
              </div>
            ))}

          <div>
            <Link
              href={`/products?categorySlug=${categoryLevels?.category.slug}`}
              className="inline-block p-1 text-sm text-gray-500 font-light"
            >
              {categoryLevels?.category.name}
            </Link>
          </div>
        </div>
      ) : (
        <div className={` ${isAdmin ? '' : 'pr-2 '}flex items-center`}>
          {!isAdmin && (
            <>
              {' '}
              <Link href="/" className="inline-block font-light p-1 text-sm text-[#00c3e1]">
                {generalSetting?.title}
              </Link>
              {'>'}
            </>
          )}

          {isAdminTable ? (
            <>
              {categoryLevels?.parentCategories?.map((category, index) => (
                <div key={category.id}>
                  <Link
                    href={`/products?categorySlug=${category.slug}&categoryId=${category.id}`}
                    className="inline-block p-1 text-sm text-[#00c3e1] font-light"
                  >
                    {category.name}
                  </Link>
                  {index < categoryLevels?.parentCategories?.length - 1 && '>'}
                </div>
              ))}
              {categoryLevels?.parentCategories?.length !== 0 && '>'}

              <div>
                <Link
                  href={`/products?categorySlug=${categoryLevels?.category?.slug}&categoryId=${categoryLevels?.category?.id}`}
                  className="inline-block p-1 text-sm text-[#00c3e1] font-light"
                >
                  {categoryLevels?.category?.name}
                </Link>
              </div>
            </>
          ) : (
            <>
              {categoryLevelProductList?.parentCategories?.map((category, index) => (
                <div key={category.id}>
                  <Link
                    href={`/products?categorySlug=${category.slug}&categoryId=${category.id}`}
                    className="inline-block p-1 text-sm text-[#00c3e1] font-light"
                  >
                    {category.name}
                  </Link>
                  {categoryLevelProductList?.parentCategories && index < categoryLevelProductList?.parentCategories?.length - 1 && '>'}
                </div>
              ))}
              {categoryLevels?.parentCategories?.length !== 0 && '>'}

              <div>
                <Link
                  href={`/products?categorySlug=${categoryLevelProductList?.slug}&categoryId=${categoryLevelProductList?.id}`}
                  className="inline-block p-1 text-sm text-[#00c3e1] font-light"
                >
                  {categoryLevelProductList?.name}
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default ProductBreadcrumb
