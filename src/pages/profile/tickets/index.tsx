import { ProfileLayout } from '@/components/Layouts'
import { Header, MetaTags } from '@/components/shared'
import { PageContainer } from '@/components/ui'
import { useAppSelector } from '@/hooks'
import type { NextPage } from 'next'
import Head from 'next/head'
const Tickets: NextPage = () => {
  const { generalSetting } = useAppSelector((state) => state.design)
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
          </div>
        </PageContainer>
      </ProfileLayout>
    </main>
  )
}

export default Tickets
