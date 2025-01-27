import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/components/Layouts'
import { HandleResponse } from '@/components/shared'
import { IProductForm } from '@/types'
import {
  useCreateProductMutation,
  useGetSingleArticleQuery,
  useGetUserQuery,
  useUpsertArticleMutation,
  useUpsertUserMutation,
} from '@/services'
import { ArticleForm, ProductForm, UserForm } from '@/components/form'
import { useDispatch } from 'react-redux'
import { setUpdated } from '@/store'
import { FullScreenLoading } from '@/components/ui'
import { useEffect } from 'react'
import { ProtectedRouteWrapper } from '@/components/user'

interface Props {}
const Edit: NextPage<Props> = () => {
  // ? Assets
  const { query, back, push } = useRouter()
  const id = query.id as string
  const dispatch = useDispatch()
  // ? Queries
  //*    Get
  const { refetch, data: selectedUser, isLoading: isLoadingGetSelectedUser } = useGetUserQuery({ id })

  //*   Create
  const [updateUser, { data, isSuccess, isLoading, isError, error }] = useUpsertUserMutation()
  console.log(selectedUser, 'selectedUser -- selectedUser')

  useEffect(() => {
    if (isSuccess) {
      refetch()
    }
  }, [isSuccess])

  // ? Handlers
  const updateHandler = (data: FormData) => {
    console.log(data, '==========data')

    updateUser(data)
    refetch()
  }

  const onSuccess = () => {
    refetch()
    push(`/admin/users/edit/${data?.data}`)
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
            <title>ویرایش کاربر</title>
          </Head>
          <DashboardLayout>
            {isLoadingGetSelectedUser ? (
              <div className="px-3 py-20">
                <FullScreenLoading />
              </div>
            ) : selectedUser?.data ? (
              <section className="bg-[#f5f8fa] w-full">
                <UserForm
                  mode="edit"
                  selectedUser={selectedUser?.data}
                  updateHandler={updateHandler}
                  isLoadingUpdate={isLoading}
                />
              </section>
            ) : null}
          </DashboardLayout>
        </main>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(Edit), { ssr: false })
