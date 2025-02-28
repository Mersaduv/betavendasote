import { ProfileLayout } from '@/components/Layouts'
import { Header, MetaTags } from '@/components/shared'
import { PageContainer } from '@/components/ui'
import { useAppSelector, useDisclosure } from '@/hooks'
import { Plus } from '@/icons'
import { useGetTicketsQuery } from '@/services'
import type { NextPage } from 'next'
import Head from 'next/head'
import moment from 'moment-jalaali'
import { useRouter } from 'next/router'
import { EmptyCommentsList, EmptyTicketList } from '@/components/emptyList'
const Tickets: NextPage = () => {
  // ? Assets
  const { query, push } = useRouter()
  const { generalSetting } = useAppSelector((state) => state.design)
  const [isShowTicketModal, ticketModalHandlers] = useDisclosure()

  // ? Queries
  const { data: ticketData, isLoading: ticketLoading } = useGetTicketsQuery({ pageSize: 9999 })

  console.log(ticketData, 'ticketData')

  const handleToggleDetails = (id: string) => {
    push(`/profile/tickets/${id}`)
  }

  return (
    <main id="profileTickets">
      <MetaTags
        title={'پروفایل' + ' | ' + 'تیکت های پشتیبانی'}
        description={generalSetting?.shortIntroduction || 'توضیحاتی فروشگاه اینترنتی'}
        keywords={generalSetting?.googleTags || ' اینترنتی, فروشگاه'}
      />
      <Header />
      <ProfileLayout isProfile>
        <PageContainer title="">
          <div>
            <div className="flex mt-3 px-4 text-sm md:text-base mx-3 border border-[#e90089] rounded-md py-2 justify-between items-center bg-[#fde5f3] text-[#e90089]">
              {' '}
              <h3 className="">{'تیکت های پشتیبانی'}</h3>
              <button
                className="flex items-center justify-center gap-x-2 rounded-lg border-2 px-3 py-2 bg-[#e90089]"
                onClick={() => push('/profile/tickets/new')}
              >
                <span className="text-white text-base font-normal">تیکت جدید</span>
                <Plus className="icon text-white" />
              </button>
            </div>

            {ticketData?.data?.data && ticketData?.data?.data?.length > 0 ? (
              ticketData?.data?.data?.map((ticket) => {
                return (
                  <section key={ticket.id} className="mt-8 border m-6 rounded-md">
                    <div className="flex justify-between px-4 pt-4">
                      {' '}
                      <div>{ticket.subject}</div>
                      {ticket.status == 1 ? (
                        <div className="flex items-center gap-2 flex-row-reverse  border px-4 rounded-[7px]">
                          <span className="font-medium">باز</span>{' '}
                          <div className="bg-green-600 w-[7px] h-[7px] rounded-full" />
                        </div>
                      ) : ticket.status == 3 ? (
                        <div className="flex items-center gap-2 flex-row-reverse border px-4 rounded-[7px]">
                          <span className="font-medium">بسته</span>{' '}
                          <div className="bg-red-600 w-[7px] h-[7px] rounded-full" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-row-reverse border px-4 rounded-[7px]">
                          <span className="font-medium">پاسخ داده شده</span>{' '}
                          <div className="bg-amber-600 w-[7px] h-[7px] rounded-full" />
                        </div>
                      )}
                    </div>
                    <div className="my-3 px-4 flex flex-wrap justify-between gap-2">
                      <div className="bg-zinc-400 text-white w-fit text-sm font-semibold rounded px-2 flex-center">
                        {ticket.ticketType?.name}
                      </div>
                      <div className="farsi-digits">کد تیکت : {ticket.ticketCode}</div>
                      <div className="farsi-digits text-sm text-gray-700">
                        {moment(ticket.created).format('jYYYY/jMM/jDD HH:mm')}
                      </div>
                    </div>

                    <div className="border-t bg-gray-50 flex justify-end px-4 py-2 rounded-b-md">
                      <button
                        className="border transition ease duration-500 hover:bg-blue-600 hover:text-white border-blue-600 rounded px-2.5 py-1 text-base font-light text-blue-600"
                        onClick={() => handleToggleDetails(ticket.id)}
                      >
                        مشاهده
                      </button>
                    </div>
                  </section>
                )
              })
            ) : (
              <EmptyTicketList />
            )}
          </div>
        </PageContainer>
      </ProfileLayout>
    </main>
  )
}

export default Tickets
