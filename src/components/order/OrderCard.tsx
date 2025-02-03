import moment from 'moment-jalaali'

import { formatNumber } from '@/utils'
import {
  useGetCanceledsQuery,
  useGetReturnedsQuery,
  useUpdateOrderCanceledMutation,
  useUpdateOrderMutation,
  useUpdateOrderReturnedMutation,
} from '@/services'

import { Check, Clock2, Minus, More, Plus, Toman } from '@/icons'
import { HandleResponse } from '@/components/shared'
import { ResponsiveImage } from '@/components/ui'

import type { IOrder } from '@/types'
import { digitsEnToFa } from '@persian-tools/persian-tools'

interface Props {
  order: IOrderDTO
  singleOrder?: boolean
  isDelivered?: boolean
  isReturned?: boolean
  isCanceled?: boolean
  isCurrently?: boolean
  isProcessPay?: boolean
}
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { setIsProcessPayment, showAlert } from '@/store'
import { useAppDispatch } from '@/hooks'
import { IOrderDTO } from '@/services/order/types'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { PdfGenerator } from '../builders'
import { MdClose } from 'react-icons/md'
type ReturnedProduct = {
  quantity: number
  selectReturned: string
  description?: string
  selectedFiles?: File[]
}
type SelectedReturnedProducts = Record<string, ReturnedProduct>
const OrderCard: React.FC<Props> = (props) => {
  const { push } = useRouter()

  const dispatch = useAppDispatch()
  // ? Props
  const { order, singleOrder, isCanceled, isDelivered, isReturned, isCurrently, isProcessPay } = props

  // ? Edit Order Query
  const [
    editOrderCanceled,
    { data: dataCanceled, isSuccess: isSuccessCanceled, isError: isErrorCanceled, error: errorCanceled },
  ] = useUpdateOrderCanceledMutation()

  const [
    editOrderReturned,
    { data: dataReturned, isSuccess: isSuccessReturned, isError: isErrorReturned, error: errorReturned },
  ] = useUpdateOrderReturnedMutation()

  // ? Canceled reason
  const { data: canceledData } = useGetCanceledsQuery({ page: 1, pageSize: 99 })
  const { data: returnedData } = useGetReturnedsQuery({ page: 1, pageSize: 99 })

  // ? State for showing order details
  const [showDetails, setShowDetails] = useState(false)
  const [showCancelSubmit, setCancelSubmit] = useState(false)
  const [showReturnedSubmit, setReturnedSubmit] = useState(false)
  const [isAccordionOpen, setIsAccordionOpen] = useState(false)
  const [isSecondAccordionOpen, setIsSecondAccordionOpen] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<{ [key: string]: boolean }>({})
  // const [selectedReturnedProducts, setSelectedReturnedProducts] = useState<{
  //   [key: string]: { quantity: number }
  // }>({})
  const [selectedReturnedProducts, setSelectedReturnedProducts] = useState<SelectedReturnedProducts>({})

  const [selectCanceled, setSelectCanceled] = useState<string>()
  const [selectReturned, setSelectReturned] = useState<string>()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [description, setDescription] = useState('')
  // ? Handlers
  const handleDescriptionChange = (itemID: string, value: string) => {
    setSelectedReturnedProducts((prev) => ({
      ...prev,
      [itemID]: {
        ...prev[itemID],
        description: value,
      },
    }))
  }
  const handleToggleDetails = () => {
    setShowDetails(!showDetails)
  }

  const handleToggleCancelSubmit = () => {
    setCancelSubmit(!showCancelSubmit)
  }
  const handleToggleContinueSubmit = () => {
    editOrderCanceled({
      canceledId: selectCanceled ?? '',
      itemID: Object.keys(selectedProducts),
      orderId: order.id,
      status: 5,
    })
    setCancelSubmit(!showCancelSubmit)
  }

  const handleToggleReturnedSubmit = () => {
    setReturnedSubmit(!showReturnedSubmit)
  }

  const handleToggleReturnedContinueSubmit = () => {
    // بررسی می‌کنیم که برای آیتم‌هایی که تعداد مرجوعی (quantity) بیشتر از 0 دارند،
    // علت مرجوعی انتخاب شده باشد
    const invalidReason = Object.values(selectedReturnedProducts).some(
      (item) => item.quantity > 0 && !item.selectReturned
    );
    if (invalidReason) {
      return dispatch(
        showAlert({
          status: 'error',
          title: 'لطفا علت مرجوعی را برای آیتم(های) انتخاب شده وارد کنید',
        })
      );
    }
  
    // بررسی تعداد (در اینجا هم برای آیتم‌هایی که انتخاب شده‌اند)
    const invalidQuantity = Object.values(selectedReturnedProducts).some(
      (item) => item.quantity > 0 && !item.quantity
    );
    if (invalidQuantity) {
      return dispatch(
        showAlert({
          status: 'error',
          title: 'لطفا تعداد را برای آیتم(های) انتخاب شده تعیین کنید',
        })
      );
    }
  
    // آماده‌سازی فرم دیتا
    const formData = new FormData();
  
    // ساخت آرایه‌ای از آیتم‌های انتخاب‌شده که تعداد مرجوعی بیشتر از 0 دارند
    const items = Object.entries(selectedReturnedProducts)
      .filter(([itemId, data]) => data.quantity > 0)
      .map(([itemId, data]) => ({
        itemId,
        quantity: data.quantity,
        returnedId: data.selectReturned,
        description: data.description || '',
        files: data.selectedFiles || [],
      }));
  
    // اضافه کردن اطلاعات هر آیتم به formData
    items.forEach((item, index) => {
      formData.append(`Items[${index}].ItemID`, item.itemId);
      formData.append(`Items[${index}].Quantity`, item.quantity.toString());
      formData.append(`Items[${index}].ReturnedId`, item.returnedId);
      formData.append(`Items[${index}].Description`, item.description);
      if (item.files.length > 0) {
        item.files.forEach((file) => {
          formData.append(`Items[${index}].Files`, file);
        });
      }
    });
  
    // اضافه کردن اطلاعات عمومی مانند شناسه سفارش و وضعیت (در اینجا به عنوان مثال)
    formData.append('OrderId', order.id);
    formData.append('Status', '4');
  
    // ارسال فرم دیتا
    editOrderReturned(formData);
    setReturnedSubmit(!showReturnedSubmit);
  };
  const handleQuantityChange = (itemID: string, newQuantity: number, maxQuantity: number) => {
    if (newQuantity >= 0 && newQuantity <= maxQuantity) {
      setSelectedReturnedProducts((prev) => ({
        ...prev,
        [itemID]: {
          ...prev[itemID],
          quantity: newQuantity,
        },
      }))
    }
  }
  const handleFileChange = (itemID: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles: File[] = Array.from(files)
      setSelectedReturnedProducts((prev) => ({
        ...prev,
        [itemID]: {
          ...prev[itemID],
          selectedFiles: [...(prev[itemID]?.selectedFiles || []), ...validFiles],
        },
      }))
    }
  }

  const handleGeneratePdf = (order: IOrderDTO) => {
    return (
      <PDFDownloadLink document={<PdfGenerator order={order} />} fileName="order.pdf">
        {({ blob, url, loading, error }) => (loading ? 'در حال ساختن PDF...' : 'فاکتور')}
      </PDFDownloadLink>
    )
  }

  const handleAccordionToggle = () => {
    setIsAccordionOpen(!isAccordionOpen)
    setIsSecondAccordionOpen(false)
  }

  const handleSecondAccordionToggle = () => {
    setIsSecondAccordionOpen(!isSecondAccordionOpen)
    setIsAccordionOpen(false)
  }

  const handleSelectProductOrderChange = (e: React.ChangeEvent<HTMLInputElement>, itemID: string) => {
    const { checked } = e.target
    setSelectedProducts((prevSelectedProducts) => ({
      ...prevSelectedProducts,
      [itemID]: checked,
    }))
  }

  const handleSelectCanceled = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectCanceled(e.target.value)
  }

  const handleSelectReturned = (itemID: string, value: string) => {
    setSelectedReturnedProducts((prev) => ({
      ...prev,
      [itemID]: {
        ...prev[itemID],
        selectReturned: value,
      },
    }))
  }

  const handleDeleteFile = (itemID: string, fileIndex: number) => {
    setSelectedReturnedProducts((prev) => {
      const currentFiles = prev[itemID]?.selectedFiles || []
      const updatedFiles = currentFiles.filter((_, idx) => idx !== fileIndex)
      return {
        ...prev,
        [itemID]: {
          ...prev[itemID],
          selectedFiles: updatedFiles,
        },
      }
    })
  }

  // ? Render(s)
  return (
    <div
      className={`${
        showCancelSubmit || showReturnedSubmit
          ? 'border rounded-lg p-2 border-[#e90089]'
          : showDetails
          ? 'border-blue-600 border rounded-lg'
          : ''
      }`}
    >
      {/* Handle Edit Order Response */}
      {(isSuccessReturned || isErrorReturned || isErrorCanceled || isSuccessCanceled) && (
        <HandleResponse
          isError={isErrorReturned || isErrorCanceled}
          isSuccess={isSuccessReturned || isSuccessCanceled}
          error={errorReturned || errorCanceled}
          message={dataCanceled?.message || dataReturned?.message}
        />
      )}

      <div
        className={` border-gray-200 ${
          showCancelSubmit || showReturnedSubmit ? ' border-gray-200' : 'border rounded-lg border-gray-200'
        }`}
      >
        <>
          <div
            className={`overflow-auto transition-all ease-in-out duration-700 ${
              showDetails ? 'max-h-screen' : 'max-h-0'
            }`}
          >
            {order.cart.map((cartItem) => (
              <div key={cartItem.itemID} className="border-b flex flex-col ">
                <div className="flex justify-between">
                  <div className="flex py-2 pr-3 gap-3">
                    <img className="w-36 h-[150px]" src={cartItem.img.imageUrl} alt="" />
                    <div className="flex flex-col justify-between py-4">
                      <div>
                        <span>کد محصول : </span>
                        <span className="farsi-digits">{cartItem.productCode}</span>
                      </div>
                      <div>{cartItem.name}</div>
                      <div className="flex items-center gap-5">
                        {cartItem.color != null && (
                          <div className="flex items-center gap-2">
                            <span>رنگ:</span> {cartItem.color?.name}
                            <div
                              className="inline-block mb-1 w-5 h-5 rounded-md shadow-3xl"
                              style={{ background: cartItem.color?.hexCode }}
                            ></div>
                          </div>
                        )}

                        {cartItem.size != null && (
                          <div className="flex gap-2">
                            <div>سایز :</div>
                            <div
                              className={`border cursor-pointer  font-semibold flex pt-0.5 items-center justify-center rounded-md text-gray-500  border-gray-400 w-7 h-6 }`}
                            >
                              {cartItem.size.name}
                            </div>
                          </div>
                        )}

                        {cartItem.features != null && (
                          <div className="flex gap-2">
                            {' '}
                            <div>{cartItem.features.title} : </div>{' '}
                            <div>
                              {cartItem.features.value?.map((item) => (
                                <div>{item.name}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-xs xs:text-base font-normal text-gray-700 ml-1">
                      {digitsEnToFa(formatNumber(cartItem.price))}
                    </span>
                    تومان
                  </div>
                </div>

                <div className="flex w-full border-t p-5 items-center gap-3 flex-wrap">
                  <div className="flex gap-2 items-center whitespace-nowrap">
                    <span className="text-sm text-gray-400 font-normal">تحویل گیرنده : </span>
                    <span className="text-sm ">{order.address.fullName}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <div className="flex gap-2 items-center whitespace-nowrap">
                    <span className="text-sm text-gray-400 font-normal">شماره موبایل : </span>
                    <span className="text-sm ">{digitsEnToFa(order.address.mobileNumber ?? '')}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <div className="flex gap-2 items-center whitespace-nowrap">
                    <span className="text-sm text-gray-400 font-normal">آدرس : </span>
                    <span className="text-sm ">{order.address.fullAddress}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <>
            <div className="flex items-center justify-between lg:px-3 pb-3 pt-4 mr-0.5">
              {isCanceled ? (
                <div className="flex items-center gap-x-2 ">
                  <img src="/images/icons/0003.png" alt="پروسس" className="h-5 w-5" />
                  <span className="text-base text-gray-700 font-light">{'لغو شده'}</span>
                </div>
              ) : isReturned ? (
                <div className="flex items-center gap-x-2 ">
                  <img src="/images/icons/0005.png" alt="پروسس" className="h-5 w-5" />
                  <span className="text-base text-gray-700 font-light">{'درانتظار بازگشت کالا'}</span>
                </div>
              ) : isDelivered ? (
                <div className="flex items-center gap-x-2 ">
                  <img src="/images/icons/0001.png" alt="پروسس" className="h-5 w-5" />
                  <span className="text-base text-gray-700 font-light">{'تحویل شده'}</span>
                </div>
              ) : isCurrently ? (
                <div className="flex items-center gap-x-2 ">
                  <img src="/images/icons/0004.png" alt="پروسس" className="h-5 w-5" />
                  <span className="text-base text-gray-700 font-light">
                    {'خرید جدید/درحال پردازش/درحال بسته بندی /درحال ارسال'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-x-2 ">
                  <img src="/images/icons/0002.png" alt="پروسس" className="h-5 w-5" />
                  <span className="text-base text-gray-700 font-light">{'در انتظار پرداخت'}</span>
                </div>
              )}
              {/* {singleOrder && (
                <div className="group relative h-fit self-end px-1.5">
                  <More className="icon cursor-pointer" />
                  <div className="absolute left-0 top-5 z-10 hidden rounded bg-white px-4 py-3 shadow-3xl group-hover:flex">
                    <div className="space-y-4">
                      <button
                        type="button"
                        className="flex w-48 items-center gap-x-3 lg:w-56"
                        onClick={handleChangeToDelivered}
                        disabled={order.delivered}
                      >
                        <Check className="icon rounded-full bg-green-500 p-0.5 text-white " />
                        <span className="block">تغییر وضعیت به تحویل شده</span>
                      </button>
                      <button
                        type="button"
                        className="flex w-48 items-center gap-x-3 lg:w-56"
                        onClick={handleChangeToInProccess}
                        disabled={!order.delivered}
                      >
                        <Clock2 className="icon rounded-full bg-amber-500 p-0.5 text-white " />
                        <span className="block">تغییر وضعیت به در حال پردازش</span>
                      </button>
                    </div>
                  </div>
                </div>
              )} */}
            </div>
            <div className="flex flex-wrap justify-between py-2 px-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-2 items-center whitespace-nowrap">
                  <span className="text-lg text-gray-400 font-normal">تاریخ سفارش</span>
                  <span className="text-lg ">{digitsEnToFa(moment(order.updated).format('jYYYY/jM/jD'))}</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex gap-2 items-center whitespace-nowrap">
                  <span className="text-lg text-gray-400 font-normal">کد سفارش</span>
                  <span className="text-lg ">{digitsEnToFa(order.orderNum)}</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex gap-2 items-center whitespace-nowrap">
                  <span className="text-lg text-gray-400 font-normal">مبلغ سفارش</span>
                  <span className="text-lg ">{digitsEnToFa(order.totalPrice)} تومان</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex gap-2 items-center whitespace-nowrap">
                  <span className="text-lg text-gray-400 font-normal">تخفیف</span>
                  <span className="text-lg ">{digitsEnToFa(order.totalDiscount)} تومان</span>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-wrap  gap-x-5 gap-y-3 pb-5  lg:border-gray-200 px-3">
              {showCancelSubmit && (
                <div className="mt-1 w-full">
                  <label htmlFor="reason" className="block mb-2 text-base font-medium text-gray-900">
                    علت لغو
                  </label>
                  <select
                    id="reason"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-2/3 p-2.5"
                    onChange={handleSelectCanceled}
                    value={selectCanceled}
                  >
                    <option className="option-selector" value="" selected>
                      انتخاب علت لغو خرید
                    </option>
                    {canceledData?.data?.data?.map((cancel) => (
                      <option key={cancel.id} className="option-selector" value={cancel.id}>
                        {cancel.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* {showReturnedSubmit && (
                <div className="mt-1 w-full">
                  <label htmlFor="reason" className="block mb-2 text-base font-medium text-gray-900">
                    علت مرجوعی
                  </label>
                  <select
                    id="reason"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-2/3 p-2.5"
                    onChange={handleSelectReturned}
                    value={selectReturned}
                  >
                    <option className="option-selector" value="" selected>
                      انتخاب مرجوعی خرید
                    </option>
                    {returnedData?.data?.data?.map((returned) => (
                      <option key={returned.id} className="option-selector" value={returned.id}>
                        {returned.title}
                      </option>
                    ))}
                  </select>
                </div>
              )} */}
              {!showCancelSubmit &&
                order.cart.map((cartItem) => (
                  <ResponsiveImage
                    key={cartItem.itemID}
                    dimensions="w-[100px] h-[100px]"
                    src={cartItem.img.imageUrl}
                    blurDataURL={cartItem.img.placeholder}
                    alt={cartItem.name}
                    imageStyles="object-contain border rounded"
                  />
                ))}
              {!showReturnedSubmit &&
                order.cart.map((cartItem) => (
                  <ResponsiveImage
                    key={cartItem.itemID}
                    dimensions="w-[100px] h-[100px]"
                    src={cartItem.img.imageUrl}
                    blurDataURL={cartItem.img.placeholder}
                    alt={cartItem.name}
                    imageStyles="object-contain border rounded"
                  />
                ))}
              <div
                className={`overflow-auto w-full transition-all ease-in-out duration-700 ${
                  showCancelSubmit ? 'max-h-screen' : 'max-h-0'
                }`}
              >
                <div className="py-2 border-t bg-white">
                  {order.cart.map((cartItem) => (
                    <div key={cartItem.itemID} className="border-b hover:shadow-product flex justify-between">
                      <div className="flex py-2 pr-3 gap-3">
                        <div className="flex items-center">
                          <div className="mb-1.5 flex justify-between px-4">
                            <input
                              className="bg-gray-200 border-none rounded checked:bg-[#e90089]"
                              type="checkbox"
                              value={cartItem.itemID}
                              onChange={(e) => handleSelectProductOrderChange(e, cartItem.itemID)}
                              checked={selectedProducts[cartItem.itemID] || false}
                            />
                          </div>
                          <img className="w-36 h-[150px]" src={cartItem.img.imageUrl} alt="" />
                        </div>
                        <div className="flex flex-col justify-between py-4">
                          <div>
                            <span>کد محصول : </span>
                            <span className="farsi-digits">{cartItem.productCode}</span>
                          </div>
                          <div>{cartItem.name}</div>
                          <div className="flex items-center gap-5">
                            {cartItem.color != null && (
                              <div className="flex items-center gap-2">
                                <span>رنگ:</span> {cartItem.color?.name}
                                <div
                                  className="inline-block mb-1 w-5 h-5 rounded-md shadow-3xl"
                                  style={{ background: cartItem.color?.hexCode }}
                                ></div>
                              </div>
                            )}

                            {cartItem.size != null && (
                              <div className="flex gap-2">
                                <div>سایز :</div>
                                <div
                                  className={`border cursor-pointer  font-semibold flex pt-0.5 items-center justify-center rounded-md text-gray-500  border-gray-400 w-7 h-6 }`}
                                >
                                  {cartItem.size.name}
                                </div>
                              </div>
                            )}

                            {cartItem.features != null && (
                              <div className="flex gap-2">
                                {' '}
                                <div>{cartItem.features.title} : </div>{' '}
                                <div>
                                  {cartItem.features.value?.map((item) => (
                                    <div>{item.name}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <span className="text-xs xs:text-base font-normal text-gray-700 ml-1">
                          {digitsEnToFa(formatNumber(cartItem.price))}
                        </span>
                        تومان
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`overflow-auto w-full transition-all ease-in-out duration-700 ${
                  showReturnedSubmit ? 'max-h-screen' : 'max-h-0'
                }`}
              >
                <div className="py-2 border-t bg-white">
                  {order.cart.map((cartItem) => (
                    <div key={cartItem.itemID} className="pb-8 hover:shadow-product">
                      <div className="flex justify-between w-full">
                        {/* بخش نمایش تصویر و مشخصات محصول */}
                        <div className="flex py-2 pr-3 gap-3">
                          <div className="flex items-center flex-col">
                            <img className="w-36 h-[150px]" src={cartItem.img.imageUrl} alt="" />
                          </div>
                          <div className="flex flex-col justify-between py-4">
                            <div>
                              <span>کد محصول : </span>
                              <span className="farsi-digits">{cartItem.productCode}</span>
                            </div>
                            <div>{cartItem.name}</div>
                            {/* نمایش مشخصات رنگ، سایز و ... */}
                            {/* ... */}
                          </div>
                        </div>
                        <div className="p-4">
                          <span className="text-xs xs:text-base font-normal text-gray-700 ml-1">
                            {digitsEnToFa(formatNumber(cartItem.price))}
                          </span>
                          تومان
                        </div>
                      </div>

                      <div className="mb-1.5 flex items-start gap-4 px-2 w-full">
                        {/* بخش تغییر تعداد مرجوعی */}
                        <div className="flex flex-col justify-between">
                          <div className="whitespace-nowrap block mb-2 text-base font-medium text-gray-900">
                            تعداد مرجوعی
                          </div>
                          <div className="flex items-center gap-1 border rounded p-0.5 w-fit">
                            <button
                              className="w-6 h-6 flex items-center justify-center rounded bg-[#f04d44] hover:bg-[#f06c65]"
                              onClick={() =>
                                handleQuantityChange(
                                  cartItem.itemID,
                                  (selectedReturnedProducts[cartItem.itemID]?.quantity || 0) - 1,
                                  cartItem.quantity
                                )
                              }
                            >
                              <Minus size={16} color="white" />
                            </button>

                            <span className="w-4 text-center farsi-digits">
                              {selectedReturnedProducts[cartItem.itemID]?.quantity || 0}
                            </span>

                            <button
                              className="w-6 h-6 flex items-center justify-center rounded bg-[#f04d44] hover:bg-[#f06c65]"
                              onClick={() =>
                                handleQuantityChange(
                                  cartItem.itemID,
                                  (selectedReturnedProducts[cartItem.itemID]?.quantity || 0) + 1,
                                  cartItem.quantity
                                )
                              }
                            >
                              <Plus size={16} color="white" />
                            </button>
                          </div>
                        </div>

                        {/* بخش انتخاب علت مرجوعی */}
                        <div className="w-full">
                          <label
                            htmlFor={`reason-${cartItem.itemID}`}
                            className="block mb-2 text-base font-medium text-gray-900"
                          >
                            علت مرجوعی
                          </label>
                          <select
                            id={`reason-${cartItem.itemID}`}
                            className="bg-gray-50 border border-gray-300 w-full text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                            onChange={(e) => handleSelectReturned(cartItem.itemID, e.target.value)}
                            value={selectedReturnedProducts[cartItem.itemID]?.selectReturned || ''}
                          >
                            <option value="">انتخاب مرجوعی خرید</option>
                            {returnedData?.data?.data?.map((returned) => (
                              <option key={returned.id} value={returned.id}>
                                {returned.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* بخش وارد کردن توضیحات */}
                      <div className="mb-4">
                        <label
                          htmlFor={`description-${cartItem.itemID}`}
                          className="block text-sm font-normal mb-2 text-gray-700 md:min-w-max lg:text-sm"
                        >
                          توضیحات
                        </label>
                        <textarea
                          id={`description-${cartItem.itemID}`}
                          placeholder="توضیحات خود را وارد کنید"
                          className="input h-24 resize-none border-[#E3E3E7] rounded-[8px] bg-white placeholder:text-xs pr-2"
                          value={selectedReturnedProducts[cartItem.itemID]?.description || ''}
                          onChange={(e) => handleDescriptionChange(cartItem.itemID, e.target.value)}
                        />
                      </div>

                      {/* بخش آپلود فایل (تصویر/فیلم) */}
                      <div className="border border-dashed border-[#009ef7] bg-[#f1faff] rounded text-center mt-4">
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          id={`Thumbnail-${cartItem.itemID}`}
                          onChange={(e) => handleFileChange(cartItem.itemID, e)}
                        />
                        <label
                          htmlFor={`Thumbnail-${cartItem.itemID}`}
                          className="block cursor-pointer p-6 text-sm font-normal"
                        >
                          {selectedReturnedProducts[cartItem.itemID]?.selectedFiles &&
                          selectedReturnedProducts[cartItem.itemID]?.selectedFiles.length > 0 ? (
                            <div className="flex flex-wrap gap-5 mt-0 px-8">
                              {selectedReturnedProducts[cartItem.itemID]?.selectedFiles.map((file, index) => (
                                <div key={index} className="text-sm text-gray-600 relative cursor-default">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-[80px] h-[88px] object-cover rounded-lg shadow-product"
                                  />
                                  <button
                                    type="button"
                                    className="absolute -top-2 -right-2 shadow-product hover:bg-red-500 hover:text-white bg-gray-50 p-0.5 rounded-full text-gray-500"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                      handleDeleteFile(cartItem.itemID, index)
                                    }}
                                  >
                                    <MdClose className="text-base" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>برای انتخاب عکس و فیلم کلیک کنید</div>
                          )}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
          {showCancelSubmit ? (
            <>
              <div className="border rounded-lg mt-4 gap-6 flex justify-between w-full px-4 py-2">
                <button
                  className="border hover:bg-red-600 hover:text-white border-red-600 rounded px-2.5 py-1 text-base font-light text-red-600 transition-colors duration-150 ease-in-out"
                  onClick={handleToggleCancelSubmit}
                >
                  برگشت
                </button>
                <button
                  onClick={handleToggleContinueSubmit}
                  className="border hover:bg-red-700 bg-red-600 border-red-600 hover:border-red-600 rounded px-2.5 py-1 text-base font-light text-white transition-colors duration-150 ease-in-out"
                >
                  ادامه
                </button>
              </div>
            </>
          ) : showReturnedSubmit ? (
            <>
              <div className="border rounded-lg mt-4 gap-6 flex justify-between w-full px-4 py-2">
                <button
                  className="border hover:bg-red-600 hover:text-white border-red-600 rounded px-2.5 py-1 text-base font-light text-red-600 transition-colors duration-150 ease-in-out"
                  onClick={handleToggleReturnedSubmit}
                >
                  برگشت
                </button>
                <button
                  onClick={handleToggleReturnedContinueSubmit}
                  className="border hover:bg-red-700 bg-red-600 border-red-600 hover:border-red-600 rounded px-2.5 py-1 text-base font-light text-white transition-colors duration-150 ease-in-out"
                >
                  ادامه
                </button>
              </div>
            </>
          ) : (
            <div className="border-t gap-6 flex justify-end bg-[rgba(0,0,0,.03)] w-full px-4 py-2">
              <button
                className="border transition ease duration-500 hover:bg-blue-600 hover:text-white border-blue-600 rounded px-2.5 py-1 text-base font-light text-blue-600"
                onClick={handleToggleDetails}
              >
                {showDetails ? 'برگشت' : 'مشاهده'}
              </button>
              {isDelivered ? (
                <>
                  <button className="border transition ease duration-500 hover:bg-[#0dcaf0] hover:text-white rounded px-2.5 py-1 text-base font-light text-[#0dcaf0] border-[#0dcaf0]">
                    {handleGeneratePdf(order)}
                  </button>
                  <button
                    onClick={handleToggleReturnedSubmit}
                    className="border transition ease duration-500 hover:bg-red-600 hover:text-white border-red-600 rounded px-2.5 py-1 text-base font-light text-red-600"
                  >
                    مرجوع
                  </button>
                </>
              ) : isCanceled || isReturned ? null : (
                <button
                  onClick={handleToggleCancelSubmit}
                  className="border transition ease duration-500 hover:bg-red-600 hover:text-white border-red-600 rounded px-2.5 py-1 text-base font-light text-red-600"
                >
                  لغو خرید
                </button>
              )}

              {isProcessPay && (
                <button
                  className="border transition ease duration-500 hover:bg-green-600 hover:text-white border-green-600 rounded px-2.5 py-1 text-base font-light text-green-600"
                  onClick={() => {
                    dispatch(setIsProcessPayment({ id: order.id, isProcessPayment: true }))
                    push('/checkout/shipping')
                  }}
                >
                  ادامه خرید
                </button>
              )}
            </div>
          )}
        </>
      </div>
    </div>
  )
}

export default OrderCard
