import { Profile2User } from 'iconsax-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Container,
  FriendItemComponent,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  SpinnerComponent,
  TextComponent,
} from '../../components';
import { colors } from '../../constants/colors';
import { fontFamillies } from '../../constants/fontFamilies';
import { sizes } from '../../constants/sizes';
import { useRoomMembers } from '../../hooks/useRoomMembers';
import { ActionModal } from '../../components/modals';

const MemberRoomScreen = ({ route }: any) => {
  const { chatRoomId } = route.params;
  const members = useRoomMembers(chatRoomId);
  const [infoModal, setInfoModal] = useState({
    visibleModal: false,
    status: '',
    fromUser: false,
    friend: null,
  });

  // const [loadingRenameModal, setLoadingRenameModal] = useState(false);
  // const [loadingAddMember, setLoadingAddMember] = useState(false);
  // const [loadingLeaveGroup, setLoadingLeaveGroup] = useState(false);

  // const handleLeaveGroup = async () => {
  //   setLoadingLeaveGroup(true);
  //   try {
  //     await leaveGroup(chatRoomId);
  //     setLoadingLeaveGroup(false);

  //     navigation.navigate('Main');
  //   } catch (error) {
  //     setLoadingLeaveGroup(false);
  //     console.log(error);
  //   }
  // };

  if (!chatRoomId) return <ActivityIndicator />;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['bottom']}
    >
      <Container
        back
        bg={colors.primaryLight}
        headerStyle={{ alignItems: 'flex-start' }}
        title={
          <RowComponent styles={{ flex: 1 }} justify="center">
            <Profile2User
              size={sizes.title}
              variant="Bold"
              color={colors.textBold}
            />
            <SpaceComponent width={16} />
            <TextComponent
              text="Thành viên nhóm"
              color={colors.background}
              font={fontFamillies.poppinsBold}
            />
            <SpaceComponent width={16} />
            <Profile2User
              size={sizes.title}
              variant="Bold"
              color={colors.textBold}
            />
          </RowComponent>
        }
      >
        <SectionComponent
          styles={{
            backgroundColor: colors.background,
            flex: 1,
          }}
        >
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: colors.gray2,
              paddingVertical: 10,
            }}
          >
            <TextComponent
              text={`Thành viên (${members.length})`}
              color={colors.textBold}
              styles={{ fontStyle: 'italic' }}
            />
          </View>

          <FlatList
            showsVerticalScrollIndicator={false}
            data={members}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <FriendItemComponent
                setInfoModal={setInfoModal}
                friend={{
                  ...item,
                  displayName: item.nickName,
                }}
                myRole={item.role}
              />
            )}
          />
        </SectionComponent>

        <SpinnerComponent loading={false} />
      </Container>
      
      <ActionModal
        visible={infoModal.visibleModal}
        setInfoModal={setInfoModal}
        infoModal={infoModal}
        onClose={() => setInfoModal({ ...infoModal, visibleModal: false })}
        isAdminGroup={true}
      />
    </SafeAreaView>
  );
};

export default MemberRoomScreen;