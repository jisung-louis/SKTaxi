import { TextStyle } from "react-native";

export const TYPOGRAPHY : {[key: string]: TextStyle} = {
    /** title */
    title1: {
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 32,
    },
    title2: {
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 28,
    },
    title3: {
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 24,
    },
    /** body */
    body1: {
        fontSize: 16,
        fontWeight: 'normal',
        lineHeight: 24,
    },
    body2: {
        fontSize: 14,
        fontWeight: 'normal',
        lineHeight: 20,
    },
    /** caption */
    caption1: {
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: 16,
    },
    caption2: {
        fontSize: 10,
        fontWeight: 'normal',
        lineHeight: 14,
    },
};