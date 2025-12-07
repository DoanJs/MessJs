import { useNavigation } from '@react-navigation/native';
import {
  CloseCircle,
  TickCircle,
  UserAdd,
  UserMinus,
  UserRemove,
} from 'iconsax-react-native';
import React, { Fragment, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { RowComponent, SpaceComponent, TextComponent } from '..';
import { DeniedSvg } from '../../assets/vector';
import { colors } from '../../constants/colors';
import { sizes } from '../../constants/sizes';

interface Props {
  visible: boolean;
  infoModal: {
    visibleModal: boolean;
    status: string;
    fromUser: boolean;
  };
  setInfoModal: any;
  // title: string
  // setTitle: any
  onClose: () => void;
  onChange: (val: string) => void;
  // handleAddEditPlan: () => void
}

export default function ActionModal(props: Props) {
  const navigation: any = useNavigation();
  const { visible, onClose, onChange, infoModal, setInfoModal } = props;

  const showActions = () => {
    let actions = [];

    switch (infoModal.status) {
      case 'pending':
        actions = infoModal.fromUser
          ? ['Hủy kết bạn', 'Chặn']
          : ['Đồng ý', 'Từ chối', 'Chặn'];
        break;
      case 'denied':
        actions = infoModal.fromUser ? ['Bỏ chặn'] : ['Chặn'];
        break;
      case 'accepted':
        actions = ['Hủy bạn bè', 'Chặn'];
        break;
      case 'cancelled':
        actions = ['Kết bạn', 'Chặn'];
        break;

      default:
        actions = ['Kết bạn', 'Chặn'];
        break;
    }

    return actions;
  };
  const showIconAction = (action: string) => {
    let result: ReactNode;

    switch (action) {
      case 'Kết bạn':
        result = (
          <UserAdd size={sizes.title} color={colors.textBold} variant="Bold" />
        );
        break;
      case 'Hủy kết bạn':
        result = (
          <UserRemove
            size={sizes.title}
            color={colors.textBold}
            variant="Bold"
          />
        );
        break;
      case 'Đồng ý':
        result = (
          <TickCircle
            size={sizes.title}
            color={colors.textBold}
            variant="Bold"
          />
        );
        break;
      case 'Từ chối':
        result = (
          <CloseCircle
            size={sizes.title}
            color={colors.textBold}
            variant="Bold"
          />
        );
        break;
      case 'Chặn':
        result = (
          <DeniedSvg
            width={sizes.title}
            height={sizes.title}
            color={colors.textBold}
          />
        );
        break;
      case 'Bỏ chặn':
        result = (
          <DeniedSvg
            width={sizes.title}
            height={sizes.title}
            color={colors.textBold}
          />
        );
        break;
      case 'Hủy bạn bè':
        result = (
          <UserMinus
            size={sizes.title}
            color={colors.textBold}
            variant="Bold"
          />
        );
        break;

      default:
        break;
    }

    return result;
  };

  const handleAction = () => {
    console.log('ok');
    setInfoModal({ ...infoModal, visibleModal: false });
  };

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
        {showActions().map((_, index) => (
          <Fragment key={index}>
            <RowComponent onPress={() => handleAction()}>
              {showIconAction(_)}
              <SpaceComponent width={16} />
              <TextComponent text={_} />
            </RowComponent>
            <SpaceComponent height={16} />
          </Fragment>
        ))}
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
