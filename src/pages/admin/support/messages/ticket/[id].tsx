import { DashboardLayout, ProfileLayout } from '@/components/Layouts'
import { HandleResponse, Header, MetaTags } from '@/components/shared'
import { PageContainer } from '@/components/ui'
import { useAppSelector, useDisclosure } from '@/hooks'
import { Plus } from '@/icons'
import { useGetTicketQuery, useGetTicketsQuery, useUpdateTicketStatusMutation } from '@/services'
import type { NextPage } from 'next'
import Head from 'next/head'
import moment from 'moment-jalaali'
import { useRouter } from 'next/router'
import { TicketMessageModal } from '@/components/modals'
import { useEffect, useState } from 'react'
const SingleAdminTickets: NextPage = () => {
  // ? Assets
  const { query } = useRouter()
  const idQuery = (query.id as string) ?? undefined
  const [statusState, setStatusState] = useState(1)
  const { generalSetting } = useAppSelector((state) => state.design)
  const [isShowTicketModal, ticketModalHandlers] = useDisclosure()

  const [
    updateTicketStatus,
    {
      isLoading: isLoadingStatus,
      isSuccess: isSuccessStatus,
      isError: isErrorStatus,
      error: errorStatus,
      data: dataStatus,
    },
  ] = useUpdateTicketStatusMutation()

  // ? Queries
  const { data: ticketData, isLoading: ticketLoading } = useGetTicketQuery(
    { id: idQuery },
    {
      skip: idQuery == undefined,
    }
  )

  useEffect(() => {
    if (ticketData && ticketData?.data?.status) {
      setStatusState(ticketData?.data?.status)
    }
  }, [ticketData])

  console.log(ticketData, 'ticketData')

  const handleChangeStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusState(Number(event.target.value))
  }

  const handleClickUpdateStatus = () => {
    if (ticketData?.data?.id) updateTicketStatus({ status: statusState, ticketId: ticketData?.data?.id })
  }

  const onSuccess = () => {}
  return (
    <main id="ticketAdmin">
      {(isSuccessStatus || isErrorStatus) && (
        <HandleResponse
          isError={isErrorStatus}
          isSuccess={isSuccessStatus}
          error={errorStatus}
          message={dataStatus?.message}
          onSuccess={onSuccess}
        />
      )}
      <MetaTags
        title={'پروفایل' + ' | ' + 'تیکت های پشتیبانی'}
        description={generalSetting?.shortIntroduction || 'توضیحاتی فروشگاه اینترنتی'}
        keywords={generalSetting?.googleTags || ' اینترنتی, فروشگاه'}
      />
      <DashboardLayout>
        <section className="bg-[#f5f8fa] w-full h-full px-6 pb-8">
          <section className="mt-7 border bg-white w-full rounded-md shadow-item">
            <div className="flex flex-col sm:flex-row justify-between px-4 pt-4">
              {' '}
              <div>{ticketData?.data?.subject}</div>
              <div className="flex">
                <div className="text-sm border rounded-md flex-center px-2 rounded-l-none">تغییر وضعیت</div>
                <select className="text-sm w-[140px]" name="" id="" value={statusState} onChange={handleChangeStatus}>
                  <option value={1}>باز</option>
                  <option value={3}>بسته</option>
                  <option value={2}>پاسخ داده شده</option>
                </select>
                <div
                  onClick={handleClickUpdateStatus}
                  className="text-sm bg-sky-500 text-white flex-center px-4 rounded-md rounded-r-none cursor-pointer hover:bg-sky-400"
                >
                  تایید
                </div>
              </div>
              {/* {ticketData?.data?.status == 1 ? (
                <div className="flex items-center gap-2 flex-row-reverse  border px-4 rounded-[7px]">
                  <span className="font-medium">باز</span> <div className="bg-green-600 w-[7px] h-[7px] rounded-full" />
                </div>
              ) : ticketData?.data?.status == 3 ? (
                <div className="flex items-center gap-2 flex-row-reverse border px-4 rounded-[7px]">
                  <span className="font-medium">بسته</span> <div className="bg-red-600 w-[7px] h-[7px] rounded-full" />
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-row-reverse border px-4 rounded-[7px]">
                  <span className="font-medium">پاسخ داده شده</span>{' '}
                  <div className="bg-amber-600 w-[7px] h-[7px] rounded-full" />
                </div>
              )} */}
            </div>
            <div className="my-3 px-4 flex flex-wrap justify-between gap-2">
              <div className="bg-zinc-400 text-white w-fit text-sm font-semibold rounded px-2 flex-center">
                {ticketData?.data?.ticketType?.name}
              </div>
              <div className="farsi-digits">کد تیکت : {ticketData?.data?.ticketCode}</div>
              <div className="farsi-digits text-sm text-gray-700">
                {moment(ticketData?.data?.created).format('jYYYY/jMM/jDD HH:mm')}
              </div>
            </div>
          </section>
          <div className="mt-4 flex flex-col gap-4 bg-white w-full rounded-md shadow-item p-4">
            {ticketData?.data?.ticketMessages &&
              ticketData?.data?.ticketMessages
                .slice() // [...ticketData?.data?.ticketMessages]
                .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
                .map((message) => (
                  <div key={message.id} className={`flex ${!message.isCreator ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={` w-full max-w-[90%] py-2 px-4 rounded-lg ${
                        !message.isCreator ? 'rounded-br-none' : 'rounded-bl-none'
                      } ${!message.isCreator ? 'bg-gray-100 text-gray-700' : 'bg-[#fde5f3] text-gray-700'}`}
                    >
                      <div>{message.message}</div>
                      <hr className={`mt-4 ${!message.isRecipient && 'border-[#e900882d]'} `} />
                      <div
                        className={`flex ${!message.isRecipient && 'flex-row-reverse'} justify-between items-center`}
                      >
                        <div className="text-gray-500 text-sm">{message.user.fullName}</div>
                        <div className="farsi-digits text-sm text-gray-700">
                          {moment(message.created).format('jYYYY/jMM/jDD HH:mm')}
                        </div>
                        {message.imagesSrc?.length > 0 && (
                          <div className="flex flex-wrap">
                            {message.imagesSrc.map((item) => {
                              return (
                                <div key={item.imageUrl}>
                                  <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
                                    <img className="w-[50px] h-[50px] object-contain" src={item.imageUrl} alt="تصویر" />
                                  </a>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            <hr />
            <TicketMessageModal ticketId={ticketData?.data?.id ?? ''} isCreator={false} isRecipient={true} />
          </div>
        </section>
      </DashboardLayout>
    </main>
  )
}

export default SingleAdminTickets
