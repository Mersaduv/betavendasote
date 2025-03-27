import Link from 'next/link'

import { Bag, Clock, Comment, Edit, Heart, Home, Location, Person, User } from '@/icons'
import { HiChatAlt2 } from 'react-icons/hi'

import { BoxLink } from '@/components/ui'
import { LogoutButton } from '@/components/user'
import { useGetUserInfoMeQuery, useGetUserInfoQuery } from '@/services'
import { user2, user3 } from '@/icons'
import { IoNotificationsOutline } from 'react-icons/io5'
export const profilePaths = [
  {
    name: 'حساب کاربری',
    Icon: User,
    path: '/profile',
  },
  {
    name: 'سفارش‌ها',
    Icon: Bag,
    path: '/profile/orders',
  },
  {
    name: 'آدرس‌ها',
    Icon: Location,
    path: '/profile/address',
  },
  {
    name: 'اعلانات',
    Icon: IoNotificationsOutline,
    path: '/profile/notifications',
  },
  {
    name: 'علاقه مندی ها',
    Icon: Heart,
    path: '/profile/lists',
  },
  {
    name: 'تیکت های پشتیبانی',
    Icon: HiChatAlt2,
    path: '/profile/tickets',
  },
  {
    name: 'دیدگاه‌ها',
    Icon: Comment,
    path: '/profile/reviews',
  },
  {
    name: 'بازدید‌های اخیر',
    Icon: Clock,
    path: '/profile/user-history',
  },
]

function UserProfileAside() {
  // ? Get UserInfo
  // const { userInfo, isLoading } = useUserInfo()
  const { data, isLoading } = useGetUserInfoMeQuery()

  // ? Render(s)
  return (
    <aside className="sticky mt-6 md:rounded-md md:pt-4 md:top-[136px] w-[300px]">
      <div className="flex items-center rounded-lg shadow-item justify-between px-5 py-2 ">
        {data?.data?.userSpecification.gender === 'آقا' ? (
          <img className="w-10" src={user3.src} alt="user3" />
        ) : data?.data?.userSpecification.gender === 'بانو' ? (
          <img className="w-10" src={user2.src} alt="user2" />
        ) : (
          <img className="w-10" src={user3.src} alt="user3" />
        )}
        {/* <Person className="h-12 w-12" /> */}
        <div className="ml-auto mr-3 flex flex-col gap-y-1">
          {isLoading ? (
            <>
              <div className="h-5 w-32 animate-pulse rounded-md bg-red-200 lg:h-6 lg:w-28" />
              <div className="h-5 w-24 animate-pulse rounded-md bg-red-200 lg:h-6 lg:w-20" />
            </>
          ) : (
            <>
              <span className="text-sm font-medium lg:text-base">{data?.data?.fullName}</span>
              <span className="text-[11px] text-gray-400">{data?.data?.mobileNumber}</span>
            </>
          )}
        </div>
        <LogoutButton />
      </div>

      <div className="mt-7 rounded-lg shadow-item">
        {profilePaths.map((item, index) => (
          <BoxLink key={index} icon={item.Icon} path={item.path} name={item.name}>
            <item.Icon className="icon text-black" />
          </BoxLink>
        ))}
      </div>
    </aside>
  )
}

export default UserProfileAside
