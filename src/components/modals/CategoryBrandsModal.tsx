import { Modal, Button } from '@/components/ui'
import { IBrand, ICategory } from '@/types'
import SizesCombobox from '../selectorCombobox/SizesCombobox'
import { useGetBrandsQuery, useGetSizesQuery, useUpdateCategoryBrandsMutation } from '@/services'
import { useEffect, useState } from 'react'
import { HandleResponse } from '../shared'
import { CategoryFeatureForm } from '@/services/category/types'
import { SizeDTO } from '@/services/feature/types'
import { BrandsCombobox } from '../selectorCombobox'

interface Props {
  brands: IBrand[] | undefined
  isShow: boolean
  category: ICategory | undefined
  onClose: () => void
  refetch: () => void
}

const CategoryBrandsModal: React.FC<Props> = (props) => {
  // States
  const [stateBrand, setStateBrand] = useState<IBrand[]>([])
  const [brandDb, setBrandDb] = useState<IBrand[]>()

  // ? Props
  const { brands, isShow, onClose, refetch, category } = props

  const { data, isLoading } = useGetBrandsQuery({ page: 1, pageSize: 9999 })
  const [
    updateCategoryBrands,
    {
      data: dataUpdate,
      isSuccess: isSuccessUpdate,
      isError: isErrorUpdate,
      error: errorUpdate,
      isLoading: isLoadingUpdate,
    },
  ] = useUpdateCategoryBrandsMutation()

  useEffect(() => {
    if (data?.data?.data) {
      setBrandDb(data?.data?.data)
    }
  }, [data?.data])

  const handleBrandSelect = (brands: IBrand[]) => {
    setStateBrand((prevState) => {
      const newState = prevState.filter((item) => brands.some((brand) => brand.id === item.id))
      brands.forEach((brand) => {
        if (!newState.some((item) => item.id === brand.id)) {
          newState.push(brand)
        }
      })
      return newState
    })
  }

  const onConfirm = () => {
    const brandListIds = stateBrand.map((brand) => brand.id)

    updateCategoryBrands({
      categoryId: category!.id,
      brandIds: brandListIds ?? null,
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
        }}
        effect="bottom-to-top"
      >
        <Modal.Content
          onClose={onClose}
          className="flex h-full flex-col z-[199] gap-y-5 bg-white  py-5 pb-0 md:rounded-lg "
        >
          <Modal.Header notBar onClose={onClose}>
            <div className="text-start text-base flex gap-2">
              انتخاب برند برای <div className="text-sky-500"> {category?.name}</div>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4 bg-white   text-center md:rounded-lg w-full">
              <div className="flex items-center w-full gap-x-12 px-6">
                <span>مقدار</span>
                <div className="w-full">
                  <BrandsCombobox
                    onBrandSelect={handleBrandSelect}
                    brandList={data?.data?.data ?? []}
                    stateBrandData={brandDb?.filter((brand) => category?.brands?.some((item) => item.id === brand.id))}
                  />
                </div>
              </div>
              <div className="flex px-5 py-3 justify-between items-center gap-x-20 bg-[#f5f8fa]">
                <span className="text-xs">برند های مربوط به این دسته بندی را وارد کنید</span>
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

export default CategoryBrandsModal
