import { useAppDispatch, useAppSelector } from '@/hooks'
import { setTempObjectValue, setTempObjectValue2 } from '@/store'
import { IObjectValue } from '@/types'

interface Props {
  objectValues: IObjectValue[]
  feature?: IObjectValue
}
const ProductObjectValueSelector: React.FC<Props> = (props) => {
  const { objectValues, feature } = props

  const dispatch = useAppDispatch()
  const { featureObjectValues } = useAppSelector((state) => state.objectValue);
  const handleClicked = (
    val: { id: string; name: string },
    featureId: string,
    featureTitle: string
  ) => {
    dispatch(setTempObjectValue({ id: featureId, title: featureTitle, value: [val] } as IObjectValue));
    dispatch(setTempObjectValue2({
      id: featureId,
      title: featureTitle,
      value:  [val],
    }));
    
  };
  const selectedValue = feature?.id ? featureObjectValues[feature.id]?.value[0]?.id : null;

  return (
    <div className="flex gap-2.5">
      {objectValues.map((val) => (
        <button
          type="button"
          onClick={() => feature?.id && feature?.title && handleClicked({ id: val.id, name: val.title }, feature.id, feature.title)}
          key={val.id}
          className={`border cursor-pointer text-sm whitespace-nowrap font-normal flex pt-0.5 items-center justify-center px-4 rounded-md text-gray-500 border-gray-400 h-8 ${
            selectedValue === val.id ? 'bg-[#686868] text-white' : ''
          }`}
        >
          {val.title}
        </button>
      ))}
    </div>
  )
}

export default ProductObjectValueSelector