import Link from 'next/link'
import { Fragment, useState } from 'react'
import { AiOutlineProduct } from 'react-icons/ai'
import { BiUser, BiBasket, BiHeart } from 'react-icons/bi'

import { Menu, Transition } from '@headlessui/react'

import { ArrowDown, ArrowLeft, Person, User } from '@/icons'
import { LogoutButton } from '@/components/user'
import { useAppDispatch } from '@/hooks'
import { clearCredentials } from '@/store'

interface Props {
  userInfo: {
    role: string
    userType: number
    mobileNumber: string | null
    fullName: string | null
    expireTime: number | null
    refreshTokenExpireTime: number | null
  }
}

const UserMenuDropdown: React.FC<Props> = (props) => {
  // ? Props
  const { userInfo } = props
  const nameParts = userInfo?.fullName?.split(' ')
  const firstName = nameParts![0]

  const dispatch = useAppDispatch()

  // ? States
  const [hover, setHover] = useState(false)

  // Handlers
  const handleLogout = () => {
    dispatch(clearCredentials())
  }

  // ? Render(s)
  return (
    <div className="dropdown">
      <button onMouseOver={() => setHover(true)} onMouseLeave={() => setHover(false)} className="dropdown__button">
        {firstName !== '' ? (
          <span className="text-xs xl:text-sm ml-auto mr-2.5 text-gray-700 font-normal">سلام {firstName} عزیز</span>
        ) : (
          <span className="text-xs xl:text-sm ml-auto mr-2.5 text-gray-700 font-normal">سلام دوست عزیز</span>
        )}

        <ArrowDown className="icon" />
      </button>

      <div
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => {
          setHover(false)
        }}
        className={`dropdown__items mt-0 -ml-2 ${hover ? 'block' : 'hidden'}`}
      >
        {userInfo.userType === 1 && (
          <div>
            <div className="transition-colors">
              <Link
                href="/admin"
                className="flex-center justify-start gap-x-1 py-2.5 text-xs xl:text-sm ml-auto pr-4 text-gray-700 hover:text-[#e90089] font-normal hover:bg-gray-50"
              >
                <div>
                  <AiOutlineProduct className="h-5 w-5 text-gray-500 ml-1.5" />
                </div>
                پیشخوان
              </Link>
            </div>
          </div>
        )}
        <div>
          <div className="transition-colors">
            <Link
              href="/profile"
              className="flex-center justify-start gap-x-1 py-2.5 text-xs xl:text-sm ml-auto pr-4 text-gray-700 hover:text-[#e90089] font-normal hover:bg-gray-50"
            >
              <div>
                <BiUser className="h-5 w-5 text-gray-500 ml-1.5" />
              </div>
              حساب کاربری{' '}
            </Link>
          </div>
        </div>
        <div>
          <div className="transition-colors">
            <Link
              href="/profile"
              className="flex-center justify-start gap-x-1 py-2.5 text-xs xl:text-sm ml-auto pr-4 text-gray-700 hover:text-[#e90089] font-normal hover:bg-gray-50"
            >
              <div>
                <BiBasket className="h-5 w-5 text-gray-500 ml-1.5" />
              </div>
              سفارش های من{' '}
            </Link>
          </div>
        </div>
        <div>
          <div className="transition-colors">
            <Link
              href="/"
              className="flex-center justify-start gap-x-1 py-2.5 text-xs xl:text-sm ml-auto pr-4 text-gray-700 hover:text-[#e90089] font-normal hover:bg-gray-50"
            >
              <div>
                <BiHeart className="h-5 w-5 text-gray-500 ml-1.5" />
              </div>
              علاقه مندی ها{' '}
            </Link>
          </div>
        </div>

        <LogoutButton isShowDropDown />
      </div>
    </div>
  )
}

export default UserMenuDropdown
