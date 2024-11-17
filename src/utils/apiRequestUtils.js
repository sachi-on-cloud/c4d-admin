import axios from 'axios';
import { ASYNC_STORAGE_KEYS, getBaseUrl, KYC_PROCESS } from "./constants";

export const ApiRequestUtils = {
    post: async (apiRoute, body, custID = 0) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'token': token,
            //'ngrok-skip-browser-warning' : true,
            'ngrok-skip-browser-warning': '69420',
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

            formData.append('name', body.name);
            formData.append('image1', body.image1);
            formData.append('extImage1', body.image1.name.split('.')[1]);
            formData.append('fileTypeImage1', body.image1.type);
            formData.append('phoneNumber', body.phoneNumber);
            formData.append('type', body.type);
            formData.append('email', body.email);
            formData.append('street', body.street);
            formData.append('district', body.district);
            formData.append('state', body.state);
            formData.append('pincode', body.pincode);

            console.log('FORM DATA :', formData)
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
    postDocs1: async (apiRoute, body, apiMethod) => {
        const token = localStorage.getItem('token');
        const { data } = await axios.put(getBaseUrl() + apiRoute, body, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'token': token
            }
        });
        console.log('data in POST DOCS :', data);
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

