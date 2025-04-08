import { Modal, Button } from '@/components/ui'
import { ICategory } from '@/types'
import SizesCombobox from '../selectorCombobox/SizesCombobox'
import { useGetFeaturesQuery, useGetSizesQuery, useUpdateCategoryFeatureMutation } from '@/services'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { HandleResponse } from '../shared'
import { CategoryFeatureForm } from '@/services/category/types'
import { ProductFeatureCombobox } from '../selectorCombobox'
import { ProductFeature } from '@/services/feature/types'
import { setUpdated } from '@/store'
import { useAppDispatch } from '@/hooks'

interface Props {
  category: ICategory | undefined
  isShow: boolean
  onClose: () => void
  refetch: () => void
  featureDb?: ProductFeature[] | undefined
  setFeatureDb: Dispatch<SetStateAction<ProductFeature[] | undefined>>
}
const generateUniqueId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
const hasSizeProperty: ProductFeature = {
  name: 'سایزبندی',
  values: [],
  count: 0,
  valueCount: 0,
  isDeleted: false,
  productId: null,
  categoryId: null,
  id: generateUniqueId(),
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
}
const FeaturesModal: React.FC<Props> = (props) => {
  // States
  const [stateFeature, setStateFeature] = useState<ProductFeature[]>([])
  const dispatch = useAppDispatch()
  // ? Props
  const { category, isShow, onClose, refetch, featureDb, setFeatureDb } = props
  if (category) {
    console.log(category, 'category')
  }
  const { data, isLoading } = useGetFeaturesQuery(
    { pageSize: 9999 },
    {
      selectFromResult: ({ data, isLoading }) => ({
        data: data?.data?.data,
        isLoading,
      }),
    }
  )
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
    if (data) {
      const updatedData = [...data]

      const newFeatureIndex = 1
      updatedData.splice(newFeatureIndex, 0, hasSizeProperty)

      setFeatureDb(updatedData)
    }
  }, [data])

  const handleFeatureSelect = (features: ProductFeature[]) => {
    var x = features.find((x) => x.name === 'سایزبندی')
    setStateFeature((prevState) => {
      const newState = prevState.filter((item) => features.some((feature) => feature.id === item.id))
      features.forEach((feature) => {
        if (!newState.some((item) => item.id === feature.id)) {
          newState.push(feature)
        }
      })
      return newState
    })
  }

  const onConfirm = () => {
    const hasSizeFeature = stateFeature.some((feature) => feature.name === 'سایزبندی')
    if (!hasSizeFeature) {
      const featureListIds = stateFeature.map((feature) => feature.id)

      updateCategoryFeature({
        categoryId: category!.id,
        featureIds: featureListIds,
      })
    } else {
      const featureListIds = stateFeature.filter((feature) => feature.name !== 'سایزبندی').map((feature) => feature.id)

      updateCategoryFeature({
        categoryId: category!.id,
        featureIds: featureListIds,
        hasSizeProperty: hasSizeFeature,
      })
    }
    dispatch(setUpdated(true))
  }

  // ? Render(s)
  return (
    <>
      {/* Handle Response */}
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
              انتخاب ویژگی برای <div className="text-sky-500"> {category?.name}</div>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4 bg-white   text-center md:rounded-lg w-full">
              <div className="flex items-center w-full gap-x-12 px-6">
                <span className='whitespace-nowrap'>مقادیر</span>
                <div className="w-full">
                  <ProductFeatureCombobox
                    hasSizeProperty={hasSizeProperty}
                    onFeatureSelect={handleFeatureSelect}
                    setStateFeature={setStateFeature}
                    featureList={featureDb ?? []}
                    stateFeatureData={featureDb?.filter((feature) => category?.featureIds?.includes(feature.id))}
                    category={category}
                  />
                </div>
              </div>
              <div className="flex px-5 py-3 justify-between items-center gap-x-20 bg-[#f5f8fa]">
                <span className="text-xs">ویژگی های مربوط به محصولات این دسته یندی را وارد کنید</span>
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

export default FeaturesModal
