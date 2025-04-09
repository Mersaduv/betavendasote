import { useRef, useState } from 'react'
import { Button, CustomCheckbox, Modal } from '../ui'

interface RefundModalProps {
  isShow: boolean
  onClose: () => void
}

const RefundModal: React.FC<RefundModalProps> = ({ isShow, onClose }) => {
  const [isRefundable, setIsRefundable] = useState<boolean>(true)
  const [refundDays, setRefundDays] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [taxEnabled, setTaxEnabled] = useState<boolean>(true)

  const refundDaysRef = useRef<HTMLInputElement | null>(null)
  const messageRef = useRef<HTMLInputElement | null>(null)

  const handleSave = () => {
    const payload = {
      isRefundable,
      refundDays,
      message,
      taxEnabled,
    }
    console.log('Save refund settings:', payload)
    onClose()
  }

  const handleRefundableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsRefundable(e.target.checked)
  }

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaxEnabled(e.target.checked)
  }

  return (
    <Modal isShow={isShow} onClose={onClose} effect="bottom-to-top">
      <Modal.Content
        onClose={onClose}
        className="flex h-full flex-col z-[199] gap-y-5 bg-white py-5 pb-0 md:rounded-lg w-full"
      >
        <Modal.Header notBar onClose={onClose}>
          <div className="text-start text-base">ویرایش استرداد</div>
        </Modal.Header>

        <Modal.Body>
          <div className="flex flex-col gap-4 px-6 w-full">
            <div className="flex justify-between items-center border p-4 rounded-lg">
              <CustomCheckbox
                name="isRefundable"
                checked={isRefundable}
                onChange={handleRefundableChange}
                label="قابلیت استرداد"
                customStyle="bg-sky-500"
              />
            </div>

            <div className="flex items-center w-full gap-x-12 px-0">
              <div className="relative mb-3 w-full">
                <input
                  type="number"
                  className="peer m-0 pr-3 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-transparent bg-clip-padding pl-3 py-4 text-xl font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:autofill:shadow-autofill dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]"
                  id="refundDays"
                  placeholder="تعداد روزهای استرداد"
                  value={refundDays}
                  onChange={(e) => setRefundDays(e.target.value)}
                  ref={(e) => {
                    refundDaysRef.current = e;
                  }}
                />
                <label
                  htmlFor="refundDays"
                  className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
                >
                  تعداد روزهای استرداد
                </label>
              </div>
            </div>

            <div className="flex items-center w-full gap-x-12 px-0">
              <div className="relative mb-3 w-full">
                <input
                  type="text"
                  className="peer m-0 pr-3 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-transparent bg-clip-padding pl-3 py-4 text-xl font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:autofill:shadow-autofill dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]"
                  id="message"
                  placeholder="پیام"
                  ref={(e) => {
                    messageRef.current = e;
                  }}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <label
                  htmlFor="message"
                  className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-3 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
                >
                  پیام
                </label>
              </div>
            </div>

            <div className="flex justify-between items-center border p-4 rounded-lg">
              <CustomCheckbox
                name="taxEnabled"
                checked={taxEnabled}
                onChange={handleTaxChange}
                label="فعال کردن مالیات"
                customStyle="bg-sky-500"
              />
            </div>

            <div className=' bg-slate-50 flex justify-between mb-4 p-4 rounded-b-lg'>
              <p className="text-center text-xs text-gray-500 mt-2">تنظیمات استرداد را از این دسته بندی مشخص نمایید</p>
              <div className="">
                <Button onClick={handleSave} className="bg-blue-500 text-white px-6 py-2 rounded-md">
                  ذخیره
                </Button>
              </div>

            </div>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  )
}

export default RefundModal
