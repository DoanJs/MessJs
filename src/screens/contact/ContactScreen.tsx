import { SearchNormal1, UserAdd } from 'iconsax-react-native';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
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
import ContactGroup from './ContactGroup';
import ContactPrivate from './ContactPrivate';

const ContactScreen = ({ navigation }: any) => {
  const [type, setType] = useState('Bạn bè');

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
