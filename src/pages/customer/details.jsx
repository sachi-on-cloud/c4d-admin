import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { Alert, Button } from '@material-tailwind/react';
import { useNavigate, useParams } from "react-router-dom";

const CustomerDetails = () => {
    const navigate = useNavigate();
    const [driverVal, setDriverVal] = useState({});
    const { id } = useParams();
    useEffect(() => {
        if (id) {
            fetchItem(id);
        }
    }, [id]);
    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_CUSTOMER + `/${itemId}`);
        setDriverVal(data.data);
    };
    const initialValues = {
        salutation: driverVal?.salutation || '',
        firstName: driverVal?.firstName || '',
        phoneNumber: driverVal?.phoneNumber ? driverVal?.phoneNumber.replace(/^(\+91)/, '') : "",
        source: driverVal?.source || '',
    };


    return (
        <>
            <div className="p-4">

                <h2 className="text-2xl font-bold mb-4">Customer Details</h2>
                <Formik
                    initialValues={initialValues}
                    onSubmit={() => { }}
                    enableReinitialize={true}
                >
                    {({ values }) => (
                        <Form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="salutation" className="text-sm font-medium text-gray-700">Salutation</label>
                                    <Field as="select" disabled name="salutation" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                        <option value="">Select salutation</option>
                                        <option value="Mr">Mr</option>
                                        <option value="Mrs">Mrs</option>
                                        <option value="Others">Others</option>
                                    </Field>
                                    <ErrorMessage name="salutation" component="div" className="text-red-500 text-sm" />
                                </div>

                                <div>
                                    <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</label>
                                    <Field type="text" disabled name="firstName" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm" />
                                    <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm my-1" />
                                </div>
                                <div>
                                    <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                    <Field type="tel" disabled name="phoneNumber" className="p-2 w-full rounded-md bg-gray-200 border border-gray-300" maxLength={10} />
                                    <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                                </div>

                                <div>
                                    <label htmlFor="source" className="text-sm font-medium text-gray-700">Source</label>
                                    <Field as="select" disabled name="source" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                        <option value="">Select Source</option>
                                        <option value="walkIn">Walk In</option>
                                        <option value="mobileApp">Mobile App</option>
                                        <option value="website">Website</option>
                                        <option value="call">Call</option>
                                    </Field>
                                    <ErrorMessage name="source" component="div" className="text-red-500 text-sm" />
                                </div>

                            </div>
                        </Form>
                    )}
                </Formik>
            </div>

            <div className='flex justify-center w-full'>
                <Button
                    onClick={() => { navigate('/dashboard/customers'); }}
                    className='my-6 px-8 text-white border-2 rounded-xl'
                >
                    Back
                </Button>
            </div>
        </>
    );
};

export default CustomerDetails;