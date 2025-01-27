import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/components/Layouts'
import { HandleResponse } from '@/components/shared'
import { IProductForm, IRoleRequest } from '@/types'
import {
  useCreateProductMutation,
  useUpsertArticleMutation,
  useUpsertRoleMutation,
  useUpsertUserMutation,
} from '@/services'
import { ArticleForm, ProductForm, RoleForm, UserForm } from '@/components/form'
import { useDispatch } from 'react-redux'
import { setUpdated } from '@/store'
import { ProtectedRouteWrapper } from '@/components/user'

interface Props {}
const New: NextPage<Props> = () => {
  // ? Assets
  const { push } = useRouter()
  const dispatch = useDispatch()
  // ? Queries
  const [createRole, { data, isSuccess, isLoading, isError, error }] = useUpsertRoleMutation()

  // ? Handlers
  const createHandler = (data: IRoleRequest) => {
    createRole(data)
  }

  const onSuccess = () => {
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
            <title>سمت جدید</title>
          </Head>
          <DashboardLayout>
            <section className="bg-[#f5f8fa] w-full">
              <RoleForm mode="create" createHandler={createHandler} isLoadingCreate={isLoading} />
            </section>
          </DashboardLayout>
        </main>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(New), { ssr: false })
