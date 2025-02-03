import { NextPage } from 'next'
import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { clearCart, setAddress } from '@/store'

import { Address, Delete, Edit, Location, Location2, Phone, Plus, Post, User, UserLocation, Users } from '@/icons'

import { Menu, Tab, Transition } from '@headlessui/react'
import { CartItemDisplay, CartSummary, FreeShippingIndicator } from '@/components/cart'
import { AddressListModal, AddressModal, RedirectToLogin } from '@/components/modals'
import { Button } from '@/components/ui'
import { HandleResponse, Header, MetaTags } from '@/components/shared'
import { formatNumber, roles } from '@/utils'
import { Cart as CartIcon } from '@/icons'
import { TbTruck } from 'react-icons/tb'

import { useDisclosure, useAppSelector, useAppDispatch, useDisclosureWithData } from '@/hooks'
import { Fragment } from 'react'
import { TfiRulerAlt2 } from 'react-icons/tfi'
import { BiCart } from 'react-icons/bi'
import { IoLogoUsd } from 'react-icons/io5'
import { ProtectedRouteWrapper } from '@/components/user'
import { useRouter } from 'next/router'
import { useGetUserInfoMeQuery } from '@/services'
import { AddressSkeleton } from '@/components/skeleton'
import { BsTelephoneOutboundFill } from 'react-icons/bs'
import { IAddress } from '@/types'
const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ')
}

