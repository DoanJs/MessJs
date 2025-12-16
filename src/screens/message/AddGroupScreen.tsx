import { doc, serverTimestamp, setDoc } from '@react-native-firebase/firestore';
import { Bezier, TickCircle } from 'iconsax-react-native';
import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import 'react-native-get-random-values';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../firebase.config';
import {
  CheckboxUserComponent,
  Container,
  InputComponent,
  SearchComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import { createNewBatch } from '../../constants/checkNewBatch';
import { colors } from '../../constants/colors';
import { fontFamillies } from '../../constants/fontFamilies';
import { sizes } from '../../constants/sizes';
import { UserModel } from '../../models';
import { useFriendShipStore, useUserStore } from '../../zustand';

const AddGroupScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const [nameGroup, setNameGroup] = useState('');
  const [memberGroup, setMemberGroup] = useState([user]);
  const friendList = useFriendShipStore(e => e.friendList)
  const [friends, setFriends] = useState<UserModel[]>(friendList);

  const handleAddGroup = async () => {
    if (user) {
      const id = uuidv4(); //chatRoomId của group
      const batchInfo = createNewBatch(null);

      await setDoc(
        doc(db, 'chatRooms', id),
        {
          type: 'group',
          name: nameGroup ?? '',
          avatarURL: '',
          description: '',
          createdBy: user.id,
          createAt: serverTimestamp(),
          lastMessageText: '',
          lastMessageAt: serverTimestamp(),
          lastSenderId: '',

          lastBatchId: batchInfo.id,
          memberCount: memberGroup.length,
          memberIds: memberGroup.map((_: any) => _.id),
          // readStatus: ,
        },
        { merge: true },
      );

      // Thêm thành viên khác ngoài author (nếu có)
      const promiseMember = memberGroup.map((_: any) => {
        setDoc(
          doc(db, `chatRooms/${id}/members`, _.id),
          {
            id: _.id,
            role: _.id === user.id ? 'admin' : 'member',
            joinedAt: serverTimestamp(),
            nickName: _.displayName,
            photoURL: _.photoURL,
          },
          {
            merge: true,
          },
        );
        // Thêm readStatus subcollection trong chatRoom
        setDoc(
          doc(db, `chatRooms/${id}/readStatus`, _.id),
          {
            lastReadMessageId: null,
            lastReadAt: null,
          },
          {
            merge: true,
          },
        );
      });
      await Promise.all(promiseMember);

      // Tạo batch đầu tiên cho group
      await setDoc(
        doc(db, `chatRooms/${id}/batches`, batchInfo.id),
        {
          id: batchInfo.id,
          messageCount: 0,
          preBatchId: null,
          nextBatchId: null,
        },
        { merge: true },
      );

      navigation.replace('MessageDetailScreen', {
        type: 'group',
        friend: null,
        chatRoom: {
          id,
          type: 'group',
          name: nameGroup ?? '',
          avatarURL: '',
          description: '',
          createdBy: user.id,
          createAt: serverTimestamp(),
          lastMessageText: '',
          lastMessageAt: serverTimestamp(),
          lastSenderId: '',

          lastBatchId: batchInfo.id,
          memberCount: memberGroup.length,
          memberIds: memberGroup.map((_: any) => _.id),
        },
      });
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['bottom']}
    >
      <Container
        bg={colors.primaryLight}
        back
        title={
          <TextComponent
            text="Nhóm mới"
            color={colors.background}
            font={fontFamillies.poppinsBold}
          />
        }
      >
        <SectionComponent
          styles={{
            backgroundColor: colors.background,
            flex: 1,
            paddingTop: 10,
          }}
        >
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: colors.gray2,
            }}
          >
            <InputComponent
              styles={{
                backgroundColor: colors.background,
                paddingVertical: 12,
                paddingHorizontal: 26,
                borderRadius: 5,
              }}
              placeholder="Đặt tên nhóm"
              placeholderTextColor={colors.gray2}
              prefix={<Bezier color={colors.text} size={26} variant="Bold" />}
              affix={
                nameGroup ? (
                  <TickCircle
                    size={sizes.title}
                    color={colors.textBold}
                    variant="Bold"
                    onPress={handleAddGroup}
                  />
                ) : undefined
              }
              color={colors.background}
              value={nameGroup}
              textStyles={{
                color: colors.text,
              }}
              onChangeText={setNameGroup}
              autoFocus
            />

            <SearchComponent
              arrSource={friendList}
              onChange={val => setFriends(val)}
              placeholder="Tìm tên hoặc email"
              type="user"
            />
            <SpaceComponent height={16} />
          </View>

          <SpaceComponent height={10} />
          <TextComponent text={`Bạn bè (${friendList.length})`} />

          <FlatList
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 80,
            }}
            data={friends}
            renderItem={({ item: friend }) => (
              <CheckboxUserComponent
                friend={friend}
                memberGroup={memberGroup}
                setMemberGroup={setMemberGroup}
              />
            )}
          />
        </SectionComponent>
      </Container>
    </SafeAreaView>
  );
};

export default AddGroupScreen;
