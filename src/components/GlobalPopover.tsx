import { collection, onSnapshot } from '@react-native-firebase/firestore';
import { Refresh2, Trash } from 'iconsax-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import Popover from 'react-native-popover-view';
import { Placement } from 'react-native-popover-view/dist/Types';
import { SpaceComponent } from '.';
import { auth, db } from '../../firebase.config';
import { ForwardMsg, ReplyMsg } from '../assets/vector';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';
import RowComponent from './RowComponent';
import TextComponent from './TextComponent';

const GlobalPopover = ({
  visible,
  rect,
  message,
  onClose,
  onDelete,
  onReply,
  onReact,
  onEmoji,
  onRecall
}: any) => {
  const userCurrent = auth.currentUser;
  const [value, setValue] = useState<string | null>('');
  const [myReactions, setMyReactions] = useState<any[]>([]);

  useEffect(() => {
    if (!message) return;

    const colRef = collection(
      db,
      `chatRooms/${message.chatRoomId}/batches/${message.batchId}/messages/${message.id}/reactions`,
    );

    const unsubscribe = onSnapshot(colRef, snap => {
      let items: any = [];

      snap.docs.forEach((doc: any) => {
        const data = doc.data();
        items.push({ ...data, id: doc.id });
      });

      setMyReactions(items);
    });

    // ⬅️ cleanup khi unmount hoặc khi chatRoomId/batchId thay đổi
    return () => unsubscribe();
  }, [message]);

  useEffect(() => {
    if (myReactions) {
      const reaction = myReactions.find(_ => _.id === userCurrent?.uid);
      setValue(reaction?.reaction ?? '');
    }
  }, [myReactions]);

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            '👍',
            '✌️',
            '🙏',
            '👏',
            '😁',
            '😘',
            '😍',
            '🥳',
            '❤️',
            '😂',
            '😭',
            '🥺',
            '😬',
            '🔥',
          ].map((emoji: string, index: number) => (
            <TouchableOpacity
              onPress={() => {
                const isSame = value === emoji;
                const newValue = isSame ? null : emoji;
                onEmoji({ emoji: newValue, message });
                setValue(newValue);
              }}
              key={index}
              style={{
                height: 50,
                width: 50,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: emoji === value ? colors.textBold : undefined,
              }}
            >
              <TextComponent text={emoji} size={sizes.bigTitle} />
            </TouchableOpacity>
          ))}
        </ScrollView>
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
        {
          userCurrent?.uid === message?.senderId &&
          <TouchableOpacity onPress={() => onRecall(message)}>
            <Refresh2 size={sizes.extraTitle} color={colors.blue} variant="Bold" />
          </TouchableOpacity>
        }
        <TouchableOpacity onPress={() => onDelete(message)}>
          <Trash size={sizes.extraTitle} color={colors.red} variant="Bold" />
        </TouchableOpacity>
      </RowComponent>
    </Popover>
  );
};

export default GlobalPopover;
