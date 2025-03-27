import Head from 'next/head'
import dynamic from 'next/dynamic'
import { AmountAndCostTabsDashboardLayout, DashboardLayout } from '@/components/Layouts'
import type { NextPage } from 'next'
import {
  useDeleteEditPriceMutation,
  useGetCostsQuery,
  useGetEditPricesQuery,
  useGetTicketsQuery,
  useUpsertCostsMutation,
} from '@/services'
import { useRouter } from 'next/router'
import { ICostsForm, ITicket } from '@/types'
import { useDisclosure } from '@/hooks'
import { Fragment, useEffect, useState } from 'react'
import { LuSearch } from 'react-icons/lu'
import { Button } from '@/components/ui'
import { ProtectedRouteWrapper } from '@/components/user'
import { GetTicketsResult } from '@/services/user/types'
import { Menu, Transition } from '@headlessui/react'
import { TableSkeleton } from '@/components/skeleton'
import { DataStateDisplay, HandleResponse } from '@/components/shared'
import moment from 'moment-jalaali'
import { Pagination } from '@/components/navigation'
import { CategoryDetailModal, ConfirmDeleteModal } from '@/components/modals'
import { Controller, Resolver, SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { costsFormValidationSchema, notificationFormValidationSchema } from '@/utils'
const Costs: NextPage = () => {
  // States
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()
  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [priceDisplay, setPriceDisplay] = useState('')
  const [deliveryCostDisplay, setDeliveryCostDisplay] = useState('')
  // ? Assets
  const { query, push } = useRouter()
  const page = query.page ? +query.page : 1

  const [
    upsertCosts,
    {
      isLoading: isUpsertCostsLoading,
      isError: isUpsertCostsError,
      isSuccess: isUpsertCostsSuccess,
      error: upsertCostsError,
      data: upsertCostsData,
    },
  ] = useUpsertCostsMutation()

  const {
    isLoading: isGetCostsLoading,
    isError: isGetCostsError,
    isSuccess: isGetCostsSuccess,
    error: getCostsError,
    data: getCostsData,
  } = useGetCostsQuery()

  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors: formErrors, isValid },
  } = useForm<ICostsForm>({
    resolver: yupResolver(costsFormValidationSchema) as unknown as Resolver<ICostsForm>,
    defaultValues: {
      giftWrapped: 0,
      deliveryCost: 0,
    },
  })

  useEffect(() => {
    const loadData = async () => {
      if (getCostsData) {
        reset({
          id: getCostsData?.data?.id ?? '',
          giftWrapped: getCostsData?.data?.giftWrapped ?? 0,
          deliveryCost: getCostsData?.data?.deliveryCost ?? 0,
        })
        const giftWrapped = formatNumber(getCostsData?.data?.giftWrapped.toString() ?? '0')
        const deliveryCost = formatNumber(getCostsData?.data?.deliveryCost.toString() ?? '0')
        setPriceDisplay(giftWrapped)
        setDeliveryCostDisplay(deliveryCost)
      }
    }
    loadData()
  }, [getCostsData])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const formatNumber = (value: string) => {
    if (!value) return ''
    const numericValue = value.replace(/[^0-9]/g, '')
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '')
    const formattedValue = formatNumber(rawValue)
    setPriceDisplay(formattedValue)
    setValue('giftWrapped', rawValue ? Number(rawValue) : 0, { shouldValidate: true })
  }

  const handleDeliveryCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '')
    const formattedValue = formatNumber(rawValue)
    setDeliveryCostDisplay(formattedValue)
    setValue('deliveryCost', rawValue ? Number(rawValue) : 0, { shouldValidate: true })
  }

  const onSubmit = (data: ICostsForm) => {
    console.log(data)
    upsertCosts(data)
  }
  return (
    <ProtectedRouteWrapper>
      <>
        {(isUpsertCostsSuccess || isUpsertCostsError) && (
          <HandleResponse
            isError={isUpsertCostsError}
            isSuccess={isUpsertCostsSuccess}
            error={upsertCostsError}
            message={upsertCostsData?.message}
          />
        )}
        <DashboardLayout>
          <AmountAndCostTabsDashboardLayout>
            <Head>
              <title>هزینه ها</title>
            </Head>

            <form onSubmit={handleSubmit(onSubmit)} className="">
              <div className="rounded-lg shadow-item bg-white">
                <div className="flex flex-col xl2:flex-row justify-between px-2 py-4 border-b gap-4 border-gray-200 overflow-auto">
                  <div className="flex flex-col items-start justify-center">
                    <h2 className="pr-4 pb-2">هزینه ها</h2>
                  </div>{' '}
                </div>
                <div className="flex flex-col md:flex-row w-full rounded-xl  p-3 pt-0 pb-6 overflow-auto">
                  <div className="flex flex-col xs:flex-row px-4 py-4 pb-0 pt-6 w-full">
                    <label
                      htmlFor="giftWrapped"
                      className="flex items-center xs:py-0 pt-2 justify-center px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                    >
                      <span className="whitespace-nowrap text-center w-[113px]">مبلغ کادوپیچ</span>
                    </label>
                    <input
                      className="w-full border rounded-r-none border-gray-200 rounded-md farsi-digits"
                      type="text"
                      id="giftWrapped"
                      value={priceDisplay}
                      onChange={handlePriceChange}
                    />
                  </div>

                  <div className="flex flex-col xs:flex-row px-4 py-4 pb-0 pt-6 w-full">
                    <label
                      htmlFor="deliveryCost"
                      className="flex items-center xs:py-0 pt-2 justify-center px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                    >
                      <span className="whitespace-nowrap text-center w-[113px]">مبلغ ارسال</span>
                    </label>
                    <input
                      className="w-full border rounded-r-none border-gray-200 rounded-md farsi-digits"
                      type="text"
                      id="deliveryCost"
                      value={deliveryCostDisplay}
                      onChange={handleDeliveryCostChange}
                    />
                  </div>
                </div>
                <div className="bg-gray-50 bottom-0 w-full  rounded-b-lg px-8 flex flex-col pb-2">
                  <span className="font-normal text-[11px] pt-2">قیمت ها را به تومان وارد کنید</span>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button type="submit" className="rounded-md" isLoading={isUpsertCostsLoading}>
                  به‌روزرسانی
                </Button>
              </div>
            </form>
          </AmountAndCostTabsDashboardLayout>
        </DashboardLayout>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(Costs), { ssr: false })
