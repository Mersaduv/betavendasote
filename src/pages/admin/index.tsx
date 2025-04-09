import dynamic from 'next/dynamic'
import Head from 'next/head'
import Image from 'next/image'

import { roles } from '@/utils'

import { ProtectedRouteWrapper } from '@/components/user'
import { DashboardAdminAside } from '@/components/shared'

import type { NextPage } from 'next'
import Link from 'next/link'
import { DashboardLayout } from '@/components/Layouts'
import { useAppSelector } from '@/hooks'
import { CartAd } from '@/icons'
const AdminPage: NextPage = () => {
  const { generalSetting } = useAppSelector((state) => state.design)
  return (
    <ProtectedRouteWrapper>
      <div className="">
        <Head>
          <title>پیشخوان </title>
        </Head>
        <DashboardLayout>
          <div className=" flex w-full">
              <section className="py-20 flex mx-6 gap-8 justify-center w-full">
                <div className="grid grid-cols-3 gap-4">
                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>

                  <div className="w-[155px] h-[152px] bg-sky-500 rounded-lg flex flex-col justify-center items-center gap-3">
                    <div className="text-white">
                      <CartAd width="34px" height="34px" />
                    </div>
                    <div className="text-center text-white farsi-digits text-lg font-semibold">2</div>
                    <div className="-mt-2 text-white">سفارش جدید</div>
                  </div>
                </div>
                {/* chart */}
                <div></div>
              </section>
          </div>
        </DashboardLayout>
      </div>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(AdminPage), { ssr: false })
