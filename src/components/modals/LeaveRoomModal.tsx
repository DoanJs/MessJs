import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../constants/colors';

interface LeaveRoomModalProps {
  visible: boolean;
  roomName?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const LeaveRoomModal = ({
  visible,
  roomName,
  onClose,
  onConfirm,
}: LeaveRoomModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLeave = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);
      await onConfirm(); // 🔥 async thật
      onClose(); // chỉ đóng khi thành công
    } catch (e) {
      setError('Thoát phòng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Thoát phòng chat</Text>

          <Text style={styles.message}>
            Bạn có chắc chắn muốn thoát
            {roomName ? ` khỏi "${roomName}"` : ' khỏi phòng này'} không?
          </Text>

          {error && <Text style={styles.error}>{error}</Text>}

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
                styles.leave,
                loading && styles.disabled,
              ]}
              onPress={handleLeave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.leaveText}>Thoát</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LeaveRoomModal;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  message: {
    fontSize: 15,
    color: '#444',
    marginBottom: 12,
  },
  error: {
    color: colors.red,
    marginBottom: 8,
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
  leave: {
    backgroundColor: colors.red,
  },
  disabled: {
    opacity: 0.7,
  },
  cancelText: {
    color: '#333',
    fontWeight: '500',
  },
  leaveText: {
    color: '#fff',
    fontWeight: '600',
  },
});
