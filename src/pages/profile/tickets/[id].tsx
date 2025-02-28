import { ProfileLayout } from '@/components/Layouts'
import { Header, MetaTags } from '@/components/shared'
import { PageContainer } from '@/components/ui'
import { useAppSelector, useDisclosure } from '@/hooks'
import { Plus } from '@/icons'
import { useGetTicketQuery, useGetTicketsQuery } from '@/services'
import type { NextPage } from 'next'
import Head from 'next/head'
import moment from 'moment-jalaali'
import { useRouter } from 'next/router'
import { TicketMessageModal } from '@/components/modals'
const SingleTickets: NextPage = () => {
  // ? Assets
  const { query } = useRouter()
  const idQuery = (query.id as string) ?? undefined
  const { generalSetting } = useAppSelector((state) => state.design)
  const [isShowTicketModal, ticketModalHandlers] = useDisclosure()

  // ? Queries
  const { data: ticketData, isLoading: ticketLoading } = useGetTicketQuery(
    { id: idQuery },
    {
      skip: idQuery == undefined,
    }
  )

  console.log(ticketData, 'ticketData')

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
              <h3 className="px-3 py-2.5">{'تیکت های پشتیبانی'}</h3>
            </div>

            <section key={ticketData?.data?.id} className="mt-8 border m-6 rounded-md">
              <div className="flex justify-between px-4 pt-4">
                {' '}
                <div>{ticketData?.data?.subject}</div>
                {ticketData?.data?.status == 1 ? (
                  <div className="flex items-center gap-2 flex-row-reverse  border px-4 rounded-[7px]">
                    <span className="font-medium">باز</span>{' '}
                    <div className="bg-green-600 w-[7px] h-[7px] rounded-full" />
                  </div>
                ) : ticketData?.data?.status == 3 ? (
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
                  {ticketData?.data?.ticketType?.name}
                </div>
                <div className="farsi-digits">کد تیکت : {ticketData?.data?.ticketCode}</div>
                <div className="farsi-digits text-sm text-gray-700">
                  {moment(ticketData?.data?.created).format('jYYYY/jMM/jDD HH:mm')}
                </div>
              </div>
            </section>
            <div className="mt-4 mx-4 flex flex-col gap-4">
              {ticketData?.data?.ticketMessages &&
                ticketData?.data?.ticketMessages
                  .slice() // [...ticketData?.data?.ticketMessages]
                  .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
                  .map((message) => (
                    <div key={message.id} className={`flex ${message.isCreator ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={` w-full max-w-[90%] py-2 px-4 rounded-lg ${
                          message.isCreator ? 'rounded-br-none' : 'rounded-bl-none'
                        } ${message.isCreator ? 'bg-gray-100 text-gray-700' : 'bg-[#fde5f3] text-gray-700'}`}
                      >
                        <div>{message.message}</div>
                        <hr className={`mt-4 ${message.isRecipient && 'border-[#e900882d]'} `} />
                        <div
                          className={`flex ${message.isRecipient && 'flex-row-reverse'} justify-between items-center`}
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
                                      <img
                                        className="w-[50px] h-[50px] object-contain"
                                        src={item.imageUrl}
                                        alt="تصویر"
                                      />
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
              <TicketMessageModal ticketId={ticketData?.data?.id ?? ''} isCreator={true} isRecipient={false} />
            </div>
          </div>
        </PageContainer>
      </ProfileLayout>
    </main>
  )
}

export default SingleTickets
