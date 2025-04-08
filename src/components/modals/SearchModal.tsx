import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

import { truncate } from '@/utils'

// import { useGetProductsQuery } from '@/services'

import { useDebounce, useDisclosure } from '@/hooks'

import { Close, Search } from '@/icons'
import { EmptySearchList } from '@/components/emptyList'
// import { ProductDiscountTag, ProductPriceDisplay } from '@/components/product'
// import { DataStateDisplay } from '@/components/shared'
import { Modal, ResponsiveImage } from '@/components/ui'
import { useGetProductsQuery } from '@/services'
import { DataStateDisplay } from '../shared'
import { ProductDiscountTag, ProductPriceDisplay } from '../product'

interface Props {}

const SearchModal: React.FC<Props> = (props) => {
  // ? Assets
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [isShowSearchModal, searchModalHanlders] = useDisclosure()
  const [isShowSearchInput, setIsShowSearchInput] = useState(false)
  const debouncedSearch = useDebounce(search, 1200)
  const searchInputRef = useRef<HTMLDivElement>(null)
  // ? Search Products Query
  const { data, ...productQueryProps } = useGetProductsQuery(
    {
      search,
    },
    { skip: !debouncedSearch }
  )

  // ? Re-Renders
  //* Reset Search
  useEffect(() => {
    if (!isShowSearchModal) {
      setSearch('')
    }
  }, [isShowSearchModal])

  //* Use useEffect to set focus after a delay when the modal is shown
  useEffect(() => {
    if (isShowSearchModal) {
      const timeoutId = setTimeout(() => {
        searchRef.current?.focus()
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [isShowSearchModal])

  // ? Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleRemoveSearch = () => {
    setSearch('')
  }
  useEffect(() => {
    if (isShowSearchInput && searchRef.current) {
      searchRef.current.focus() // فوکوس کردن بر روی input
    }
  }, [isShowSearchInput])
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
  //       setIsShowSearchInput(false)
  //     }
  //   }

  //   document.addEventListener('mousedown', handleClickOutside)

  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside)
  //   }
  // }, [])
  // ? Render(s)
  return (
    <>
    {isShowSearchInput && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsShowSearchInput(false)}
        />
      )}
      <div className={`sm:w-2/3 w-full border relative rounded-md ${isShowSearchInput ? 'rounded-b-none' : ''} `}>
        {/* input   */}
        {isShowSearchInput ? (
          <div ref={searchInputRef} className="w-full rounded-md rounded-b-none px-3 pb-2 bg-white shadow-item relative z-20">
            <div className="flex flex-row-reverse  border-b border-blue-300 w-full ">
              <input
                type="text"
                placeholder="جستجو"
                className="input grow placeholder:text-sm  pr-0 bg-transparent text-right focus:outline-none border-none focus:ring-0"
                ref={searchRef}
                value={search}
                onChange={handleChange}
              />
              <Search className="icon m-2 ml-2 mr-0 text-gray-500" />
            </div>
            <div className="absolute shadow-searchModal h-[500px] overflow-auto rounded-md rounded-t-none sm:top-12 right-0 left-0 bg-white w-full border border-gray-200   border-t-0 p-3 ">
              <DataStateDisplay
                {...productQueryProps}
                dataLength={data ? data.data?.productsLength! : 0}
                emptyComponent={<EmptySearchList />}
              >
                <div className="space-y-3 divide-y px-4 py-3">
                  {data?.data?.productsLength &&
                    data?.data?.productsLength > 0 &&
                    search.length > 0 &&
                    data?.data?.pagination?.data?.map((item) => (
                      <article key={item.id} className="py-2">
                        <Link href={`/products/${item.slug}`} onClick={() => searchModalHanlders.close()}>
                          <ResponsiveImage
                            dimensions="w-20 h-20"
                            src={item.mainImageSrc.imageUrl}
                            blurDataURL={item.mainImageSrc.placeholder}
                            alt={item.title}
                            imageStyles="object-contain"
                          />
                          <span className="py-2 text-sm">{truncate(item.title, 70)}</span>
                          <div className="flex justify-between">
                            <div>
                              {/* {item.stockItems[0].discount! > 0 && <ProductDiscountTag price={item.stockItems[0].price ?? 0} discount={item.stockItems[0].discount ?? 0} />} */}
                            </div>
                            <ProductPriceDisplay
                              inStock={item.inStock}
                              discount={item.stockItems[0].discount ?? 0}
                              price={item.stockItems[0].price ?? 0}
                            />
                          </div>
                        </Link>
                      </article>
                    ))}
                </div>
              </DataStateDisplay>
              {/* <EmptySearchList /> */}
              تاریخچه جستجو ..
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsShowSearchInput(true)}
            className="flex w-full cursor-text  z-0  rounded-md bg-zinc-200/80 items-center transition duration-700 ease-in-out"
          >
            <Search className="icon m-2 text-gray-500" />
            <div className="text-sm text-gray-600">جستجو</div>
          </button>
        )}
      </div>
    </>
  )
}

export default SearchModal
