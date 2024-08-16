import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { Alert, Button } from '@material-tailwind/react';
import { useNavigate, useParams } from "react-router-dom";

const CustomerAdd = (props) => {
    const [driverVal, setDriverVal] = useState({});
    const [alert, setAlert] = useState(false);
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
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
        phoneNumber: '', //driverVal?.phoneNumber ? driverVal?.phoneNumber.replace(/^(\+91)/, ''): "",
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
                phoneNumber: Yup.string().matches(/^[0-9]{10}$/, 'Must be a valid 10-digit number').required('Phone number is required'),
                // carNumber: Yup.string().required('Car number is required'),
                // nickName: Yup.string().required('Car name is required'),
                // carType: Yup.string().required('Car type is required'),
                // fuelType: Yup.string().required('Fuel type is required'),
                // transmissionType: Yup.string().required('Transmission type number is required')
            }),
    });

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

                return navigate('/dashboard/customers');
            } else {
                customerData['phoneNumber'] = "+91" + values.phoneNumber;
                data = await ApiRequestUtils.post(API_ROUTES.REGISTER_CUSTOMER, customerData);
            }
            console.log('Customer created:', data);

            if (!data?.success && data?.code === 203) {
                setAlert(true);

                setTimeout(() => {
                    setAlert(false);
                    resetForm();
                }, 2000)
            }
            if(props.isQuickCreate){
                return navigate('/dashboard/booking',{
                    state:{
                        refreshData: true,
                    }
                });
            }
            navigate('/dashboard/customers', {
                state: {
                    customerAdded: true,
                    customerName: data?.data?.firstName
                }
            });
            // if (data.data) {
            //     const carData = {
            //         customerId: data?.data?.id,
            //         carNumber: values.carNumber,
            //         nickName: values.nickName,
            //         carType: values.carType,
            //         fuelType: values.fuelType,
            //         transmissionType: values.transmissionType
            //     };

            //     const carResponse = await ApiRequestUtils.post(API_ROUTES.ADD_CAR_DETAILS, carData);
            //     console.log('Car added:', carResponse.data);
            // }
            // Handle success (e.g., show a success message, redirect, etc.)
        } catch (error) {
            console.error('Error creating customer and car:', error);
            // Handle error (e.g., show an error message)
        }
        setSubmitting(false);
    };

    return (
        <div className="p-4">
            {alert && <div className='mb-2'>
                <Alert
                    color='red'
                    className='py-3 px-6 rounded-xl'
                >
                    User already exist!
                </Alert>
            </div>}
            <h2 className="text-2xl font-bold mb-4">Add New Customer</h2>
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
                                <Field as="select" name="salutation" className="p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                    <option value="">Select salutation</option>
                                    <option value="Mr">Mr</option>
                                    <option value="Mrs">Mrs</option>
                                    <option value="Others">Others</option>
                                </Field>
                                <ErrorMessage name="salutation" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</label>
                                <Field type="text" name="firstName" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            {!isEditMode && (
                                <>
                                    <div>
                                        <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                        <Field type="tel" name="phoneNumber" className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                        <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                                    </div>
                                    {/*Car module */}
                                    {/* <div>
                                        <label htmlFor="carNumber" className="text-sm font-medium text-gray-700">Car Number</label>
                                        <Field type="text" name="carNumber" className="p-2 w-full rounded-md border-gray-300 uppercase" maxLength={10} />
                                        <ErrorMessage name="carNumber" component="div" className="text-red-500 text-sm" />
                                    </div>

                                    <div>
                                        <label htmlFor="nickName" className="text-sm font-medium text-gray-700">Car Name</label>
                                        <Field type="text" name="nickName" className="p-2 w-full rounded-md border-gray-300" />
                                        <ErrorMessage name="nickName" component="div" className="text-red-500 text-sm" />
                                    </div>

                                    <div>
                                        <label htmlFor="fuelType" className="text-sm font-medium text-gray-700">Fuel Type</label>
                                        <Field as="select" name="fuelType" className="p-2 w-full rounded-md border-gray-300 shadow-sm">
                                            <option value="">Select fuel type</option>
                                            <option value="Petrol">Petrol</option>
                                            <option value="Diesel">Diesel</option>
                                            <option value="Electric">Electric</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </Field>
                                        <ErrorMessage name="fuelType" component="div" className="text-red-500 text-sm" />
                                    </div>

                                    <div>
                                        <label htmlFor="transmissionType" className="text-sm font-medium text-gray-700">Transmission Type</label>
                                        <Field as="select" name="transmissionType" className="p-2 w-full rounded-md border-gray-300">
                                            <option value="">Select transmission type</option>
                                            <option value="Manual">Manual</option>
                                            <option value="Automatic">Automatic</option>
                                        </Field>
                                        <ErrorMessage name="transmissionType" component="div" className="text-red-500 text-sm" />
                                    </div> */}
                                </>)}
                        </div>
                        {/* {!isEditMode && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Car Type</p>
                                <div className="space-x-4">
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="carType" value="Sedan" className="form-radio" />
                                        <span className="ml-2">Sedan</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="carType" value="SUV" className="form-radio" />
                                        <span className="ml-2">SUV</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="carType" value="Hatchback" className="form-radio" />
                                        <span className="ml-2">Hatchback</span>
                                    </label>
                                </div>
                                <ErrorMessage name="carType" component="div" className="text-red-500 text-sm" />
                            </div>
                        )} */}

                        <Button
                            fullWidth
                            color="black"
                            onClick={handleSubmit}
                            disabled={isEditMode ? false : !dirty || !isValid}
                            className='my-6 mx-2'
                        >
                            {isEditMode ? 'Update' : 'Continue'}
                        </Button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CustomerAdd;