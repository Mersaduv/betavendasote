import type { NextPage } from 'next'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/Layouts'
import {
  useDeleteArticleMutation,
  useDeleteTrashArticleMutation,
  useGetArticlesQuery,
  useRestoreArticleMutation,
} from '@/services'
import { Fragment, useEffect, useState } from 'react'
import { GetArticlesResult } from '@/services/design/types'
import { DataStateDisplay, HandleResponse } from '@/components/shared'
import { useAppSelector, useDisclosure } from '@/hooks'
import { ConfirmDeleteModal, ConfirmUpdateModal } from '@/components/modals'
import { Menu, Tab, TabGroup, TabList, TabPanel, TabPanels, Transition } from '@headlessui/react'
import { ArrowDown } from '@/icons'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { IArticle } from '@/types'
import { TableSkeleton } from '@/components/skeleton'
import { Pagination } from '@/components/navigation'
import { LuSearch } from 'react-icons/lu'

const Users: NextPage = () => {
  // ? Assets
  const { query, push } = useRouter()
  const userPage = query.page ? +query.page : 1
  const { generalSetting } = useAppSelector((state) => state.design)

  
  return (
    <>
    
    <main>
        <Head>
          <title>مدیریت | مقالات</title>
        </Head>
        <DashboardLayout>
            <section>
              
            </section>
        </DashboardLayout>
      </main>
    </>
  )
}
// ? Local Components
export default dynamic(() => Promise.resolve(Users), { ssr: false })
