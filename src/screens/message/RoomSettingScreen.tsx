import {
  ArrowRight2,
  Camera,
  Colorfilter,
  Edit2,
  Image as ImageIcon,
  LogoutCurve,
  Notification,
  Profile2User,
  SearchNormal1,
  UserAdd,
} from 'iconsax-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Container,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  SpinnerComponent,
  TextComponent,
} from '../../components';
import {
  AddMemberModal,
  LeaveRoomModal,
  RenameGroupModal,
} from '../../components/modals';
import { colors } from '../../constants/colors';
import { fontFamillies } from '../../constants/fontFamilies';
import { leaveGroup } from '../../constants/functions';
import { sizes } from '../../constants/sizes';
import { useChatRoom } from '../../hooks/useChatRoom';
import { useUsersByIds } from '../../hooks/useUsersByIds';

const RoomSettingScreen = ({ route, navigation }: any) => {
  const { friend, chatRoomId } = route.params;
  const { room, myRole } = useChatRoom(chatRoomId);
  const members = useUsersByIds(room?.memberIds);
  const [loadingRenameModal, setLoadingRenameModal] = useState(false);
  const [loadingAddMember, setLoadingAddMember] = useState(false);
  const [loadingLeaveGroup, setLoadingLeaveGroup] = useState(false);

  const handleLeaveGroup = async () => {
    setLoadingLeaveGroup(true);
    try {
      await leaveGroup(chatRoomId);
      setLoadingLeaveGroup(false);

      navigation.navigate('Main');
    } catch (error) {
      setLoadingLeaveGroup(false);
      console.log(error);
    }
  };

  if (!room) return <ActivityIndicator />;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['bottom']}
    >
      <Container
        back
        bg={colors.primaryLight}
        headerStyle={{ alignItems: 'flex-start' }}
      >
        <SectionComponent
          styles={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1,
            }}
          >
            <View
              style={{
                marginBottom: 10,
                position: 'relative',
              }}
            >
              <Image
                source={{
                  uri:
                    friend?.photoURL ??
                    'https://cdn.pixabay.com/photo/2019/10/30/16/19/fox-4589927_1280.jpg',
                }}
                style={{
                  resizeMode: 'cover',
                  borderRadius: 100,
                  height: 120,
                  width: 120,
                }}
              />
              {room.type === 'group' && (
                <View
                  style={{
                    backgroundColor: colors.red,
                    padding: 4,
                    position: 'absolute',
                    borderRadius: 100,
                    bottom: 0,
                    right: 10,
                  }}
                >
                  <Camera size={16} color={colors.background} variant="Bold" />
                </View>
              )}
            </View>

            <RowComponent>
              <TextComponent
                text={friend?.displayName ?? room.name ?? ''}
                font={fontFamillies.poppinsSemiBold}
                size={sizes.bigText}
                textAlign="center"
                styles={{
                  maxWidth: '80%',
                }}
                numberOfLine={2}
              />
              {room.type === 'group' && (
                <>
                  <SpaceComponent width={16} />
                  <Edit2
                    onPress={() => setLoadingRenameModal(true)}
                    size={16}
                    color={colors.background}
                    variant="Bold"
                  />
                </>
              )}
            </RowComponent>
          </View>
          <SpaceComponent height={16} />

          <RowComponent
            justify="flex-start"
            styles={{
              alignItems: 'flex-start',
            }}
          >
            {[
              {
                icon: (
                  <SearchNormal1
                    size={sizes.smallTitle}
                    color={colors.textBold}
                  />
                ),
                title: 'Tìm tin nhắn',
                onPress: () =>
                  navigation.navigate('SearchMsgScreen', {
                    type: room.type,
                    friend: room.type === 'private' ? friend : null,
                    chatRoom: room,
                    members,
                  }),
              },
              {
                icon: (
                  <UserAdd size={sizes.smallTitle} color={colors.textBold} />
                ),
                title: 'Thêm thành viên',
                onPress: () => setLoadingAddMember(true),
              },
              {
                icon: (
                  <Colorfilter
                    size={sizes.smallTitle}
                    color={colors.textBold}
                  />
                ),
                title: 'Đổi hình nền',
                onPress: () => {},
              },
              {
                icon: (
                  <Notification
                    size={sizes.smallTitle}
                    color={colors.textBold}
                  />
                ),
                title: 'Bật thông báo',
                onPress: () => {},
              },
            ].map((_, index) => {
              if (
                (room.type === 'private' &&
                  (_.title === 'Thêm thành viên' ||
                    _.title === 'Đổi hình nền')) ||
                (room.type === 'group' &&
                  myRole &&
                  (myRole === 'member') &&
                  _.title === 'Thêm thành viên')
              )
                return;

              return (
                <RowComponent
                  onPress={_.onPress}
                  key={index}
                  styles={{
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    flexDirection: 'column',
                    width: '20%',
                    marginHorizontal: 8,
                  }}
                >
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: colors.background,
                      padding: 10,
                      height: 40,
                      width: 40,
                      borderRadius: 100,
                    }}
                  >
                    {_.icon}
                  </View>
                  <SpaceComponent height={10} />
                  <TextComponent
                    text={_.title}
                    color={colors.background}
                    textAlign="center"
                  />
                </RowComponent>
              );
            })}
          </RowComponent>

          <SpaceComponent height={16} />
        </SectionComponent>

        <SectionComponent
          styles={{
            backgroundColor: colors.background,
            flex: 1,
          }}
        >
          <SpaceComponent height={16} />

          <RowComponent justify="space-between" onPress={() => {}}>
            <RowComponent>
              <ImageIcon
                size={sizes.title}
                variant="Bold"
                color={colors.textBold}
              />
              <SpaceComponent width={16} />
              <TextComponent
                text="Ảnh, file, link"
                font={fontFamillies.poppinsBold}
                color={colors.textBold}
              />
            </RowComponent>
            <ArrowRight2 size={sizes.title} color={colors.textBold} />
          </RowComponent>
          {room.type === 'group' && (
            <>
              <SpaceComponent height={16} />

              <RowComponent
                justify="space-between"
                onPress={() =>
                  navigation.navigate('MemberRoomScreen', {
                    chatRoomId,
                  })
                }
              >
                <RowComponent>
                  <Profile2User
                    size={sizes.title}
                    variant="Bold"
                    color={colors.textBold}
                  />
                  <SpaceComponent width={16} />
                  <TextComponent
                    text="Thành viên"
                    font={fontFamillies.poppinsBold}
                    color={colors.textBold}
                  />
                </RowComponent>
                <ArrowRight2 size={sizes.title} color={colors.textBold} />
              </RowComponent>
            </>
          )}

          <SpaceComponent height={16} />

          {room.type === 'group' && (
            <RowComponent onPress={() => setLoadingLeaveGroup(true)}>
              <LogoutCurve size={sizes.title} color={colors.textBold} />
              <SpaceComponent width={16} />
              <TextComponent
                text="Rời nhóm"
                font={fontFamillies.poppinsBold}
                color={colors.textBold}
              />
            </RowComponent>
          )}
        </SectionComponent>

        <SpinnerComponent loading={false} />
      </Container>

      <RenameGroupModal
        visible={loadingRenameModal}
        infoModal={{
          name: room.name,
          chatRoomId,
        }}
        onClose={() => setLoadingRenameModal(false)}
      />
      <AddMemberModal
        visible={loadingAddMember}
        onClose={() => setLoadingAddMember(false)}
        members={members}
        roomId={chatRoomId}
        onChange={() => {}}
      />

      <LeaveRoomModal
        onClose={() => setLoadingLeaveGroup(false)}
        onConfirm={handleLeaveGroup}
        visible={loadingLeaveGroup}
      />
    </SafeAreaView>
  );
};

export default RoomSettingScreen;
