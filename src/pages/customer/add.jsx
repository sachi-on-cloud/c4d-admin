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
            //console.log('Customer created:', data);

            if (!data?.success) {
                if (data?.code === 203) {
                    setAlert({ show: true, message: 'Customer already exists!', color: 'red' });
                } else {
                    setAlert({ show: true, message: 'An error occurred while processing your request.', color: 'red' });
                }
                setTimeout(() => {
                    setAlert({ show: false, message: '', color: 'red' });
                }, 2000);
            } else {
                // setAlert({ show: true, message: 'Customer added successfully!', color: 'green' });
                setTimeout(() => {
                    // setAlert({ show: false, message: '', color: 'green' });
                    if (props.isQuickCreate) {
                        navigate('/dashboard/booking', {
                            state: {
                                refreshData: true,
                                customerPhoneNumber: data?.data?.phoneNumber
                            }
                        });
                    } else {
                        navigate('/dashboard/customers', {
                            state: {
                                customerAdded: true,
                                customerName: data?.data?.firstName
                            }
                        });
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('Error creating customer:', error);
            setAlert({ show: true, message: 'An unexpected error occurred.', color: 'red' });
            setTimeout(() => {
                setAlert({ show: false, message: '', color: 'red' });
            }, 5000);
        }
        setSubmitting(false);
    };

    const handleCancel = () => {
        if (props.isQuickCreate) {
            return navigate('/dashboard/booking', {
                state: {
                    refreshData: true,
                    customerPhoneNumber:''
                }
            });
        } else {
            navigate('/dashboard/customers');
        }
    };

    return (
        <div className="p-4">
            {alert.show && (
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