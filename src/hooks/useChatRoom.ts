import { doc, onSnapshot } from "@react-native-firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../../firebase.config"

// hooks/useChatRoom.ts
export const useChatRoom = (roomId: string) => {
  const [room, setRoom] = useState<any>(null)

  useEffect(() => {
    if (!roomId) return

    const unsub = onSnapshot(
      doc(db, 'chatRooms', roomId),
      snap => {
        if (!snap.exists()) return
        setRoom({ id: snap.id, ...snap.data() })
      }
    )

    return unsub
  }, [roomId])

  return room
}
