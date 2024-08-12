import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { Button } from '@material-tailwind/react';

const DriverAdd = () => {
    const initialValues = {
        salutation: '',
        firstName: '',
        phoneNumber: '',
        license: '',
        carNumber: '',
        nickName: '',
        carType: '',
        fuelType: '',
        transmissionType: ''
    };

    const validationSchema = Yup.object({
        salutation: Yup.string().required('Salutation is required'),
        firstName: Yup.string().required('Name is required'),
        phoneNumber: Yup.string().matches(/^[0-9]{10}$/, 'Must be a valid 10-digit number').required('Phone number is required'),
        license: Yup.string().matches(`^[A-Z]{2}[0-9]{13}$/`, 'Invalid Driver\'s License').required('Driving License is required'),
        carNumber: Yup.string().required('Car number is required'),
        nickName: Yup.string().required('Car name is required'),
        carType: Yup.string().required('Car type is required'),
        fuelType: Yup.string().required('Fuel type is required'),
        transmissionType: Yup.string().required('Transmission type number is required')
    });

    const onSubmit = async (values, { setSubmitting }) => {
        try {
            const driverData = {
                salutation: values.salutation,
                firstName: values.firstName,
                phoneNumber: "+91" + values.phoneNumber,
                license: values.license
            };

            const response = await ApiRequestUtils.post(API_ROUTES.REGISTER_CUSTOMER, driverData);
            console.log('Driver created:', response.data);

            if (response.data) {
                const carData = {
                    customerId: response.data.id,
                    carNumber: values.carNumber,
                    nickName: values.nickName,
                    carType: values.carType,
                    fuelType: values.fuelType,
                    transmissionType: values.transmissionType
                };

                const carResponse = await ApiRequestUtils.post(API_ROUTES.ADD_CAR_DETAILS, carData);
                console.log('Car added:', carResponse.data);
            }

            // Handle success (e.g., show a success message, redirect, etc.)
        } catch (error) {
            console.error('Error creating driver and car:', error);
            // Handle error (e.g., show an error message)
        }
        setSubmitting(false);
    };

    return (
        <div className="p-4 mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Driver</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
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

                            <div>
                                <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                <Field type="tel" name="phoneNumber" className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="license" className="text-sm font-medium text-gray-700">License Number</label>
                                <Field type="text" name="license" className="p-2 w-full rounded-md border-gray-300 uppercase" />
                                <ErrorMessage name="license" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="carNumber" className="text-sm font-medium text-gray-700">Car Number</label>
                                <Field type="text" name="carNumber" className="p-2 w-full rounded-md border-gray-300" />
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
                            </div>
                        </div>

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

                        <Button
                            fullWidth
                            color="black"
                            onClick={handleSubmit}
                            disabled={!dirty || !isValid}
                            className='my-6 mx-2'
                        >
                            Continue
                        </Button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default DriverAdd;