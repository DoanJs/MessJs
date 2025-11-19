import moment from 'moment';
import React, { ReactNode, useEffect, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import {
  AvatarComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '.';
import { colors } from '../constants/colors';
import { convertInfoUserFromID } from '../constants/convertData';
import { formatMessageBlockTime, toMs } from '../constants/handleTimeData';
import { sizes } from '../constants/sizes';
import { MessageModel, ReadStatusModel, UserModel } from '../models';
import { useUsersStore, useUserStore } from '../zustand';

interface Props {
  showBlockTime: boolean;
  shouldShowSmallTime: boolean;
  isEndOfTimeBlock: boolean;
  msg: MessageModel;
  messages: MessageModel[];
  type: string;
  readStatus: Record<string, ReadStatusModel>;
  members: UserModel[];
  onImagePress: (uri: string) => void;
}

const MessageContentComponent = (props: Props) => {
  const { user } = useUserStore();
  const { users } = useUsersStore();
  const [uri, setUri] = useState(
    'https://img6.thuthuatphanmem.vn/uploads/2022/11/18/hinh-anh-dang-load-troll_093252029.jpg',
  );
  const {
    showBlockTime,
    shouldShowSmallTime,
    isEndOfTimeBlock,
    msg,
    messages,
    type,
    readStatus,
    members,
    onImagePress,
  } = props;

  useEffect(() => {
    if (msg.type === 'image') {
      getSignedUrl(msg.mediaURL);
    }
  }, [msg.type]);

  const readers = Object.keys(readStatus).filter(userId => {
    if (userId === user?.id) return false; // bỏ người gửi

    const lastId = readStatus[userId]?.lastReadMessageId;
    const lastIndex = messages.findIndex(m => m.id === lastId);
    const currentIndex = messages.findIndex(m => m.id === msg.id);
    return lastIndex === currentIndex; // user đã đọc tới tin này hoặc sau
  });
  // Tìm tin cuối cùng (cuối danh sách) mà người gửi là chính bạn
  const lastSentByUser = [...messages]
    .reverse()
    .find(m => m.senderId === user?.id && m.status === 'sent');

  // Tìm tin hiển thị avatar đối với 2 tin liên tiếp
  const showAvatar = () => {
    const index = messages.findIndex(_ => _.id === msg.id);
    const nextMessage = messages[index + 1];
    const isShow = !nextMessage || nextMessage.senderId !== msg.senderId;

    return isShow;
  };
  const showDisplayName = () => {
    const index = messages.findIndex(_ => _.id === msg.id);
    const nextMessage = messages[index - 1];
    const isShow = !nextMessage || nextMessage.senderId !== msg.senderId;

    return isShow;
  };
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
            onPress={() => onImagePress(msg.mediaURL)}
          >
            <Image
              source={{
                uri: msg.status === 'pending' ? msg.localURL : uri,
              }}
              style={{
                width: 200,
                height: 150,
                flex: 1,
                objectFit: 'cover',
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
  const getSignedUrl = async (key: string) => {
    const res = await fetch(
      `https://asia-southeast1-messjs.cloudfunctions.net/getSignedUrlR2?key=${key}`,
    );
    const json = await res.json();

    setUri(json.url);
  };
  return (
    <>
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
            showAvatar() || isEndOfTimeBlock ? 'flex-end' : 'flex-start',
        }}
      >
        {user?.id !== msg.senderId && (
          <>
            {showAvatar() || isEndOfTimeBlock ? (
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
        <View
          style={{
            maxWidth: '70%',
          }}
        >
          {type === 'group' &&
            user?.id !== msg.senderId &&
            showDisplayName() && (
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
                user?.id !== msg.senderId
                  ? colors.gray + '80'
                  : colors.primaryBold,
              padding: 10,
              borderRadius: 10,
              alignItems: 'flex-start',
            }}
          >
            {showContent()}
            {(showAvatar() || shouldShowSmallTime) && (
              <TextComponent
                text={moment(toMs(msg.createAt ?? msg.createAt)).format(
                  'HH:mm',
                )}
                textAlign="center"
                size={sizes.smallText}
                color={
                  msg.senderId === user?.id ? colors.background : colors.red
                }
              />
            )}
          </RowComponent>
          {readers.length == 0 && (
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
        </View>
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
    </>
  );
};

export default MessageContentComponent;
