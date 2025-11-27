import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Popover from 'react-native-popover-view';
import { Placement } from 'react-native-popover-view/dist/Types';
import RowComponent from './RowComponent';
import { Trash } from 'iconsax-react-native';
import { sizes } from '../constants/sizes';
import { colors } from '../constants/colors';
import { ForwardMsg, ReplyMsg } from '../assets/vector';
import TextComponent from './TextComponent';
import { SpaceComponent } from '.';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from '@react-native-firebase/firestore';
import { auth, db } from '../../firebase.config';

const GlobalPopover = ({
  visible,
  rect,
  message,
  onClose,
  onDelete,
  onReply,
  onReact,
  onEmoji
}: any) => {
  const userCurrent = auth.currentUser
  const [value, setValue] = useState('');
  const [myReactions, setMyReactions] = useState<any[]>([]);


  useEffect(() => {
    if (!message) return;

    const colRef = collection(
      db,
      `chatRooms/${message.chatRoomId}/batches/${message.batchId}/messages/${message.id}/reactions`
    );

    const unsubscribe = onSnapshot(colRef, snap => {
      let items: any = []

      snap.docs.forEach((doc: any) => {
        const data = doc.data();
        items.push({ ...data, id: doc.id })
      });

      setMyReactions(items)
    });

    // ⬅️ cleanup khi unmount hoặc khi chatRoomId/batchId thay đổi
    return () => unsubscribe();
  }, [message]);

  useEffect(() => {
    if (myReactions) {
      const reaction = myReactions.find((_) => _.id === userCurrent?.uid)
      setValue(reaction?.reaction ?? '')
    }
  }, [myReactions])

  return (
    <Popover
      isVisible={visible}
      onRequestClose={onClose}
      from={rect} // 🎯 POPUP TỪ TỌA ĐỘ CỦA TIN NHẮN
      placement={Placement.TOP}
      popoverStyle={{
        padding: 6,
      }}
    >
      <RowComponent
        styles={{
          borderBottomWidth: 1,
          borderBottomColor: colors.gray,
        }}
      >
        {['👍', '❤️', '😍', '😂', '🙏', '🥺', '😭', '👏', '😁', '🔥'].map(
          (emoji: string, index: number) => (
            <TouchableOpacity
              onPress={() => {
                onEmoji({ emoji, message })
                setValue(emoji)
              }}
              key={index}
              style={{
                height: 50, width: 50,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: emoji === value ? colors.textBold : undefined
              }}
            >
              <TextComponent text={emoji} size={sizes.bigTitle} />
            </TouchableOpacity>
          ),
        )}
      </RowComponent>
      <SpaceComponent height={10} />
      <RowComponent justify="space-around">
        <TouchableOpacity onPress={() => onReply(message)}>
          <ReplyMsg
            fill={colors.textBold}
            width={sizes.extraTitle}
            height={sizes.extraTitle}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onReact(message)}>
          <ForwardMsg
            fill={colors.textBold}
            width={sizes.smallHeader}
            height={sizes.smallHeader}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onDelete(message)}>
          <Trash size={sizes.extraTitle} color={colors.red} variant="Bold" />
        </TouchableOpacity>
      </RowComponent>
    </Popover>
  );
};

export default GlobalPopover;
