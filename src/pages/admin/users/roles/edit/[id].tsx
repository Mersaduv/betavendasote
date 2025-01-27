import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/components/Layouts'
import { HandleResponse } from '@/components/shared'
import { IProductForm, IRoleRequest } from '@/types'
import {
  useCreateProductMutation,
  useGetRoleQuery,
  useGetSingleArticleQuery,
  useGetUserQuery,
  useUpsertArticleMutation,
  useUpsertRoleMutation,
  useUpsertUserMutation,
} from '@/services'
import { ArticleForm, ProductForm, RoleForm, UserForm } from '@/components/form'
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
  const { refetch, data: selectedRole, isLoading: isLoadingGetSelectedRole } = useGetRoleQuery(id)

  //*   Create
  const [updateRole, { data, isSuccess, isLoading, isError, error }] = useUpsertRoleMutation()
  useEffect(() => {
    if (isSuccess) {
      refetch()
    }
  }, [isSuccess])

  // ? Handlers
  const updateHandler = (data: IRoleRequest) => {
    console.log(data, '==========data')

    updateRole(data)
    refetch()
  }

  const onSuccess = () => {
    refetch()
    push(`/admin/users/roles/edit/${data?.data}`)
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
            {isLoadingGetSelectedRole ? (
              <div className="px-3 py-20">
                <FullScreenLoading />
              </div>
            ) : selectedRole?.data ? (
              <section className="bg-[#f5f8fa] w-full">
                <RoleForm
                  mode="edit"
                  selectedRole={selectedRole?.data}
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
