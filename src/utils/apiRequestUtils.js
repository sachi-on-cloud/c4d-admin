import axios from 'axios';
import { getBaseUrl } from "./constants";

export const ApiRequestUtils = {
    post: async (apiRoute, body, custID = 0) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'token': token
        }
        if (custID != 0) {
            headers['custID'] = custID;
        }
        const { data } = await axios.post(getBaseUrl() + apiRoute, body, {
            headers
        });
        if (!data.success && (data.code === 400 || data.code === 415)) { // Unauthorized request
            alert('Failure', data.message, [{
                style: 'default', onPress: () => {
                    // navigation.navigate('Welcome');
                }
            }]);
            return;
        } else {
            return data;
        }
    },

    get: async (apiRoute, custID = 0) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'token': token
        }
        if (custID != 0) {
            headers['custID'] = custID;
        }
        const { data } = await axios.get(getBaseUrl() + apiRoute, {
            headers
        });
        if (!data.success && (data.code === 400 || data.code === 415)) { // Unauthorized request
            alert('Failure', data.message, [{
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
        const token = localStorage.getItem('token');
        const { data } = await axios.get(getBaseUrl() + apiRoute, {
            headers: {
                'Content-Type': 'application/json',
                'token': token,
                'custID': 63
            },
            params: params
        });
        if (!data.success && (data.code === 400 || data.code === 415)) { // Unauthorized request
            alert('Failure', data.message, [{
                style: 'default', onPress: () => {
                    // navigation.navigate('Welcome');
                }
            }]);
            return;
        } else {
            return data;
        }
    },

    update: async (apiRoute, body, custID = 0) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'token': token
        }
        if (custID != 0) {
            headers['custID'] = custID;
        }
        const { data } = await axios.put(getBaseUrl() + apiRoute, body, {
            headers
        });
        if (!data.success && (data.code === 400 || data.code === 415)) { // Unauthorized request
            alert('Failure', data.message, [{
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
        const token = localStorage.getItem('token');
        const { data } = await axios.delete(getBaseUrl() + apiRoute, {
            headers: {
                'Content-Type': 'application/json',
                'token': token,
                'custID': 63
            },
            data: body
        });
        if (!data.success && (data.code === 400 || data.code === 415)) { // Unauthorized request
            alert('Failure', data.message, [{
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

