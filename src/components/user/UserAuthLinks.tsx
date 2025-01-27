import Link from 'next/link'
import { useRouter } from 'next/router'
import { Login, User } from '@/icons'
import { LogoutButton, UserMenuDropdown } from '@/components/user'
import { Skeleton } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { Disclosure } from '@headlessui/react'
import useDisclosure from '@/hooks/useDisclosure'
import { useEffect } from 'react'
import { useGetCategoriesQuery } from '@/services'
import { SidebarSkeleton } from '@/components/skeleton'
import { ArrowDown, ArrowLeft, Bars, LogoPersian } from '@/icons'
import { BiBasket, BiCategory, BiHeart, BiLogOut, BiUser } from 'react-icons/bi'
import { AiOutlineProduct } from 'react-icons/ai'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { user2, user3 } from '@/icons'
const UserAuthLinks = () => {
  const { asPath } = useRouter()
  const dispatch = useAppDispatch()

  const [isSidebar, sidebarHandlers] = useDisclosure()

  // ? Get UserInfo
  const { userInfo } = useAppSelector((state) => state.auth)
  // ? Render(s)
  if (!userInfo) {
    return (
      <Link href={`/authentication/login?redirectTo=${asPath}`} className="flex-center gap-x-1 p-1 py-2 z-50">
        <div className="flex-center gap-x-2 lg:rounded-xl lg:border lg:border-[#e90089] lg:px-3 lg:py-1.5">
          <Login className="text-2xl rotate-180 text-gray-500  ml-3 sm:ml-0" />
          <span className="text-sm hidden sm:block font-medium">ورود</span>
        </div>
      </Link>
    )
  } else if (userInfo) {
    return (
      <div className="sm:border rounded-lg z-[100]">
        <div
          onClick={sidebarHandlers.open}
          className="lg:hidden px-2  sm:px-3 py-1 hover:shadow rounded-lg cursor-pointer"
        >
          {/* <Link href="/profile">
            <User className="icon h-7 w-7" />
          </Link> */}
          <div className="">
            <User className="icon h-6 w-6 text-gray-500" />
          </div>
          <div
            className={`fixed top-0 z-10 h-screen w-full duration-200 lg:hidden ${
              isSidebar ? 'left-0' : '-left-full'
            } `}
          >
            <div
              className={`${
                isSidebar ? 'visible opacity-100 delay-200 duration-300' : 'invisible opacity-0 '
              } z-10  h-full w-full bg-gray-100/50`}
              onClick={sidebarHandlers.close}
            />

            <div className="absolute left-0 top-0 z-20 h-screen w-3/4 max-w-sm space-y-4 overflow-y-auto bg-white pb-4">
              {/* <LogoPersian className="mr-3 h-10 w-28" /> */}
              <div className="h-[150px] flex flex-col justify-center items-center bg-gray-100">
                <div>
                  {' '}
                  <div className="border-2 inline-block rounded-full p-1">
                    <img className="w-14" src={user3.src} alt="user2" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <h2>{userInfo.fullName}</h2>
                  <span className="text-base"> {digitsEnToFa(userInfo.mobileNumber ?? '')}</span>
                </div>
              </div>
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="!mt-0 flex w-full items-center justify-between px-4 py-2 pb-0">
                      {userInfo.userType === 1 && (
                        <div className="transition-colors w-full border-b">
                          <Link
                            href="/admin"
                            className="flex-center py-3 justify-start gap-x-1 text-base xl:text-sm ml-auto pr-4 text-gray-700 hover:text-[#e90089]  hover:bg-gray-50"
                          >
                            <div>
                              <AiOutlineProduct className="h-6 w-6 text-black ml-1.5" />
                            </div>
                            پیشخوان
                          </Link>
                        </div>
                      )}
                    </Disclosure.Button>

                    <Disclosure.Button className="!mt-0 flex w-full items-center justify-between px-4 py-0">
                      <div className="transition-colors w-full border-b">
                        <Link
                          href="/profile"
                          className="flex-center py-3 justify-start gap-x-1 text-base xl:text-sm ml-auto pr-4 text-gray-700 hover:text-[#e90089]  hover:bg-gray-50"
                        >
                          <div>
                            <BiUser className="h-6 w-6 text-black ml-1.5" />
                          </div>
                          حساب کاربری{' '}
                        </Link>
                      </div>
                    </Disclosure.Button>

                    <Disclosure.Button className="!mt-0 flex w-full items-center justify-between px-4 py-0">
                      <div className="transition-colors w-full border-b">
                        <Link
                          href="/profile"
                          className="flex-center py-3 justify-start gap-x-1 text-base xl:text-sm ml-auto pr-4 text-gray-700 hover:text-[#e90089]  hover:bg-gray-50"
                        >
                          <div>
                            <BiBasket className="h-6 w-6 text-black ml-1.5" />{' '}
                          </div>
                          سفارش های من{' '}
                        </Link>
                      </div>
                    </Disclosure.Button>

                    <Disclosure.Button className="!mt-0 flex w-full items-center justify-between px-4 py-0">
                      <div className="transition-colors w-full border-b">
                        <Link
                          href="/profile"
                          className="flex-center py-3 justify-start gap-x-1 text-base xl:text-sm ml-auto pr-4 text-gray-700 hover:text-[#e90089]  hover:bg-gray-50"
                        >
                          <div>
                            <BiHeart className="h-6 w-6 text-black ml-1.5" />
                          </div>
                          علاقه مندی ها{' '}
                        </Link>
                      </div>
                    </Disclosure.Button>

                    <Disclosure.Button className="!mt-0 flex w-full items-center justify-between px-4 py-0">
                      <div className="transition-colors w-full border-b">
                        <Link
                          href="/"
                          className="flex-center py-3 justify-start gap-x-1 text-base xl:text-sm ml-auto pr-4 text-gray-700 hover:text-[#e90089]  hover:bg-gray-50"
                        >
                          <div>
                            <BiLogOut className="h-6 w-6 text-red-500  ml-1.5" />
                          </div>
                          خروج از حساب کاربری
                        </Link>
                      </div>
                    </Disclosure.Button>
                  </>
                )}
              </Disclosure>
            </div>
          </div>
        </div>
        <div className="hidden lg:block">
          <UserMenuDropdown userInfo={userInfo} />
        </div>
      </div>
    )
  }
}

export default UserAuthLinks
