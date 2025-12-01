import React from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { UserForwardComponent } from '..';
import { auth } from '../../../firebase.config';
import { UserModel } from '../../models';

interface Props {
  visible: boolean
  onClose: () => void
  users: UserModel[],
  onSelectUser: (val: any) => void
}

const ForwardUserModal = (props: Props) => {
  const {
    visible,
    onClose,
    users,
    onSelectUser
  } = props
  const userCurrent = auth.currentUser


  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          padding: 20
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 15,
            maxHeight: '70%'
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
            Chọn người để chuyển tiếp
          </Text>

          <FlatList
            data={users.filter((_) => _.id !== userCurrent?.uid)}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <UserForwardComponent item={item} onSelectUser={onSelectUser} />}
          />

          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 15,
              backgroundColor: '#ddd',
              padding: 12,
              borderRadius: 8
            }}
          >
            <Text style={{ textAlign: 'center', fontSize: 16 }}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ForwardUserModal;
