import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { useGetOrdersQuery, useGetUserInfoMeQuery } from '@/services'
import { IPermission } from '@/types'

interface OrderTabDashboardLayoutProps {
  children: ReactNode
}

// const tabs = [
//   { path: '/admin/orders', label: 'همه سفارشات' },
//   { path: '/admin/orders/new-order', label: 'سفارش جدید' },
//   { path: '/admin/orders/processing', label: 'در حال پردازش' },
//   { path: '/admin/orders/packing', label: 'درحال بسته بندی' },
//   { path: '/admin/orders/sending', label: 'درحال ارسال' },
//   { path: '/admin/orders/completed', label: 'تکمیل شده' },
//   { path: '/admin/orders/canceled', label: 'لغو شده' },
//   { path: '/admin/orders/returned', label: 'مرجوع شده' },
//   { path: '/admin/orders/deleted', label: 'زباله دان' },
// ]

const OrderTabDashboardLayout: React.FC<OrderTabDashboardLayoutProps> = ({ children }) => {
  const router = useRouter()
  const { pathname } = router
  const [permissions, setPermissions] = useState<IPermission[] | undefined>()

  const [allOrder, setAllOrder] = useState<number>()
  const [newOrder, setNewOrder] = useState<number>()
  const [processing, setProcessing] = useState<number>()
  const [packing, setBrandsInActivePagination] = useState<number>()
  const [sending, setSending] = useState<number>()
  const [completed, setCompleted] = useState<number>()
  const [canceled, setCanceled] = useState<number>()
  const [returned, setReturned] = useState<number>()
  const [deleted, setDeleted] = useState<number>()

  const useFetchOrders = (status: string) => {
    const commonOrderQueryParams = {
      pageSize: 99999,
      status: status !== '6' && status,
      isDeleted: status === '6',
      adminList: true,
    }

    const { data, isError, isFetching, isSuccess, refetch } = useGetOrdersQuery({ ...commonOrderQueryParams })

    return {
      data,
      isError,
      isFetching,
      isSuccess,
      refetch,
    }
  }

  const {
    data: allOrders,
    isError: isAllOrdersError,
    isFetching: isAllOrdersFetching,
    isSuccess: isAllOrdersSuccess,
    refetch: refetchAllOrders,
  } = useFetchOrders('')

  const {
    data: newOrders,
    isError: isNewOrdersError,
    isFetching: isNewOrdersFetching,
    isSuccess: isNewOrdersSuccess,
    refetch: refetchNewOrders,
  } = useFetchOrders('21')

  const {
    data: processingOrders,
    isError: isProcessingOrdersError,
    isFetching: isProcessingOrdersFetching,
    isSuccess: isProcessingOrdersSuccess,
    refetch: refetchProcessingOrders,
  } = useFetchOrders('22')

  const {
    data: packingOrders,
    isError: isPackingOrdersError,
    isFetching: isPackingOrdersFetching,
    isSuccess: isPackingOrdersSuccess,
    refetch: refetchPackingOrders,
  } = useFetchOrders('23')

  const {
    data: sendingOrders,
    isError: isSendingOrdersError,
    isFetching: isSendingOrdersFetching,
    isSuccess: isSendingOrdersSuccess,
    refetch: refetchSendingOrders,
  } = useFetchOrders('24')

  const {
    data: completedOrders,
    isError: isCompletedOrdersError,
    isFetching: isCompletedOrdersFetching,
    isSuccess: isCompletedOrdersSuccess,
    refetch: refetchCompletedOrders,
  } = useFetchOrders('3')

  const {
    data: canceledOrders,
    isError: isCanceledOrdersError,
    isFetching: isCanceledOrdersFetching,
    isSuccess: isCanceledOrdersSuccess,
    refetch: refetchCanceledOrders,
  } = useFetchOrders('4')

  const {
    data: returnedOrders,
    isError: isReturnedOrdersError,
    isFetching: isReturnedOrdersFetching,
    isSuccess: isReturnedOrdersSuccess,
    refetch: refetchReturnedOrders,
  } = useFetchOrders('5')

  const {
    data: deletedOrders,
    isError: isDeletedOrdersError,
    isFetching: isDeletedOrdersFetching,
    isSuccess: isDeletedOrdersSuccess,
    refetch: refetchDeletedOrders,
  } = useFetchOrders('6')

  useEffect(() => {
    if (allOrders) {
      setAllOrder(allOrders.data?.ordersLength)
    }
  }, [allOrders])

  useEffect(() => {
    if (newOrders) {
      setNewOrder(newOrders.data?.ordersLength)
    }
  }, [newOrders])

  useEffect(() => {
    if (processingOrders) {
      setProcessing(processingOrders.data?.ordersLength)
    }
  }, [processingOrders])

  useEffect(() => {
    if (packingOrders) {
      setBrandsInActivePagination(packingOrders.data?.ordersLength)
    }
  }, [packingOrders])

  useEffect(() => {
    if (sendingOrders) {
      setSending(sendingOrders.data?.ordersLength)
    }
  }, [sendingOrders])

  useEffect(() => {
    if (completedOrders) {
      setCompleted(completedOrders.data?.ordersLength)
    }
  }, [completedOrders])

  useEffect(() => {
    if (canceledOrders) {
      setCanceled(canceledOrders.data?.ordersLength)
    }
  }, [canceledOrders])

  useEffect(() => {
    if (returnedOrders) {
      setReturned(returnedOrders.data?.ordersLength)
    }
  }, [returnedOrders])

  useEffect(() => {
    if (deletedOrders) {
      setDeleted(deletedOrders.data?.ordersLength)
    }
  }, [deletedOrders])

  // دریافت permissions از context یا API
  const { data: userData } = useGetUserInfoMeQuery()

  useEffect(() => {
    if (userData?.data?.userSpecification?.role?.permissions) {
      setPermissions(userData.data.userSpecification.role.permissions)
    }
  }, [userData])

  const handleTabClick = useCallback(
    (path: string) => {
      router.push(path).catch((error) => {
        console.error('Failed to navigate:', error)
      })
    },
    [router]
  )

  const tabsWithLength = useMemo(
    () => [
      { path: '/admin/orders', label: 'همه سفارشات', length: allOrder },
      { path: '/admin/orders/new-order', label: 'سفارش جدید', length: newOrder },
      { path: '/admin/orders/processing', label: 'در حال پردازش', length: processing },
      { path: '/admin/orders/packing', label: 'درحال بسته بندی', length: packing },
      { path: '/admin/orders/sending', label: 'درحال ارسال', length: sending },
      { path: '/admin/orders/completed', label: 'تکمیل شده', length: completed },
      { path: '/admin/orders/canceled', label: 'لغو شده', length: canceled },
      { path: '/admin/orders/returned', label: 'مرجوع شده', length: returned },
      { path: '/admin/orders/deleted', label: 'زباله دان', length: deleted },
    ],
    [allOrder, newOrder, processing, packing, sending, completed, canceled, returned, deleted]
  )

  // فیلتر تب‌ها بر اساس permissions
  const filteredTabs = useMemo(() => {
     return tabsWithLength.filter((tab) => permissions?.some((permission) => permission.name === tab.label))
  }, [permissions, tabsWithLength])

  // رندر تب‌ها
  const renderedTabs = useMemo(
    () =>
      tabsWithLength.map((tab) => (
        <a
          key={tab.path}
          href={tab.path}
          onClick={(e) => {
            e.preventDefault()
            handleTabClick(tab.path)
          }}
          className={clsx(
            'px-3 py-2.5 whitespace-nowrap rounded-[10px] hover:shadow cursor-pointer text-sm',
            pathname === tab.path ? 'bg-[#e90089] text-white hover:bg-[#cf057b]' : 'bg-white text-black'
          )}
          aria-current={pathname === tab.path ? 'page' : undefined}
        >
          {tab.label} {tab.length !== undefined && `(${tab.length})`}
        </a>
      )),
    [handleTabClick, pathname, filteredTabs]
  )

  //   }

  return (
    <div className="min-h-screen max-w-screen-2xl flex flex-col mx-auto w-full pt-7 relative">
      {/* Tab Navigation */}
      <nav className=" top-0 z-50 max-w-screen-2xl w-full bg-[#f5f8fa] pb-3">
        <div className="py-4 overflow-auto flex gap-4 p-2 shadow-item mx-3 bg-white rounded-lg border-gray-200">
          {renderedTabs}
        </div>
      </nav>
      {/* Page Content */}
      <div className="mt-1 mb-4 overflow-auto rounded-lg">{children}</div>
    </div>
  )
}

export default OrderTabDashboardLayout

// ریدایرکت در صورت عدم دسترسی به تب فعلی
//   useEffect(() => {
//     const currentTabHasPermission = filteredTabs.some((tab) => pathname.startsWith(tab.path))

//     if (!currentTabHasPermission && filteredTabs.length > 0) {
//       router.push(filteredTabs[0].path)
//     }
//   }, [pathname, filteredTabs, router])

//   // اگر هیچ تبی با دسترسی وجود نداشت
//   if (filteredTabs.length === 0) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-gray-500">شما دسترسی به این بخش را ندارید</p>
//       </div>
//     )
