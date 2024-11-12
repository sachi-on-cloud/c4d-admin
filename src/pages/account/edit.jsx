import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, DISTRICT_LIST, STATE_LIST } from '@/utils/constants';
import { Button, Card, CardBody, Typography, Input, List, ListItem } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ACCOUNT_EDIT_SCHEMA } from '@/utils/validations';

const AccountEdit = () => {
    const [accountVal, setAccountVal] = useState({});
    const [alert, setAlert] = useState(false);
    const [districtSearchText, setDistrictSearchText] = useState("");
    const [isDistrictListVisible, setIsDistrictListVisible] = useState(false);
    const [stateSearchText, setStateSearchText] = useState("");
    const [isStateListVisible, setIsStateListVisible] = useState(false);
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();

    useEffect(() => {
        fetchItem(id);
    }, [id]);

    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(`${API_ROUTES.GET_ACCOUNT_BY_ID}/${itemId}`);
        setAccountVal(data.data);
    };

    const initialValues = {
        
        name: accountVal?.name || "",
        phoneNumber: accountVal?.phoneNumber || "",
        type: accountVal?.type || "",
        email: accountVal?.email || "",
        street: accountVal?.street || "",
        district: accountVal?.district || "",
        state: accountVal?.state || "",
        pincode: accountVal?.pincode || "",
    };

    const onSubmit = async (values, { setSubmitting, resetForm }) => {
        console.log('onSubmit :', values)
        try {
            const accountData = {
                name: values.name,
                phoneNumber: values.phoneNumber,
                email: values.email,
                type:values.type,
                street: values.street || "",
                district: values.district,
                state: values.state,
                pincode: values.pincode || "",
                accountId: id
            };
            // let accountData = { accountDetails }
            //return;
            const data = await ApiRequestUtils.update(API_ROUTES.UPDATE_ACCOUNT, accountData);
            console.log('data in driver add :', data);
            navigate('/dashboard/account', {
                state: {
                    accountUpdated: true,
                    accountName: data?.data?.name
                }
            });

        } catch (error) {
            console.error('Error creating driver and car:', error);
        }
        setSubmitting(false);
    };

    const districtOptions = DISTRICT_LIST.map(district => ({
        id: district.value,
        name: district.label
    }));

    const filteredDistricts = districtOptions.filter(district =>
        district.name.toLowerCase().includes(districtSearchText.toLowerCase())
    );
    useEffect(() => {
        if (initialValues.district) {
            const selectedDistrict = districtOptions.find(district => district.id === initialValues.district);
            if (selectedDistrict) {
                setDistrictSearchText(selectedDistrict.name);
            }
        }
    }, [initialValues.district]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.district-search-container')) {
                setIsDistrictListVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const stateOptions = STATE_LIST.map(state => ({
        id: state.value,
        name: state.label
    }));

    const filteredState = stateOptions.filter(state => 
        state.name.toLowerCase().includes(stateSearchText.toLowerCase()) 
    );
    useEffect(() => {
        if (initialValues.state) {
            const selectedState = stateOptions.find(state => state.id === initialValues.state);
            if (selectedState) {
                setStateSearchText(selectedState.name);
            }
        }
    }, [initialValues.state]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.state-search-container')) {
                setIsStateListVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    return (
        <div className="p-4 mx-auto">
            <h2 className="text-2xl font-bold mb-4">Update Account</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={ACCOUNT_EDIT_SCHEMA}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ handleSubmit, values, errors, dirty, isValid, handleChange, setFieldValue }) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                        
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                                <Field type="text" name="name" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                <Field type="tel" name="phoneNumber" className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="type" className="text-sm font-medium text-gray-700">Type</label>
                                <Field as="select" name="type" className="p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                    <option value="">Select Type</option>
                                    <option value="Individual">Individual</option>
                                    <option value="Company">Company</option>
                                </Field>
                                <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                                <Field type="text" name="email" className="p-2 w-full rounded-md shadow-sm border-gray-300" />
                                <ErrorMessage name="email" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            <div>
                                <label htmlFor="street" className="text-sm font-medium text-gray-700">Street Name</label>
                                <Field type="text" name="street" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="street" component="div" className="text-red-500 text-sm my-1" />
                            </div>
                            
                            <div>
                                <label htmlFor="district" className="text-sm font-medium text-gray-700">District</label>
                                <div className="relative district-search-container">
                                    <Input
                                        type="text"
                                        placeholder="Search District"
                                        value={districtSearchText}
                                        onChange={(e) => {
                                            setDistrictSearchText(e.target.value);
                                            setIsDistrictListVisible(true);
                                        }}
                                        onFocus={() => setIsDistrictListVisible(true)}
                                        className="p-2 w-full rounded-md border-gray-300"
                                    />
                                    {isDistrictListVisible && districtSearchText && filteredDistricts.length > 0 && (
                                        <List className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {filteredDistricts.map((district) => (
                                                <ListItem
                                                    key={district.id}
                                                    onClick={() => {
                                                        setFieldValue("district", district.id);
                                                        setDistrictSearchText(district.name);
                                                        setIsDistrictListVisible(false);
                                                    }}
                                                    className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {district.name}
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </div>
                                <ErrorMessage name="district" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="state" className="text-sm font-medium text-gray-700">State</label>
                                <div className="relative state-search-container">
                                    <Input
                                        type="text"
                                        placeholder="Search State"
                                        value={stateSearchText}
                                        onChange={(e) => {
                                            setStateSearchText(e.target.value);
                                            setIsStateListVisible(true);
                                        }}
                                        onFocus={() => setIsStateListVisible(true)}
                                        className="p-2 w-full rounded-md border-gray-300"
                                    />
                                    {isStateListVisible && stateSearchText && filteredState.length > 0 && (
                                        <List className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {filteredState.map((state) => (
                                                <ListItem
                                                    key={state.id}
                                                    onClick={() => {
                                                        setFieldValue("state", state.id);
                                                        setStateSearchText(state.name);
                                                        setIsStateListVisible(false);
                                                    }}
                                                    className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {state.name}
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </div>
                                <ErrorMessage name="state" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="pincode" className="text-sm font-medium text-gray-700">Pincode</label>
                                <Field type="text" name="pincode" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="pincode" component="div" className="text-red-500 text-sm my-1" />
                            </div>
                            
                        </div>
                    
                        <div className='flex flex-row'>
                            <Button
                                fullWidth
                                onClick={() => { navigate('/dashboard/account'); }}
                                className='my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl'
                            >
                                Cancel
                            </Button>
                            <Button
                                fullWidth
                                color="black"
                                onClick={handleSubmit}
                                //disabled={!dirty || !isValid}
                                // disabled={!isFormValid(values, errors)}
                                className='my-6 mx-2'
                            >
                                {isEditMode ? 'Update' : 'Continue'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AccountEdit;