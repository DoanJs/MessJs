import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FriendItemComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '..';
import { fontFamillies } from '../../constants/fontFamilies';
import { UserModel } from '../../models';
import { useFriendShipStore } from '../../zustand';

interface Props {
  visible: boolean;
  onClose: () => void;
  members: UserModel[];
  roomId: string;
  onChange: (val: string) => void;
}

export default function AddMemberModal(props: Props) {
  const insets = useSafeAreaInsets();
  const { visible, onClose, onChange, members, roomId } = props;
  const friendList = useFriendShipStore(f => f.friendList);
  const memberIds = members.map(_ => _.id);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={styles.modal}
    >
      <View style={styles.modalBox}>
        <RowComponent justify="space-between">
          <TextComponent
            text="Thêm thành viên vào nhóm"
            font={fontFamillies.poppinsBold}
          />
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>Đóng</Text>
          </TouchableOpacity>
        </RowComponent>
        <SpaceComponent height={16} />

        <View>
          <TextComponent text={`Liên hệ (${friendList.length})`} />
          <FlatList
            contentContainerStyle={{
              paddingBottom: insets.bottom,
            }}
            showsVerticalScrollIndicator={false}
            data={friendList}
            renderItem={({ item }) => (
              <FriendItemComponent
                friend={item}
                setInfoModal={undefined}
                isMember={memberIds.includes(item.id)}
                roomId={roomId}
              />
            )}
          />
        </View>
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
