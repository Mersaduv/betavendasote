import { ITicketMessage } from './ITicketMessage.type'
import { ITicketType } from './ITicketType.type'
import { IUser } from './IUser.type'

export interface ITicket {
  id: string
  ticketType: ITicketType
  ticketCode: string
  user: IUser
  subject: string
  ticketMessages: ITicketMessage[]
  status: number
  created: string
  lastUpdated: string
}
