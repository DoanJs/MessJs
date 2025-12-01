import { doc, onSnapshot } from '@react-native-firebase/firestore';
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
import { db } from '../../firebase.config';
import { colors } from '../constants/colors';
import { convertInfoUserFromID } from '../constants/convertData';
import { handleReaction } from '../constants/functions';
import { formatMessageBlockTime, toMs } from '../constants/handleTimeData';
import { sizes } from '../constants/sizes';
import { MessageModel, UserModel } from '../models';

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
  const ref = useRef<any>(null);
  const isForwarded =
    msg.forwardedFrom &&
    ((msg.forwardedFrom.senderId !== user?.id ||
      msg.senderId !== user?.id) as boolean);

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
              borderLeftWidth: isForwarded ? 2 : undefined,
              borderLeftColor: isForwarded
                ? msg.senderId === user?.id
                  ? colors.background
                  : colors.text
                : undefined,
              paddingLeft: isForwarded ? 6 : undefined,
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
            style={{ flex: 1, width: '100%', marginVertical: 10 }}
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
          <TouchableOpacity
            style={{ flex: 1, width: '100%', marginVertical: 10 }}
          >
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
          {msg.replyTo && (
            <View
              style={{
                borderWidth: 1,
                borderColor: 'coral',
                borderRadius: 10,
                padding: 6,
                marginTop: 10,
              }}
            >
              <TextComponent
                text={`${msg.senderId === user?.id 
                  ?  user?.id === msg.replyTo.senderId 
                    ? 'Bạn đã trả lời chính mình'
                    : 'Bạn đã trả lời tin nhắn của ' +
                      convertInfoUserFromID(user?.id as string, users)
                        ?.displayName
                  : convertInfoUserFromID(user?.id as string, users)
                        ?.displayName + ' đã trả lời tin nhắn'}`}
                color={colors.primaryLight}
                styles={{ fontStyle: 'italic' }}
              />
              <TextComponent
                text={
                  msg.replyStatus ? 'Tin nhắn không tồn tại' : msg.replyTo.text
                }
                color={colors.gray3}
                numberOfLine={1}
                styles={{ fontStyle: 'italic' }}
              />
            </View>
          )}
          {isForwarded && (
            <View
              style={{
                borderRadius: 10,
                padding: 6,
                marginTop: 10,
              }}
            >
              <TextComponent
                text={`👉 ${
                  msg.senderId === user?.id
                    ? 'Bạn'
                    : convertInfoUserFromID(msg.senderId, users)?.displayName
                } đã chuyển tiếp tin nhắn`}
                color={colors.primaryLight}
                styles={{ fontStyle: 'italic' }}
              />
            </View>
          )}
          <RowComponent
            styles={{
              flexDirection: 'column',
              backgroundColor:
                msg.type === 'text' ||
                (msg.type !== 'text' && (msg.deleted || msg.hiddenMsg))
                  ? user?.id !== msg.senderId
                    ? colors.gray + '80'
                    : colors.primaryBold
                  : colors.background,
              padding:
                msg.type === 'text' ||
                (msg.type !== 'text' && (msg.deleted || msg.hiddenMsg))
                  ? 10
                  : 0,
              borderRadius: 10,
              alignItems: 'flex-start',
            }}
          >
            {msg.deleted || msg.hiddenMsg ? (
              <TextComponent
                text={`${
                  msg.senderId === user?.id
                    ? `Bạn đã ${msg.deleted ? 'thu hồi' : 'xóa'} tin nhắn`
                    : `Tin nhắn đã bị ${msg.deleted ? 'thu hồi' : 'xóa'}`
                }`}
                color={
                  msg.senderId === user?.id
                    ? colors.background + '66'
                    : colors.text + '66'
                }
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
            {handleReaction({ reactions: reactionCounts, reactionCounts })
              .reactionList.length > 0 && (
              <RowComponent
                styles={{
                  position: 'absolute',
                  bottom: -10,
                  right: 0,
                }}
              >
                {handleReaction({
                  reactions: reactionCounts,
                  reactionCounts,
                }).reactionList.map(
                  (_, index) =>
                    index <= 2 && <TextComponent text={_} key={index} />,
                )}
                {handleReaction({ reactions: reactionCounts, reactionCounts })
                  .totalReaction > 3 && (
                  <TextComponent
                    text={`+${
                      handleReaction({
                        reactions: reactionCounts,
                        reactionCounts,
                      }).totalReaction - 3
                    }`}
                  />
                )}
              </RowComponent>
            )}
          </RowComponent>
          {handleReaction({ reactions: reactionCounts, reactionCounts })
            .totalReaction > 0 && <SpaceComponent height={6} />}
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
      {readers.length > 0 && (
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