const AddressCart: NextPage = () => {
  const { data: addressDb, isLoading, refetch } = useGetUserInfoMeQuery()
  const [isOpen, selectedAddress, { open, close }] = useDisclosureWithData()
  const [isShowAddressListModal, addressListModalHandlers] = useDisclosure()
  const [isShowAddressModal, addressModalHandlers] = useDisclosure()
  const { generalSetting } = useAppSelector((state) => state.design)
  // const [isShowRedirectModal, redirectModalHandlers] = useDisclosure()
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const { userInfo, address } = useAppSelector((state) => state.auth)
  const { cartItems, totalItems, totalPrice, totalDiscount } = useAppSelector((state) => state.cart)
  const [selectedAddressState, setSelectedAddress] = useState<IAddress | null>(null)

  const handleRoute = () => {
    // if (!userInfo) return redirectModalHandlers.open()

    push('/checkout/shipping')
  }

  const handleSelectAddress = (address: IAddress, isRefetchData?: IAddress[]) => {
    if (isRefetchData) {
      const addressData = isRefetchData.filter((f: IAddress) => f.id === selectedAddressState?.id)
      if (addressData[0] !== undefined) {
        dispatch(setAddress(addressData[0]))
        setSelectedAddress(addressData[0])
      } else {
        dispatch(setAddress(isRefetchData[0]))
        setSelectedAddress(isRefetchData[0])
      }
    } else {
      dispatch(setAddress(address))
      setSelectedAddress(address)
    }
  }

  useEffect(() => {
    if (address) {
      setSelectedAddress(address)
    }
  }, [address])

  useEffect(() => {
    if (selectedAddressState == null && addressDb?.data?.addresses) {
      handleSelectAddress(addressDb?.data?.addresses[0])
    }
  }, [addressDb])

  useEffect(() => {
    handleSelectAddress({} as IAddress, addressDb?.data?.addresses)
  }, [addressDb, refetch])

  return (
    <ProtectedRouteWrapper>
      <Header />
      <main className="mt-[80px]">
        <MetaTags
          title={generalSetting?.title + ' | ' + 'ارسال اطلاعات' || 'فروشگاه اینترنتی'}
          description={generalSetting?.shortIntroduction || 'توضیحاتی فروشگاه اینترنتی'}
          keywords={generalSetting?.googleTags || ' اینترنتی, فروشگاه'}
        />
        {/* steps header  */}
        <div className="flex flex-col items-center px-4 md:px-8">
          <div className="flex justify-between w-[300px]">
            <button className=" bg-white w-[93px] ring-0 border-none outline-none">
              <div className="flex flex-col items-center  ring-0 border-none outline-none">
                <div
                  className={classNames(
                    'rounded-[10px] relative flex border-2  items-center justify-center p-1.5  sm:text-base  font-light  text-[#6b6b6b] border-[#f1f1f1]'
                  )}
                >
                  <CartIcon className={`icon h-8 w-8 text-[#3F3A42]`} />
                  <div className="w-[56px] h-[2px] bg-[#f1f1f1] absolute -left-[58px] top-[22px]" />
                </div>
                <div className={classNames('rounded-[10px] text-sm font-semibold text-[#6b6b6b]')}>سبد خرید</div>
              </div>
            </button>
            <button className=" bg-white  w-[93px]  ring-0 border-none outline-none">
              <div className="flex flex-col items-center ring-0 border-none outline-none">
                <div
                  className={classNames(
                    'rounded-[10px] flex border-2 relative text-white border-red-500 bg-red-500 shadow items-center justify-center p-1.5  sm:text-base  font-light'
                  )}
                >
                  <TbTruck className={`icon h-8 w-8 text-white`} />
                  <div className="w-[56px] h-[2px] bg-[#f1f1f1] absolute -left-[58px] top-[22px]" />
                </div>
                <div className={classNames('rounded-[10px] text-sm font-semibold text-red-500')}>اطلاعات ارسال</div>
              </div>
            </button>
            <button className=" bg-white w-[93px] ring-0 border-none outline-none">
              <div className="flex flex-col items-center  ring-0 border-none outline-none">
                <div
                  className={classNames(
                    'rounded-[10px] relative flex border-2  items-center justify-center p-1.5  sm:text-base  font-light  text-[#6b6b6b] border-[#f1f1f1]'
                  )}
                >
                  <IoLogoUsd className={`icon h-8 w-8 text-[#3F3A42]`} />
                </div>
                <div className={classNames('rounded-[10px] text-sm font-semibold text-[#6b6b6b]')}> اطلاعات پرداخت</div>
              </div>
            </button>
          </div>
        </div>

        {/* step content */}
        <div className="mt-[75px] w-full flex justify-center">
          <div className="flex flex-col sm:flex-row md:pl-4  px-2 gap-6 max-w-6xl justify-center w-full">
            {/* address content */}
            <div className="h-fit rounded-xl py-0.5 pb-1  sm:w-[72%] ">
              {/* addresses */}
              <section className="">
                {selectedAddress == null ? (
                  <AddressModal
                    isShow={isShowAddressModal}
                    onClose={addressModalHandlers.close}
                    address={{} as IAddress}
                    refetch={refetch}
                    openIsAddressList={addressListModalHandlers.open}
                  />
                ) : (
                  <AddressModal isShow={isOpen} onClose={close} address={selectedAddress} refetch={refetch} />
                )}
                {selectedAddressState != null ? (
                  <section
                    key={selectedAddressState.id}
                    className={`flex-1 hover:shadow border-2 pr-5 relative m-4 mt-0 rounded-lg cursor-pointer border-[#e90089]`}
                  >
                    <div className={`absolute top-0 flex right-0 bg-[#e90089] w-6 h-6 rounded-bl-full`}>
                      <span className="text-white mr-1">✔</span>
                    </div>{' '}
                    <div className="flex justify-between py-5">
                      {/* rows */}
                      <div className="flex flex-col gap-4">
                        <div className="flex md:items-center w-full flex-col md:flex-row gap-x-12">
                          <div className="flex items-center md:w-36 gap-1.5">
                            <User className="text-xl text-gray-500" />
                            <span className="font-normal text-base">گیرنده محصول</span>
                          </div>
                          <span className="text-gray-400 font-normal">{selectedAddressState?.fullName}</span>
                        </div>
                        <div className="flex md:items-center w-full flex-col md:flex-row  gap-x-12">
                          <div className="flex items-center md:w-36 gap-1.5">
                            <BsTelephoneOutboundFill className="text-lg text-gray-500" />
                            <span className="font-normal text-base">شماره موبایل</span>
                          </div>
                          <span className="text-gray-400 font-normal farsi-digits">{selectedAddressState?.mobileNumber}</span>
                        </div>
                        <div className="flex md:items-center w-full flex-col md:flex-row  gap-x-12">
                          <div className="flex items-center md:w-36 gap-1.5">
                            <Location2 className="text-2xl -mr-1 text-gray-500" />
                            <span className="font-normal text-base">آدرس</span>
                          </div>
                          <span className="text-gray-400 font-normal">{selectedAddressState?.fullAddress}</span>
                        </div>
                      </div>
                      <div className="flex justify-start flex-col left-4 -mt-4 rounded-3xl h-fit ml-2">
                        <button
                          className="px-2 py-3"
                          onClick={() => {
                            open(selectedAddressState)
                          }}
                        >
                          <Edit className="text-xl text-gray-500 hover:text-blue-500  cursor-pointer" />
                        </button>
                      </div>
                    </div>
                  </section>
                ) : (
                  <div className="my-2">لطفا ادرس خود را انتخاب کنید</div>
                )}
                <hr />
                <button
                  className="bg-white px-4 md:px-1 border-none text-blue-500 w-full text-end py-3"
                  onClick={addressListModalHandlers.open}
                >
                  تغییر آدرس
                </button>
                <AddressListModal
                  open={addressModalHandlers.open}
                  handleSelectAddress={handleSelectAddress}
                  selectedAddressState={selectedAddressState ?? ({} as IAddress)}
                  isShow={isShowAddressListModal}
                  onClose={addressListModalHandlers.close}
                  addressDb={addressDb?.data?.addresses ?? []}
                  isLoading={isLoading}
                />

                <div className="w-full">
                  <div className="mb-3 text-sm text-gray-600">اگر توضیحی راجع به نحوه ارسال سفارش دارید بیان کنید</div>
                  <textarea
                    rows={4}
                    className="w-full resize-none rounded-md border border-gray-300"
                    name="note"
                    id="note"
                  ></textarea>
                </div>
              </section>
            </div>

            {/* summary */}
            <div className="flex-initial flex-col">
              {/* cart Info */}
              <section className="rounded-xl bg-[#efefef] h-fit">
                <CartSummary handleRoute={handleRoute} address />
              </section>

              {/* to Shipping */}
              <section className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-gray-300 bg-white p-3 shadow-3xl md:hidden">
                <Button className="w-1/2" onClick={handleRoute}>
                  تایید اطلاعات و ادامه
                </Button>
                <div>
                  <span className="font-light">جمع سبد خرید</span>
                  <div className="flex items-center">
                    <span className="farsi-digits text-sm">{formatNumber(totalPrice - totalDiscount)}</span>
                    تومان{' '}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRouteWrapper>
  )
}

export default AddressCart
