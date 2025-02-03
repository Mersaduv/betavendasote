import { IAddress } from '@/types'
import { Modal, DisplayError, TextField, SubmitModalButton, Combobox } from '@/components/ui'
import { AddressSkeleton } from '../skeleton'
import { Address, Delete, Edit, Location, Location2, Phone, Plus, Post, User, UserLocation, Users } from '@/icons'
import { BsTelephoneOutboundFill } from 'react-icons/bs'

interface Props {
  isShow: boolean
  onClose: () => void
  addressDb: IAddress[]
  handleSelectAddress: (address: IAddress) => void
  selectedAddressState: IAddress
  isLoading: boolean
  open: () => void
}

const AddressListModal: React.FC<Props> = (props) => {
  const { isShow, onClose, addressDb, handleSelectAddress, isLoading, selectedAddressState, open } = props

  return (
    <>
      <Modal isShow={isShow} onClose={onClose} effect="bottom-to-top">
        <Modal.Content
          onClose={onClose}
          className="flex h-full max-h-[600px] overflow-auto flex-col gap-y-5 bg-white px-5 py-5 md:rounded-lg "
        >
          <Modal.Header onClose={onClose}>انتخاب آدرس</Modal.Header>
          <Modal.Body>
            <div className='w-full'>
              {isLoading ? (
                <AddressSkeleton />
              ) : addressDb?.length! > 0 ? (
                <div className="">
                  {addressDb?.map((address) => (
                    <section
                      key={address.id}
                      onClick={() => handleSelectAddress(address)}
                      className={`flex-1 hover:shadow border-2 pr-5 relative m-6 mt-8 rounded-lg cursor-pointer ${
                        selectedAddressState.id === address.id ? ' border-[#e90089]' : ''
                      }`}
                    >
                      <div
                        className={` ${
                          selectedAddressState.id === address.id
                            ? ' absolute top-0 flex right-0 bg-[#e90089] w-6 h-6 rounded-bl-full '
                            : 'hidden'
                        }`}
                      >
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
                            <span className="text-gray-400 font-normal">{address?.fullName}</span>
                          </div>
                          <div className="flex md:items-center w-full flex-col md:flex-row  gap-x-12">
                            <div className="flex items-center md:w-36 gap-1.5">
                              <BsTelephoneOutboundFill className="text-lg text-gray-500" />
                              <span className="font-normal text-base">شماره موبایل</span>
                            </div>
                            <span className="text-gray-400 font-normal">{address?.mobileNumber}</span>
                          </div>
                          <div className="flex md:items-center w-full flex-col md:flex-row  gap-x-12">
                            <div className="flex items-center md:w-36 gap-1.5">
                              <Location2 className="text-2xl -mr-1 text-gray-500" />
                              <span className="font-normal text-base">آدرس</span>
                            </div>
                            <span className="text-gray-400 font-normal">{address?.fullAddress}</span>
                          </div>
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
              <div>
                <button
                  className="flex items-center justify-center gap-x-2 rounded-lg border-2 px-3 py-2 bg-[#e90089]"
                  onClick={() => {
                    onClose()
                    open()
                  }}
                >
                  <span className="text-white text-base font-normal">آدرس جدید</span>
                  <Plus className="icon text-white" />
                </button>
              </div>
              <div className="border-t-2 border-gray-200 py-3 lg:pb-0 flex justify-end mt-3">
                <SubmitModalButton className="" onClick={onClose}>
                  تایید{' '}
                </SubmitModalButton>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default AddressListModal
