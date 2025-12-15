import { collection, getDocs, query, where } from '@react-native-firebase/firestore';
import { SearchNormal1, UserOctagon } from 'iconsax-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import 'react-native-get-random-values';
import {
  SafeAreaView,
  useSafeAreaInsets
} from 'react-native-safe-area-context';
import { db } from '../../../firebase.config';
import {
  Container,
  FriendItemComponent,
  InputComponent,
  ProfileItemComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent
} from '../../components';
import { ActionModal } from '../../components/modals';
import { colors } from '../../constants/colors';
import { fontFamillies } from '../../constants/fontFamilies';
import { sizes } from '../../constants/sizes';
import { validateEmail } from '../../constants/validateEmailPhone';
import { UserModel } from '../../models';
import { useUserStore } from '../../zustand';

const AddFriendScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<UserModel[]>([]);
  const [errorText, setErrorText] = useState('');
  const [infoModal, setInfoModal] = useState({
    visibleModal: false,
    status: '',
    fromUser: false,
    friend: null,
  });

  const handleAddFriend = async () => {
    if (!user) {
      setErrorText('Lỗi chưa đăng nhập')
      return
    }

    if (!validateEmail(email)) {
      setErrorText('Lỗi email không hợp lệ')
      return
    }

    let data: UserModel[] = []

    setLoading(true)
    try {
      const q = query(
        collection(db, 'users'),
        where('email', '==', email)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setErrorText('Không tìm thấy thông tin bạn bè!')
        data = []
      }

      snapshot.docs.map((doc: any) => data.push({
        id: doc.id,
        ...doc.data()
      }))
      setLoading(false)
      data.length === 0 ?
        setErrorText('Không tìm thấy thông tin bạn bè!') :
        setErrorText('')

    } catch (error) {
      setLoading(false)
      setErrorText(errorText)
      console.log(error)
    }

    setFriends(data)
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
            text="Thêm bạn"
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
              placeholder="Nhập email bạn bè"
              placeholderTextColor={colors.gray2}
              prefix={<UserOctagon color={colors.text} size={26} variant="Bold" />}
              affix={
                email ? (
                  <SearchNormal1
                    size={sizes.title}
                    color={colors.textBold}
                    onPress={handleAddFriend}
                  />
                ) : undefined
              }
              color={colors.background}
              value={email}
              textStyles={{
                color: colors.text,
              }}
              onChangeText={setEmail}
              autoFocus
            />

          </View>
          <SpaceComponent height={16} />
          {
            loading ? <ActivityIndicator /> :
              errorText !== '' ?
                <TextComponent text={errorText} textAlign='center' styles={{ fontStyle: 'italic' }} color={colors.red} />
                :
                <FlatList
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingBottom: insets.bottom + 80,
                  }}
                  data={friends}
                  renderItem={({ item: friend }) =>
                    user?.id === friend.id ?
                      <ProfileItemComponent />
                      :
                      <FriendItemComponent friend={friend} setInfoModal={setInfoModal} />
                  }
                />
          }
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

export default AddFriendScreen;
