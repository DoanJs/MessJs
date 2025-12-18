import { doc, getDoc } from '@react-native-firebase/firestore'
import { ArrowRight2, Camera, Colorfilter, Edit2, Image as ImageIcon, LogoutCurve, Notification, Profile2User, SearchNormal1, UserAdd } from 'iconsax-react-native'
import React, { useEffect, useState } from 'react'
import { Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { auth, db } from '../../../firebase.config'
import { Container, RowComponent, SectionComponent, SpaceComponent, SpinnerComponent, TextComponent } from '../../components'
import { RenameGroupModal } from '../../components/modals'
import { colors } from '../../constants/colors'
import { fontFamillies } from '../../constants/fontFamilies'
import { sizes } from '../../constants/sizes'
import { UserModel } from '../../models'

const RoomSettingScreen = ({ route }: any) => {
  const { type, friend, chatRoom } = route.params;
  const userCurrent = auth.currentUser
  const [members, setMembers] = useState<Record<string, UserModel>>({});
  const [loadingRenameModal, setLoadingRenameModal] = useState(false);

  useEffect(() => {
    if (!chatRoom.id) return
    handleMemberIds()

  }, [chatRoom.id])

  const handleMemberIds = async () => {
    const needFetchIds = chatRoom.memberIds.filter((id: string) => id !== userCurrent?.uid);
    const snaps = await Promise.all(
      needFetchIds.map((uid: string) => getDoc(doc(db, 'users', uid)))
    );

    const data: Record<string, UserModel> = {};
    snaps.filter(s => s.exists()).forEach((doc: any) => (data[doc.id] = doc.data()));

    setMembers(data)
  }

  console.log(members)

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['bottom']}
    >
      <Container back bg={colors.primaryLight}
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
                    'https://cdn.pixabay.com/photo/2019/10/30/16/19/fox-4589927_1280.jpg',
                }}
                style={{
                  resizeMode: 'cover',
                  borderRadius: 100,
                  height: 120,
                  width: 120,
                }}
              />
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
            </View>
            <RowComponent>
              <TextComponent
                text={friend?.displayName ?? chatRoom?.name ?? ''}
                font={fontFamillies.poppinsSemiBold}
                size={sizes.bigText}
              />
              {
                chatRoom.type === 'group' &&
                <>
                  <SpaceComponent width={16} />
                  <Edit2
                    onPress={() => setLoadingRenameModal(true)}
                    size={16} color={colors.background} variant="Bold" />
                </>
              }
            </RowComponent>
          </View>
          <SpaceComponent height={16} />

          <RowComponent justify='flex-start' styles={{
            alignItems: 'flex-start'
          }}>
            {[
              {
                icon: <SearchNormal1 size={sizes.smallTitle} color={colors.textBold} />,
                title: 'Tìm tin nhắn'
              },
              {
                icon: <UserAdd size={sizes.smallTitle} color={colors.textBold} />,
                title: 'Thêm thành viên'
              },
              {
                icon: <Colorfilter size={sizes.smallTitle} color={colors.textBold} />,
                title: 'Đổi hình nền'
              },
              {
                icon: <Notification size={sizes.smallTitle} color={colors.textBold} />,
                title: 'Bật thông báo'
              }
            ].map((_, index) => {
              if (chatRoom.type === 'private' && (_.title === 'Thêm thành viên' || _.title === 'Đổi hình nền')) return
              return <RowComponent
                onPress={() => { }}
                key={index}
                styles={{
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  flexDirection: 'column',
                  width: '20%',
                  marginHorizontal: 8
                }}>
                <View style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: colors.background,
                  padding: 10,
                  height: 40,
                  width: 40,
                  borderRadius: 100
                }}>
                  {_.icon}
                </View>
                <SpaceComponent height={10} />
                <TextComponent text={_.title} color={colors.background} textAlign='center' />
              </RowComponent>
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

          <RowComponent justify="space-between" onPress={() => { }}>
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
          {
            chatRoom.type === 'group' &&
            <>
              <SpaceComponent height={16} />

              <RowComponent justify="space-between" onPress={() => { }}>
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
          }

          <SpaceComponent height={16} />

          {
            chatRoom.type === 'group' &&
            <RowComponent onPress={() => { }}>
              <LogoutCurve size={sizes.title} color={colors.textBold} />
              <SpaceComponent width={16} />
              <TextComponent
                text="Rời nhóm"
                font={fontFamillies.poppinsBold}
                color={colors.textBold}
              />
            </RowComponent>
          }
        </SectionComponent>

        <SpinnerComponent loading={false} />
      </Container>

      <RenameGroupModal
        visible={loadingRenameModal}
        infoModal={{
          visibleModal: loadingRenameModal,
          name: chatRoom.name,
          chatRoomId: chatRoom.id
        }}
        onClose={() => setLoadingRenameModal(false)}
      />

    </SafeAreaView>

  )
}

export default RoomSettingScreen