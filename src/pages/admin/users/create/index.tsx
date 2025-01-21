import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/components/Layouts'
import { HandleResponse } from '@/components/shared'
import { IProductForm } from '@/types'
import { useCreateProductMutation, useUpsertArticleMutation, useUpsertUserMutation } from '@/services'
import { ArticleForm, ProductForm, UserForm } from '@/components/form'
import { useDispatch } from 'react-redux'
import { setUpdated } from '@/store'

interface Props {}
const Create: NextPage<Props> = () => {
  // ? Assets
  const { push } = useRouter()
  const dispatch = useDispatch()
  // ? Queries
  const [createUser, { data, isSuccess, isLoading, isError, error }] = useUpsertUserMutation()

  // ? Handlers
  const createHandler = (data: FormData) => {
    createUser(data)
  }

  const onSuccess = () => {
    push(`/admin/user/edit/${data?.data}`)
  }

  return (
    <>
      {(isSuccess || isError) && (
        <HandleResponse
          isError={isError}
          isSuccess={isSuccess}
          error={error}
          message={data?.message}
          onSuccess={onSuccess}
        />
      )}

      <main>
        <Head>
          <title>کاربر جدید</title>
        </Head>
        <DashboardLayout>
          <section className="bg-[#f5f8fa] w-full">
            <UserForm mode="create" createHandler={createHandler} isLoadingCreate={isLoading} />
          </section>
        </DashboardLayout>
      </main>
    </>
  )
}

export default dynamic(() => Promise.resolve(Create), { ssr: false })
