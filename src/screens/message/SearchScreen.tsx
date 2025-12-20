import { doc, getDoc } from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import 'react-native-get-random-values';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { db } from '../../../firebase.config';
import {
  Container,
  FriendItemComponent,
  MessageItemComponent,
  SearchComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import { ActionModal } from '../../components/modals';
import { colors } from '../../constants/colors';
import { fontFamillies } from '../../constants/fontFamilies';
import { makeContactId } from '../../constants/makeContactId';
import {
  useBadgeStore,
  useChatRoomStore,
  useFriendShipStore,
  useUserStore,
} from '../../zustand';

const SearchScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const [infoModal, setInfoModal] = useState({
    visibleModal: false,
    status: '',
    fromUser: false,
    friend: null,
  });
  const { badges } = useBadgeStore();
  const { chatRooms } = useChatRoomStore();
  const friendList = useFriendShipStore(s => s.friendList);
  const [dataNews, setDataNews] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);

  useEffect(() => {
    if (!chatRooms || !friendList) return;
    handleArray();
  }, [chatRooms, friendList]);

  const handleArray = async () => {
    const chatRoomGroup = chatRooms.filter(_ => _.type === 'group') ?? [];
    const contactIds = friendList.map(_ =>
      makeContactId(user?.id as string, _.id),
    );
    const chatRoomPrivate = chatRooms.filter(
      _ => _.type === 'private' && !contactIds.includes(_.id),
    );

    const friendIds = Array.from(
      new Set(
        chatRoomPrivate
          .map(room => handleMemberIds(room.memberIds))
          .filter((id): id is string => !!id && id !== user?.id),
      ),
    );
    const existingIds = new Set(friendList.map(f => f.id));

    const needFetchIds = friendIds.filter(id => !existingIds.has(id));
    const snaps = await Promise.all(
      needFetchIds.map(uid => getDoc(doc(db, 'users', uid))),
    );

    const users = snaps
      .filter(s => s.exists())
      .map(s => ({
        uid: s.id,
        ...s.data(),
      }));
    const data = [...friendList, ...users, ...chatRoomGroup];

    setDataNews(data);
    setDataSource(data);
  };
  const handleMemberIds = (memberIds: string[]) => {
    return memberIds.find(_ => _ !== user?.id);
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
            text="Tìm kiếm"
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
            <SearchComponent
              placeholder="Tìm kiếm bạn bè/nhóm"
              onChange={val => setDataNews(val)}
              arrSource={dataSource}
              type="searchScreen"
            />
          </View>
          <SpaceComponent height={16} />
          <View>
            <TextComponent text={`Liên hệ (${dataNews.length})`} />
            <FlatList
              contentContainerStyle={{
                paddingBottom: insets.bottom,
              }}
              showsVerticalScrollIndicator={false}
              data={dataNews}
              renderItem={({ item }) =>
                item.type ? (
                  <MessageItemComponent
                    chatRoom={item}
                    count={badges[item.id]} //truyền count vào để show ngoài badge
                  />
                ) : (
                  <FriendItemComponent
                    friend={item}
                    setInfoModal={setInfoModal}
                  />
                )
              }
            />
          </View>
        </SectionComponent>
      </Container>

      <ActionModal
        visible={infoModal.visibleModal}
        setInfoModal={setInfoModal}
        infoModal={infoModal}
        onClose={() => setInfoModal({ ...infoModal, visibleModal: false })}
      />
    </SafeAreaView>
  );
};

export default SearchScreen;
