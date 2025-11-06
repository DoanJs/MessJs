import {
  doc,
  serverTimestamp,
  setDoc,
  where,
} from '@react-native-firebase/firestore';
import { Bezier, TickCircle } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  CheckboxUserComponent,
  Container,
  InputComponent,
  SearchComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import { colors } from '../../constants/colors';
import { getDocsData } from '../../constants/firebase/getDocsData';
import { fontFamillies } from '../../constants/fontFamilies';
import { sizes } from '../../constants/sizes';
import { UserModel } from '../../models';
import { useUserStore } from '../../zustand';
import { db } from '../../../firebase.config';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { createNewBatch } from '../../constants/checkNewBatch';
import { convertBatchId } from '../../constants/convertData';

const AddGroupScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const [refreshing, setRefreshing] = useState(false); // loading khi kéo xuống
  const [nameGroup, setNameGroup] = useState('');
  const [friends, setFriends] = useState<UserModel[]>([]);
  const [memberGroup, setMemberGroup] = useState([user]);

  useEffect(() => {
    if (user) {
      getDocsData({
        nameCollect: 'users',
        condition: [where('email', '!=', user?.email)],
        setData: setFriends,
      });
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    try {
      // getDocsData({
      //   nameCollect: 'fields',
      //   setData: setFields,
      // });
    } finally {
      setRefreshing(false);
    }
  };

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
      const promiseMember = memberGroup.map((_: any) =>
        setDoc(
          doc(db, `chatRooms/${id}/members`, _.id),
          {
            id: _.id,
            role: _.id === user.id ? 'admin' : 'member',
            joinedAt: serverTimestamp(),
            nickName: _.displayName,
          },
          {
            merge: true,
          },
        ),
      );
      await Promise.all(promiseMember);

      // Tạo batch đầu tiên cho group
      await setDoc(
        doc(db, `chatRooms/${id}/batches`, batchInfo.id),
        {
          id: batchInfo.id,
          messageCount: 0,
          preBatchId: null,
          nextBatchId: convertBatchId(batchInfo, 'increase'),
        },
        { merge: true },
      );

      // redirect tới chatRoom nếu đã tạo thành công
      navigation.navigate('MessageDetailScreen', {
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
          // readStatus: ,
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
              arrSource={[]}
              onChange={() => {}}
              placeholder="Tìm tên hoặc email"
            />
            <SpaceComponent height={16} />
          </View>

          <FlatList
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 80,
            }}
            data={friends}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
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
