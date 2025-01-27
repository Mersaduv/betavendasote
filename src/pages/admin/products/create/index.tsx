import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/components/Layouts'
import { HandleResponse } from '@/components/shared'
import { IProductForm } from '@/types'
import { useCreateProductMutation } from '@/services'
import { ProductForm } from '@/components/form'
import { useDispatch } from 'react-redux'
import { setUpdated } from '@/store'
import { ProtectedRouteWrapper } from '@/components/user'

interface Props {}
const Create: NextPage<Props> = () => {
  // ? Assets
  const { push } = useRouter()
  const dispatch = useDispatch()
  // ? Queries
  //*   Create Product
  const [createProduct, { data, isSuccess, isLoading, isError, error }] = useCreateProductMutation()

  // ? Handlers
  const createHandler = (data: FormData) => {
    createProduct(data)
  }

  const onSuccess = () => {
    dispatch(setUpdated(true))
    push(`/admin/products/edit/${data?.data}`)
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
            <title>محصول جدید</title>
          </Head>
          <DashboardLayout>
            <section className="bg-[#f5f8fa] w-full">
              <ProductForm mode="create" createHandler={createHandler} isLoadingCreate={isLoading} />
            </section>
          </DashboardLayout>
        </main>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(Create), { ssr: false })
