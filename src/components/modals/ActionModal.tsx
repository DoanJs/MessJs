import {
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';
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
import { auth, db } from '../../../firebase.config';
import { DeniedSvg } from '../../assets/vector';
import { colors } from '../../constants/colors';
import { makeContactId } from '../../constants/makeContactId';
import { sizes } from '../../constants/sizes';
import { UserModel } from '../../models';

interface Props {
  visible: boolean;
  infoModal: {
    visibleModal: boolean;
    status: string;
    fromUser: boolean;
    friend: UserModel | null;
  };
  setInfoModal: any;
  onClose: () => void;
}

export default function ActionModal(props: Props) {
  const { visible, onClose, infoModal, setInfoModal } = props;
  const userCurrent = auth.currentUser;
  const { friend, status, fromUser } = infoModal;

  const showActions = () => {
    let actions = [];

    switch (status) {
      case 'pending':
        actions = fromUser
          ? ['Hủy kết bạn', 'Chặn']
          : ['Đồng ý', 'Từ chối', 'Chặn'];
        break;
      case 'denied':
        actions = fromUser ? ['Bỏ chặn'] : ['Chặn'];
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
  const handleAction = async (type: string) => {
    if (!userCurrent || !friend) return;

    const id = makeContactId(userCurrent.uid, friend.id);

    if (!status) {
      await setDoc(
        doc(db, `friendRequests`, id),
        {
          id,
          from: userCurrent.uid as string,
          to: friend.id as string,
          status:
            type === 'Chặn'
              ? 'denied'
              : type === 'Kết bạn'
              ? 'pending'
              : 'cancelled',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          memberIds: [userCurrent.uid, friend.id],
        },
        { merge: true },
      );
    } else {
      await updateDoc(doc(db, 'friendRequests', id), {
        status:
          type === 'Chặn'
            ? 'denied'
            : type === 'Kết bạn'
            ? 'pending'
            : 'cancelled',
        updatedAt: serverTimestamp(),
      });
    }

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
            <RowComponent onPress={() => handleAction(_)}>
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
