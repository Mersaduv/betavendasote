import { useEffect, useState } from 'react'

import { clearCart, clearIsProcessPayment, setAddress, showAlert } from '@/store'

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
import { useCreateOrderMutation, useGetUserInfoMeQuery, usePlaceOrderMutation } from '@/services'
import { AddressSkeleton } from '@/components/skeleton'
import { BsTelephoneOutboundFill } from 'react-icons/bs'
import { IAddress } from '@/types'
import { ArrowLeft, Cart, Location2, LogoPersian, Rule, Wallet } from '@/icons'
import { CartSummary } from '@/components/cart'
import { HandleResponse, Header, MetaTags } from '@/components/shared'
import { ResponsiveImage, Button } from '@/components/ui'
import Head from 'next/head'
import type { NextPage } from 'next'
import type { IOrder, WithAddressModalProps } from '@/types'
import dynamic from 'next/dynamic'

const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ')
}

const ShippingPage: NextPage = () => {
  const { push } = useRouter()

  // ? Get UserInfo
  const { userInfo, address } = useAppSelector((state) => state.auth)

  // ? Assets
  const dispatch = useAppDispatch()
  const { generalSetting } = useAppSelector((state) => state.design)
  // ? States
  const [paymentMethod, setPaymentMethod] = useState('درگاه پرداخت')
  const [orderCreated, setOrderCreated] = useState(false)
  const [orderId, setOrderId] = useState<string>()
  // ? Store
  const { cartItems, totalItems, totalDiscount, totalPrice, isProcessPayment, placeOrderId, isGiftWrapped } =
    useAppSelector((state) => state.cart)
  // ? Handlers
  // ? Create Order Query
  const [postData, { data, isSuccess, isError, isLoading, error }] = useCreateOrderMutation()
  const [
    placeOrder,
    {
      data: updateData,
      isSuccess: updateIsSuccess,
      isError: updateIsError,
      isLoading: updateIsLoading,
      error: updateError,
    },
  ] = usePlaceOrderMutation()

  const saveIncompleteOrder = () => {
    const note = localStorage.getItem('note')
    if (!address?.city && !address?.province && !address?.fullAddress && !address?.postalCode) {
      return dispatch(
        showAlert({
          status: 'error',
          title: 'لطفا آدرس خود را تکمیل کنید',
        })
      )
    } else {
      const formData = new FormData()
      formData.append('address', address.id)
      formData.append('note', note || '')
      formData.append('status', '1')
      formData.append('cart', JSON.stringify(cartItems))
      formData.append('totalItems', totalItems.toString())
      formData.append('orgPrice', (totalPrice - totalDiscount).toString())
      formData.append('totalPrice', totalPrice.toString())
      formData.append('totalDiscount', totalDiscount.toString())
      formData.append('paymentMethod', paymentMethod)
      formData.append('isGiftWrapped', isGiftWrapped.toString())

      postData(formData)
        .unwrap()
        .then((d) => {
          localStorage.removeItem('note')
          dispatch(clearCart())
        })
        .catch((error) => {})
    }
  }

  // ? Handlers
  const handleCreateOrder = () => {
    if (!address?.city && !address?.province && !address?.fullAddress && !address?.postalCode) {
      return dispatch(
        showAlert({
          status: 'error',
          title: 'لطفا آدرس خود را تکمیل کنید',
        })
      )
    } else if (!isProcessPayment) {
      placeOrder({ id: orderId ?? '' })
      setOrderCreated(true)
    }
    if (isProcessPayment) {
      placeOrder({ id: placeOrderId })
      setOrderCreated(true)
      dispatch(clearIsProcessPayment())
    }
  }

  useEffect(() => {
    if (data?.data) {
      setOrderId(data.data)
    }
  }, [data])

  useEffect(() => {
    if (!isProcessPayment && totalItems > 0) {
      const timeout = setTimeout(() => {
        if (!orderCreated) {
          saveIncompleteOrder()
        }
      }, 0)
      return () => clearTimeout(timeout)
    }
  }, [orderCreated, address])

  // ? Render(s)
  return (
    <ProtectedRouteWrapper>
      {/*  Handle Create Order Response */}
      {(isSuccess || isError) && orderCreated && (
        <HandleResponse
          isError={updateIsError}
          isSuccess={updateIsSuccess}
          error={updateError}
          message={updateData?.message}
          onSuccess={() => {
            dispatch(clearCart())
            if (orderCreated) {
              push('/profile')
            }
          }}
        />
      )}

      {(updateIsSuccess || updateIsError) && orderCreated && (
        <HandleResponse
          isError={updateIsError}
          isSuccess={updateIsSuccess}
          error={updateError}
          message={updateData?.message}
          onSuccess={() => {
            push('/profile')
          }}
        />
      )}

      <Header />
      <main className="mt-[80px]">
        <MetaTags
          title={generalSetting?.title + ' | ' + 'پرداخت' || 'فروشگاه اینترنتی'}
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
                    'rounded-[10px] flex border-2 border-[#f1f1f1] relative text-white items-center justify-center p-1.5  sm:text-base  font-light'
                  )}
                >
                  <TbTruck className={`icon h-8 w-8 text-[#3F3A42]`} />
                  <div className="w-[56px] h-[2px] bg-[#f1f1f1] absolute -left-[58px] top-[22px]" />
                </div>
                <div className={classNames('rounded-[10px] text-sm font-semibold text-[#6b6b6b]')}>اطلاعات ارسال</div>
              </div>
            </button>
            <button className=" bg-white w-[93px] ring-0 border-none outline-none">
              <div className="flex flex-col items-center  ring-0 border-none outline-none">
                <div
                  className={classNames(
                    'rounded-[10px] relative flex border-2  border-red-500 bg-red-500 items-center justify-center p-1.5  sm:text-base  font-light  text-[#6b6b6b] '
                  )}
                >
                  <IoLogoUsd className={`icon h-8 w-8  text-white`} />
                </div>
                <div className={classNames('rounded-[10px] text-sm font-semibold   text-red-500')}> اطلاعات پرداخت</div>
              </div>
            </button>
          </div>
        </div>

        {/* summary cart  */}
        <div className="flex-initial flex-col mt-20">
          {/* cart Info */}

          <Button onClick={handleCreateOrder} className="mx-auto w-full max-w-2xl">
            نهایی کردن خرید
          </Button>
        </div>
      </main>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(ShippingPage), { ssr: false })
