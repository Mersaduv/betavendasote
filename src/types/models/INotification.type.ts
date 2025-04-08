import { ITicketMessage } from './ITicketMessage.type'
import { ITicketType } from './ITicketType.type'
import { IUser } from './IUser.type'

export interface INotification {
  id: string
  notificationCode: string
  user: IUser
  towards: string
  recipients: IUser[]
  allRoles: boolean
  isPublic: boolean
  subject: string
  description: string
  sendingTime: number
  scheduledDate: string
  isPublish: boolean
  isRead: boolean
  created: string
  lastUpdated: string
}
