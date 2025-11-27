import moment from 'moment';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Image, Pressable, TouchableOpacity, View } from 'react-native';
import {
  AudioPlayerComponent,
  AvatarComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
  VideoPlayer,
} from '.';
import { colors } from '../constants/colors';
import { convertInfoUserFromID } from '../constants/convertData';
import { formatMessageBlockTime, toMs } from '../constants/handleTimeData';
import { sizes } from '../constants/sizes';
import { MessageModel, UserModel } from '../models';
import { collection, doc, onSnapshot } from '@react-native-firebase/firestore';
import { db } from '../../firebase.config';

interface Props {
  currentUser: UserModel | null;
  users: UserModel[];
  lastSentByUser: any;
  showDisplayName: boolean;
  showAvatar: boolean;
  showBlockTime: boolean;
  shouldShowSmallTime: boolean;
  isEndOfTimeBlock: boolean;
  msg: MessageModel | any;
  chatRoomId: string;
  readers: any;

  type: string;
  members: UserModel[];
  onLongPress: ({ msg, rect }: any) => void;
}

const MessageContentComponent = React.memo((props: Props) => {
  const {
    currentUser: user,
    users,
    lastSentByUser,
    showDisplayName,
    showAvatar,
    showBlockTime,
    shouldShowSmallTime,
    isEndOfTimeBlock,
    msg,
    chatRoomId,
    readers,
    type,
    members,
    onLongPress,
  } = props;
  const [reactionCounts, setReactionCounts] = useState<{
    [key: string]: number;
  }>({});
  const batchId = msg.batchId; // batchId được lưu trong message

  useEffect(() => {
    if (!chatRoomId || !batchId || !user) return;

    const messageRef = doc(
      db,
      `chatRooms/${chatRoomId}/batches/${batchId}/messages/${msg.id}`,
    );

    // listen reactionCounts
    const unsubMessage = onSnapshot(messageRef, docSnap => {
      setReactionCounts(docSnap.data()?.reactionCounts || {});
    });

    // cleanup
    return () => {
      unsubMessage();
    };
  }, [chatRoomId, batchId, msg.id, user?.id]);

  const showContent = () => {
    let result: ReactNode;
    switch (msg.type) {
      case 'text':
        result = (
          <TextComponent
            text={msg.text}
            styles={{
              textAlign: 'justify',
              color:
                user?.id !== msg.senderId ? colors.text : colors.background,
            }}
          />
        );
        break;
      case 'image':
        result = (
          <TouchableOpacity
            style={{ flex: 1, width: '100%' }}
            onPress={msg.onImagePressForItem}
          >
            <Image
              source={{
                uri: msg.mediaURL,
              }}
              style={{
                width: 200,
                height: 150,
                borderRadius: 10,
                flex: 1,
                objectFit: 'cover',
                opacity: msg.status === 'pending' ? 0.3 : 1,
              }}
            />
          </TouchableOpacity>
        );
        break;
      case 'video':
        result = (
          <TouchableOpacity style={{ flex: 1, width: '100%' }}>
            <VideoPlayer
              videoUrl={msg.status === 'pending' ? msg.localURL : msg.mediaURL}
              styles={{
                opacity: msg.status === 'pending' ? 0.3 : 1,
              }}
            />
          </TouchableOpacity>
        );
        break;
      case 'audio':
        result = (
          <TouchableOpacity style={{ flex: 1, width: '100%' }}>
            <AudioPlayerComponent
              url={msg.mediaURL}
              audioStyles={{
                opacity: msg.status === 'pending' ? 0.3 : 1,
              }}
            />
          </TouchableOpacity>
        );
        break;

      default:
        break;
    }

    return result;
  };
  const ref = useRef<any>(null);
  const handleLongPress = () => {
    ref.current?.measure(
      (fx: any, fy: any, width: any, height: any, px: any, py: any) => {
        // Gửi vị trí bong bóng + dữ liệu tin nhắn lên cha
        onLongPress({
          msg,
          rect: { x: px, y: py + 10, width, height },
        });
      },
    );
  };
  const handleReaction = (reactions: Record<string, number>) => {
    const reactionList = Object.entries(reactionCounts)
      .filter(([emoji, count]) => count > 0)
      .map(([emoji]) => emoji);
    const totalReaction = Object.values(reactions).reduce(
      (sum, n) => sum + n,
      0,
    );

    return {
      reactionList,
      totalReaction,
    };
  };

  return (
    <TouchableOpacity onLongPress={handleLongPress} delayLongPress={250}>
      {showBlockTime && (
        <TextComponent
          styles={{ marginVertical: 4 }}
          text={formatMessageBlockTime(msg.createAt)}
          textAlign="center"
          size={sizes.subText}
          color={colors.gray3}
        />
      )}
      <RowComponent
        justify={user?.id === msg.senderId ? 'flex-end' : 'flex-start'}
        styles={{
          alignItems:
            showAvatar || isEndOfTimeBlock ? 'flex-end' : 'flex-start',
        }}
      >
        {user?.id !== msg.senderId && (
          <>
            {showAvatar || isEndOfTimeBlock ? (
              <AvatarComponent
                size={26}
                uri={convertInfoUserFromID(msg.senderId, users)?.photoURL}
                styles={{ marginBottom: 6 }}
              />
            ) : (
              <SpaceComponent height={26} width={26} />
            )}
            <SpaceComponent width={10} />
          </>
        )}
        <Pressable
          ref={ref}
          style={{
            maxWidth: '70%',
          }}
        >
          {type === 'group' && user?.id !== msg.senderId && showDisplayName && (
            <RowComponent justify="flex-start" styles={{ width: '100%' }}>
              <TextComponent
                text={
                  convertInfoUserFromID(msg.senderId, users)
                    ?.displayName as string
                }
                size={sizes.smallText}
                color="coral"
              />
            </RowComponent>
          )}
          <RowComponent
            styles={{
              flexDirection: 'column',
              backgroundColor:
                msg.type === 'text'
                  ? user?.id !== msg.senderId
                    ? colors.gray + '80'
                    : colors.primaryBold
                  : colors.background,
              padding: msg.type === 'text' ? 10 : 0,
              borderRadius: 10,
              alignItems: 'flex-start',
            }}
          >
            {msg.hiddenMsg ? (
              <TextComponent
                text="Tin nhắn đã bị xóa"
                color={colors.background}
                styles={{
                  fontStyle: 'italic',
                }}
              />
            ) : (
              showContent()
            )}
            {(showAvatar || shouldShowSmallTime) && (
              <TextComponent
                text={moment(toMs(msg.createAt ?? msg.createAt)).format(
                  'HH:mm',
                )}
                textAlign="center"
                size={sizes.smallText}
                color={
                  msg.senderId === user?.id
                    ? msg.type === 'text'
                      ? colors.background
                      : colors.text
                    : colors.red
                }
              />
            )}
            {handleReaction(reactionCounts).reactionList.length > 0 && (
              <RowComponent
                styles={{
                  position: 'absolute',
                  bottom: -10,
                  right: 0,
                }}
              >
                {handleReaction(reactionCounts).reactionList.map(
                  (_, index) =>
                    index <= 2 && <TextComponent text={_} key={index} />,
                )}
                {handleReaction(reactionCounts).totalReaction > 3 && (
                  <TextComponent
                    text={`+${
                      handleReaction(reactionCounts).totalReaction - 3
                    }`}
                  />
                )}
              </RowComponent>
            )}
          </RowComponent>
          {handleReaction(reactionCounts).totalReaction > 0 && (
            <SpaceComponent height={6} />
          )}
          {readers.length === 0 && (
            <RowComponent justify="flex-end">
              {(msg.status === 'failed' ||
                msg.status === 'pending' ||
                (msg.status === 'sent' && msg.id === lastSentByUser?.id)) && (
                <TextComponent
                  text={
                    msg.status === 'failed'
                      ? '❌ Lỗi gửi'
                      : msg.status === 'pending'
                      ? 'Đang gửi'
                      : 'Đã gửi'
                  }
                  size={sizes.extraComment}
                />
              )}
            </RowComponent>
          )}
          <SpaceComponent height={4} />
        </Pressable>
      </RowComponent>
      {readers.length > 0 && Object.keys(reactionCounts).length !== 0 && (
        <RowComponent justify="flex-end" styles={{ marginBottom: 4 }}>
          {readers.map((_: string, index: number) => (
            <AvatarComponent
              size={sizes.bigText}
              key={index}
              uri={members.filter(member => member.id === _)[0]?.photoURL}
            />
          ))}
        </RowComponent>
      )}
    </TouchableOpacity>
  );
});

export default MessageContentComponent;
