import type { NextPage } from 'next'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/Layouts'
import {
  useDeleteArticleMutation,
  useDeleteSuggestionMutation,
  useDeleteTrashArticleMutation,
  useGetArticlesQuery,
  useGetCategoriesTreeQuery,
  useGetColumnFootersQuery,
  useGetSuggestionsQuery,
  useRestoreArticleMutation,
} from '@/services'
import { Fragment, useEffect, useState } from 'react'
import { GetArticlesResult } from '@/services/design/types'
import { DataStateDisplay, HandleResponse } from '@/components/shared'
import { useAppSelector, useDisclosure } from '@/hooks'
import { ConfirmDeleteModal, ConfirmUpdateModal, SuggestionModal } from '@/components/modals'
import { Menu, Tab, TabGroup, TabList, TabPanel, TabPanels, Transition } from '@headlessui/react'
import { ArrowDown } from '@/icons'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { IArticle, ICategory, ISuggestion } from '@/types'
import { TableSkeleton } from '@/components/skeleton'
import { Pagination } from '@/components/navigation'
import { LuSearch } from 'react-icons/lu'
import { ProductBreadcrumb } from '@/components/product'
import { ProtectedRouteWrapper } from '@/components/user'
import { GetSuggestionsResult } from '@/services/product/types'
import { Button } from '@/components/ui'
import moment from 'moment-jalaali'
const Suggestions: NextPage = () => {
  // ? Assets
  const { query, push } = useRouter()
  const suggestionPage = query.page ? +query.page : 1
  const { generalSetting } = useAppSelector((state) => state.design)
  // ? States
  const { name } = useAppSelector((state) => state.stateString)
  const [tabKey, setTabKey] = useState('allSuggestions')
  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const [isShowSuggestionModal, suggestionModalHandlers] = useDisclosure()
  const [suggestionState, setSuggestionState] = useState<ISuggestion | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()
  const [isShowConfirmUpdateModal, confirmUpdateModalHandlers] = useDisclosure()
  // ? Querirs
  const { categoriesData } = useGetCategoriesTreeQuery(undefined, {
    selectFromResult: ({ data }) => ({
      categoriesData: data?.data,
    }),
  })
  //* Get Articles Data
  const [suggestionsPagination, setSuggestionsPagination] = useState<GetSuggestionsResult>()

  const useFetchArticles = (status: string) => {
    const commonQueryParams = {
      pageSize: 6,
      page: suggestionPage,
      search: searchTerm,
      adminList: status === 'adminList',
    }
    const { data, isError, isFetching, isSuccess, refetch } = useGetSuggestionsQuery({ ...commonQueryParams })

    return {
      data,
      isError,
      isFetching,
      isSuccess,
      refetch,
    }
  }

  const {
    data: allSuggestions,
    isError: isAllSuggestionsError,
    isFetching: isAllSuggestionsFetching,
    isSuccess: isAllSuggestionsSuccess,
    refetch: refetchAllSuggestions,
  } = useFetchArticles('adminList')

  useEffect(() => {
    console.log(allSuggestions?.data?.result, 'allSuggestions')

    if (allSuggestions && allSuggestions.data && allSuggestions?.data?.result)
      setSuggestionsPagination(allSuggestions?.data?.result)
  }, [allSuggestions])

  useEffect(() => {
    switch (name) {
      case 'allSuggestions':
        setTabKey('allSuggestions')
        break
      case 'activeSuggestions':
        setTabKey('activeSuggestions')
        break
      case 'inactiveSuggestions':
        setTabKey('inactiveSuggestions')
        break
      case 'deletedSuggestions':
        setTabKey('deletedSuggestions')
        break
      default:
        setTabKey('allSuggestions')
    }
  }, [name])

  //*    Delete Suggestion
  const [
    deleteSuggestion,
    {
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
      data: dataDelete,
      isLoading: isLoadingDelete,
    },
  ] = useDeleteSuggestionMutation()

  // ? Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  //*   Delete Handlers
  const handleDelete = (id: string) => {
    setDeleteInfo({ id })
    confirmDeleteModalHandlers.open()
  }

  const onCancel = () => {
    setDeleteInfo({ id: '' })
    confirmDeleteModalHandlers.close()
    confirmUpdateModalHandlers.close()
  }

  const onConfirmDelete = () => {
    deleteSuggestion({ id: deleteInfo.id })
  }

  const onSuccess = () => {
    handleAllRefetch()
    confirmDeleteModalHandlers.close()
    confirmUpdateModalHandlers.close()
    setDeleteInfo({ id: '' })
  }
  const onError = () => {
    confirmDeleteModalHandlers.close()
    confirmUpdateModalHandlers.close()
    setDeleteInfo({ id: '' })
  }
  const handleAllRefetch = () => {
    refetchAllSuggestions()
  }

  return (
    <ProtectedRouteWrapper>
      <>
        {/* Handle Delete Suggestion Response */}
        {(isSuccessDelete || isErrorDelete) && (
          <HandleResponse
            isError={isErrorDelete}
            isSuccess={isSuccessDelete}
            error={errorDelete}
            message={dataDelete?.message}
            onSuccess={onSuccess}
            onError={onError}
          />
        )}
        <SuggestionModal
          refetch={refetchAllSuggestions}
          isShow={isShowSuggestionModal}
          onClose={suggestionModalHandlers.close}
          suggestion={suggestionState}
        />

        {/* Confirm Delete Suggestion Modal */}
        <ConfirmDeleteModal
          title="پیشنهاد شگفت انگیز"
          deleted
          isLoading={isLoadingDelete}
          isShow={isShowConfirmDeleteModal}
          onClose={confirmDeleteModalHandlers.close}
          onCancel={onCancel}
          onConfirm={onConfirmDelete}
        />
        <main>
          <Head>
            <title> همه پیشنهادات شگفت انگیز</title>
          </Head>
          <DashboardLayout>
            <section className="w-full mt-7 flex flex-col">
              <div className="mx-3 bg-white rounded-xl shadow-item">
                <div className="flex justify-between">
                  <h2 className="p-4 text-gray-600">همه پیشنهادات شگفت انگیز</h2>
                </div>

                {/* tab changed  */}
                <div className="relative overflow-x-auto min-h-96">
                  <Tab.Group
                    selectedIndex={
                      tabKey === 'allSuggestions'
                        ? 0
                        : tabKey === 'activeSuggestions'
                        ? 1
                        : tabKey === 'inactiveSuggestions'
                        ? 2
                        : tabKey === 'deletedSuggestions'
                        ? 3
                        : 0
                    }
                    onChange={(index) => {
                      switch (index) {
                        case 0:
                          setTabKey('allSuggestions')
                          break
                        case 1:
                          setTabKey('activeSuggestions')
                          break
                        case 2:
                          setTabKey('inactiveSuggestions')
                          break
                        case 3:
                          setTabKey('deletedSuggestions')
                          break
                        default:
                          setTabKey('allSuggestions')
                      }
                    }}
                  >
                    <Tab.List className="flex justify-between gap-4 p-2 border-b-2 py-2 border-gray-200">
                      <Tab
                        className={({ selected }) =>
                          selected
                            ? 'px-4 py-2 text-sky-500 rounded cursor-pointer text-sm'
                            : 'px-4 py-2 hover:text-sky-500 rounded cursor-pointer text-sm'
                        }
                      >
                        تعداد ({digitsEnToFa(allSuggestions?.data?.dataLength ?? 0)})
                      </Tab>

                      {/* filter control  */}
                      <div className="flex justify-end px-4 pl-2 gap-x-6 gap-y-2.5 flex-wrap">
                        <Button className="bg-sky-500 text-white" onClick={suggestionModalHandlers.open}>
                          افزودن پیشنهاد
                        </Button>
                        {/* search filter */}
                        <div className="flex border w-fit rounded-lg">
                          <label
                            htmlFor="search"
                            className="bg-gray-100 hover:bg-gray-200 ml-[1px] rounded-r-md flex justify-center cursor-pointer items-center w-14"
                          >
                            <LuSearch className="icon text-gray-500" />
                          </label>
                          <input
                            id="search"
                            type="text"
                            className="w-44 text-sm placeholder:text-center focus:outline-none appearance-none border-none rounded-l-lg"
                            placeholder="جستجو"
                            value={searchTerm}
                            onChange={handleSearchChange}
                          />
                        </div>
                      </div>
                    </Tab.List>

                    <Tab.Panels className="mt-3 p-3">
                      <Tab.Panel>
                        <div id="_adminSuggestion">
                          <DataStateDisplay
                            isError={isAllSuggestionsError}
                            refetch={refetchAllSuggestions}
                            isFetching={isAllSuggestionsFetching}
                            isSuccess={isAllSuggestionsSuccess}
                            dataLength={suggestionsPagination?.data ? suggestionsPagination.data.length : 0}
                            loadingComponent={<TableSkeleton count={20} />}
                          >
                            <table className="w-[780px] md:w-full mx-auto">
                              <thead className="bg-sky-300">
                                <tr>
                                  <th className="text-sm py-3 px-2 font-normal w-[130px] text-center text-gray-600 ">
                                    عکس
                                  </th>
                                  <th className="text-sm py-3 px-2 text-gray-600 font-normal whitespace-nowrap">
                                    کد محصول
                                  </th>
                                  <th className="text-sm py-3 px-2 text-gray-600 font-normal whitespace-nowrap">
                                    نام محصول
                                  </th>
                                  <th className="text-sm py-3 px-2 text-gray-600 font-normal whitespace-nowrap">
                                    دسته بندی{' '}
                                  </th>
                                  <th className="text-sm py-3 px-2 text-gray-600 font-normal">زمان باقی مانده</th>
                                  <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                                </tr>
                              </thead>
                              <tbody>
                                {suggestionsPagination?.data &&
                                  suggestionsPagination?.data.map((suggestion, index) => {
                                    return (
                                      <tr
                                        key={suggestion.id}
                                        className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                      >
                                        <td>
                                          <img
                                            className="w-[108px] h-[70px] rounded-md my-2 mr-2"
                                            src={suggestion.products.mainImageSrc.imageUrl}
                                            alt="a-img"
                                          />
                                        </td>
                                        <td className="text-sm text-gray-600 text-center">
                                          {suggestion.products.code}
                                        </td>
                                        <td className="text-sm text-gray-600 text-center">
                                          {suggestion.products.title}
                                        </td>
                                        <td className="text-center text-sm text-gray-600">
                                          {suggestion.products.parentCategories.category.name}
                                        </td>
                                        <td className="text-center text-sm text-gray-600 farsi-digits">
                                          {moment(suggestion.expireTime).format('jYYYY/jMM/jDD HH:mm')}
                                        </td>

                                        <td className="text-center text-sm text-gray-600">
                                          <Menu as="div" className="dropdown">
                                            <Menu.Button className="">
                                              <div className="w-full flex justify-center items-center">
                                                <span className="text-2xl hover:bg-gray-300 cursor-pointer  bg-gray-200 text-gray-700 p-1 pb-1.5 px-1.5 h-8 flex justify-center items-center rounded-md">
                                                  :
                                                </span>
                                              </div>
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
                                                  {({ close }) => (
                                                    <>
                                                      <div
                                                        onClick={() => {
                                                          setSuggestionState(suggestion)
                                                          suggestionModalHandlers.open()
                                                          close()
                                                        }}
                                                        className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full cursor-pointer"
                                                      >
                                                        <span>ویرایش</span>
                                                      </div>
                                                      <button
                                                        onClick={() => {
                                                          handleDelete(suggestion.id)
                                                          close()
                                                        }}
                                                        className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                      >
                                                        <span>حذف</span>
                                                      </button>
                                                    </>
                                                  )}
                                                </Menu.Item>
                                              </Menu.Items>
                                            </Transition>
                                          </Menu>
                                        </td>
                                      </tr>
                                    )
                                  })}
                              </tbody>
                            </table>
                          </DataStateDisplay>

                          {suggestionsPagination &&
                            suggestionsPagination.data &&
                            suggestionsPagination?.data?.length > 0 && (
                              <div className="mx-auto py-4 lg:max-w-5xl">
                                <Pagination
                                  pagination={suggestionsPagination}
                                  section="_adminSuggestion"
                                  client
                                />
                              </div>
                            )}
                        </div>
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>
                </div>
              </div>
            </section>
          </DashboardLayout>
        </main>
      </>
    </ProtectedRouteWrapper>
  )
}
export default dynamic(() => Promise.resolve(Suggestions), { ssr: false })
