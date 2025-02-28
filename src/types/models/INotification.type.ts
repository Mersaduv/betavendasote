import { ITicketMessage } from './ITicketMessage.type'
import { ITicketType } from './ITicketType.type'
import { IUser } from './IUser.type'

export interface INotification {
  id: string
  notificationCode: string
  user: IUser
  subject: string
  description: string
  sendingTime: number
  scheduledDate: string
  isPublish: boolean
  created: string
  lastUpdated: string
}
