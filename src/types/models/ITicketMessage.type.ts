import { IUser } from "./IUser.type"

export interface ITicketMessage {
    id:string
    user:IUser
    message : string
    imagesSrc: {
        id:string
        imageUrl:string
        placeholder:string
    }[]
    isCreator:boolean
    isRecipient:boolean
    created:string
    lastUpdated:string
}