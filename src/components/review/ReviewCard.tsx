import { Fragment, useState } from 'react'

import { useEditReviewMutation } from '@/services'

import { Menu, Transition } from '@headlessui/react'
import { HandleResponse } from '@/components/shared'
import { ResponsiveImage } from '@/components/ui'
import { Check, Clock, Cross, Delete, Edit, Location2, Minus, More, Plus, User } from '@/icons'

import type { IReview } from '@/types'
import { BsTelephoneOutboundFill } from 'react-icons/bs'
import moment from 'moment-jalaali'
import { FaStar } from 'react-icons/fa'
interface Props {
  item: IReview
  singleComment?: boolean
  deleteReviewHandler: (id: string) => void
  open: () => void
  setReviewState: (review: IReview) => void
}

const ReviewCard: React.FC<Props> = (props) => {
  // ? Props
  const { item, singleComment, deleteReviewHandler, open, setReviewState } = props

  // ? States
  const [status, setStatus] = useState(item.status)

  // ? Edit Review Query
  const [editReview, { data, isSuccess, isError, error }] = useEditReviewMutation()

  // ? Handlers
  const handleChangeStatus = (statusNum: number) => {
    editReview({
      id: item.id,
      body: { status: statusNum },
    })
    setStatus(statusNum)
  }

  // ? Render(s)
  return (
    <>
      {/* Handle Edit Review Response */}
      {(isSuccess || isError) && (
        <HandleResponse
          isError={isError}
          isSuccess={isSuccess}
          error={error}
          message={data?.msg}
          onError={() => setStatus(item.status)}
        />
      )}
      <section key={item.id} className="flex-1 hover:shadow pr-2 relative border m-6 mt-8 rounded-lg">
        <div className="flex justify-between py-2">
          {/* rows */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-4 min-w-[100px]">
              <img
                src={item.productImageUrl.imageUrl}
                alt={item.product.title}
                className="w-[100px] h-[100px] rounded-lg"
              />
            </div>
            <div className="flex flex-col lg:flex-row">
              <div className="space-y-1 flex flex-col justify-between py-2 pl-1">
                <p className="text-lg line-clamp-1 overflow-hidden text-ellipsis">{item.product.title}</p>
                <p className="text-sm text-gray-400 farsi-digits">
                  {moment(item.created).format('jYYYY/jMM/jDD  HH:mm')}
                </p>
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar key={i} className={`text-sm ${item.rating > i ? 'text-[#FFD700]' : 'text-[#eee]'}`} />
                  ))}
                </div>
              </div>
              <div className="space-y-1 flex-col justify-between py-2 flex-1 hidden lgs:flex">
                <p className="pt-1 lg:text-base line-clamp-2 overflow-hidden text-ellipsis">{item.comment}</p>
                {item.positivePoints.length > 0 && (
                  <div>
                    {item.positivePoints.map((point) => (
                      <div className="flex items-center gap-x-1" key={point.id}>
                        <Plus className="icon text-green-400" />
                        <p className="font-semibold">{point.title}</p>
                      </div>
                    ))}
                  </div>
                )}
                {item.negativePoints.length > 0 && (
                  <div>
                    {item.negativePoints.map((point) => (
                      <div className="flex items-center gap-x-1" key={point.id}>
                        <Minus className="icon text-red-400" />
                        <p className="font-semibold">{point.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="">
            {item.status == 1 ? (
              <div className=" text-[#ffc700] bg-[#fff8dd] w-fit flex mx-auto px-2 ml-2 rounded-md text-sm font-medium whitespace-nowrap">
                در انتظار تایید
              </div>
            ) : item.status == 3 ? (
              <div className="text-[#f1416c] bg-[#fff5f8] w-fit flex mx-auto px-2 ml-2 rounded-md text-sm font-medium whitespace-nowrap">
                رد شده
              </div>
            ) : (
              <div className="text-green-500 bg-[#e8fff3] w-fit flex mx-auto px-2 ml-2 rounded-md text-sm font-medium whitespace-nowrap">
                تایید شده
              </div>
            )}
            <div className="w-full flex justify-end">
              <div className="flex justify-end items-start  mt-2 flex-col left-4 bg-gray-200 rounded-3xl h-fit ml-2 w-fit">
                <button title="حذف" className="px-2 py-3" onClick={() => deleteReviewHandler(item.id)}>
                  <Delete className="text-xl cursor-pointer text-gray-500 hover:text-red-500" />
                </button>
                <button
                  title="ویرایش"
                  className="px-2 py-3 "
                  onClick={() => {
                    setReviewState(item)
                    open()
                  }}
                >
                  <Edit className="text-xl cursor-pointer text-gray-500 hover:text-blue-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-1 flex-col justify-between py-2 flex-1 flex lgs:hidden">
          <p className="pt-1 lg:text-base line-clamp-2 overflow-hidden text-ellipsis">{item.comment}</p>
          {item.positivePoints.length > 0 && (
            <div>
              {item.positivePoints.map((point) => (
                <div className="flex items-center gap-x-1" key={point.id}>
                  <Plus className="icon text-green-400" />
                  <p className="font-semibold">{point.title}</p>
                </div>
              ))}
            </div>
          )}
          {item.negativePoints.length > 0 && (
            <div>
              {item.negativePoints.map((point) => (
                <div className="flex items-center gap-x-1" key={point.id}>
                  <Minus className="icon text-red-400" />
                  <p className="font-semibold">{point.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default ReviewCard
