import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Combobox } from '@headlessui/react'
import { FaCheck } from 'react-icons/fa'
import { AiOutlineClose } from 'react-icons/ai'
import { FeatureValue, SizeDTO } from '@/services/feature/types'
import { IBrand } from '@/types'

interface Props {
  brandList?: IBrand[]
  onBrandSelect: (brands: IBrand[]) => void
  stateBrandData?: IBrand[] | undefined
}

const BrandsCombobox: React.FC<Props> = ({ onBrandSelect, brandList, stateBrandData }) => {
  const [query, setQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<IBrand[]>([]);

  useEffect(() => {
    if (stateBrandData) {
      handleSelectBrand(stateBrandData)
    }
  }, [stateBrandData?.length]);

  const filteredFeatures = brandList && brandList.length > 0 
    ? query === '' 
      ? brandList 
      : brandList.filter(brandItem => brandItem.nameFa.toLowerCase().includes(query.toLowerCase())) 
    : [];

  const handleSelectBrand = (brands: IBrand[]) => {
    setSelectedBrands(brands);
    onBrandSelect(brands);
  };

  const handleRemoveBrand = (item: IBrand) => {
    const newSelectedBrands = selectedBrands.filter(brand => brand.id !== item.id);
    setSelectedBrands(newSelectedBrands);
    onBrandSelect(newSelectedBrands);
  };
  return (
    <div className="flex items-center gap-2">
      <div className="w-full relative">
        {brandList && (
          <Combobox multiple value={selectedBrands} onChange={handleSelectBrand}>
            <div
              id="parent"
              className="border min-h-[36px] py-1 px-1 relative flex flex-col bg-white border-gray-200 rounded-md"
            >
              <div id="childrens" className=" flex-wrap flex gap-2">
                {selectedBrands.map((item) => (
                  <div key={item.id} className="flex custom-z4 items-center bg-gray-100 rounded-md px-2 py-1">
                    <span className="text-gray-900  text-sm whitespace-nowrap">{item.nameFa}</span>
                    <button type="button" className="" onClick={() => handleRemoveBrand(item)}>
                      <AiOutlineClose className="mr-1  text-gray-400 hover:text-gray-900" size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <Combobox.Button className={`flex gap-2 custom-z2 `}>
                <Combobox.Input
                  className={`w-full absolute h-[28px] right-0 top-0.5 py-0 border-b  placeholder:text-sm   rounded-md border-transparent focus:border-transparent focus:ring-0   text-gray-900 ${
                    selectedBrands.length > 0 ? 'placeholder:text-white' : ''
                  }`}
                  displayValue={(brand: IBrand) => brand?.nameFa}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="انتخاب برند"
                  id="inputBrand"
                />
              </Combobox.Button>
            </div>

            <Combobox.Options className="absolute z-[60] mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredFeatures.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">هیچ برندی یافت نشد.</div>
              ) : (
                filteredFeatures.map((brand) => (
                  <Combobox.Option
                    key={brand.id}
                    value={brand}
                    className={({ active }) =>
                      `relative cursor-pointer select-none text-start py-2 pl-10 pr-4 ${
                        active ? 'bg-gray-100 text-white' : 'text-gray-900'
                      }`
                    }
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {brand.nameFa}
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
        )}
      </div>
    </div>
  )
}

export default BrandsCombobox
