import { Linking, ToastAndroid } from "react-native";

export const showToast = (message) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
};

export const callMobile = async (number) => {
    const url = `tel:${number}`;
    try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            showToast('Calling '+number);
            await Linking.openURL(url);
        } else {
            console.log(`Don't know how to open this URL: ${url}`);
            showToast('Unable to Call '+number);
        }
    } catch (error) {
        console.error('An error occurred', error);
    }  
}

