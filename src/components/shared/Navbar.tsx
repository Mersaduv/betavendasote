import { useEffect, useState } from 'react'
import Link from 'next/link'

import { useGetCategoriesQuery } from '@/services'
import { BiCategory } from 'react-icons/bi'

import { ArrowDown, ArrowLeft, Bars } from '@/icons'
import { NavbarSkeleton } from '@/components/skeleton'
import { ResponsiveImage } from '@/components/ui'

import type { ICategory } from '@/types'

// export default function Navbar() {
//   // ? Get Categories Query
//   const { categories, isLoading } = useGetCategoriesQuery(undefined, {
//     selectFromResult: ({ data, isLoading }) => ({
//       categories: data?.data?.categoryDTO,
//       isLoading,
//     }),
//   })

//   // ? State
//   const [activeMinCat, setActiveMinCat] = useState<ICategory>({} as ICategory)
//   const [hover, setHover] = useState(false)

//   // ? Handlers
//   const handleActive = (cat: ICategory) => {
//     setActiveMinCat(cat)
//   }
//   const hanldeDeactive = () => {
//     if (categories) setActiveMinCat(categories.filter((category) => category.level === 0)[0])
//   }

//   // ? Re-Renders
//   useEffect(() => {
//     if (categories) setActiveMinCat(categories?.filter((category) => category.level === 0)[0])
//   }, [categories])
//   if (categories) {
//     // console.log(categories)
//   }
//   // ? Render
//   return (
//     <div className="group hidden lg:block">
//       <button
//         className="flex-center gap-x-1 px-2 text-sm"
//         onMouseOver={() => setHover(true)}
//         onMouseLeave={() => setHover(false)}
//       >
//         <BiCategory className="icon" />
//         دسته‌بندی کالاها
//       </button>
//       <div className={`fixed left-0 z-20 h-screen w-full bg-gray-400/50 ${hover ? 'block' : 'hidden'}`} />

//       <div
//         className="absolute top-8 z-40 hidden w-full rounded-md border border-gray-100 bg-white shadow-lg group-hover:block"
//         onMouseOver={() => setHover(true)}
//         onMouseLeave={() => {
//           hanldeDeactive()
//           setHover(false)
//         }}
//       >
//         <div className="flex">
//           <ul className="w-72 border-l-2 border-gray-100">
//             {isLoading ? (
//               <NavbarSkeleton />
//             ) : categories ? (
//               categories
//                 .filter((category) => category.level === 0)
//                 .map((levelOneCategory) => (
//                   <li
//                     key={levelOneCategory.id}
//                     className="group w-full px-2 py-0.5 text-sm hover:bg-gray-100"
//                     onMouseOver={() => handleActive(levelOneCategory)}
//                   >
//                     <Link href={`/main/${levelOneCategory.slug}`} className="flex items-center gap-x-1.5 p-3">
//                       <ResponsiveImage
//                         dimensions="w-7 h-7"
//                         className="grayscale"
//                         src={levelOneCategory.imagesSrc?.imageUrl!}
//                         blurDataURL={levelOneCategory.imagesSrc?.placeholder}
//                         alt={levelOneCategory.name}
//                       />

//                       <span className="text-base font-normal">{levelOneCategory.name}</span>
//                     </Link>
//                   </li>
//                 ))
//             ) : null}
//           </ul>
//           <ul className="flex w-full flex-wrap gap-10  py-4 bg-gray-100">
//             {isLoading
//               ? null
//               : activeMinCat
//               ? categories?.map((levelTwoCategory) => {
//                   if (levelTwoCategory.parentCategoryId === activeMinCat.id) {
//                     return (
//                       <li key={levelTwoCategory.id} className="h-fit ">
//                         <Link
//                           href={`/products?category=${levelTwoCategory.slug}`}
//                           className="flex items-center justify-start mb-1 border-r-2 hover:text-[#e90089] border-[#e90089] px-1 text-sm font-semibold tracking-wider text-gray-700"
//                         >
//                           <ArrowDown className="text-3xl -ml-1" />
//                           {levelTwoCategory.name}
//                         </Link>
//                         <ul className="space-y-1">
//                           {categories
//                             .filter((category) => category.parentCategoryId === levelTwoCategory.id)
//                             .map((levelThreeCategory) => (
//                               <li className='w-full' key={levelThreeCategory.id}>
//                                 <Link
//                                   href={`/products?category=${levelThreeCategory.slug}`}
//                                   className="w-full px-4 hover:text-[#e90089] text-xs font-medium text-gray-700"
//                                 >
//                                   {levelThreeCategory.name}
//                                 </Link>
//                               </li>
//                             ))}
//                         </ul>
//                       </li>
//                     )
//                   } else return null
//                 })
//               : null}
//           </ul>
//         </div>
//       </div>
//     </div>
//   )
// }

