import Link from 'next/link'

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight2,
  ArrowUp,
  Bag,
  Category,
  Comment,
  Image,
  Location,
  Logo,
  Plus,
  Save,
  Slider,
  Users,
} from '@/icons'
import { LiaAdSolid } from 'react-icons/lia'
import { MdOutlineAdsClick, MdOutlinePreview } from 'react-icons/md'
import { GrGallery } from 'react-icons/gr'
import { PiUserDuotone } from 'react-icons/pi'
import { AiTwotoneMail } from 'react-icons/ai'
import { FaCalculator } from 'react-icons/fa'
import { IoSettings } from 'react-icons/io5'
import { HiMail } from 'react-icons/hi'

import { BoxLink } from '@/components/ui'
import { LogoutButton } from '@/components/user'
import { BiGrid, BiSolidGridAlt, BiWindow } from 'react-icons/bi'
import { IoCart } from 'react-icons/io5'
import { TbPointFilled } from 'react-icons/tb'
import { RiShoppingBag2Fill } from 'react-icons/ri'
import { IconType } from 'react-icons'
import { Dispatch, SetStateAction, use, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { IoMdDocument } from 'react-icons/io'
import Drawer from './Drawer'
import { useGetUserInfoMeQuery } from '@/services'
import { IPermission } from '@/types'

interface ProfilePath {
  id: number
  name: string
  Icon: any
  subItem?: {
    id: number
    name: string
    Icon: any
    path: string[]
  }[]
  path?: string[]
  pathName?: string
}

function makeIdsUnique(arr: ProfilePath[]) {
  let idCounter = 1

  const recursiveIdUpdate = (arr: ProfilePath[]) => {
    arr.forEach((item: any) => {
      item.id = idCounter
      idCounter++

      if (item.subItem && Array.isArray(item.subItem)) {
        recursiveIdUpdate(item.subItem)
      }
    })
  }

  recursiveIdUpdate(arr)
  return arr
}

const profileData: ProfilePath[] = [
  { id: 1, name: 'پیشخوان', Icon: BiSolidGridAlt, path: ['/admin'] },
  {
    id: 7,
    name: 'نمای سایت',
    Icon: MdOutlinePreview,
    path: ['/admin/ads/main', '/admin/design/paints', '/admin/design/footer', '/admin/design/siteItems'],
  },
  { id: 1, name: 'سفارشات', Icon: IoCart, path: ['/admin/orders'] },
  {
    id: 1,
    name: 'محصولات',
    Icon: RiShoppingBag2Fill,
    subItem: [
      {
        id: 1,
        name: 'محصول جدید',
        Icon: TbPointFilled,
        path: ['/admin/products/create'],
      },
      {
        id: 12,
        name: 'همه محصولات',
        Icon: TbPointFilled,
        path: ['/admin/products'],
      },
    ],
  },
  {
    id: 2,
    name: 'تبلیغات',
    Icon: MdOutlineAdsClick,
    subItem: [
      {
        id: 21,
        name: 'پیشنهاد شگفت انگیز',
        Icon: TbPointFilled,
        path: ['/admin/ads/suggestion'],
      },
      {
        id: 22,
        name: 'هدایا',
        Icon: TbPointFilled,
        path: ['/admin/ads/gift'],
      },
      {
        id: 23,
        name: 'تخفیفات',
        Icon: TbPointFilled,
        path: ['/admin/ads/coupon'],
      },
    ],
  },
  {
    id: 3,
    name: 'مقالات',
    Icon: IoMdDocument,
    subItem: [
      {
        id: 3,
        name: 'مقاله جدید',
        Icon: TbPointFilled,
        path: ['/admin/articles/create'],
      },
      {
        id: 3,
        name: 'همه مقالات',
        Icon: TbPointFilled,
        path: ['/admin/articles'],
      },
    ],
  },
  {
    id: 4,
    name: 'کاربران',
    Icon: PiUserDuotone,
    subItem: [
      {
        id: 4,
        name: 'کاربر جدید',
        Icon: TbPointFilled,
        path: ['/admin/users/create'],
      },
      {
        id: 4,
        name: 'همه کاربران',
        Icon: TbPointFilled,
        path: ['/admin/users/personnel'],
      },
      {
        id: 4,
        name: 'سمت ها',
        Icon: TbPointFilled,
        path: ['/admin/users/roles'],
      },
    ],
  },
  {
    id: 5,
    name: 'پشتیبانی',
    Icon: HiMail,
    subItem: [
      {
        id: 5,
        name: 'پیام ها',
        Icon: TbPointFilled,
        path: [
          '/admin/support/messages/ticket',
          '/admin/support/messages/sms-list',
          '/admin/support/messages/notifications',
        ],
      },
      {
        id: 5,
        name: 'دیدگاه',
        Icon: TbPointFilled,
        path: ['/admin/support/review/product'],
      },
    ],
  },
  {
    id: 6,
    name: 'تجزیه تحلیل',
    Icon: FaCalculator,
    subItem: [
      {
        id: 6,
        name: 'درآمد',
        Icon: TbPointFilled,
        path: ['/admin/analyze'],
      },
      {
        id: 6,
        name: 'مالیات',
        Icon: TbPointFilled,
        path: ['/admin/analyze'],
      },
      {
        id: 6,
        name: 'نمودار فروش',
        Icon: TbPointFilled,
        path: ['/admin/analyze'],
      },
    ],
  },
  {
    id: 8,
    name: 'تنظیمات',
    Icon: IoSettings,
    subItem: [
      {
        id: 8,
        name: 'پیکربندی محصولات',
        Icon: TbPointFilled,
        path: ['/admin/product-configuration/categories'],
      },
      {
        id: 8,
        name: 'مبالغ و هزینه ها',
        Icon: TbPointFilled,
        path: ['/admin/amount-and-cost/edit-price'],
      },
      {
        id: 8,
        name: 'دپارتمان',
        Icon: TbPointFilled,
        path: ['/admin/department/department-ticket'],
      },
    ],
  },
]

const profilePaths = makeIdsUnique(profileData)
interface Props {
  openRight: boolean
  setOpenRight: Dispatch<SetStateAction<boolean>>
}
export default function DashboardAdminAside(props: Props) {
  const { openRight, setOpenRight } = props
  const router = useRouter()
  const { data: userData, isLoading, refetch } = useGetUserInfoMeQuery()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const [permissions, setPermissions] = useState<IPermission[]>()

  useEffect(() => {
    if (userData?.data?.userSpecification.role && userData?.data?.userSpecification.role.permissions) {
      setPermissions(userData?.data?.userSpecification.role.permissions)
    }
  }, [userData])

  useEffect(() => {
    profilePaths.forEach((item) => {
      if (item.subItem) {
        item.subItem.forEach((subItem) => {
          if (subItem.path.includes(router.pathname)) {
            setOpenIndex(item.id)
          }
        })
      }
    })
  }, [router.pathname])

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const isPathActive = (paths: string[]) => paths.includes(router.pathname)

  const isParentPathActive = (subItems?: { path: string[] }[]) => {
    return subItems?.some((subItem) => isPathActive(subItem.path))
  }

  // if (userData) {
  //   console.log(userData, 'userData')
  // }
  return (
    <div className="lg2:w-[265px]">
      {/* Desktop aside  */}
      <aside className="fixed top-[74px] w-[265px] bg-[#1e1e2d] hidden lg2:block">
        <div className="py-5 flex flex-col justify-between h-screen">
          <div className="overflow-auto">
            {profilePaths.map((item, index) => {
              const isDashboard = item.name === 'پیشخوان'

              const hasPermission = isDashboard || permissions?.some((p) => p.name === item.name)

              const validSubItems = item.subItem?.filter((subItem) => {
                const parentPermission = permissions?.find((permission) => permission.name === item.name)
                return parentPermission?.childPermissions?.some((childPerm) => childPerm.name === subItem.name)
              })

              if (!hasPermission) return null

              const isItemActive = item.path?.includes(router.pathname)

              return item.path ? (
                <Link href={item.path[0]} key={index}>
                  <div
                    className={`flex cursor-pointer hover:bg-[#1b1b28] justify-between items-center py-2.5 text-sm px-6 pl-4 w-full gap-3 text-[#9899ac] ${
                      isItemActive ? 'text-[#e90089] bg-[#1b1b28]' : ' text-gray-700'
                    }`}
                    onClick={() => handleToggle(item.id)}
                  >
                    <div className="flex gap-3 items-center">
                      <item.Icon className={`text-xl ${isItemActive ? 'text-[#e90089]' : 'text-[#5a6080]'}`} />
                      <span className={`ml-2 ${isItemActive ? 'text-white' : ' text-gray-400'}`}>{item.name}</span>
                    </div>
                    {item.subItem && validSubItems && validSubItems.length > 0 && (
                      <span className="text-white">
                        <ArrowLeft
                          className={`transition-all ease-in-out duration-500 ${
                            openIndex == item.id ? '-rotate-90' : ''
                          } text-3xl hover:shadow-xl rounded-full text-[#e90089]`}
                        />
                      </span>
                    )}
                  </div>
                </Link>
              ) : (
                <div key={index}>
                  <div
                    className={`flex cursor-pointer hover:bg-[#1b1b28] justify-between items-center py-2.5 text-sm px-6 pl-4 w-full gap-3 text-[#9899ac] ${
                      item.pathName?.includes(router.pathname)
                        ? 'text-[#e90089] bg-[#1b1b28]'
                        : openIndex === item.id
                        ? 'bg-[#1b1b28]'
                        : 'text-gray-700'
                    }`}
                    onClick={() => handleToggle(item.id)}
                  >
                    <div className="flex gap-3 items-center">
                      <item.Icon className="text-xl text-[#5a6080]" />
                      <span className={`ml-2 ${isParentPathActive(item.subItem) ? 'text-white' : 'text-gray-400'}`}>
                        {item.name}
                      </span>
                    </div>
                    {validSubItems && validSubItems.length > 0 && (
                      <span className="text-white">
                        <ArrowLeft
                          className={`transition-all ease-in-out duration-500 ${
                            openIndex == item.id ? '-rotate-90' : ''
                          } text-3xl hover:shadow-xl rounded-full text-[#e90089]`}
                        />
                      </span>
                    )}
                  </div>

                  <div
                    className={`overflow-hidden w-full transition-all ease-in-out duration-500 ${
                      validSubItems && validSubItems.length > 0 && openIndex === item.id ? 'max-h-screen' : 'max-h-0'
                    }`}
                  >
                    {validSubItems?.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.path[0]}
                        className="flex items-center hover:bg-[#1b1b28] py-2.5 text-sm px-6 w-full gap-3 text-[#9899ac]"
                      >
                        <subItem.Icon
                          className={`mr-4 text-sm ${
                            subItem.path.includes(router.pathname) ? 'text-[#e90089]' : 'text-[#5a6080]'
                          }`}
                        />
                        <span className={`${subItem.path.includes(router.pathname) ? 'text-white' : 'text-gray-400'}`}>
                          {subItem.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <LogoutButton isShowDrawer />
        </div>
      </aside>

      <Drawer open={openRight} side="right" setOpen={setOpenRight}>
        <aside
          className={`fixed top-[74px] w-[265px] bg-[#1e1e2d] z-50 h-screen transition-transform duration-300 ease-in-out ${
            openRight ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="py-5 flex flex-col justify-between h-full">
            <div className="overflow-auto">
              {profilePaths.map((item, index) => {
                const isDashboard = item.name === 'پیشخوان'
                const hasPermission = isDashboard || permissions?.some((p) => p.name === item.name)

                const validSubItems = item.subItem?.filter((subItem) => {
                  const parentPermission = permissions?.find((permission) => permission.name === item.name)
                  return parentPermission?.childPermissions?.some((childPerm) => childPerm.name === subItem.name)
                })

                if (!hasPermission) return null

                const isItemActive = item.path?.includes(router.pathname)

                return item.path ? (
                  <Link href={item.path[0]} key={index}>
                    <div
                      className={`flex cursor-pointer hover:bg-[#1b1b28] justify-between items-center py-2.5 text-sm px-6 pl-4 w-full gap-3 text-[#9899ac] ${
                        isItemActive ? 'text-[#e90089] bg-[#1b1b28]' : 'text-gray-700'
                      }`}
                      onClick={() => handleToggle(item.id)}
                    >
                      <div className="flex gap-3 items-center">
                        <item.Icon className={`text-xl ${isItemActive ? 'text-[#e90089]' : 'text-[#5a6080]'}`} />
                        <span className={`ml-2 ${isItemActive ? 'text-white' : 'text-gray-400'}`}>{item.name}</span>
                      </div>
                      {validSubItems && validSubItems.length > 0 && (
                        <span className="text-white">
                          <ArrowLeft
                            className={`transition-all ease-in-out duration-500 ${
                              openIndex == item.id ? '-rotate-90' : ''
                            } text-3xl hover:shadow-xl rounded-full text-[#e90089]`}
                          />
                        </span>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div key={index}>
                    <div
                      className={`flex cursor-pointer hover:bg-[#1b1b28] justify-between items-center py-2.5 text-sm px-6 pl-4 w-full gap-3 text-[#9899ac] ${
                        item.pathName?.includes(router.pathname)
                          ? 'text-[#e90089] bg-[#1b1b28]'
                          : openIndex === item.id
                          ? 'bg-[#1b1b28]'
                          : 'text-gray-700'
                      }`}
                      onClick={() => handleToggle(item.id)}
                    >
                      <div className="flex gap-3 items-center">
                        <item.Icon className="text-xl text-[#5a6080]" />
                        <span className={`ml-2 ${isParentPathActive(item.subItem) ? 'text-white' : 'text-gray-400'}`}>
                          {item.name}
                        </span>
                      </div>
                      {validSubItems && validSubItems.length > 0 && (
                        <span className="text-white">
                          <ArrowLeft
                            className={`transition-all ease-in-out duration-500 ${
                              openIndex == item.id ? '-rotate-90' : ''
                            } text-3xl hover:shadow-xl rounded-full text-[#e90089]`}
                          />
                        </span>
                      )}
                    </div>

                    <div
                      className={`overflow-hidden w-full transition-all ease-in-out duration-500 ${
                        validSubItems && validSubItems.length > 0 && openIndex === item.id ? 'max-h-screen' : 'max-h-0'
                      }`}
                    >
                      {validSubItems?.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          href={subItem.path[0]}
                          className="flex items-center hover:bg-[#1b1b28] py-2.5 text-sm px-6 w-full gap-3 text-[#9899ac]"
                        >
                          <subItem.Icon
                            className={`mr-4 text-sm ${
                              subItem.path?.includes(router.pathname) ? 'text-[#e90089]' : 'text-[#5a6080]'
                            }`}
                          />
                          <span
                            className={`${subItem.path?.includes(router.pathname) ? 'text-white' : 'text-gray-400'}`}
                          >
                            {subItem.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
              <LogoutButton isShowDrawer />
            </div>
          </div>
        </aside>
      </Drawer>
    </div>
  )
}
