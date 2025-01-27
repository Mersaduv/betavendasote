import Head from 'next/head'
import dynamic from 'next/dynamic'

import { Address, Delete, Edit, Location, Location2, Phone, Plus, Post, User, UserLocation, Users } from '@/icons'

import { ProfileLayout } from '@/components/Layouts'
import { HandleResponse, Header } from '@/components/shared'
import { AddressSkeleton } from '@/components/skeleton'
import { PageContainer } from '@/components/ui'

import type { NextPage } from 'next'
import type { IAddress, WithAddressModalProps } from '@/types'
import { useDeleteUserAddressMutation, useGetUserInfoMeQuery } from '@/services'
import { useDisclosure, useDisclosureWithData } from '@/hooks'
import { AddressModal, ConfirmDeleteModal } from '@/components/modals'
import { useEffect, useState } from 'react'
import { BsTelephoneOutboundFill } from 'react-icons/bs'

const BasicAddresses: NextPage = () => {
  const { data, isLoading, refetch } = useGetUserInfoMeQuery()
  //*    Delete Product
  const [
    deleteAddress,
    {
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
      data: dataDelete,
      isLoading: isLoadingDelete,
    },
  ] = useDeleteUserAddressMutation()
  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const [isOpen, selectedAddress, { open, close }] = useDisclosureWithData()
  const [isShowAddressModal, addressModalHandlers] = useDisclosure()
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()

  //*   Delete Handlers
  const handleDelete = (id: string) => {
    setDeleteInfo({ id })
    confirmDeleteModalHandlers.open()
  }

  const onCancel = () => {
    setDeleteInfo({ id: '' })
    confirmDeleteModalHandlers.close()
  }

  const onConfirm = () => {
    deleteAddress(deleteInfo.id)
  }

  const onSuccess = () => {
    refetch()
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
  }
  const onError = () => {
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
  }
  // ? Render(s)
  return (
    <>
      <ConfirmDeleteModal
        deleted
        title="آدرس"
        isLoading={isLoadingDelete}
        isShow={isShowConfirmDeleteModal}
        onClose={confirmDeleteModalHandlers.close}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
      {(isSuccessDelete || isErrorDelete) && (
        <HandleResponse
          isError={isErrorDelete}
          isSuccess={isSuccessDelete}
          error={errorDelete}
          message={dataDelete?.message}
          onSuccess={onSuccess}
          onError={onError}
        />
      )}
      <main>
        <Head>
          <title>پروفایل | آدرس‌ها</title>
        </Head>
        <Header />
        <ProfileLayout isProfile>
          <PageContainer title="">
            {selectedAddress == null ? (
              <AddressModal
                isShow={isShowAddressModal}
                onClose={addressModalHandlers.close}
                address={{} as IAddress}
                refetch={refetch}
              />
            ) : (
              <AddressModal isShow={isOpen} onClose={close} address={selectedAddress} mode={'edit'} refetch={refetch} />
            )}
            <div className="flex mt-3 px-4 text-sm md:text-base mx-3 border border-[#e90089] rounded-md py-2 justify-between items-center bg-[#fde5f3] text-[#e90089]">
              {' '}
              <h3 className="">{'آدرس‌ها'}</h3>
              <button
                className="flex items-center justify-center gap-x-2 rounded-lg border-2 px-3 py-2 bg-[#e90089]"
                onClick={addressModalHandlers.open}
              >
                <span className="text-white text-base font-normal">آدرس جدید</span>
                <Plus className="icon text-white" />
              </button>
            </div>
            {isLoading ? (
              <AddressSkeleton />
            ) : data?.data?.addresses.length! > 0 ? (
              <div className="">
                {data?.data?.addresses?.map((address) => (
                  <section key={address.id} className="flex-1 hover:shadow pr-5 relative border m-6 mt-8 rounded-lg">
                    <div className="flex justify-between py-2">
                      {/* rows */}
                      <div className="flex flex-col gap-4">
                        <div className="flex md:items-center w-full flex-col md:flex-row gap-x-12">
                          <div className="flex items-center md:w-36 gap-1.5">
                            <User className="text-lg text-gray-500" />
                            <span className="font-light  text-base">گیرنده محصول</span>
                          </div>
                          <span className="text-gray-400 font-normal">{address?.fullName}</span>
                        </div>
                        <div className="flex md:items-center w-full flex-col md:flex-row  gap-x-12">
                          <div className="flex items-center md:w-36 gap-1.5">
                            <BsTelephoneOutboundFill className="text-sm text-gray-500" />
                            <span className="font-light  text-base">شماره موبایل</span>
                          </div>
                          <span className="text-gray-400 font-normal">{address?.mobileNumber}</span>
                        </div>
                        <div className="flex md:items-center w-full flex-col md:flex-row  gap-x-12">
                          <div className="flex items-center md:w-36 gap-1.5">
                            <Location2 className="text-xl -mr-1 text-gray-500" />
                            <span className="font-light  text-base">آدرس</span>
                          </div>
                          <span className="text-gray-400 font-normal">{address?.fullAddress}</span>
                        </div>
                      </div>
                      <div className="flex justify-start  mt-2 flex-col left-4 bg-gray-200 rounded-3xl h-fit ml-2">
                        <button title="حذف" className="px-2 py-3" onClick={() => handleDelete(address.id)}>
                          <Delete className="text-xl cursor-pointer text-gray-500 hover:text-red-500" />
                        </button>
                        <button title="ویرایش" className="px-2 py-3 " onClick={() => open(address)}>
                          <Edit className="text-xl cursor-pointer text-gray-500 hover:text-blue-400" />
                        </button>
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <section className="flex flex-col items-center gap-y-4 py-20">
                <Address className="h-52 w-52" />
                <p>هنوز آدرس ثبت نکرده‌اید.</p>
              </section>
            )}
          </PageContainer>
        </ProfileLayout>
      </main>
    </>
  )
}

export default dynamic(() => Promise.resolve(BasicAddresses), { ssr: false })
