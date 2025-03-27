import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { clearCart } from '@/store'

import { Delete, EmptyCart, More } from '@/icons'
import { Menu, Transition } from '@headlessui/react'
import { CartItemDisplay, CartSummary } from '@/components/cart'
import { RedirectToLogin } from '@/components/modals'
import { Button } from '@/components/ui'
import { Header, MetaTags } from '@/components/shared'
import { formatNumber } from '@/utils'
import { Cart as CartIcon } from '@/icons'
import { TbTruck } from 'react-icons/tb'

import { useDisclosure, useAppSelector, useAppDispatch } from '@/hooks'

import type { NextPage } from 'next'
import { Fragment } from 'react'
import { IoLogoUsd } from 'react-icons/io5'
import { digitsEnToFa } from '@persian-tools/persian-tools'

const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ')
}

const Cart: NextPage = () => {
  // ? Assets
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const { generalSetting } = useAppSelector((state) => state.design)
  const [isShowRedirectModal, redirectModalHandlers] = useDisclosure()

  // ? Get UserInfo
  const { userInfo } = useAppSelector((state) => state.auth)

  // ? Store
  const { cartItems, totalItems, totalPrice, totalDiscount } = useAppSelector((state) => state.cart)

  // ? Handlers
  const handleRoute = () => {
    if (!userInfo) return redirectModalHandlers.open()

    push('/checkout/address-cart')
  }

  // ? Local Components
  const DeleteAllDropDown = () => (
    <Menu as="div" className="dropdown">
      <Menu.Button className="dropdown__button">
        <More className="icon" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="dropdown__items w-32 ">
          <Menu.Item>
            <button onClick={() => dispatch(clearCart())} className="flex-center gap-x-2 px-4 py-3">
              <Delete className="icon" />
              <span>حذف همه</span>
            </button>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )

  // ? Render(s)
  if (cartItems.length === 0)
    return (
      <>
        <Header />
        <section className="mx-auto mb-20 space-y-3 py-2 lg:mb-0 lg:mt-6 lg:max-w-7xl lg:space-y-0 lg:rounded-md lg:border lg:border-gray-200 lg:px-5 lg:py-4 xl:mt-36">
        <MetaTags
          title={generalSetting?.title + ' | ' + 'سبد خرید' || 'فروشگاه اینترنتی'}
          description={generalSetting?.shortIntroduction || 'توضیحاتی فروشگاه اینترنتی'}
          keywords={generalSetting?.googleTags || ' اینترنتی, فروشگاه'}
        />
          <div className="section-divide-y" />

          <div className="py-20">
            <EmptyCart className="mx-auto h-52 w-52" />
            <p className="text-center text-base font-bold">سبد خرید شما خالی است!</p>
          </div>
        </section>
      </>
    )

  return (
    <>
      <RedirectToLogin
        title="شما هنوز وارد نشدید"
        text=""
        onClose={redirectModalHandlers.close}
        isShow={isShowRedirectModal}
      />
      <Header />

      <main className="mt-[80px]">
        <Head>
          <title>{generalSetting?.title} | سبد خرید</title>
        </Head>

        <div className=" flex flex-col items-center px-4 md:px-8">
          <div className="flex flex-col items-center px-4 md:px-8">
            <div className="flex justify-between w-[300px]">
              <button className=" bg-white  w-[93px]  ring-0 border-none outline-none">
                <div className="flex flex-col items-center ring-0 border-none outline-none">
                  <div
                    className={classNames(
                      'rounded-[10px] flex border-2 relative text-white border-red-500 bg-red-500 shadow items-center justify-center p-1.5  sm:text-base  font-light'
                    )}
                  >
                    <CartIcon className={`icon h-8 w-8 text-white`} />
                    <div className="w-[56px] h-[2px] bg-[#f1f1f1] absolute -left-[58px] top-[22px]" />
                  </div>
                  <div className={classNames('rounded-[10px] text-sm font-semibold text-red-500')}>سبد خرید</div>
                </div>
              </button>

              <button className=" bg-white w-[93px] ring-0 border-none outline-none">
                <div className="flex flex-col items-center  ring-0 border-none outline-none">
                  <div
                    className={classNames(
                      'rounded-[10px] relative flex border-2  items-center justify-center p-1.5  sm:text-base  font-light  text-[#6b6b6b] border-[#f1f1f1]'
                    )}
                  >
                    <TbTruck className={`icon h-8 w-8 text-[#3F3A42]`} />
                    <div className="w-[56px] h-[2px] bg-[#f1f1f1] absolute -left-[58px] top-[22px]" />
                  </div>
                  <div className={classNames('rounded-[10px] text-sm font-semibold text-[#6b6b6b]')}>
                    {' '}
                    اطلاعات ارسال
                  </div>
                </div>
              </button>

              <button className="bg-white w-[93px] ring-0 border-none outline-none">
                <div className="flex flex-col items-center  ring-0 border-none outline-none">
                  <div
                    className={classNames(
                      'rounded-[10px] relative flex border-2  items-center justify-center p-1.5  sm:text-base  font-light  text-[#6b6b6b] border-[#f1f1f1]'
                    )}
                  >
                    <IoLogoUsd className={`icon h-8 w-8 text-[#3F3A42]`} />
                  </div>
                  <div className={classNames('rounded-[10px] text-sm font-semibold text-[#6b6b6b]')}>
                    {' '}
                    اطلاعات پرداخت
                  </div>
                </div>
              </button>
            </div>
          </div>
          <div className="mt-[75px] w-full flex justify-center">
            <div className="flex flex-col sm:flex-row  gap-6 max-w-6xl justify-center w-full">
              {/* cart content */}
              <div className="h-fit border rounded-xl py-3 pb-1  sm:w-[72%] ">
                {/* title */}
                <section className="flex justify-between px-4">
                  <div>
                    <span className="farsi-digits">{digitsEnToFa(formatNumber(totalItems))} کالا</span>
                  </div>
                  <DeleteAllDropDown />
                </section>
                {/* carts */}
                <section className="">
                  {cartItems.map((item) => (
                    <CartItemDisplay item={item} key={item.itemID} />
                  ))}
                </section>
              </div>
              {/* summary cart  */}
              <div className="flex-initial flex-col">
                {/* cart Info */}
                <section className="rounded-xl bg-[#efefef] h-fit">
                  <CartSummary handleRoute={handleRoute} cart />
                </section>

                {/* to Shipping */}
                <section className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-gray-300 bg-white p-3 shadow-3xl md:hidden">
                  <Button className="w-1/2" onClick={handleRoute}>
                    ثبت و ادامه
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
        </div>
      </main>
    </>
  )
}

export default dynamic(() => Promise.resolve(Cart), { ssr: false })
