import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ICategory } from '@/types';
import { AiOutlineClose } from 'react-icons/ai';
import { FaCheck } from 'react-icons/fa';

interface Props {
  categories: ICategory[];
  onCategorySelect: (categories: ICategory[]) => void;
  stateCategoryData?: ICategory[];
}

const CategorySelectedCombobox: React.FC<Props> = ({ categories, onCategorySelect, stateCategoryData }) => {
  const [selectedCategories, setSelectedCategories] = useState<ICategory[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (stateCategoryData) {
      setSelectedCategories(stateCategoryData);
    }
  }, [stateCategoryData]);

  const filteredCategories =
    query === ''
      ? categories
      : categories.filter((category) => category.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (categories: ICategory[]) => {
    setSelectedCategories(categories);
    onCategorySelect(categories);
  };

  const handleRemove = (category: ICategory) => {
    const newSelectedCategories = selectedCategories.filter((cat) => cat.id !== category.id);
    setSelectedCategories(newSelectedCategories);
    onCategorySelect(newSelectedCategories);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-full relative">
        <Combobox multiple value={selectedCategories} onChange={handleSelect}>
          <div
            id="parent"
            className="border min-h-[36px] px-1 relative flex flex-col bg-white border-gray-200 rounded-md"
          >
            <div id="childrens" className="mt-1 pb-1 flex-wrap flex gap-2">
              {selectedCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex custom-z4 items-center bg-gray-100 rounded-md px-2 py-1"
                >
                  <span className="text-gray-900 text-sm whitespace-nowrap">{category.name}</span>
                  <button type="button" onClick={() => handleRemove(category)}>
                    <AiOutlineClose
                      className="mr-1 text-gray-400 hover:text-gray-900"
                      size={14}
                    />
                  </button>
                </div>
              ))}
            </div>
            <Combobox.Button className="flex gap-2 custom-z2">
              <Combobox.Input
                className={`w-full absolute h-[28px] right-0 top-0.5 py-0 border-b placeholder:text-sm rounded-md border-transparent focus:border-transparent focus:ring-0 text-gray-900 ${
                  selectedCategories.length > 0 ? 'placeholder:text-white' : ''
                }`}
                displayValue={(category: ICategory) => category?.name}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="انتخاب"
                id="inputCategory"
              />
            </Combobox.Button>
          </div>
          <Combobox.Options className="absolute z-[60] mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredCategories.length === 0 ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                هیچ دسته‌بندی یافت نشد.
              </div>
            ) : (
              filteredCategories.map((category) => (
                <Combobox.Option
                  key={category.id}
                  value={category}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 flex pl-10 pr-4 ${
                      active ? 'bg-gray-100 text-white' : 'text-gray-900'
                    }`
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`${selected ? 'visible' : 'invisible'} inset-y-0 left-0 flex items-center pl-3 ${
                          active ? 'text-[#e90089]' : 'text-[#e90089]'
                        }`}
                      >
                        <FaCheck className="h-4 w-4" />
                      </span>
                      <span
                        className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                      >
                        {category.name}
                      </span>
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Combobox>
      </div>
    </div>
  );
};

export default CategorySelectedCombobox;