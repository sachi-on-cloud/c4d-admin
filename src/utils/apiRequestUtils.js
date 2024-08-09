import axios from 'axios';
import { getBaseUrl } from "./constants";
import { Alert } from '@material-tailwind/react';

const TOKEN = 'bc8612f9-2253-4170-b3d8-185edae495aa';
export const ApiRequestUtils = {
    post: async (apiRoute, body) => {
        // const token = await Utils.getValueFromAsyncStorage(ASYNC_STORAGE_KEYS.TOKEN);
        const { data } = await axios.post(getBaseUrl() + apiRoute, body, {
            headers: {
                'Content-Type': 'application/json',
                'token': TOKEN,
                'custID': 63
            }
        });
        if (!data.success && (data.code === 400 || data.code === 415)) { // Unauthorized request
            Alert.alert('Failure', data.message, [{
                style: 'default', onPress: () => {
                    // navigation.navigate('Welcome');
                }
            }]);
            return;
        } else {
            return data;
        }
    },

    get: async (apiRoute) => {
        // const token = await Utils.getValueFromAsyncStorage(ASYNC_STORAGE_KEYS.TOKEN);
        const { data } = await axios.get(getBaseUrl() + apiRoute, {
            headers: {
                'Content-Type': 'application/json',
                'token': TOKEN,
                'custID': 63
            }
        });
        if (!data.success && (data.code === 400 || data.code === 415)) { // Unauthorized request
            Alert.alert('Failure', data.message, [{
                style: 'default', onPress: () => {
                    // navigation.navigate('Welcome');
                }
            }]);
            return;
        } else {
            return data;
        }
    },

    getWithQueryParam: async (apiRoute, params) => {
        // const token = await Utils.getValueFromAsyncStorage(ASYNC_STORAGE_KEYS.TOKEN);
        const { data } = await axios.get(getBaseUrl() + apiRoute, {
            headers: {
                'Content-Type': 'application/json',
                'token': TOKEN,
                'custID': 63
            },
            params: params
        });
        if (!data.success && (data.code === 400 || data.code === 415)) { // Unauthorized request
            Alert.alert('Failure', data.message, [{
                style: 'default', onPress: () => {
                    // navigation.navigate('Welcome');
                }
            }]);
            return;
        } else {
            return data;
        }
    },

    update: async (apiRoute, body) => {
        // const token = await Utils.getValueFromAsyncStorage(ASYNC_STORAGE_KEYS.TOKEN);
        const { data } = await axios.put(getBaseUrl() + apiRoute, body, {
            headers: {
                'Content-Type': 'application/json',
                'token': TOKEN,
                'custID': 63
            }
        });
        if (!data.success && (data.code === 400 || data.code === 415)) { // Unauthorized request
            Alert.alert('Failure', data.message, [{
                style: 'default', onPress: () => {
                    // navigation.navigate('Welcome');
                }
            }]);
            return;
        } else {
            return data;
        }
    },

    delete: async (apiRoute, body) => {
        // const token = await Utils.getValueFromAsyncStorage(ASYNC_STORAGE_KEYS.TOKEN);
        const { data } = await axios.delete(getBaseUrl() + apiRoute, {
            headers: {
                'Content-Type': 'application/json',
                'token': TOKEN,
                'custID': 63
            },
            data: body
        });
        if (!data.success && (data.code === 400 || data.code === 415)) { // Unauthorized request
            Alert.alert('Failure', data.message, [{
                style: 'default', onPress: () => {
                    // navigation.navigate('Welcome');
                }
            }]);
            return;
        } else {
            return data;
        }

    }
};

