import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { AvatarComponent, TextComponent } from '.';
import { colors } from '../constants/colors';
import { UserModel } from '../models';

interface Props {
  memberGroup: UserModel[];
}

const AvatarGroupComponent = (props: Props) => {
  const { memberGroup } = props;

  const renderAvatar = (memberGroup: UserModel[]) => {
    let children: ReactNode;
    switch (memberGroup.length) {
      case 1:
        children = (
          <View
            style={{
              position: 'absolute',
              top: 20,
              left: 6,
            }}
          >
            <AvatarComponent size={26} uri={memberGroup[0].photoURL} />
          </View>
        );
        break;
      case 2:
        children = (
          <>
            <View
              style={{
                position: 'absolute',
                top: 6,
                left: 6,
                zIndex: 1,
              }}
            >
              <AvatarComponent size={26} uri={memberGroup[0].photoURL} />
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 6,
                zIndex: 2,
              }}
            >
              <AvatarComponent size={26} uri={memberGroup[1].photoURL} />
            </View>
          </>
        );
        break;
      case 3:
        children = (
          <>
            <View
              style={{
                position: 'absolute',
                top: 6,
                left: 6,
                zIndex: 1,
              }}
            >
              <AvatarComponent size={26} uri={memberGroup[0].photoURL} />
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                zIndex: 2,
              }}
            >
              <AvatarComponent size={26} uri={memberGroup[1].photoURL} />
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 6,
                right: 0,
                zIndex: 3,
              }}
            >
              <AvatarComponent size={26} uri={memberGroup[2].photoURL} />
            </View>
          </>
        );
        break;
      default:
        children = (
          <>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1,
              }}
            >
              <AvatarComponent size={26} uri={memberGroup[0].photoURL} />
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                zIndex: 2,
              }}
            >
              <AvatarComponent size={26} uri={memberGroup[1].photoURL} />
            </View>
            <View
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                zIndex: 3,
              }}
            >
              <AvatarComponent size={26} uri={memberGroup[2].photoURL} />
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                zIndex: 3,
                height: 26,
                width: 26,
                borderRadius: 100,
                backgroundColor: colors.gray,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TextComponent text={`${memberGroup.length - 3}`} color={colors.gray3} />
            </View>
          </>
        );
        break;
    }

    return children;
  };
  return (
    <View
      style={{
        height: 50,
        width: 50,
        position: 'relative',
      }}
    >
      {memberGroup.length > 0 && renderAvatar(memberGroup)}
    </View>
  );
};

export default AvatarGroupComponent;
