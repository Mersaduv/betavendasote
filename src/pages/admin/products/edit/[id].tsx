import { useRouter } from 'next/router'
import { useState } from 'react'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'

import { useDisclosure } from '@/hooks'

import { SubmitHandler } from 'react-hook-form'

import { DashboardLayout } from '@/components/Layouts'
import { ConfirmUpdateModal } from '@/components/modals'
import { HandleResponse } from '@/components/shared'
import { PageContainer, FullScreenLoading } from '@/components/ui'

import type { IProduct, IProductForm } from '@/types'
import { ProductForm, ProductFormEdit } from '@/components/form'
import { useGetSingleProductQuery, useUpdateProductMutation } from '@/services'
import { useDispatch } from 'react-redux'
import { setUpdated } from '@/store'
import { ProtectedRouteWrapper } from '@/components/user'

interface Props {}
const Edit: NextPage<Props> = () => {
  // ? Assets
  const { query, back, push } = useRouter()
  const id = query.id as string
  const dispatch = useDispatch()
  const initialUpdataInfo = {} as IProduct

  // ? Modals
  const [isShowConfirmUpdateModal, confirmUpdateModalHandlers] = useDisclosure()

  // ? States
  const [updateInfo, setUpdateInfo] = useState<IProduct>(initialUpdataInfo)

  // ? Queries
  //*    Get Product
  const { refetch, data: selectedProduct, isLoading: isLoadingGetSelectedProduct } = useGetSingleProductQuery({ id })

  //*   Update Product
  const [
    updateProduct,
    {
      data: dataUpdate,
      isSuccess: isSuccessUpdate,
      isError: isErrorUpdate,
      error: errorUpdate,
      isLoading: isLoadingUpdate,
    },
  ] = useUpdateProductMutation()

  // ? Handlers
  const updateHandle = (data: FormData) => {
    updateProduct(data)
    confirmUpdateModalHandlers.open()
  }
  const onSuccess = () => {
    dispatch(setUpdated(true))
    push(`/admin/products/edit/${dataUpdate?.data}`)
  }

  return (
    <ProtectedRouteWrapper>
      <>
        {(isSuccessUpdate || isErrorUpdate) && (
          <HandleResponse
            isError={isErrorUpdate}
            isSuccess={isSuccessUpdate}
            error={errorUpdate}
            message={dataUpdate?.message}
            onSuccess={onSuccess}
          />
        )}

        <main>
          <Head>
            <title>{'ویرایش محصول'}</title>
          </Head>

          <DashboardLayout>
            {isLoadingGetSelectedProduct ? (
              <div className="px-3 py-20">
                <FullScreenLoading />
              </div>
            ) : selectedProduct?.data ? (
              <section className="bg-[#f5f8fa] w-full ">
                <ProductFormEdit
                  mode="edit"
                  isLoadingUpdate={isLoadingUpdate}
                  updateHandle={updateHandle}
                  selectedProduct={selectedProduct.data}
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
