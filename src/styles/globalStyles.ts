import { Platform, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { fontFamillies } from '../constants/fontFamilies';

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    row: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    section: {
        paddingHorizontal: 16
    },
    inputContainer: {
        backgroundColor: colors.gray,
        borderRadius: 5,
    },
    text: {
        fontSize: 16,
        fontFamily: fontFamillies.poppinsMedium,
        color: colors.text,
    },
    header: {
        marginTop: Platform.OS === 'ios' ? 0 : 50,
        marginBottom: 0,
    }
});