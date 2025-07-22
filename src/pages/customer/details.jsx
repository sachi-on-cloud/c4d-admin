import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { Alert, Button } from '@material-tailwind/react';
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDownIcon, ChevronUpIcon, StarIcon } from '@heroicons/react/24/solid';
import CustomerWalletLog from '@/components/CustomerWalletLog';
import CustomerBookingNotes from '@/components/CustomerBookingNotes';
import moment from "moment";

const CustomerDetails = () => {
    const navigate = useNavigate();
    const [driverVal, setDriverVal] = useState({});
    const { id } = useParams();
    const [notes, setNotes] = useState([]);
    const [showMore, setShowMore] = useState(false);
    useEffect(() => {
        if (id) {
            fetchItem(id);
        }
    }, [id]);
    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_CUSTOMER + `/${itemId}`);
        setDriverVal(data.data);
        if (Array.isArray(data.notes)) {
            setNotes(data.notes);
        }
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
                                    <h2 className="text-2xl font-bold mb-4">Feedback Details</h2>
                                    <table className="w-full border bg-blue-gray-50 py-3 text-sm">
                                        <thead className=" text-left">
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
                                                    const comment = trip?.CustomerFeedbacks?.[0]?.comments ?? '-';
                                                    const driverName = trip?.Driver?.firstName ?? 'N/A';

                                                    return (
                                                        <tr key={trip.id}>
                                                            <td className="p-2 border">{trip.id}</td>
                                                            <td className="p-2 border">{trip.endDate}</td>
                                                            <td className="p-2 border">{trip.endTime}</td>
                                                            <td className="p-2 border">{driverName}</td>
                                                            <td className="p-2 border flex">
                                                                {rating !== null ? rating : '0'}
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

                            </div>
                        </Form>
                    )}
                </Formik>
                <div className='py-3'>
                    <CustomerBookingNotes customerId={id} />
                <div className="mt-6">
                <h2 className="text-xl font-bold mb-4">Existing Notes</h2>
                <div className="flex-1">
                    {notes.length === 0 ? (
                    <p className="text-center text-gray-500 text-base mt-5">No notes available.</p>
                    ) : (
                    <ul className="space-y-3">
                        {notes.map((note) => (
                        <li
                            key={note?.id}
                            className="bg-white rounded-lg p-3 shadow-sm border"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="inline-block px-2 py-0.5 text-xs text-white bg-blue-600 rounded">
                                {note.User.name || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                  <span className="inline-block px-2 py-0.5 text-xs text-white bg-blue-600 rounded">
                                {note?.noteType || 'Note'}
                            </span>
                            <span className="text-sm text-gray-500">
                                {moment(note?.created_at).format('DD-MM-YYYY / hh:mm A')}
                                </span>
                            </div>
                            <p className="text-base text-gray-700">{note?.notes}</p>
                        </li>
                        ))}
                    </ul>
                    )}
                </div>
                </div>
                </div> 
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