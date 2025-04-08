import { IUser } from './IUser.type'

export interface ISmsMessage {
  id: string
  smsCode: string
  subject: string
  description: string
  sendingTime: number
  scheduledDate: string
  allRoles: boolean
  towards: string
  recipients: IUser[]
  user: IUser
  isPublic: boolean
  created: string
  lastUpdated: string
}
