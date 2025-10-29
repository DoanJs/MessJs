import { TimeAtModel } from "."

export interface MemberModel {
    id: string
    role: string
    joinedAt: TimeAtModel
    nickName: string
}