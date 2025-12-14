import {
  useBlockStore,
  useFriendRequestStore,
  useFriendShipStore,
} from '../zustand';

export function useFriendState(userId: string) {
  const blockedMe = useBlockStore(s => s.blockedMe[userId]);
  const blockedByMe = useBlockStore(s => s.blockedByMe[userId]);

  const pending = useFriendRequestStore(s => s.friendRequests[userId]);
  const isFriend = useFriendShipStore(s => s.friendShips[userId]);

  if (blockedMe) return 'blocked_me';
  if (blockedByMe) return 'blocked_by_me';
  if (isFriend) return 'friend';
  if (pending) return pending;
  return 'none';
}
