import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { Alert, Button } from '@material-tailwind/react';
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDownIcon, ChevronUpIcon, StarIcon } from '@heroicons/react/24/solid';
import CustomerWalletLog from '@/components/CustomerWalletLog';

const CustomerDetails = () => {
    const navigate = useNavigate();
    const [driverVal, setDriverVal] = useState({});
    const { id } = useParams();
    const [showMore, setShowMore] = useState(false);
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

        tripId: driverVal?.Bookings?.id || '',
        tripDate: driverVal?.Bookings?.endDate || '',
        tripTime: driverVal?.Bookings?.endTime || '',
        driverName: driverVal?.Driver?.firstName || '',
        rating: driverVal?.Bookings?.CustomerFeedbacks?.rating || '',
        comment: driverVal?.Bookings?.CustomerFeedbacks?.comments || '',
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
                                        <option value="Miss">Miss</option>
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
                                        <option value="Walk In">Walk In</option>
                                        <option value="Mobile App">Mobile App</option>
                                        <option value="Website">Website</option>
                                        <option value="Call">Call</option>
                                    </Field>
                                    <ErrorMessage name="source" component="div" className="text-red-500 text-sm" />
                                </div>
                            </div>
                            <CustomerWalletLog customerId={id} />
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setShowMore(!showMore)}
                                    className="text-black-600 text-sm mb-2 p-1  border-blue-gray-100 rounded-lg shadow-sm"
                                >
                                    <div className='flex font-medium'>
                                        {showMore ? (
                                            <>
                                                <ChevronUpIcon className="w-5 h-5 ml-0 text-black" />
                                                View Less
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDownIcon className="w-5 h-5 ml-0 text-black" />
                                                View More
                                            </>
                                        )}
                                    </div>
                                </button>
                                {showMore && (
                                    <table className="w-full border border-gray-300 text-sm">
                                        <thead className="bg-gray-300 text-left">
                                            <tr>
                                                <th className="p-2 border">Trip ID</th>
                                                <th className="p-2 border">End Date</th>
                                                <th className="p-2 border">End Time</th>
                                                <th className="p-2 border">Driver Name</th>
                                                <th className="p-2 border">Rating</th>
                                                <th className="p-2 border">Comment</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {driverVal?.Bookings?.length > 0 ? (
                                                driverVal.Bookings.map((trip) => {
                                                    const rating = trip?.CustomerFeedbacks?.[0]?.rating ?? null;
                                                    const comment = trip?.CustomerFeedbacks?.[0]?.comments ?? 'No feedback given';
                                                    const driverName = trip?.Driver?.firstName ?? 'N/A';

                                                    return (
                                                        <tr key={trip.id}>
                                                            <td className="p-2 border">{trip.id}</td>
                                                            <td className="p-2 border">{trip.endDate}</td>
                                                            <td className="p-2 border">{trip.endTime}</td>
                                                            <td className="p-2 border">{driverName}</td>
                                                            <td className="p-2 border flex">
                                                                {rating !== null ? rating : 'No feedback given'}
                                                                <StarIcon className="w-5 h-5 text-yellow-500" />
                                                            </td>
                                                            <td className="p-2 border">
                                                                {comment}
                                                            </td>

                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="p-2 border text-gray-500 text-center">
                                                        No trips available.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}

                            </div>
                        </Form>
                    )}
                </Formik>
            </div>

            <div className='flex justify-center w-full'>
                <Button
                    onClick={() => { navigate('/dashboard/customers'); }}
                    className={`my-6 px-8 ${ColorStyles.backButton}`}
                >
                    Back
                </Button>
            </div>
        </>
    );
};

export default CustomerDetails;