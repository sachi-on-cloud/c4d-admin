import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, DISTRICT_LIST, STATE_LIST} from '@/utils/constants';
import { ACCOUNT_ADD_SCHEMA } from '@/utils/validations';
import { Alert, Button, Input, Typography, List, ListItem} from '@material-tailwind/react';
import { useNavigate, useParams } from "react-router-dom";

const AccountAdd = (props) => {
    const [accountVal, setAccountVal] = useState({});
    const [districtSearchText, setDistrictSearchText] = useState("");
    const [isDistrictListVisible, setIsDistrictListVisible] = useState(false);
    const [stateSearchText, setStateSearchText] = useState("");
    const [isStateListVisible, setIsStateListVisible] = useState(false);
    const [alert, setAlert] = useState(false);
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [image1, setImage1] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchItem(id);
        }
    }, [id, isEditMode]);
    
    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_ACCOUNT_BY_ID + `/${itemId}`);
        console.log('Fetched account data:', data);
        setAccountVal(data.data);
    };
            
    const initialValues = {
        name: accountVal?.name || '',
        phoneNumber:  accountVal?.phoneNumber || "",//accountVal?.phoneNumber || "", //props.customerNumber || '',
        email: accountVal?.email || "",
        type: accountVal?.type || "",
        street: accountVal?.street || "",
        district: accountVal?.district || "",
        state: accountVal?.state || "",
        pincode: accountVal?.pincode || "",
    };

    // const ImageUploadPreview = ({ field, form, label = "Upload Image" }) => {
    //     const [preview, setPreview] = useState(null);

    //     const handleImageChange = async (e) => {
    //         console.log('TARGET :', e.target.files[0])
    //         const file = e.target.files[0];
    //         // if (file) {
    //         //     // form.setFieldValue(field.name, file);

    //         //     // const reader = new FileReader();
    //         //     // reader.onloadend = () => {
    //         //     //     setPreview(reader.result);
    //         //     // };
    //         //     // reader.readAsDataURL(file);
    //         //     const data = await ApiRequestUtils.postDocs(API_ROUTES.UPLOAD_PHOTO, {
    //         //         image1: file,
    //         //         type: KYC_PROCESS.LIVE_PHOTO,
    //         //         driverId: 7
    //         //     });
    //         //     console.log('data :', data);
    //         // }
    //     };

    //     const handleRemoveImage = () => {
    //         form.setFieldValue(field.name, null);
    //         setPreview(null);
    //     };

    //     return (
    //         <div>
    //             <label
    //                 htmlFor={field.name}
    //                 className="text-sm font-medium text-gray-700"
    //             >
    //                 {label}
    //             </label>

    //             <div className="mt-1">
    //                 {preview ? (
    //                     <div className="relative inline-block">
    //                         <img
    //                             src={preview}
    //                             alt="Preview"
    //                             className="w-32 h-32 object-cover rounded-md border border-gray-300 shadow-sm"
    //                         />
    //                         <button
    //                             type="button"
    //                             onClick={handleRemoveImage}
    //                             className="absolute -top-2 -right-2 p-1.5 bg-white border border-gray-300 rounded-full text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors shadow-sm"
    //                         >
    //                             X
    //                             {/* <X size={14} /> */}
    //                         </button>
    //                     </div>
    //                 ) : (
    //                     <div className="w-full">
    //                         <input
    //                             type="file"
    //                             accept="image/*"
    //                             onChange={handleImageChange}
    //                             id={field.name}
    //                         />
    //                         {/* <label
    //                             htmlFor={field.name}
    //                             className="w-full p-2 flex items-center justify-center border border-gray-300 rounded-md shadow-sm cursor-pointer hover:border-blue-300 focus:outline-none focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors"
    //                         >
    //                             <div className="flex items-center space-x-2">
    //                                 <Camera size={20} className="text-gray-400" />
    //                                 <span className="text-sm text-gray-500">Click to upload image</span>
    //                             </div>
    //                         </label> */}
    //                     </div>
    //                 )}
    //             </div>

    //             {form.errors[field.name] && form.touched[field.name] && (
    //                 <div className="text-red-500 text-sm my-1">
    //                     {form.errors[field.name]}
    //                 </div>
    //             )}
    //         </div>
    //     );
    // };

    const onSubmit = async (values, { setSubmitting, setFieldError}) => {
        console.log('Form submission started with values:', values);
        try {
            const accountData = {
                name: values.name,
                phoneNumber: values.phoneNumber ,
                type: values.type,
                email: values.email,
                street: values.street || undefined,
                district: values.district || undefined,
                state: values.state || undefined,
                pincode: values.pincode 
            };
            
            let data;
            if (isEditMode) {
                accountData['accountId'] = id;
                data = await ApiRequestUtils.update(API_ROUTES.UPDATE_ACCOUNT, accountData);
            }
             else {
                data = await ApiRequestUtils.post(API_ROUTES.CREATE_ACCOUNT, accountData);
            }
                if (!data?.success && data?.code === 203) {
                    setAlert({ message: 'Account already exists!', color: 'red' });
                    setTimeout(() => setAlert(null), 5000);
                    resetForm();
                } else {
                    // setAlert({ show: true, message: isEditMode ? 'User updated successfully!' : 'User added successfully!', color: 'green' });
                    // setTimeout(() => {
                    //     resetForm();
                    navigate('/dashboard/account', {
                        state: {
                            accountAdded: isEditMode ? false : true,
                            accountUpdated: isEditMode ? true : false,
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
                                <Field
                                    name="image1"
                                    component={ImageUploadPreview}
                                    label="Image"
                                />
                            </div> */}
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
                                disabled={isEditMode ? false: !dirty || !isValid}
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

export default AccountAdd;