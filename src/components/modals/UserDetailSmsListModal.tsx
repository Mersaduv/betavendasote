import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

import { truncate } from '@/utils'

import { useGetProductsQuery } from '@/services'

import { useDebounce, useDisclosure } from '@/hooks'

import { Close, Search } from '@/icons'
import { EmptySearchList } from '@/components/emptyList'
import { ProductDiscountTag, ProductPriceDisplay } from '@/components/product'
import { DataStateDisplay } from '@/components/shared'
import { Modal, ResponsiveImage } from '@/components/ui'
import { IUser } from '@/types'

interface Props {
  users: IUser[]
}

const UserDetailSmsListModal: React.FC<Props> = (props) => {
  const { users } = props
  // ? Assets
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [isShowSearchModal, searchModalHanlders] = useDisclosure()

  // ? Search
  const filteredUsers = users.filter((user) => {
    const searchLower = search.toLowerCase()
    return user.mobileNumber.toLowerCase().includes(searchLower) || user.fullName.toLowerCase().includes(searchLower)
  })

  // ? Re-Renders
  //* Reset Search
  useEffect(() => {
    if (!isShowSearchModal) {
      setSearch('')
    }
  }, [isShowSearchModal])

  //* Use useEffect to set focus after a delay when the modal is shown
  useEffect(() => {
    if (isShowSearchModal) {
      const timeoutId = setTimeout(() => {
        searchRef.current?.focus()
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [isShowSearchModal])

  // ? Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleRemoveSearch = () => {
    setSearch('')
  }

  // ? Render(s)
  return (
    <>
      <div onClick={searchModalHanlders.open} className="">
        مشاهده
      </div>
      <Modal isShow={isShowSearchModal} onClose={searchModalHanlders.close} effect="bottom-to-top">
        <Modal.Content
          onClose={searchModalHanlders.close}
          className="flex h-screen flex-col gap-y-3 bg-white py-3 pl-2 pr-4 md:rounded-lg lg:h-fit"
        >
          <Modal.Header onClose={searchModalHanlders.close}>جزئیات کاربران</Modal.Header>
          <Modal.Body>
            <div className="w-full">
              <div className="my-3 flex rounded-md bg-zinc-200/80">
                <button type="button" className="p-2.5" onClick={handleRemoveSearch}>
                  <Close className="h-4 w-4 text-gray-700 md:h-5 md:w-5" />
                </button>
                <input
                  type="text"
                  placeholder="جستجو..."
                  className="input grow bg-transparent p-1 pr-3 text-right outline-none"
                  ref={searchRef}
                  value={search}
                  onChange={handleChange}
                />
                <div className="p-2">
                  <Search className="icon " />
                </div>
              </div>
              <div className="overflow-y-auto lg:max-h-[500px]">
                <table className="w-[700px] md:w-full mx-auto">
                  <thead className="bg-sky-300">
                    <tr>
                      <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">نام</th>
                      <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">شماره کاربری</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((item, index) => (
                        <tr key={item.id} className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                          <td className="text-sm text-center farsi-digits">
                            {item.fullName.trim() === '' ? '-' : item.fullName}
                          </td>
                          <td className="text-sm text-center farsi-digits">{item.mobileNumber}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="text-center py-4">
                          کاربری یافت نشد
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default UserDetailSmsListModal
