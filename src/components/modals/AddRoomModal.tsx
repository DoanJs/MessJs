import { useNavigation } from '@react-navigation/native';
import { Profile2User, UserAdd } from 'iconsax-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { RowComponent, SpaceComponent, TextComponent } from '..';
import { colors } from '../../constants/colors';
import { sizes } from '../../constants/sizes';

interface Props {
  visible: boolean;
  // title: string
  // setTitle: any
  onClose: () => void;
  onChange: (val: string) => void;
  // handleAddEditPlan: () => void
}

export default function AddRoomModal(props: Props) {
  const navigation: any = useNavigation();
  const { visible, onClose, onChange } = props;

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={styles.modal}
    >
      <View style={styles.modalBox}>
        <RowComponent justify="flex-end">
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>Đóng</Text>
          </TouchableOpacity>
        </RowComponent>
        <SpaceComponent height={16} />

        <RowComponent onPress={() => {
            navigation.navigate('AddFriendScreen');
            onClose();
          }}>
          <UserAdd size={sizes.title} color={colors.textBold} variant="Bold" />
          <SpaceComponent width={16} />
          <TextComponent text="Thêm bạn" />
        </RowComponent>
        <SpaceComponent height={16} />
        <RowComponent
          onPress={() => {
            navigation.navigate('AddGroupScreen');
            onClose();
          }}
        >
          <Profile2User
            size={sizes.title}
            color={colors.textBold}
            variant="Bold"
          />
          <SpaceComponent width={16} />
          <TextComponent text="Tạo nhóm" />
        </RowComponent>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    margin: 0, // bỏ khoảng trống mặc định
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    maxHeight: '85%', // tránh tràn màn hình
  },
  closeBtn: {
    color: '#007AFF',
    fontSize: 16,
  },
});
