import React, { useState } from 'react'
import moment from 'moment-jalaali'
import { FaStar } from 'react-icons/fa'
import { Delete, Edit, Plus, Minus } from '@/icons'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { IClientReview } from '@/services/review/types'

interface Props {
  item: IClientReview
  // این دو پراپ فقط برای مواردی که نوع Review است اعمال می‌شوند
  deleteReviewHandler?: (item: IClientReview) => void
  deleteArticleReviewHandler?: (item: IClientReview) => void
  open?: () => void
  setReviewState?: (item: IClientReview) => void
}

const ClientReviewCard: React.FC<Props> = (props) => {
  const { item, deleteReviewHandler, deleteArticleReviewHandler, open, setReviewState } = props
  const [status, setStatus] = useState(item.status)


  return (
    <section key={item.id} className="flex-1 hover:shadow pr-2 relative border m-6 mt-8 rounded-lg">
      <div className="flex justify-between py-2">
        <div className="flex gap-3">
          {/* نمایش تصویر برای Review یا ArticleReview (در صورت موجود بودن) */}
          {item.reviewType === 'Review' && item.productImageUrl ? (
            <div className="flex flex-col gap-4 min-w-[100px]">
              <img
                src={item.productImageUrl.imageUrl}
                alt={item.product ? item.product.title : 'محصول'}
                className="w-[100px] h-[100px] rounded-lg"
              />
            </div>
          ) : item.reviewType === 'ArticleReview' && item.article?.image ? (
            <div className="flex flex-col gap-4 min-w-[100px]">
              <img
                src={item.article.image.imageUrl}
                alt={item.article.title}
                className="w-[100px] h-[100px] rounded-lg"
              />
            </div>
          ) : null}

          <div className="flex flex-col lg:flex-row">
            <div className="space-y-1 flex flex-col justify-between py-2 pl-1">
              {/* عنوان محصول یا مقاله */}
              <p className="text-lg line-clamp-1 overflow-hidden text-ellipsis">
                {item.reviewType === 'Review' ? item.product?.title : item.article?.title || ''}
              </p>
              {/* تاریخ ایجاد */}
              <p className="text-sm text-gray-400 farsi-digits">
                {moment(item.created).format('jYYYY/jMM/jDD  HH:mm')}
              </p>
              {/* در صورت وجود امتیاز برای Review، ستاره‌ها را نمایش می‌دهد */}
              {item.reviewType === 'Review' && typeof item.rating !== 'undefined' && (
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar key={i} className={`text-sm ${item.rating && item.rating > i ? 'text-[#FFD700]' : 'text-[#eee]'}`} />
                  ))}
                </div>
              )}
            </div>

            {/* برای نمایش اطلاعات تکمیلی فقط در حالت دسکتاپ */}
         
              <div className="space-y-1 flex-col justify-between py-2 flex-1 hidden lgs:flex">
                <p className="pt-1 lg:text-base line-clamp-2 overflow-hidden text-ellipsis">{item.comment}</p>
                {item.positivePoints && item.positivePoints.length > 0 && (
                  <div>
                    {item.positivePoints.map((point) => (
                      <div className="flex items-center gap-x-1" key={point.id}>
                        <Plus className="icon text-green-400" />
                        <p className="font-semibold">{point.title}</p>
                      </div>
                    ))}
                  </div>
                )}
                {item.negativePoints && item.negativePoints.length > 0 && (
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

        {/* نمایش وضعیت و عملیات برای Review */}
          <div className="">
            {item.status === 1 ? (
              <div className="text-[#ffc700] bg-[#fff8dd] w-fit flex mx-auto px-2 ml-2 rounded-md text-sm font-medium whitespace-nowrap">
                در انتظار تایید
              </div>
            ) : item.status === 3 ? (
              <div className="text-[#f1416c] bg-[#fff5f8] w-fit flex mx-auto px-2 ml-2 rounded-md text-sm font-medium whitespace-nowrap">
                رد شده
              </div>
            ) : (
              <div className="text-green-500 bg-[#e8fff3] w-fit flex mx-auto px-2 ml-2 rounded-md text-sm font-medium whitespace-nowrap">
                تایید شده
              </div>
            )}
            <div className="w-full flex justify-end">
              <div className="flex justify-end items-start mt-2 flex-col left-4 bg-gray-200 rounded-3xl h-fit ml-2 w-fit">
                <button
                  title="حذف"
                  className="px-2 py-3"
                  onClick={() => {
                    if (item.reviewType === 'ArticleReview') {
                      deleteArticleReviewHandler && deleteArticleReviewHandler(item)
                    } else {
                      deleteReviewHandler && deleteReviewHandler(item)
                    }
                  }}
                >
                  <Delete className="text-xl cursor-pointer text-gray-500 hover:text-red-500" />
                </button>
                <button
                  title="ویرایش"
                  className="px-2 py-3"
                  onClick={() => {
                    setReviewState && setReviewState(item)
                    open && open()
                  }}
                >
                  <Edit className="text-xl cursor-pointer text-gray-500 hover:text-blue-400" />
                </button>
              </div>
            </div>
          </div>
     
      </div>

      {/* بخش نمایش کامنت در حالت موبایل */}
      {item.reviewType === 'Review' && (
        <div className="space-y-1 flex-col justify-between py-2 flex-1 flex lgs:hidden">
          <p className="pt-1 lg:text-base line-clamp-2 overflow-hidden text-ellipsis">{item.comment}</p>
          {item.positivePoints && item.positivePoints.length > 0 && (
            <div>
              {item.positivePoints.map((point) => (
                <div className="flex items-center gap-x-1" key={point.id}>
                  <Plus className="icon text-green-400" />
                  <p className="font-semibold">{point.title}</p>
                </div>
              ))}
            </div>
          )}
          {item.negativePoints && item.negativePoints.length > 0 && (
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
      )}
    </section>
  )
}

export default ClientReviewCard
