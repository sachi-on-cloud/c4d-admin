import React, { useState, useEffect } from 'react';
// import Select from 'react-select';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, DISTRICT_LIST, STATE_LIST} from '@/utils/constants';
import { ACCOUNT_ADD_SCHEMA } from '@/utils/validations';
import { Alert, Button, Input, List, ListItem} from '@material-tailwind/react';
import { useNavigate, useParams } from "react-router-dom";

const AccountAdd = (props) => {
    const [districtSearchText, setDistrictSearchText] = useState("");
    const [isDistrictListVisible, setIsDistrictListVisible] = useState(false);
    const [stateSearchText, setStateSearchText] = useState("");
    const [isStateListVisible, setIsStateListVisible] = useState(false);
    const [alert, setAlert] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const [imagePreview, setImagePreview] = useState(null);
   
    const initialValues = {
        name: "",
        phoneNumber:  "",
        email: "",
        type: "",
        street: "",
        district: "",
        state: "",
        pincode: "",
        image1: ""
    };

    const onSubmit = async (values, { setSubmitting, setFieldError}) => {
        console.log('Form submission started with values:', values);
        try {
            const formData = new FormData();
        
            formData.append('name', values.name);
            formData.append('image1', values.image1);
            formData.append('extImage1', values.image1.name.split('.')[1]);
            formData.append('fileTypeImage1', values.image1.type);
            formData.append('phoneNumber', values.phoneNumber);
            formData.append('type', values.type);
            formData.append('email', values.email);
            formData.append('street', values.street);
            formData.append('district', values.district);
            formData.append('state', values.state);
            formData.append('pincode', values.pincode);
            
            let data;
            data = await ApiRequestUtils.postDocs(API_ROUTES.CREATE_ACCOUNT, formData);
            console.log('data :', data)
                if (!data?.success && data?.code === 203) {
                    setAlert({ message: 'Account already exists!', color: 'red' });
                    setTimeout(() => setAlert(null), 5000);
                    resetForm();
                } else {
                    navigate('/dashboard/account', {
                        state: {
                            accountAdded:  true,
                            accountName: values.name
                        }
                    });
                }
        } catch (error) {
            console.error('Error submitting form:', error);
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
        <div className="p-4">
            {alert && (
                <div className='mb-2'>
                    <Alert
                        color={alert.color}
                        className='py-3 px-6 rounded-xl'
                    >
                        {alert.message}
                    </Alert>
                </div>
            )}
            <h2 className="text-2xl font-bold mb-4">Add new Account</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={ACCOUNT_ADD_SCHEMA}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ handleSubmit, dirty, isValid, setFieldValue, values, errors, touched}) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                                <Field type="text" name="name" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" />
                                <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                <Field type="text" name="phoneNumber" className="p-2 w-full rounded-md border-2 border-gray-300" maxLength={10} />
                                <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="type" className="text-sm font-medium text-gray-700">Type</label>
                                <Field as="select" name="type" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                    <option value="">Select Type</option>
                                    <option value="Individual">Individual</option>
                                    <option value="Company">Company</option>
                                </Field>
                                <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                                <Field type="email" name="email" className="p-2 w-full rounded-md border-2  shadow-sm border-gray-300" />
                                <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="street" className="text-sm font-medium text-gray-700">Street Name</label>
                                <Field type="text" name="street" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" />
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
                                            //setFieldValue("district", "");
                                        }}
                                        onFocus={() => setIsDistrictListVisible(true)}
                                        className="p-2 w-full rounded-md border-gray-300"
                                    />
                                    {isDistrictListVisible && districtSearchText && filteredDistricts.length > 0 &&(
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
                                            //setFieldValue("state", "");
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
                                <Field type="text" name="pincode" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" maxlength={6} />
                                <ErrorMessage name="pincode" component="div" className="text-red-500 text-sm my-1" />
                            </div>
                            {/* <div>
                                <label htmlFor="location" className="text-sm font-medium text-gray-700">Select Location</label>
                                <Select
                                    id="location"
                                    options={DISTRICT_LIST}
                                    onChange={(e) => { console.log('on handle change :', e)}}
                                    placeholder="Search and select..."
                                    isSearchable
                                    className="w-full"
                                />
                            </div> */}
                            <div>
                                <label htmlFor="image1" className="text-sm font-medium text-gray-700">
                                    Aadhaar Image
                                </label>
                                <div className="mt-1">
                                    <div className="relative w-40 h-40 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                                        {values?.image1 ? (
                                            <img
                                                src={imagePreview ? imagePreview : values?.image1}
                                                alt="Preview"
                                                className="w-full h-full object-contain rounded-md"
                                            />
                                        ) : (
                                            <div className="text-gray-500 font-medium p-2">No image selected. Click below to upload.</div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="image1"
                                        name='image1'
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setFieldValue("image1", file);

                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setImagePreview(reader.result);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden" // Hide the native input
                                    />
                                    <label
                                        htmlFor="image1"
                                        className="p-2 mt-2 inline-block text-center text-white border border-gray-400 bg-black rounded-xl cursor-pointer"
                                    >
                                        Upload Image
                                    </label>
                                </div>
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
                                disabled={!dirty || !isValid}
                                className='my-6 mx-2'
                            >
                                Continue
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AccountAdd;