export default function Navbar() {
  // ? Get Categories Query
  const { categories, isLoading } = useGetCategoriesQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({
      categories: data?.data?.categoryDTO,
      isLoading,
    }),
  })

  // ? State
  const [activeMinCat, setActiveMinCat] = useState<ICategory>({} as ICategory)
  const [hover, setHover] = useState(false)

  // ? Handlers
  const handleActive = (cat: ICategory) => {
    setActiveMinCat(cat)
  }
  const hanldeDeactive = () => {
    if (categories) {
      const defaultCategory = categories.find((category) => category.level === 0)
      if (defaultCategory) setActiveMinCat(defaultCategory)
    }
  }

  // ? Re-Renders
  useEffect(() => {
    if (categories) {
      const defaultCategory = categories.find((category) => category.level === 0)
      if (defaultCategory) setActiveMinCat(defaultCategory)
    }
  }, [categories])

  // Recursive function to render categories dynamically
  const renderCategoryList = (parentCategoryId: string | undefined) => {
    return categories
      ?.filter((category) => category.parentCategoryId === parentCategoryId)
      .map((category) => (
        <li key={category.id}>
          <Link
            href={`/products?categorySlug=${category.slug}&categoryId=${category.id}`}
            className={`flex items-center justify-start mb-2 hover:text-[#e90089] text-sm font-semibold text-gray-700 ${
              category.level >= 2 ? 'text-xs' : ''
            }`}
            >
            {category.name}
            {category.level >= 2 ? null : <ArrowDown className="text-3xl -ml-1" />}
          </Link>
          <ul className="space-y-1">{renderCategoryList(category.id)}</ul>
        </li>
      ))
  }

  // ? Render
  return (
    <div className="group hidden lg:block">
      <button
        className="flex-center gap-x-1 px-2 text-sm py-3"
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <BiCategory className="text-[20px] text-gray-500 opacity-65" />
        دسته‌بندی کالاها
      </button>
      <div className={`fixed left-0 z-20 h-screen w-full  ${hover ? 'block' : 'hidden'}`} />

      <div
        className="absolute top-8 z-40 hidden w-full rounded-md border border-gray-100 bg-white shadow-lg group-hover:block"
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => {
          hanldeDeactive()
          setHover(false)
        }}
      >
        <div className="flex">
          <ul className="w-72 border-l-2 border-gray-100">
            {isLoading ? (
              <NavbarSkeleton />
            ) : (
              categories &&
              categories
                .filter((category) => category.level === 0)
                .map((levelOneCategory) => (
                  <li
                    key={levelOneCategory.id}
                    className="group w-full px-2 py-0.5 text-sm hover:bg-gray-100"
                    onMouseOver={() => handleActive(levelOneCategory)}
                  >
                    <Link href={`/products?categorySlug=${levelOneCategory.slug}&categoryId=${levelOneCategory.id}`} className="flex items-center gap-x-1.5 p-3">
                      <ResponsiveImage
                        dimensions="w-7 h-7"
                        className="grayscale"
                        src={levelOneCategory.imagesSrc?.imageUrl!}
                        blurDataURL={levelOneCategory.imagesSrc?.placeholder}
                        alt={levelOneCategory.name}
                      />
                      <span className="text-base font-normal">{levelOneCategory.name}</span>
                    </Link>
                  </li>
                ))
            )}
          </ul>
          <ul className="flex w-full flex-wrap gap-10 py-4 bg-gray-100 pr-4">
            {isLoading ? null : categories && activeMinCat && renderCategoryList(activeMinCat.id)}
          </ul>
        </div>
      </div>
    </div>
  )
}
