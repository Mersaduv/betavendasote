import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/components/Layouts'
import { HandleResponse } from '@/components/shared'
import { IProductForm } from '@/types'
import { useCreateProductMutation, useGetSingleArticleQuery, useUpsertArticleMutation } from '@/services'
import { ArticleForm, ProductForm } from '@/components/form'
import { useDispatch } from 'react-redux'
import { setUpdated } from '@/store'
import { FullScreenLoading } from '@/components/ui'
import { useEffect } from 'react'

interface Props {}
const Edit: NextPage<Props> = () => {
  // ? Assets
  const { query, back, push } = useRouter()
  const id = query.id as string
  const dispatch = useDispatch()
  // ? Queries
  //*    Get Article
  const { refetch, data: selectedArticle, isLoading: isLoadingGetSelectedArticle } = useGetSingleArticleQuery({ id })

  //*   Create Article
  const [updateArticle, { data, isSuccess, isLoading, isError, error }] = useUpsertArticleMutation()
  console.log(selectedArticle, 'selectedArticle -- selectedArticle')

  useEffect(() => {
    if (isSuccess) {
      refetch()
    }
  }, [isSuccess])

  // ? Handlers
  const updateHandler = (data: FormData) => {
    console.log(data, '==========data')

    updateArticle(data)
    refetch()
  }

  const onSuccess = () => {
    refetch() // این خط جدید
    push(`/admin/articles/edit/${data?.data}`)
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
          <title>ویرایش کاربر</title>
        </Head>
        <DashboardLayout>
          {isLoadingGetSelectedArticle ? (
            <div className="px-3 py-20">
              <FullScreenLoading />
            </div>
          ) : selectedArticle?.data ? (
            <section className="bg-[#f5f8fa] w-full">
              <ArticleForm
                mode="edit"
                selectedArticle={selectedArticle?.data}
                updateHandler={updateHandler}
                isLoadingUpdate={isLoading}
              />
            </section>
          ) : null}
        </DashboardLayout>
      </main>
    </>
  )
}

export default dynamic(() => Promise.resolve(Edit), { ssr: false })
