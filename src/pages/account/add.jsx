import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, KYC_PROCESS } from '@/utils/constants';
import { Alert, Button } from '@material-tailwind/react';
import { useNavigate, useParams } from "react-router-dom";

const CustomerAdd = (props) => {
    const [driverVal, setDriverVal] = useState({});
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
        const data = await ApiRequestUtils.get(API_ROUTES.GET_CUSTOMER + `/${itemId}`);
        setDriverVal(data.data);
    };
    const initialValues = {
        salutation: driverVal?.salutation || '',
        firstName: driverVal?.firstName || '',
        phoneNumber: props.customerNumber || '', //driverVal?.phoneNumber ? driverVal?.phoneNumber.replace(/^(\+91)/, ''): "",
        carNumber: '',
        nickName: '',
        carType: '',
        fuelType: '',
        transmissionType: ''
    };

    const validationSchema = Yup.object({
        salutation: Yup.string().required('Salutation is required'),
        firstName: Yup.string().required('Name is required'),
        ...(isEditMode
            ? {}
            : {
                phoneNumber: Yup.string().matches(/^[6-9][0-9]{9}$/, 'Must be a valid 10-digit number').required('Phone number is required'),
                // carNumber: Yup.string().required('Car number is required'),
                // nickName: Yup.string().required('Car name is required'),
                // carType: Yup.string().required('Car type is required'),
                // fuelType: Yup.string().required('Fuel type is required'),
                // transmissionType: Yup.string().required('Transmission type number is required')
            }),
        image1: Yup.object().shape({
            file: Yup.string().required('Image is required'),
        }).required('Image is required'),
    });

    const ImageUploadPreview = ({ field, form, label = "Upload Image" }) => {
        const [preview, setPreview] = useState(null);

        const handleImageChange = async (e) => {
            console.log('TARGET :', e.target.files[0])
            const file = e.target.files[0];
            if (file) {
                // form.setFieldValue(field.name, file);

                // const reader = new FileReader();
                // reader.onloadend = () => {
                //     setPreview(reader.result);
                // };
                // reader.readAsDataURL(file);
                const data = await ApiRequestUtils.postDocs(API_ROUTES.UPLOAD_PHOTO, {
                    image1: file,
                    type: KYC_PROCESS.LIVE_PHOTO,
                    driverId: 7
                });
                console.log('data :', data);
            }
        };

        const handleRemoveImage = () => {
            form.setFieldValue(field.name, null);
            setPreview(null);
        };

        return (
            <div>
                <label
                    htmlFor={field.name}
                    className="text-sm font-medium text-gray-700"
                >
                    {label}
                </label>

                <div className="mt-1">
                    {preview ? (
                        <div className="relative inline-block">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-md border border-gray-300 shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 p-1.5 bg-white border border-gray-300 rounded-full text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors shadow-sm"
                            >
                                X
                                {/* <X size={14} /> */}
                            </button>
                        </div>
                    ) : (
                        <div className="w-full">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                id={field.name}
                            />
                            {/* <label
                                htmlFor={field.name}
                                className="w-full p-2 flex items-center justify-center border border-gray-300 rounded-md shadow-sm cursor-pointer hover:border-blue-300 focus:outline-none focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors"
                            >
                                <div className="flex items-center space-x-2">
                                    <Camera size={20} className="text-gray-400" />
                                    <span className="text-sm text-gray-500">Click to upload image</span>
                                </div>
                            </label> */}
                        </div>
                    )}
                </div>

                {form.errors[field.name] && form.touched[field.name] && (
                    <div className="text-red-500 text-sm my-1">
                        {form.errors[field.name]}
                    </div>
                )}
            </div>
        );
    };

    const onSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const customerData = {
                salutation: values.salutation,
                firstName: values.firstName,
            };
            let data;
            if (isEditMode) {
                customerData['id'] = id;
                data = await ApiRequestUtils.update(API_ROUTES.UPDATE_CUSTOMER, customerData);

                navigate('/dashboard/customers', {
                    state: {
                        customerUpdated: true,
                        customerName: values.firstName
                    }
                });
            } else {
                customerData['phoneNumber'] = "+91" + values.phoneNumber;
                data = await ApiRequestUtils.post(API_ROUTES.REGISTER_CUSTOMER, customerData);

                if (!data?.success && data?.code === 203) {
                    setAlert({ message: 'Customer already exists!', color: 'red' });
                    setTimeout(() => setAlert(null), 5000);
                    resetForm();
                } else {
                    // setAlert({ show: true, message: isEditMode ? 'User updated successfully!' : 'User added successfully!', color: 'green' });
                    // setTimeout(() => {
                    //     resetForm();
                    if (props.isQuickCreate) {
                        return navigate('/dashboard/booking', {
                            state: {
                                refreshData: true,
                                customerPhoneNumber: data?.data?.phoneNumber
                            }
                        });
                    }
                    navigate('/dashboard/customers', {
                        state: {
                            customerAdded: true,
                            customerName: values.firstName
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error creating user and car:', error);
            // Handle error (e.g., show an error message)
        }
        setSubmitting(false);
    };

    const handleCancel = () => {
        if (props.isQuickCreate) {
            return navigate('/dashboard/booking', {
                state: {
                    refreshData: true,
                    customerPhoneNumber: '',
                    selectCustomer: 0
                }
            });
        } else {
            navigate('/dashboard/customers');
        }
    };

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
            <h2 className="text-2xl font-bold mb-4">New Customer</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ handleSubmit, dirty, isValid }) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="salutation" className="text-sm font-medium text-gray-700">Salutation</label>
                                <Field as="select" name="salutation" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                    <option value="">Select salutation</option>
                                    <option value="Mr">Mr</option>
                                    <option value="Mrs">Mrs</option>
                                    <option value="Others">Others</option>
                                </Field>
                                <ErrorMessage name="salutation" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</label>
                                <Field type="text" name="firstName" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" />
                                <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            {!isEditMode && (
                                <>
                                    <div>
                                        <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                        <Field type="tel" name="phoneNumber" className="p-2 w-full rounded-md border-2 border-gray-300" maxLength={10} />
                                        <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                                    </div>
                                </>)}

                            <div>
                                <Field
                                    name="image1"
                                    component={ImageUploadPreview}
                                    label="Image"
                                />
                            </div>
                        </div>

                        <div className='flex flex-row'>
                            <Button
                                fullWidth
                                onClick={handleCancel}
                                className='my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl'
                            >
                                Cancel
                            </Button>
                            <Button
                                fullWidth
                                color="black"
                                onClick={handleSubmit}
                                disabled={isEditMode ? false : !dirty || !isValid}
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

export default CustomerAdd;