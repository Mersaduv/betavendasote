import { IArticle, IColumnFooter, IFooterArticleColumn, ITextMarqueeForm } from '@/types'
import { profileFormSchema, textMarqueeSchema } from '@/utils'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'

import { useFormContext, Controller } from 'react-hook-form'
import { Button, ControlledCheckbox } from '../ui'
import dynamic from 'next/dynamic'
import { showAlert } from '@/store'
import { useAppDispatch } from '@/hooks'
import { MdClose } from 'react-icons/md'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { BiAddToQueue } from 'react-icons/bi'
import { Plus } from '@/icons'
import { useGetArticlesQuery } from '@/services'
import { ArticleCombobox } from '../selectorCombobox'
interface Props {
  setColumnFooter: Dispatch<SetStateAction<IColumnFooter[]>>
  columnFooters: IColumnFooter[]
  setDeletedFooterArticle: Dispatch<SetStateAction<IFooterArticleColumn[]>>
  setDeletedColumnFooter: Dispatch<SetStateAction<IColumnFooter[]>>
}
const AdditionalForm: React.FC<Props> = ({
  columnFooters,
  setColumnFooter,
  setDeletedFooterArticle,
  setDeletedColumnFooter,
}) => {
  const { control, setValue } = useFormContext()
  const dispatch = useAppDispatch()
  const [nextIndex, setNextIndex] = useState(2)
  // ? Queries
  const {
    data: articleData,
    isLoading: isLoadingArticle,
    isError: isErrorArticle,
  } = useGetArticlesQuery({
    page: 1,
    pageSize: 99999,
  })

  // ? States
  const [selectedArticles, setSelectedArticles] = useState<(IArticle | null)[][]>([])

  // ? Effect for initializing selectedArticles
  useEffect(() => {
    if (articleData && columnFooters) {
      const updatedSelectedArticles = columnFooters.map((columnFooter) =>
        columnFooter.footerArticleColumns.map((footerArticleColumn) => {
          const matchedArticle = articleData?.data?.data?.find(
            (article) => article.id === footerArticleColumn.articleId
          )
          return matchedArticle || null
        })
      )

      setSelectedArticles(updatedSelectedArticles)
    }
  }, [articleData, columnFooters])

  useEffect(() => {
    const updatedColumnFooters = columnFooters.map((columnFooter) => {
      const filteredFooterArticleColumns = columnFooter.footerArticleColumns.filter(
        (footerArticle) => footerArticle.articleId !== ''
      )

      return {
        ...columnFooter,
        footerArticleColumns: filteredFooterArticleColumns,
      }
    })

    const columnFootersWithName = updatedColumnFooters.filter((columnFooter) => columnFooter.name !== '')

    setValue('columnFooters', columnFootersWithName)
  }, [columnFooters, setValue])

  // ? Handlers
  const handleInputChange = (index: number, value: string) => {
    const newColumnFooters = columnFooters.map((columnFooter, i) =>
      i === index ? { ...columnFooter, name: value } : columnFooter
    )

    setColumnFooter(newColumnFooters)
  }

  const handleAdd = (index: number) => {
    const updatedColumnFooters = columnFooters.map((columnFooter, i) => {
      if (i === index) {
        const updatedFooterArticleColumn = [
          ...columnFooter.footerArticleColumns,
          { id: '', articleId: '', index: columnFooter.footerArticleColumns.length + 1 },
        ]

        return {
          ...columnFooter,
          footerArticleColumns: updatedFooterArticleColumn,
        }
      }

      return columnFooter
    })

    setColumnFooter(updatedColumnFooters)

    const newSelectedArticles = [...selectedArticles]
    newSelectedArticles[index] = [...(selectedArticles[index] || []), null]
    setSelectedArticles(newSelectedArticles)
  }

  const handleColumnAdd = () => {
    if (columnFooters.length === 4) {
      dispatch(
        showAlert({
          status: 'error',
          title: 'حداکثر تعداد ستون های فوتر 4 عدد میباشد',
        })
      )
      return
    }

    const nextIndex = columnFooters.length + 2

    setColumnFooter([...columnFooters, { id: '', name: '', index: nextIndex, footerArticleColumns: [] }])
  }

  const handleRemove = (columnIndex: number, footerIndex: number) => {
    const updatedColumnFooters = columnFooters.map((columnFooter, i) => {
      if (i === columnIndex) {
        var footerArticleColumn = columnFooter.footerArticleColumns.find((_, idx) => idx === footerIndex)

        if (footerArticleColumn !== undefined && footerArticleColumn.id) {
          setDeletedFooterArticle((prevDeleted) => [...prevDeleted, footerArticleColumn!])
        }
        const updatedFooterArticleColumn = columnFooter.footerArticleColumns.filter((_, idx) => idx !== footerIndex)
        return {
          ...columnFooter,
          footerArticleColumns: updatedFooterArticleColumn,
        }
      }

      return columnFooter
    })

    setColumnFooter(updatedColumnFooters)

    const newSelectedArticles = [...selectedArticles]
    newSelectedArticles[columnIndex] = newSelectedArticles[columnIndex].filter((_, idx) => idx !== footerIndex)
    setSelectedArticles(newSelectedArticles)
  }

  const handleDeleteColumnFooter = (index: number, columnFooter: IColumnFooter) => {
    if (columnFooter.id) {
      setDeletedColumnFooter((prevDeleted) => [...prevDeleted, columnFooter])
    }
    setColumnFooter((prevFiles) => {
      const updatedFiles = [...prevFiles]
      updatedFiles.splice(index, 1)
      return updatedFiles
    })
  }
  const handleArticleSelect = (article: IArticle, columnIndex: number, footerIndex: number) => {
    if (!article) return

    const updatedSelectedArticles = [...selectedArticles]
    updatedSelectedArticles[columnIndex][footerIndex] = article
    setSelectedArticles(updatedSelectedArticles)

    const updatedColumnFooters = columnFooters.map((columnFooter, i) => {
      if (i === columnIndex) {
        const updatedFooterArticleColumns = [...columnFooter.footerArticleColumns]
        updatedFooterArticleColumns[footerIndex] = {
          ...updatedFooterArticleColumns[footerIndex],
          articleId: article.id,
        }
        return {
          ...columnFooter,
          footerArticleColumns: updatedFooterArticleColumns,
        }
      }

      return columnFooter
    })

    setColumnFooter(updatedColumnFooters)
  }

  return (
    <div className="flex flex-1">
      <div className="bg-white flex flex-col justify-between w-full rounded-md shadow-item">
        <div>
          <div className="flex justify-between items-center border-b p-5 px-6">
            <h3 className="text-gray-600 whitespace-nowrap">ستون فوتر</h3>
            <div className="flex justify-end w-[260px] gap-4 items-center">
              <Button className=" px-5 py-2.5 bg-sky-500 hover:bg-sky-400" onClick={handleColumnAdd}>
                {'افزودن'}
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row py-6 pt-10  gap-4">
            {columnFooters.length === 0 ? (
              <div className="text-center w-full">ستون مورد نظر را اضافه کنید</div>
            ) : (
              <div className="flex flex-col items-center md:flex-row w-full">
                {columnFooters.map((columnFooter, index) => {
                  return (
                    <div
                      key={index}
                      className="mb-4 w-full max-w-[25%] h-full flex-1 rounded-lg flex flex-col items-center justify-start gap-1 px-4 relative" 
                    >
                      <button
                        type="button"
                        className="absolute -top-4 right-1 z-20 shadow-product bg-gray-50 hover:bg-red-600 hover:text-white p-1 rounded-full text-gray-500"
                        onClick={() => handleDeleteColumnFooter(index, columnFooter)}
                      >
                        <MdClose className="text-lg" /> {/* Add your delete icon here */}
                      </button>
                      <div className="flex items-center gap-1 w-full">
                        <div className="w-full relative">
                          <input
                            type="text"
                            placeholder={`ستون ${digitsEnToFa(index + 1)}`}
                            value={columnFooter.name}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            className={`peer m-0 block rounded-lg h-[50px] w-full border border-solid border-gray-200 bg-clip-padding px-3 py-4 text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-400 dark:text-white dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]`}
                            id="floatingCopy"
                          />
                          <label
                            htmlFor="floatingCopy"
                            className="pointer-events-none absolute right-0 top-0 origin-[0_0] border border-solid border-transparent pr-2 pb-4 pt-3.5 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
                          >
                            ستون {digitsEnToFa(index + 1)}{' '}
                          </label>
                        </div>
                        <Plus
                          onClick={() => handleAdd(index)}
                          className="text-2xl text-[#e90089] hover:text-[#ff6ac1] cursor-pointer"
                        />
                      </div>
                      <div className="w-full space-y-5 mt-4">
                        {[...columnFooter.footerArticleColumns]
                          .sort((a, b) => {
                            const dateA = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0
                            const dateB = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0
                            return dateB - dateA
                            // return dateA - dateB
                          })
                          .map((footerArticle, footerIndex) => (
                            <div
                              key={footerIndex}
                              className="flex w-full flex-col justify-center items-center gap-3 relative"
                            >
                              <div
                                className="absolute cursor-pointer -top-2 -right-2 shadow-product bg-gray-50 z-40 hover:bg-red-600 hover:text-white p-1 rounded-full text-gray-500"
                                onClick={() => handleRemove(index, footerIndex)}
                              >
                                <MdClose className="text-lg" /> {/* Add your delete icon here */}
                              </div>
                              <ArticleCombobox
                                articles={articleData?.data?.data ?? []}
                                selectedArticle={
                                  selectedArticles[index] && selectedArticles[index][footerIndex]
                                    ? selectedArticles[index][footerIndex]
                                    : null
                                }
                                setSelectedArticle={(article) =>
                                  handleArticleSelect(article as IArticle, index, footerIndex)
                                }
                                onArticleSelect={(article) =>
                                  handleArticleSelect(article as IArticle, index, footerIndex)
                                }
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdditionalForm
