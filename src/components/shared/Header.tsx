import { Logo, Question, Search } from '@/icons'
import Link from 'next/link'

// import { Logo, Question } from "@/icons";
import { SearchModal } from '@/components/modals'
import { UserAuthLinks } from '@/components/user'
import { CartDisplay } from '@/components/cart'
import { Sidebar, Navbar } from '@/components/shared'
import { useEffect, useState } from 'react'
import TextMarquee from '../ui/TextMarquee'
import { useAppSelector } from '@/hooks'
import { useGetDesignItemsQuery, useGetNotificationsQuery, useGetStoreCategoriesQuery } from '@/services'
import { IoNotificationsOutline } from 'react-icons/io5'
const Header = () => {
  const [isShowSearch, setIsShowSearch] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { logoImages } = useAppSelector((state) => state.design)

  const {
    data: designItemsData,
    isLoading: isLoadingDesignItems,
    isError: isErrorDesignItems,
  } = useGetDesignItemsQuery()

  const { data: notificationData } = useGetNotificationsQuery({
    pageSize: 9999,
    isRead: 'false',
  })

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 0)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <TextMarquee />
      <header className="bg-white shadow xl:inset-x-0 top-0 sticky w-full z-[101] transition duration-700 ease-in-out">
        {/* Tablet and Desktop */}
        <div className="px-4 flex flex-col items-center z-50 bg-white">
          <div className="container mx-10 hidden sm:block z-[99] items-center max-w-[1700px] lg:flex lg:py-2 w-full bg-white">
            <div className="inline-flex w-full items-center justify-between border-b lg:ml-8 lg:max-w-min lg:border-b-0">
              <Sidebar />
              <Link className="w-32 md:w-52" passHref href="/">
                <img
                  width={250}
                  src={(logoImages?.orgImage && logoImages?.orgImage.imageUrl) || ''}
                  alt="online shop"
                />
              </Link>
              <Question className="icon lg:hidden" />
            </div>
            <div className="inline-flex w-full items-center justify-between gap-x-10 border-b py-2 lg:border-b-0">
              <div className="flex grow gap-x-7 lg:justify-center">
                <SearchModal />
              </div>
              <div className="inline-flex items-center gap-x-4">
                <div className="flex gap-4 items-center">
                  <Link href={`/profile/notifications`} className="relative dropdown__button cursor-pointer">
                    {notificationData?.data?.totalCount === 0 ? null : (
                      <span className="farsi-digits absolute bottom-[22px] left-5 h-5 w-5 rounded-md bg-[#e90089] p-0.5 text-center text-xs text-white outline outline-2">
                        {notificationData?.data?.totalCount}
                      </span>
                    )}

                    <IoNotificationsOutline className="icon h-6 w-6 text-gray-500" />
                  </Link>
                  <CartDisplay />
                </div>
                <span className="hidden h-8 w-0.5 bg-gray-300 lg:block" />
                <UserAuthLinks />
              </div>
            </div>
          </div>
          <nav
            className={`relative gap-8 flex max-w-[1700px] justify-start w-full transition-all duration-500 ease-in-out ${
              isScrolled ? 'translate-y-[-100%] h-0 opacity-0' : 'sm:translate-y-0  sm:h-14'
            }`}
          >
            <Navbar />
            <div className="gap-8 hidden lg:flex">
              {designItemsData &&
                designItemsData.data
                  ?.filter((item) => item.type === 'lists')
                  .map((designItem) => {
                    return (
                      <a
                        className="flex gap-2 border-[#e90089] hover:border-b-2 cursor-pointer py-3"
                        key={designItem.id}
                        href={designItem.link}
                      >
                        <div>
                          <img
                            className="w-5 h-5 rounded-lg opacity-55"
                            src={designItem.image.imageUrl}
                            alt={designItem.title}
                          />
                        </div>
                        <div className="text-sm">{designItem.title}</div>
                      </a>
                    )
                  })}
            </div>
          </nav>

          {/* mobile  */}
          <div className="container block sm:hidden z-[99] items-center max-w-[1700px] py-2 pb-1 transition duration-700 ease-in-out">
            <div className="inline-flex w-full items-center justify-between">
              <div className="flex gap-x-3">
                <Sidebar />
                <Search
                  onClick={() => setIsShowSearch((prev) => !prev)}
                  className="icon m-2 cursor-pointer z-50 text-gray-500"
                />
              </div>
              <Link className="w-24 md:w-52" passHref href="/">
                <img width={250} src={'/logo/Logo.png'} alt="Venda Mode" />
              </Link>
              <div className=" inline-flex items-center gap-x-4">
                <CartDisplay />
                <span className="hidden h-8 w-0.5 bg-gray-300 lg:block" />
                <UserAuthLinks />
              </div>
            </div>
            <div className={`${isShowSearch ? '-mt-0' : '-mt-6'} `}>
              <div
                className={`inline-flex w-full items-center justify-between gap-x-10 border-b py-2 lg:border-b-0 transition-all duration-700 ease-in-out ${
                  isShowSearch ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0  overflow-hidden'
                }`}
              >
                <div className="flex pl-2 sm:pl-0 grow gap-x-7 lg:mr-8 w-full">
                  <SearchModal />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
