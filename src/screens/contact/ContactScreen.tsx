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
import { useFriendShipStore } from '../../zustand';
import useFriendRequestStore from '../../zustand/useFriendRequestStore';
import ContactGroup from './ContactGroup';
import ContactPrivate from './ContactPrivate';

const ContactScreen = () => {
  const [type, setType] = useState('Bạn bè');
  const userCurrent = auth.currentUser;
  const { setFriendRequests } = useFriendRequestStore();
  const { setFriendShips } = useFriendShipStore();

  useEffect(() => {
    if (!userCurrent) return;

    // Lắng nghe realtime
    const unsubFrienRequest = onSnapshot(
      query(
        collection(db, 'friendRequests'),
        where('memberIds', 'array-contains', userCurrent.uid),
      ),
      snapshot => {
        const data = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFriendRequests(data);
      },
      error => {
        console.error('Error listening users:', error);
      },
    );

    // const unsubFriendShips = onSnapshot(
    //   collection(db, `friendShips/${userCurrent.uid}/friends`),
    //   snapshot => {
    //     const data = snapshot.docChanges().map((change: any) => ({
    //       id: change.doc.id,
    //       ...change.doc.data(),
    //     }));

    //     setFriendShips(data);
    //     console.log(data)
    //   },
    //   error => {
    //     console.error('Error listening friendShips:', error);
    //   },
    // );
    const unsubFriendShips = onSnapshot(
      collection(db, `friendShips/${userCurrent.uid}/friends`),
      snapshot => {
        const friends = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFriendShips(friends);
        console.log('friends:', friends);
      },
      error => {
        console.error('Error listening friendShips:', error);
      },
    );

    // Cleanup listener khi component unmount
    return () => {
      unsubFrienRequest();
      unsubFriendShips();
    };
  }, [userCurrent]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['bottom']}
    >
      <Container
        bg={colors.primaryLight}
        title={
          <RowComponent styles={{ flex: 1 }} onPress={() => {}}>
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
              onPress={() => {}}
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
