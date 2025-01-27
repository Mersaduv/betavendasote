import dynamic from 'next/dynamic'
import Head from 'next/head'

import { FavoritesListEmpty } from '@/icons'

import { ProfileLayout } from '@/components/Layouts'
import { PageContainer } from '@/components/ui'

import type { NextPage } from 'next'
import { Header, MetaTags } from '@/components/shared'
import { Plus } from 'heroicons-react'
import { useAppSelector } from '@/hooks'

const Lists: NextPage = () => {
  const { generalSetting } = useAppSelector((state) => state.design)
  // ? Render(s)
  return (
    <main>
      <MetaTags
        title={'پروفایل' + ' | ' + 'علاقه مندی ها'}
        description={generalSetting?.shortIntroduction || 'توضیحاتی فروشگاه اینترنتی'}
        keywords={generalSetting?.googleTags || ' اینترنتی, فروشگاه'}
      />
      <Header />
      <ProfileLayout isProfile>
        <PageContainer title="لیست‌ها">
          <div className="flex mt-3 px-4 text-sm md:text-base mx-3 border border-[#e90089] rounded-md py-2 justify-between items-center bg-[#fde5f3] text-[#e90089]">
            {' '}
            <h3 className="px-3 py-2.5">{'علاقه مندی ها'}</h3>
          </div>
          <section className="py-20">
            <FavoritesListEmpty className="mx-auto h-52 w-52" />
            <p className="text-center">لیست علاقه‌مندی‌های شما خالی است.</p>
          </section>
        </PageContainer>
      </ProfileLayout>
    </main>
  )
}

export default dynamic(() => Promise.resolve(Lists), { ssr: false })
