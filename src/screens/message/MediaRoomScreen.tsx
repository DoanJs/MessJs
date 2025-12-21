import { Image as ImageIcon } from 'iconsax-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const MediaRoomScreen = ({ route }: any) => {
  const { chatRoomId } = route.params;
  const [type, setType] = useState('Ảnh');

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
            <ImageIcon
              size={sizes.title}
              variant="Bold"
              color={colors.textBold}
            />
            <SpaceComponent width={16} />
            <TextComponent
              text="Ảnh, file, link nhóm"
              color={colors.background}
              font={fontFamillies.poppinsBold}
            />
            <SpaceComponent width={16} />
            <ImageIcon
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
          <RowComponent
            justify="space-around"
            styles={{
              borderBottomWidth: 1,
              borderBottomColor: colors.gray2,
              paddingVertical: 10,
            }}
          >
            {['Ảnh', 'File', 'Link'].map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setType(_)}
                style={{
                  backgroundColor:
                    type === _ ? colors.primaryDark : colors.background,
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <TextComponent
                  text={`${_} (${`members.length`})`}
                  color={type === _ ? colors.background : colors.textBold}
                  styles={{ fontStyle: 'italic' }}
                />
              </TouchableOpacity>
            ))}
          </RowComponent>

          <SpaceComponent height={10} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <RowComponent
              styles={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
              justify="flex-start"
            >
              {Array.from({ length: 20 }).map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: '30%',
                    marginHorizontal: '1.5%',
                    marginVertical: '1.5%',
                  }}
                >
                  <Image
                    source={{
                      uri: 'https://cdn.pixabay.com/photo/2019/10/30/16/19/fox-4589927_1280.jpg',
                    }}
                    style={{
                      resizeMode: 'cover',
                      borderRadius: 10,
                      height: 120,
                      width: 120,
                    }}
                  />
                </TouchableOpacity>
              ))}
            </RowComponent>
          </ScrollView>
        </SectionComponent>

        {/* <SpinnerComponent loading={false} /> */}
      </Container>

      {/* <ActionModal
        visible={infoModal.visibleModal}
        setInfoModal={setInfoModal}
        infoModal={infoModal}
        onClose={() => setInfoModal({ ...infoModal, visibleModal: false })}
      /> */}
    </SafeAreaView>
  );
};

export default MediaRoomScreen;
