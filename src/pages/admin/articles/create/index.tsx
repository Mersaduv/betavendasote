import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/components/Layouts'
import { HandleResponse } from '@/components/shared'
import { IProductForm } from '@/types'
import { useCreateProductMutation, useUpsertArticleMutation } from '@/services'
import { ArticleForm, ProductForm } from '@/components/form'
import { useDispatch } from 'react-redux'
import { setUpdated } from '@/store'
import { ProtectedRouteWrapper } from '@/components/user'

interface Props {}
const NewTickets: NextPage<Props> = () => {
  // ? Assets
  const { push } = useRouter()
  const dispatch = useDispatch()
  // ? Queries
  //*   Create Product
  const [createArticle, { data, isSuccess, isLoading, isError, error }] = useUpsertArticleMutation()

  // ? Handlers
  const createHandler = (data: FormData) => {
    createArticle(data)
  }

  const onSuccess = () => {
    push(`/admin/articles/edit/${data?.data}`)
  }

  return (
    <ProtectedRouteWrapper>
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
            <title>مقاله جدید</title>
          </Head>
          <DashboardLayout>
            <section className="bg-[#f5f8fa] w-full">
              <ArticleForm mode="create" createHandler={createHandler} isLoadingCreate={isLoading} />
            </section>
          </DashboardLayout>
        </main>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(NewTickets), { ssr: false })
