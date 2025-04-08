import { Dispatch, SetStateAction, useState } from 'react'
import { Combobox } from '@headlessui/react'
import { IBrand, ICategory } from '@/types'
import { ArrowDown, CheckCircleOutline } from 'heroicons-react'
import { IoChevronDownCircleOutline } from 'react-icons/io5'
import { FaCheck } from 'react-icons/fa'
import { ArrowRight, ArrowRight2 } from '@/icons'

interface Props {
  brands: IBrand[]
  onBrandSelect: (brand: IBrand) => void
  selectedBrand: IBrand | null
  setSelectedBrand: Dispatch<SetStateAction<IBrand | null>>
}

const BrandCombobox: React.FC<Props> = ({ brands, onBrandSelect, selectedBrand, setSelectedBrand }) => {
  const [query, setQuery] = useState('')

  const filteredCategories =
    query === ''
      ? [...brands].sort((a, b) => a.nameFa.localeCompare(b.nameFa, 'fa'))
      : brands
          .filter((brand) => brand.nameFa.toLowerCase().includes(query.toLowerCase()))
          .sort((a, b) => a.nameFa.localeCompare(b.nameFa, 'fa'))

  const handleSelect = (brand: IBrand) => {
    setSelectedBrand(brand)
    onBrandSelect(brand)
  }

  return (
    <div className="md:w-[318px] relative">
      <Combobox value={selectedBrand} onChange={handleSelect}>
        <div className="relative">
          <Combobox.Button className="absolute w-full top-1 -left-1 flex items-center justify-end pr-2">
            <ArrowRight2 className="text-4xl text-gray-400 rotate-90 ml-1 -mt-0.5" />
          </Combobox.Button>
          <Combobox.Input
            className="w-full rounded-md border border-gray-300 py-1.5 pr-8 pl-3 text-gray-900"
            displayValue={(brand: IBrand) => brand?.nameFa}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="انتخاب کنید"
          />
        </div>
        <Combobox.Options className="absolute z-[60] mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {filteredCategories.length === 0 && query !== '' ? (
            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">هیچ برندی یافت نشد.</div>
          ) : (
            filteredCategories.map((brand) => (
              <Combobox.Option
                key={brand.id}
                value={brand}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-gray-100 text-white' : 'text-gray-900'
                  }`
                }
              >
                {({ selected, active }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {brand.nameFa + ' ' + '-' + ' ' + brand.nameEn}
                    </span>
                    {selected ? (
                      <span
                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                          active ? 'text-[#e90089]' : 'text-[#e90089]'
                        }`}
                      >
                        <FaCheck className="h-4 w-4" />
                      </span>
                    ) : null}
                  </>
                )}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox>
    </div>
  )
}

export default BrandCombobox
