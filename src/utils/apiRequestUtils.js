import axios from 'axios';
import { ASYNC_STORAGE_KEYS, getBaseUrl, KYC_PROCESS } from "./constants";

export const ApiRequestUtils = {
    post: async (apiRoute, body, custID = 0) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'token': token,
            'ngrok-skip-browser-warning' : true,
            //'ngrok-skip-browser-warning': '69420',
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
            'token': token,
            'ngrok-skip-browser-warning': '69420',
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
                'custID': 63,
                'ngrok-skip-browser-warning': '69420',
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
            'token': token,
            'ngrok-skip-browser-warning': '69420',
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
                'custID': 63,
                'ngrok-skip-browser-warning': '69420',
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

    },
    postDocs: async (apiRoute, body) => {
        const formData = new FormData();

        if (body.type === KYC_PROCESS.LIVE_PHOTO) {
            formData.append('type', body.type);
            formData.append('image1', body);
            formData.append('driverId', 7);
        } else {
            formData.append('id', body.id);
            formData.append('idNumber', body.idNumber);
            formData.append('image1', {
                uri: body.image1.uri,
                type: body.image1.type,
                name: body.image1.fileName
            });
            formData.append('image2', {
                uri: body.image2.uri,
                type: body.image2.type,
                name: body.image2.fileName
            });
            formData.append('extImage1', body.image1.fileName.split('.')[1]);
            formData.append('fileTypeImage1', body.image1.type);
            formData.append('extImage2', body.image2.fileName.split('.')[1]);
            formData.append('fileTypeImage2', body.image2.type);
            formData.append('mobile', body.mobile);
            formData.append('name', body.name);
            formData.append('type', body.type);
        }

        const token = localStorage.getItem('token');
        const { data } = await axios.post(getBaseUrl() + apiRoute, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'token': token
            }
        });
        if (!data.success && (data.code === 400 || data.code === 415)) { // Unauthorized request
            // Alert.alert('Failure', data.message, [{
            //     style: 'default', onPress: () => {
            //         // navigation.navigate('Welcome');
            //     }
            // }]);
            return;
        } else {
            return data;
        }
    },
};

