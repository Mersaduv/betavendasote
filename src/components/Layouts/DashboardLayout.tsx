import { ProtectedRouteWrapper } from '@/components/user'
import { DashboardAdminAside } from '@/components/shared'

import { roles } from '@/utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import jalaliday from 'jalaliday'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { useAppSelector } from '@/hooks'
interface Props {
  children: React.ReactNode
}
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(jalaliday)

dayjs.tz.setDefault('Asia/Tehran')
const DashboardLayout: React.FC<Props> = ({ children }) => {
  const [openRight, setOpenRight] = useState(false)
  const [currentDate, setCurrentDate] = useState('')
  const { logoImages } = useAppSelector((state) => state.design)
  const { userInfo } = useAppSelector((state) => state.auth)
  useEffect(() => {
    const updateDate = () => {
      const baseDate = dayjs().subtract(1, 'day') 
      const dayName = baseDate.add(1, 'day').calendar('jalali').locale('fa').format('dddd') 
      const fullDate = baseDate.calendar('jalali').locale('fa').format('D MMMM YYYY') 
      setCurrentDate(`${dayName}, ${fullDate}`)
    }
    
    updateDate()
    const interval = setInterval(updateDate, 60000)

    return () => clearInterval(interval)
  }, [])
  return (
    <ProtectedRouteWrapper>
      <header className="w-full flex justify-between items-center shadow py-2 fixed top-0 z-[90] bg-white ">
        <div className="flex items-center justify-start gap-3 mr-3">
          <div className="rounded p-2 hover:bg-sky-100   cursor-pointer" onClick={() => setOpenRight(!openRight)}>
            <span className="block lg2:hidden">
              <svg
                className="text-sky-400"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 7H3C2.4 7 2 6.6 2 6V4C2 3.4 2.4 3 3 3H21C21.6 3 22 3.4 22 4V6C22 6.6 21.6 7 21 7Z"
                  fill="black"
                />
                <path
                  opacity="0.3"
                  d="M21 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14ZM22 20V18C22 17.4 21.6 17 21 17H3C2.4 17 2 17.4 2 18V20C2 20.6 2.4 21 3 21H21C21.6 21 22 20.6 22 20Z"
                  fill="black"
                />
              </svg>
            </span>
          </div>
          <Link className="w-[245px]" passHref href="/">
            <img
              width={175}
              src={(logoImages && logoImages?.orgImage && logoImages?.orgImage.imageUrl) || ''}
              alt="online shop"
            />
          </Link>
        </div>
        <div className="flex justify-between w-full items-center">
          <div className="flex items-center gap-2">
            <img className="w-10 h-10 object-cover rounded-lg" src={userInfo?.imageScr?.imageUrl} alt="" />
            <div>{userInfo?.fullName == ' ' ? 'مدیر' : userInfo?.fullName}</div>
          </div>
          <div className="pl-2 sm:pl-4 md:pl-6">{digitsEnToFa(currentDate)}</div>
        </div>
      </header>
      <div className="flex mt-[75px] bg-[#f5f8fa]  w-full">
        <div className="">
          <DashboardAdminAside setOpenRight={setOpenRight} openRight={openRight} />
        </div>
        <div className="w-full flex flex-col items-start max-w-screen-2xl bg-[#f5f8fa] mx-auto">{children}</div>
      </div>
    </ProtectedRouteWrapper>
  )
}

export default DashboardLayout
