import {
  CloseCircle,
  MedalStar,
  TickCircle,
  UserAdd,
  UserMinus,
  UserRemove,
} from 'iconsax-react-native';
import React, { Fragment, ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { RowComponent, SpaceComponent, TextComponent } from '..';
import { auth } from '../../../firebase.config';
import { DeniedSvg } from '../../assets/vector';
import { colors } from '../../constants/colors';
import {
  acceptFriendRequest,
  blockUser,
  cancelFriendRequest,
  declineFriendRequest,
  sendFriendRequest,
  unblockUser,
  unfriend,
} from '../../constants/functions';
import { makeContactId } from '../../constants/makeContactId';
import { sizes } from '../../constants/sizes';
import { UserModel } from '../../models';

interface Props {
  visible: boolean;
  infoModal: {
    visibleModal: boolean;
    status: string;
    friend: UserModel | null;
  };
  setInfoModal: any;
  onClose: () => void;
  isAdminGroup?: boolean;
}

export default function ActionModal(props: Props) {
  const { visible, onClose, infoModal, setInfoModal, isAdminGroup } = props;
  const userCurrent = auth.currentUser;
  const { friend, status } = infoModal;
  const [loading, setLoading] = useState(false);

  const showActions = () => {
    let actions: string[] = [];

    switch (status) {
      case 'blocked_me':
        actions = []; // ❌ không cho làm gì
        // hoặc ['Báo cáo'] nếu app có
        break;

      case 'blocked_by_me':
        actions = ['Bỏ chặn'];
        break;

      case 'pending_in':
        actions = ['Đồng ý', 'Từ chối', 'Chặn'];
        break;

      case 'pending_out':
        actions = ['Hủy kết bạn', 'Chặn'];
        break;

      case 'friend':
        actions = ['Hủy bạn bè', 'Chặn'];
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

    setLoading(true);
    try {
      let result: string;
      switch (type) {
        case 'Kết bạn':
          result = await sendFriendRequest(friend.id);
          break;
        case 'Hủy kết bạn':
          result = await cancelFriendRequest(
            makeContactId(userCurrent.uid, friend.id),
          );
          break;
        case 'Hủy bạn bè':
          result = await unfriend(friend.id);
          break;
        case 'Đồng ý':
          result = await acceptFriendRequest(
            makeContactId(userCurrent.uid, friend.id),
          );
          break;
        case 'Từ chối':
          result = await declineFriendRequest(
            makeContactId(userCurrent.uid, friend.id),
          );
          break;
        case 'Chặn':
          result = await blockUser(friend.id);
          break;
        case 'Bỏ chặn':
          result = await unblockUser(friend.id);
          break;

        default:
          break;
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
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
        {loading ? (
          <ActivityIndicator />
        ) : (
          showActions().map((_, index) => (
            <Fragment key={index}>
              <RowComponent onPress={() => handleAction(_)}>
                {showIconAction(_)}
                <SpaceComponent width={16} />
                <TextComponent text={_} />
              </RowComponent>
              <SpaceComponent height={16} />
            </Fragment>
          ))
        )}
        {isAdminGroup && (
          <RowComponent>
            <MedalStar
              size={sizes.title}
              color={colors.textBold}
              variant="Bold"
            />
            <SpaceComponent width={16} />
            <TextComponent text="Bổ nhiệm làm trưởng nhóm" />
          </RowComponent>
        )}
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
