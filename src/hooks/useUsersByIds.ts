import {
  collection,
  documentId,
  onSnapshot,
  query,
  where,
} from '@react-native-firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { db } from '../../firebase.config'

export const useUsersByIds = (memberIds?: string[]) => {
  const [members, setMembers] = useState<any[]>([])

  const memberKey = useMemo(() => {
    if (!memberIds || memberIds.length === 0) return ''
    return [...memberIds].sort().join(',')
  }, [memberIds])

  useEffect(() => {
    if (!memberKey) {
      setMembers([])
      return
    }

    const ids = memberKey.split(',')

    const chunks: string[][] = []
    for (let i = 0; i < ids.length; i += 10) {
      chunks.push(ids.slice(i, i + 10))
    }

    const unsubs = chunks.map(chunk =>
      onSnapshot(
        query(
          collection(db, 'users'),
          where(documentId(), 'in', chunk)
        ),
        snap => {
          setMembers(prev => {
            const map = new Map(prev.map(u => [u.id, u]))
            snap.docs.forEach((d: any) => {
              map.set(d.id, { id: d.id, ...d.data() })
            })
            return Array.from(map.values())
          })
        }
      )
    )

    return () => unsubs.forEach(u => u())
  }, [memberKey])

  return members
}
