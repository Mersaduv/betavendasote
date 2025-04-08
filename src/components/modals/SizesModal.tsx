import { Modal, Button } from '@/components/ui'
import { ICategory } from '@/types'
import SizesCombobox from '../selectorCombobox/SizesCombobox'
import { useGetSizesQuery, useUpdateCategoryFeatureMutation } from '@/services'
import { useEffect, useState } from 'react'
import { HandleResponse } from '../shared'
import { CategoryFeatureForm } from '@/services/category/types'
import { SizeDTO } from '@/services/feature/types'

interface Props {
  category: ICategory | undefined
  isShow: boolean
  onClose: () => void
  refetch: () => void
}

const SizesModal: React.FC<Props> = (props) => {
  // States
  const [stateSizeFeature, setStateSizeFeature] = useState<SizeDTO[]>([])
  const [sizeDb, setSizeDb] = useState<SizeDTO[]>()

  // ? Props
  const { category, isShow, onClose, refetch } = props

  const { data, isLoading } = useGetSizesQuery({ page: 1, pageSize: 9999 })
  const [
    updateCategoryFeature,
    {
      data: dataUpdate,
      isSuccess: isSuccessUpdate,
      isError: isErrorUpdate,
      error: errorUpdate,
      isLoading: isLoadingUpdate,
    },
  ] = useUpdateCategoryFeatureMutation()

  useEffect(() => {
    if (data?.data?.data) {
      setSizeDb(data?.data.data)
    }
  }, [data?.data])

  const handleFeatureSelect = (sizes: SizeDTO[]) => {
    setStateSizeFeature((prevState) => {
      const newState = prevState.filter((item) => sizes.some((size) => size.id === item.id))
      sizes.forEach((size) => {
        if (!newState.some((item) => item.id === size.id)) {
          newState.push(size)
        }
      })
      return newState
    })
  }

  const onConfirm = () => {
    const sizeListIds = stateSizeFeature.map((size) => size.id)

    updateCategoryFeature({
      categoryId: category!.id,
      categorySizes: { ids: category?.categorySizes?.ids ?? null, sizeIds: sizeListIds ?? null },
      hasSizeProperty: category?.hasSizeProperty,
    })
  }

  // ? Render(s)
  return (
    <>
      {/* Handle Delete Response */}
      {(isSuccessUpdate || isErrorUpdate) && (
        <HandleResponse
          isError={isErrorUpdate}
          isSuccess={isSuccessUpdate}
          error={errorUpdate}
          message={dataUpdate?.message}
          onSuccess={() => {
            onClose()
            refetch()
          }}
        />
      )}
      <Modal
        isShow={isShow}
        onClose={() => {
          onClose()
          refetch()
        }}
        effect="bottom-to-top"
      >
        <Modal.Content
          onClose={() => {
            onClose()
            refetch()
          }}
          className="flex h-full flex-col z-[199] gap-y-5 bg-white  py-5 pb-0 md:rounded-lg "
        >
          <Modal.Header notBar onClose={() => {
          onClose()
          refetch()
        }}>
          <div className="text-start text-base flex gap-2">
              انتخاب سایز برای <div className="text-sky-500"> {category?.name}</div>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4 bg-white   text-center md:rounded-lg w-full">
              <div className="flex items-center w-full gap-x-12 px-6">
                <span>مقدار</span>
                <div className="w-full">
                  <SizesCombobox
                    onFeatureSelect={handleFeatureSelect}
                    sizeList={data?.data?.data ?? []}
                    stateSizeData={sizeDb?.filter((size) => category?.categorySizes?.sizeIds?.includes(size.id))}
                  />
                </div>
              </div>
              <div className="flex px-5 py-3 justify-between items-center gap-x-20 bg-[#f5f8fa]">
                <span className="text-xs">سایز های مربوط به این دسته بندی را وارد کنید</span>
                <Button
                  className="bg-sky-500 px-5 py-3 hover:bg-sky-600"
                  onClick={onConfirm}
                  isLoading={isLoadingUpdate}
                >
                  بروزرسانی
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default SizesModal
