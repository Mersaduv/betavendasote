import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

import { useChangeRoute, useDebounce, useDisclosure } from '@/hooks'

import { ArrowDown, Close, Search, Toman } from '@/icons'
import { Button, CustomCheckbox } from '@/components/ui'

import { IBrand, QueryParams } from '@/types'
import PriceRange from './PriceRange'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { digitsEnToFa, digitsFaToEn } from '@persian-tools/persian-tools'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import {
  useGetBrandsQuery,
  useGetFeaturesByCategoryOrAllQuery,
  useGetFeaturesByCategoryQuery,
  useGetFeaturesQuery,
} from '@/services'

interface Props {
  mainMaxPrice: number | undefined
  mainMinPrice: number | undefined
  onClose?: () => void
}
const ProductFilterControls: React.FC<Props> = (props) => {
  // ? Props
  const { mainMaxPrice, mainMinPrice, onClose } = props

  // ? Assets
  const { query, push } = useRouter()
  const inStockQuery = !!query?.inStock || false
  const discountQuery = !!query?.discount || false
  const minPriceQuery = query.price && +query.price.toString().split('-')[0]
  const maxPriceQuery = query.price && +query.price.toString().split('-')[1]
  let brandIds: string[] = []
  if (typeof query.brands === 'string') {
    brandIds = query.brands.split(',')
  } else if (Array.isArray(query.brands)) {
    brandIds = query.brands
  }
  let featureIds: string[] = []
  if (typeof query.features === 'string') {
    featureIds = query.features.split(',')
  } else if (Array.isArray(query.features)) {
    featureIds = query.features
  }
  const pageQuery = Number(query?.page)
  const [isOpenPrice, setIsOpenPrice] = useState(false)
  const [isOpen, setIsOpen] = useState<{ [key: string]: boolean }>({})

  const changeRoute = useChangeRoute()

  // ? State
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedFeature, setSelectedFeature] = useState<string[]>([])
  const [price, setPrice] = useState({
    minPrice: mainMinPrice,
    maxPrice: mainMaxPrice,
  })

  // ? Debounced Values
  const debouncedMinPrice = useDebounce(price.minPrice!, 1200)
  const debouncedMaxPrice = useDebounce(price.maxPrice!, 1200)

  // ? Queries
  const { data: featuresData, isLoading: isLoadingData } = useGetFeaturesByCategoryOrAllQuery({ pageSize: 999 })
  // ? Handlers
  const handleChangeRoute = (newQueries: QueryParams) => {
    changeRoute({
      ...query,
      page: pageQuery && pageQuery > 1 ? 1 : '',
      ...newQueries,
    })
  }

  useEffect(() => {
    handleChangeRoute({ minPrice: debouncedMinPrice, maxPrice: debouncedMaxPrice })
  }, [debouncedMinPrice, debouncedMaxPrice])

  const handlefilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target
    var numValue = Number(digitsFaToEn(value))
    if (type === 'checkbox') handleChangeRoute({ [name]: checked })
    if (type === 'text') setPrice((prev) => ({ ...prev, [name]: +numValue }))
  }

  const handleResetFilters = () => {
    handleChangeRoute({ inStock: '', discount: '', price: '' })
    onClose?.()
  }

  const canReset =
    inStockQuery || discountQuery || mainMinPrice !== debouncedMinPrice || mainMaxPrice !== debouncedMaxPrice

  //*   Close Modal on Change Filter
  useEffect(() => {
    onClose?.()
  }, [discountQuery, inStockQuery, debouncedMaxPrice, debouncedMinPrice])

  //*  Change prices when mainMaxPrice and mainMinPrice of category changes
  useEffect(() => {
    if (minPriceQuery && maxPriceQuery)
      setPrice({
        minPrice: minPriceQuery,
        maxPrice: maxPriceQuery,
      })
    else {
      setPrice({
        minPrice: mainMinPrice,
        maxPrice: mainMaxPrice,
      })
    }
  }, [minPriceQuery, maxPriceQuery])

  //search filter
  //..................
  const [searchTerm, setSearchTerm] = useState('')
  const [featureSearchTerms, setFeatureSearchTerms] = useState<{ [key: string]: string }>({})
  const [filteredBrands, setFilteredBrands] = useState<IBrand[]>([])
  // ? brand Query
  const { data } = useGetBrandsQuery({
    page: 1,
    pageSize: 15,
    isActive: true,
  })

  useEffect(() => {
    if (data?.data?.data) {
      setFilteredBrands(data.data.data)
    }
  }, [data])

  // useEffect(() => {
  //   if (data?.data?.data) {
  //     const filtered = data.data.data.filter((brand) => brand.nameFa.toLowerCase().includes(searchTerm.toLowerCase()))
  //     setFilteredBrands(filtered)
  //   }
  // }, [searchTerm, data])

  // useEffect(() => {
  //   // If brandIds has changed, update selectedBrands
  //   if (brandIds.length > 0 && selectedBrands.length === 0) {
  //     setSelectedBrands(brandIds)
  //   }
  // }, [brandIds, selectedBrands.length])

  // useEffect(() => {
  //   // If featureIds has changed, update selectedFeature
  //   if (featureIds.length > 0 && selectedFeature.length === 0) {
  //     setSelectedFeature(featureIds)
  //   }
  // }, [featureIds, selectedFeature.length])
  const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target

    let newSelectedBrands = [...selectedBrands]

    if (checked) {
      if (!newSelectedBrands.includes(value)) {
        newSelectedBrands.push(value)
      }
    } else {
      newSelectedBrands = newSelectedBrands.filter((brand) => brand !== value)
    }

    setSelectedBrands(newSelectedBrands)

    // Update URL when brands change
    handleChangeRoute({
      brands: newSelectedBrands.length ? newSelectedBrands.join(',') : '',
    })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target

    let newSelectedFeatures = [...selectedFeature]

    if (checked) {
      if (!newSelectedFeatures.includes(value)) {
        newSelectedFeatures.push(value)
      }
    } else {
      newSelectedFeatures = newSelectedFeatures.filter((feature) => feature !== value)
    }

    setSelectedFeature(newSelectedFeatures)

    // Update URL when features change
    handleChangeRoute({
      featureValues: newSelectedFeatures.length ? newSelectedFeatures.join(',') : '',
    })
  }

  const handleFeatureSearchChange = (featureId: string, value: string) => {
    setFeatureSearchTerms((prev) => ({
      ...prev,
      [featureId]: value,
    }))
  }

  // useEffect(() => {
  //   if (selectedBrands.length > 0 || selectedBrands.length === 0) {
  //     handleChangeRoute({
  //       brands: selectedBrands.length ? selectedBrands.join(',') : '',
  //     })
  //   }
  // }, [selectedBrands])

  if (featuresData) {
    console.log(featuresData, 'featuresData')
  }
  // ? Render(s)
  return (
    <>
      <div className="flex justify-between border py-1 px-2 w-full rounded-lg mb-5 -mt-4">
        <CustomCheckbox name="inStock" checked={inStockQuery} onChange={handlefilter} label="فقط کالاهای موجود" />
      </div>

      {/* <CustomCheckbox name="discount" checked={discountQuery} onChange={handlefilter} label="فقط کالاهای فروش ویژه" /> */}
      {/* price filter */}
      <div className="border rounded-lg space-y-3 pb-4">
        <div className="px-4 pt-4 rounded-lg">
          <Menu>
            {({ open }) => (
              <>
                <Menu.Button
                  className="flex justify-between w-full py-3 bg-gray-100 px-5 rounded-lg"
                  onClick={() => setIsOpenPrice(!isOpenPrice)}
                >
                  قیمت
                  {isOpenPrice ? <IoIosArrowUp className="icon" /> : <IoIosArrowDown className="icon" />}
                </Menu.Button>

                <Transition
                  show={isOpenPrice}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items static className="">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <div>
                            {/* price filter */}
                            <div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center justify-between gap-x-1">
                                  <span className="text-base">از</span>
                                  <input
                                    type="text"
                                    className="w-3/4 border-b border-gray-200 pt-3 text-xl outline-none rounded-md text-center"
                                    style={{ direction: 'ltr' }}
                                    name="minPrice"
                                    value={digitsEnToFa(price.minPrice ?? 0)}
                                    onChange={handlefilter}
                                  />
                                </div>
                                <div className="flex items-center justify-between gap-x-1">
                                  <span className="text-base pr-3.5">تا</span>
                                  <input
                                    type="text"
                                    className="w-3/4 border-b pt-3 border-gray-200 px-1 rounded-md text-center text-xl outline-none"
                                    style={{ direction: 'ltr' }}
                                    name="maxPrice"
                                    value={digitsEnToFa(price.maxPrice ?? 0)}
                                    onChange={handlefilter}
                                  />
                                </div>
                              </div>
                              {/* <PriceRange
                              minPrice={price.minPrice}
                              maxPrice={price.maxPrice}
                              onPriceChange={(newPrice) => setPrice(newPrice)}
                            /> */}
                            </div>
                            {/* <div className="py-4">
                            <span className="font-medium text-gray-700">محدوده قیمت</span>
                            <div className="flex items-center justify-between gap-x-1">
                              <span className="text-base">از</span>
                              <input
                                type="number"
                                className="w-3/4 border-b pt-3 border-gray-200 px-1 rounded-md text-center text-xl outline-none"                                style={{ direction: 'ltr' }}
                                name="minPrice"
                                value={digitsEnToFa(price.minPrice ?? 0)}
                                onChange={handlefilter}
                              />
                              تومان
                            </div>
                            <div className="mb-4 mt-2 flex items-center justify-between gap-x-1">
                              <span className="text-base">تا</span>
                              <input
                                type="number"
                                className="w-3/4 border-b border-gray-200 px-1 text-left text-xl outline-none"
                                style={{ direction: 'ltr' }}
                                name="maxPrice"
                                value={digitsEnToFa(price.maxPrice ?? 0)}
                                onChange={handlefilter}
                              />
                              تومان{' '}
                            </div>
                          </div> */}
                          </div>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </>
            )}
          </Menu>
        </div>
        {/* brand filter */}
        <div className="px-4 rounded-lg">
          <Menu>
            {({ open }) => (
              <>
                <Menu.Button
                  className="flex justify-between w-full py-3 bg-gray-100 px-5 rounded-lg"
                  onClick={() => setIsOpen((prevState) => ({ ...prevState, brand: !prevState.brand }))}
                >
                  برند
                  {isOpen.brand ? <IoIosArrowUp className="icon" /> : <IoIosArrowDown className="icon" />}
                </Menu.Button>

                <Transition
                  show={isOpen.brand}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items static className="">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <div>
                            <div className="my-0 flex flex-row-reverse rounded-lg border">
                              <input
                                type="text"
                                placeholder="جستجو در برند..."
                                className="input grow bg-transparent p-1 text-right outline-none border-none placeholder:text-sm placeholder:font-light placeholder:pr-1.5"
                                value={searchTerm}
                                onChange={handleSearchChange}
                              />
                            </div>
                            <div className="overflow-auto max-h-[200px] pt-2">
                              {filteredBrands.map((brand) => (
                                <div className="mb-1.5 flex justify-between px-4" key={brand.id}>
                                  <label className="ml-2">{brand.nameFa}</label>
                                  <div className="flex items-center gap-x-1">
                                    <label className="ml-2">{brand.nameEn}</label>
                                    <input
                                      className="bg-gray-200 border-none rounded checked:bg-[#e90089]"
                                      type="checkbox"
                                      value={brand.id}
                                      onChange={handleBrandChange}
                                      checked={selectedBrands.includes(brand.id)}
                                    />
                                  </div>
                                </div>
                              ))}
                              {filteredBrands.length === 0 && (
                                <div className="text-center text-xs text-gray-500">هیچ برندی یافت نشد</div>
                              )}
                            </div>
                          </div>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </>
            )}
          </Menu>
        </div>

        {/* features  */}
        {featuresData?.data?.productFeatureSizes &&
          featuresData?.data?.productFeatureSizes.map((feature) => {
            // Filter feature values based on search term for this specific feature
            const filteredValues = feature.values?.filter(
              (value) =>
                !featureSearchTerms[feature.id] ||
                value.name.toLowerCase().includes((featureSearchTerms[feature.id] || '').toLowerCase())
            )

            return (
              <div className="px-4 rounded-lg" key={feature.id}>
                <Menu>
                  {({ open }) => (
                    <>
                      <Menu.Button
                        className="flex justify-between w-full py-3 bg-gray-100 px-5 rounded-lg"
                        onClick={() =>
                          setIsOpen((prevState) => ({ ...prevState, [feature.id]: !prevState[feature.id] }))
                        }
                      >
                        {feature.name}
                        {isOpen[feature.id] ? <IoIosArrowUp className="icon" /> : <IoIosArrowDown className="icon" />}
                      </Menu.Button>

                      <Transition
                        show={isOpen[feature.id]}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items static className="">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <div>
                                  <div className="my-0 flex flex-row-reverse rounded-lg border">
                                    <input
                                      type="text"
                                      placeholder={`جستجو در ${feature.name}...`}
                                      className="input grow bg-transparent p-1 text-right outline-none border-none placeholder:text-sm placeholder:font-light placeholder:pr-1.5"
                                      value={featureSearchTerms[feature.id] || ''}
                                      onChange={(e) => handleFeatureSearchChange(feature.id, e.target.value)}
                                    />
                                  </div>
                                  <div className="overflow-auto max-h-[200px] pt-2">
                                    {filteredValues?.map((value) => (
                                      <div className="mb-1.5 flex justify-between px-4" key={value.id}>
                                        <label className="ml-2">{value.name}</label>
                                        <div className="flex items-center gap-x-1">
                                          <input
                                            className="bg-gray-200 border-none rounded checked:bg-[#e90089]"
                                            type="checkbox"
                                            value={value.id}
                                            onChange={handleFeatureChange}
                                            checked={selectedFeature.includes(value.id)}
                                          />
                                        </div>
                                      </div>
                                    ))}

                                    {filteredValues?.length === 0 && (
                                      <div className="text-center text-xs text-gray-500">
                                        هیچ {feature.name} یافت نشد
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </>
                  )}
                </Menu>
              </div>
            )
          })}

        {featuresData?.data?.productFeatures &&
          featuresData?.data?.productFeatures.map((feature) => {
            // Filter feature values based on search term for this specific feature
            const filteredValues = feature.values?.filter(
              (value) =>
                !featureSearchTerms[feature.id] ||
                value.name.toLowerCase().includes((featureSearchTerms[feature.id] || '').toLowerCase())
            )

            return (
              <div className="px-4 rounded-lg" key={feature.id}>
                <Menu>
                  {({ open }) => (
                    <>
                      <Menu.Button
                        className="flex justify-between w-full py-3 bg-gray-100 px-5 rounded-lg"
                        onClick={() =>
                          setIsOpen((prevState) => ({ ...prevState, [feature.id]: !prevState[feature.id] }))
                        }
                      >
                        {feature.name}
                        {isOpen[feature.id] ? <IoIosArrowUp className="icon" /> : <IoIosArrowDown className="icon" />}
                      </Menu.Button>

                      <Transition
                        show={isOpen[feature.id]}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items static className="">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <div>
                                  <div className="my-0 flex flex-row-reverse rounded-lg border">
                                    <input
                                      type="text"
                                      placeholder={`جستجو در ${feature.name}...`}
                                      className="input grow bg-transparent p-1 text-right outline-none border-none placeholder:text-sm placeholder:font-light placeholder:pr-1.5"
                                      value={featureSearchTerms[feature.id] || ''}
                                      onChange={(e) => handleFeatureSearchChange(feature.id, e.target.value)}
                                    />
                                  </div>
                                  <div className="overflow-auto max-h-[200px] pt-2">
                                    {filteredValues?.map((value) => (
                                      <div className="mb-1.5 flex justify-between px-4" key={value.id}>
                                        <label className="ml-2">{value.name}</label>
                                        <div className="flex items-center gap-x-1">
                                          <input
                                            className="bg-gray-200 border-none rounded checked:bg-[#e90089]"
                                            type="checkbox"
                                            value={value.id}
                                            onChange={handleFeatureChange}
                                            checked={selectedFeature.includes(value.id)}
                                          />
                                        </div>
                                      </div>
                                    ))}

                                    {filteredValues?.length === 0 && (
                                      <div className="text-center text-xs text-gray-500">
                                        هیچ {feature.name} یافت نشد
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </>
                  )}
                </Menu>
              </div>
            )
          })}
      </div>
    </>
  )
}

export default ProductFilterControls
