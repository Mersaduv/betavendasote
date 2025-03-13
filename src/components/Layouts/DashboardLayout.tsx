import { ProtectedRouteWrapper } from '@/components/user'
import { DashboardAdminAside } from '@/components/shared'

import { roles } from '@/utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import jalaliday from 'jalaliday'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { useAppSelector } from '@/hooks'
interface Props {
  children: React.ReactNode
}
dayjs.extend(jalaliday)
const DashboardLayout: React.FC<Props> = ({ children }) => {
  const [openRight, setOpenRight] = useState(false)
  const [currentDate, setCurrentDate] = useState('')
  const { logoImages } = useAppSelector((state) => state.design)
  useEffect(() => {
    const updateDate = () => {
      const formattedDate = dayjs().calendar('jalali').locale('fa').format('dddd, D MMMM YYYY')
      setCurrentDate(formattedDate)
    }

    updateDate()
    const interval = setInterval(updateDate, 60000) // به‌روزرسانی هر دقیقه

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
          <Link className="" passHref href="/">
            <img
              width={175}
              src={(logoImages && logoImages?.orgImage && logoImages?.orgImage.imageUrl) || ''}
              alt="online shop"
            />
          </Link>
        </div>
        <div className="pl-2 sm:pl-4 md:pl-6">{digitsEnToFa(currentDate)}</div>
      </header>
      <div className="flex mt-[75px] bg-[#f5f8fa] h-screen w-full">
        <div className="">
          <DashboardAdminAside setOpenRight={setOpenRight} openRight={openRight} />
        </div>
        <div className="w-full flex flex-col items-start max-w-screen-2xl  mx-auto">{children}</div>
      </div>
    </ProtectedRouteWrapper>
  )
}

export default DashboardLayout
