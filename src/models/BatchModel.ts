// import { TimeAtModel } from "./TimeAtModel"

import { MessageModel, TimeAtModel } from "."

export interface BatchModel {
    id: string
    batchInfo: {
        count: number
        date: TimeAtModel
    }
    messages: MessageModel[]
}