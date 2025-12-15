import {
  collection,
  onSnapshot,
  query,
  where,
} from '@react-native-firebase/firestore';
import { SearchNormal1, UserAdd } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../../firebase.config';
import {
  Container,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import { colors } from '../../constants/colors';
import { fontFamillies } from '../../constants/fontFamilies';
import { sizes } from '../../constants/sizes';
import {
  useBlockStore,
  useFriendRequestStore,
  useFriendShipStore,
} from '../../zustand';
import ContactGroup from './ContactGroup';
import ContactPrivate from './ContactPrivate';
import { UserModel } from '../../models';

const ContactScreen = ({navigation}: any) => {
  const [type, setType] = useState('Bạn bè');
  const userCurrent = auth.currentUser;
  const setFriendRequests = useFriendRequestStore(s => s.setFriendRequests);
  const setFriendShips = useFriendShipStore(s => s.setFriendShips);
  const setFriendList = useFriendShipStore(s => s.setFriendList);
  const setBlockedByMe = useBlockStore(s => s.setBlockedByMe);

  useEffect(() => {
    if (!userCurrent?.uid) return;

    // Lắng nghe realtime
    const unsubFrienRequest = onSnapshot(
      query(
        collection(db, 'friendRequests'),
        where('memberIds', 'array-contains', userCurrent.uid),
      ),
      snapshot => {
        const map: Record<string, 'pending_in' | 'pending_out'> = {};

        snapshot.docs.forEach((doc: any) => {
          const data = doc.data();
          if (data.status !== 'pending') return;

          const otherId = data.from === userCurrent.uid ? data.to : data.from;

          map[otherId] =
            data.from === userCurrent.uid ? 'pending_out' : 'pending_in';
        });

        setFriendRequests(map);
      },
    );

    const unsubFriendShips = onSnapshot(
      collection(db, `friendShips/${userCurrent.uid}/friends`),
      snapshot => {
        const map: Record<string, true> = {};
        const users: UserModel[] = [];

        snapshot.docs.forEach((doc: any) => {
          map[doc.id] = true;

          users.push({
            ...(doc.data() as UserModel),
          });
        });

        setFriendShips(map);
        setFriendList(users);
      },
    );

    // 1️⃣ Mình chặn người khác
    const unsubBlockedByMe = onSnapshot(
      collection(db, `blocks/${userCurrent.uid}/blocked`),
      snapshot => {
        const map: Record<string, true> = {};
        snapshot.docs.forEach((doc: any) => {
          map[doc.id] = true;
        });
        setBlockedByMe(map);
      },
    );

    // Cleanup listener khi component unmount
    return () => {
      unsubFrienRequest();
      unsubFriendShips();
      unsubBlockedByMe();
    };
  }, [userCurrent?.uid]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['bottom']}
    >
      <Container
        bg={colors.primaryLight}
        title={
          <RowComponent styles={{ flex: 1 }} onPress={() => navigation.navigate('SearchScreen')}>
            <SearchNormal1 size={sizes.bigTitle} color={colors.background} />
            <SpaceComponent width={16} />
            <TextComponent text="Tìm kiếm" color={colors.background} />
          </RowComponent>
        }
        right={
          <RowComponent>
            <UserAdd
              size={sizes.bigTitle}
              color={colors.background}
              onPress={() => {
                navigation.navigate('AddFriendScreen');
              }}
              variant="Bold"
            />
          </RowComponent>
        }
      >
        <SectionComponent
          styles={{
            backgroundColor: colors.background,
            flex: 1,
            paddingTop: 10,
          }}
        >
          <RowComponent
            justify="space-around"
            styles={{
              borderBottomWidth: 1,
              borderBottomColor: colors.gray,
              paddingBottom: 6,
            }}
          >
            {['Bạn bè', 'Nhóm'].map((_, index) => (
              <TouchableOpacity key={index} onPress={() => setType(_)}>
                <TextComponent
                  text={_}
                  font={
                    type === _
                      ? fontFamillies.poppinsBold
                      : fontFamillies.poppinsRegular
                  }
                />
              </TouchableOpacity>
            ))}
          </RowComponent>

          <SpaceComponent height={10} />

          {type === 'Bạn bè' ? <ContactPrivate /> : <ContactGroup />}
        </SectionComponent>
      </Container>
    </SafeAreaView>
  );
};

export default ContactScreen;
