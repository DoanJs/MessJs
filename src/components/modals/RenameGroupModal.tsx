import { doc, serverTimestamp, updateDoc } from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { InputComponent, RowComponent, SpaceComponent } from '..';
import { db } from '../../../firebase.config';
import { colors } from '../../constants/colors';

interface Props {
  visible: boolean;
  infoModal: {
    visibleModal: boolean;
    name: string;
    chatRoomId: string
  };
  // setInfoModal: any;
  onClose: () => void;
}

export default function RenameGroupModal(props: Props) {
  const { visible, onClose, infoModal: { name, chatRoomId } } = props;
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!name) return
    setValue(name)
  }, [name])

  useEffect(() => {
    if (value === name) {
      setDisabled(true)
    } else {
      setDisabled(false)
    }
  }, [value])

  const handleRenameGroup = async () => {
    setLoading(true)
    try {
      await updateDoc(doc(db, 'chatRooms', chatRoomId), {
        name: value,
        updatedAt: serverTimestamp(),
      })
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }

    onClose()
  }
  
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
        <InputComponent
          styles={{
            backgroundColor: colors.background,
            paddingVertical: 12,
            paddingHorizontal: 26,
            borderRadius: 5,
          }}
          allowClear
          placeholder="Nhập tên phòng chat"
          placeholderTextColor={colors.gray}
          color={colors.background}
          value={value}
          onChangeText={setValue}
        />

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancel]}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.cancelText}>Huỷ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.save,
              disabled && styles.disabled,
            ]}
            onPress={handleRenameGroup}
            disabled={disabled}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Lưu</Text>
            )}
          </TouchableOpacity>
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  cancel: {
    backgroundColor: '#eee',
  },
  save: {
    backgroundColor: colors.textBold,
  },
  disabled: {
    opacity: 0.7,
    backgroundColor:'#333',
  },
  cancelText: {
    color: '#333',
    fontWeight: '500',
  },

  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
});
