import React, { ReactNode } from 'react';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

interface Props {
    children: ReactNode;
    styles?: StyleProp<ViewStyle>;
    onPress?: () => void;
    justify?:
    | 'center'
    | 'flex-start'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | undefined;
}
const RowComponent = (props: Props) => {
    const { justify, styles, children, onPress } = props;
    const localStyle = [
        globalStyles.row,
        {
            justifyContent: justify ?? 'flex-start',
        },
        styles,
    ];
    return onPress ? (
        <TouchableOpacity activeOpacity={0.5} onPress={onPress} style={localStyle}>
            {children}
        </TouchableOpacity>
    ) : (
        <View style={localStyle}>{children}</View>
    );
};

export default RowComponent;