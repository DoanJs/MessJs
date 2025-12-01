import { Send2 } from 'iconsax-react-native'
import React, { useState } from 'react'
import { ActivityIndicator, Text } from 'react-native'
import { RowComponent } from '.'
import { auth } from '../../firebase.config'
import { colors } from '../constants/colors'
import { makeContactId } from '../constants/makeContactId'
import { sizes } from '../constants/sizes'
import { UserModel } from '../models'
import { TickSvg } from '../assets/vector'

interface Props {
  item: UserModel
  onSelectUser: (val: any) => void
}

const UserForwardComponent = (props: Props) => {
  const { item, onSelectUser } = props
  const userCurrent = auth.currentUser
  const [isloading, setIsloading] = useState(false);
  const [isActive, setIsActive] = useState(false);

  return (
    <RowComponent
      styles={{
        paddingVertical: 12,
        borderBottomWidth: 0.3,
        borderColor: '#ccc',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Text style={{ fontSize: 16 }}>{item.displayName}</Text>
      {
        isloading ? <ActivityIndicator /> :
          isActive ? <TickSvg
            width={sizes.extraTitle}
            height={sizes.extraTitle}
          /> : <Send2
            onPress={async () => {
              setIsloading(true)
              await onSelectUser({ chatRoomId: makeContactId(userCurrent?.uid as string, item.id), friend: { id: item.id }, type: 'private' })
              setIsloading(false)

              setIsActive(true)
            }}
            size={sizes.extraTitle}
            color={colors.textBold}
            variant="Bold"
          />
      }
    </RowComponent>
  )
}

export default UserForwardComponent