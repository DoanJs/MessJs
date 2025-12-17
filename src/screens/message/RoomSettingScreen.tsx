import React from 'react'
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native'
import { colors } from '../../constants/colors'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Container, RowComponent, SectionComponent, TextComponent } from '../../components'
import { sizes } from '../../constants/sizes'
import { fontFamillies } from '../../constants/fontFamilies'

const RoomSettingScreen = ({ route }: any) => {

  const { type, friend, chatRoom } = route.params;
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.primaryLight }}
      edges={['bottom']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <Container
          bg={colors.primaryLight}
          back
          title={
            <RowComponent
              styles={{
                flex: 1,
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
              onPress={() => { }}
            >
              <TextComponent
                text={type === 'private' ? friend?.displayName : chatRoom.name}
                color={colors.background}
                size={sizes.bigText}
                font={fontFamillies.poppinsBold}
                numberOfLine={1}
              />
              {type === 'group' && (
                <TextComponent
                  text={`${chatRoom.memberCount} thành viên`}
                  color={colors.background}
                  size={sizes.smallText}
                />
              )}
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
          </SectionComponent>
        </Container>
      </KeyboardAvoidingView>
    </SafeAreaView>

  )
}

export default RoomSettingScreen