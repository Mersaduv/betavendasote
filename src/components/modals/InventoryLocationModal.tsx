import { useEffect, useRef } from 'react'
import { Button, Modal } from '../ui'
import { Close } from '@/icons'

interface ModalProps {
  isShow: boolean
  onClose: () => void
  inventoryLocationState: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export default function InventoryLocationModal({ isShow, onClose, inventoryLocationState, onChange }: ModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isShow) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [isShow])

  return (
    <Modal isShow={isShow} onClose={onClose} effect="bottom-to-top">
      <Modal.Content onClose={onClose} className="flex h-full flex-col z-[199] gap-y-5">
        <Modal.Body>
          <div className="flex items-center w-full gap-x-12 px-6">
            <div className="bg-white w-full rounded-md shadow-item">
              <div className="border-b p-6 text-gray-600 flex justify-between flex-row-reverse">
                <button type="button" onClick={onClose} className="">
                  <Close className="icon " />
                </button>
                <h3> موقعیت کالا در انبار</h3>
              </div>
              <div className="flex flex-col xs:flex-row px-4 py-4 pb-0 pt-6">
                <textarea
                  ref={textareaRef}
                  className="input resize-none w-full min-h-[300px] h-auto border border-gray-200 rounded-md bg-white"
                  value={inventoryLocationState}
                  onChange={onChange}
                />
              </div>
              <div className="flex justify-end p-4">
                <Button onClick={onClose}>تایید</Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  )
}
