import { OrderEmpty } from '@/icons'

export default function EmptyTicketList() {
  return (
    <div className="py-20">
      <OrderEmpty className="mx-auto h-52 w-52" />

      <p className="text-center">هنوز هیچ تیکتی ندارید</p>
    </div>
  )
}
