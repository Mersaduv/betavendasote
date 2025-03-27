import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Combobox } from '@headlessui/react'
import { FaCheck } from 'react-icons/fa'
import { AiOutlineClose } from 'react-icons/ai'
import { ICategory } from '@/types'

interface Props {
  categoryList?: ICategory[]
  onCategorySelect: (categories: ICategory[]) => void
  stateCategoryData?: ICategory[] | undefined
}

const CategoriesCombobox: React.FC<Props> = ({ onCategorySelect, categoryList, stateCategoryData }) => {
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<ICategory[]>([]);

  useEffect(() => {
    if (stateCategoryData) {
      handleSelectCategory(stateCategoryData)
    }
  }, [stateCategoryData?.length]);

  const filteredFeatures = categoryList && categoryList.length > 0 
    ? query === '' 
      ? categoryList 
      : categoryList.filter(categoryItem => categoryItem.name.toLowerCase().includes(query.toLowerCase())) 
    : [];

  const handleSelectCategory = (categories: ICategory[]) => {
    setSelectedCategories(categories);
    onCategorySelect(categories);
  };

  const handleRemoveCategory = (item: ICategory) => {
    const newSelectedCategories = selectedCategories.filter(category => category.id !== item.id);
    setSelectedCategories(newSelectedCategories);
    onCategorySelect(newSelectedCategories);
  };
  return (
    <div className="flex items-center gap-2">
      <div className="w-full relative">
        {categoryList && (
          <Combobox multiple value={selectedCategories} onChange={handleSelectCategory}>
            <div
              id="parent"
              className="border min-h-[36px] py-1 px-1 relative flex flex-col bg-white border-gray-200 rounded-md"
            >
              <div id="childrens" className=" flex-wrap flex gap-2">
                {selectedCategories.map((item) => (
                  <div key={item.id} className="flex custom-z4 items-center bg-gray-100 rounded-md px-2 py-1">
                    <span className="text-gray-900  text-sm whitespace-nowrap">{item.name}</span>
                    <button type="button" className="" onClick={() => handleRemoveCategory(item)}>
                      <AiOutlineClose className="mr-1  text-gray-400 hover:text-gray-900" size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <Combobox.Button className={`flex gap-2 custom-z2 `}>
                <Combobox.Input
                  className={`w-full absolute h-[28px] right-0 top-0.5 py-0 border-b  placeholder:text-sm   rounded-md border-transparent focus:border-transparent focus:ring-0   text-gray-900 ${
                    selectedCategories.length > 0 ? 'placeholder:text-white' : ''
                  }`}
                  displayValue={(category: ICategory) => category?.name}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="انتخاب دسته بندی"
                  id="inputCategory"
                />
              </Combobox.Button>
            </div>

            <Combobox.Options className="absolute z-[9999] mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredFeatures.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">هیچ دسته بندی یافت نشد.</div>
              ) : (
                filteredFeatures.map((category) => (
                  <Combobox.Option
                    key={category.id}
                    value={category}
                    className={({ active }) =>
                      `relative cursor-pointer select-none text-start py-2 pl-10 pr-4 ${
                        active ? 'bg-gray-100 text-white' : 'text-gray-900'
                      }`
                    }
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {category.name}
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

export default CategoriesCombobox
