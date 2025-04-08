import { Button, Modal } from '@/components/ui'
import { IProductSizeInfo } from '@/types'
import { digitsEnToFa } from '@persian-tools/persian-tools'

interface Props {
  isShow: boolean
  onClose: () => void
  productSizeInfo: IProductSizeInfo
}

const ProductScaleModal: React.FC<Props> = (props) => {
  const { isShow, onClose, productSizeInfo } = props
  return (
    <>
      {/* {(isSuccess || isError) && (
        <HandleResponse
          isError={isError}
          isSuccess={isSuccess}
          error={error}
          message={data?.message}
          onSuccess={onClose}
        />
      )} */}

      <Modal isShow={isShow} onClose={onClose} effect="bottom-to-top-scale">
        <Modal.Content onClose={onClose} className="flex h-full flex-col gap-y-5 bg-white  md:rounded-lg  w-full">
          <Modal.Header notBar onClose={onClose}>
            راهنمای سایز
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col-reverse  items-center sm:flex-row gap-x-8 pb-4 px-5 w-full">
              <div className="flex flex-col flex-1 w-full">
                <div className='text-center sm:text-start'>
                  <span className="font-normal">
                    - تلورانس اندازه گیری تا {digitsEnToFa('5%')} طبیعی است <br /> - اعداد بر حسب{' '}
                    <span className="text-red-600">{productSizeInfo.sizeType == '0' ? 'سانتیمتر' : 'میلیمتر'}</span>{' '}
                    میباشد
                  </span>
                </div>
                <table className="table-auto mt-4 border-collapse w-full">
                  <thead className="bg-[#8fdcff]">
                    <tr>
                    <th className=" px-4 py-2 text-start">اندازه</th>
                      {productSizeInfo?.columns?.map((column) => (
                        <th key={column.id} className="px-4 py-2 w-[135px] font-normal">
                          {column.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {productSizeInfo?.rows?.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-100' : ''}>
                        <td className="px-4 py-2">{row.productSizeValue}</td>
                        {productSizeInfo?.columns?.map((column, colIndex) => (
                          <td key={colIndex} className="px-4 py-2 font-normal">
                            <div className="border h-9 w-full flex justify-center farsi-digits items-center pr-1 rounded-md bg-white">
                              {row.scaleValues![colIndex] || ''}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-lg shadow-product w-[400px] h-[400px]">
                <img
                  className="w-full h-full rounded-lg"
                  src={productSizeInfo.imagesSrc?.imageUrl}
                  alt="عکس اندازه محصول"
                />
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default ProductScaleModal
