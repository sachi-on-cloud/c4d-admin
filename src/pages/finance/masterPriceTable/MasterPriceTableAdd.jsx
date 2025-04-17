import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Alert, Button } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { Utils } from '@/utils/utils';

const RATE_PARAMETER_OPTIONS = [
    { value: 'RAINY_DAY', label: 'Rainy Day' },
    { value: 'PREMIUM_RIDE', label: 'Premium Ride' },
    { value: 'MID_TRIP_CANCELLATION', label: 'Mid Trip Cancellation' },
    { value: 'OFF_PEAK', label: 'Off Peak' },
    { value: 'DURING_PEAK', label: 'During Peak' },
    { value: 'NORMAL_RIDE', label: 'Normal Ride' },
];

const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
];

const PRICE_SCHEMA = Yup.object().shape({
    baseFare: Yup.number().required('Base Fare is required'),
    ratePerKm: Yup.number().required('Rate Per Km is required'),
    ratePerMin: Yup.number().required('Rate Per Min is required'),
    additionalMin: Yup.number().required('Additional Min is required'),
    rateParameter: Yup.string().required('Rate Parameter is required'),
    surchargePercentage: Yup.number().required('Surcharge Percentage is required'),
    nightCharge: Yup.number().required('Night Charge is required'),
    cancellationMins: Yup.number().required('Cancellation Mins is required'),
    cancellationCharge: Yup.number().required('Cancellation Charge is required'),
    status: Yup.string().required('Status is required'),
});

const PriceAdd = () => {
    const [alert, setAlert] = useState(false);
    const navigate = useNavigate();

    const initialValues = {
        baseFare: '',
        baseFareMVP: '',
        ratePerKm: '',
        ratePerKmMVP: '',
        ratePerMin: '',
        additionalMin: '',
        rateParameter: '',
        surchargePercentage: '',
        nightHoursFrom: '',
        nightHoursTo: '',
        nightCharge: '',
        cancellationMins: '',
        cancellationCharge: '',
        status: 'ACTIVE',
    };

    const onSubmit = async (values, { setSubmitting }) => {
        try {
            console.log('Submitted Price Data:', values);
            const reqBody = {
                'baseFare': values.baseFare,
                'baseFareMVP': values.baseFareMVP,
                'kilometerPrice': values.ratePerKm,
                'kilometerPriceMVP': values.ratePerKmMVP,
                'minCharge': values.ratePerMin,
                'rateParameter': values.rateParameter,
                'additionalMinCharge': values.additionalMin,
                'surChargePercentage': values.surchargePercentage,
                'nightHoursFrom': Utils.formatTimeWithSeconds(values.nightHoursFrom),
                'nightHoursTo': Utils.formatTimeWithSeconds(values.nightHoursTo),
                'nightCharge': values.nightCharge,
                'cancelMins': Utils.convertMinutesToTimeFormat(values.cancellationMins),
                'cancelCharge': values.cancellationCharge,
                'type': 'Rides',
                'serviceType': 'RIDES',
                'period': 'Rides',
                'status': values.status == "ACTIVE" ? 1 : 0,
            }
            const data = await ApiRequestUtils.post(API_ROUTES.ADD_RIDES_PRICE_TABLE, reqBody);
            if (data?.success) {
                navigate('/dashboard/users/master-price')
            }
        } catch (error) {
            console.error('Error saving price details:', error);
            setAlert({ message: 'Error saving data', color: 'red' });
        }
        setSubmitting(false);
    };

    return (
        <div className="p-4 mx-auto">
            {alert && (
                <div className='mb-2'>
                    <Alert color={alert.color} className='py-3 px-6 rounded-xl'>
                        {alert.message}
                    </Alert>
                </div>
            )}
            <h2 className="text-2xl font-bold mb-4">Add Pricing Details</h2>
            <Formik initialValues={initialValues} validationSchema={PRICE_SCHEMA} onSubmit={onSubmit} enableReinitialize>
                {({ handleSubmit, setFieldValue, isValid, dirty }) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare(Mini, SUV, Sedan)</label>
                                <Field type="number" name="baseFare" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="baseFare" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare (MUV)</label>
                                <Field type="number" name="baseFareMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="baseFareMVP" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Rate Per Km(Mini, SUV, Sedan)</label>
                                <Field type="number" name="ratePerKm" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="ratePerKm" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Rate Per Km (MUV)</label>
                                <Field type="number" name="ratePerKmMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="ratePerKmMVP" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Rate Per Min</label>
                                <Field type="number" name="ratePerMin" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="ratePerMin" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional Min</label>
                                <Field type="number" name="additionalMin" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="additionalMin" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <Select
                                    options={STATUS_OPTIONS}
                                    onChange={(selectedOption) => setFieldValue('status', selectedOption.value)}
                                    defaultValue={STATUS_OPTIONS[0]}
                                    placeholder="Select Status"
                                    className="w-full"
                                />
                                <ErrorMessage name="status" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Rate Parameter</label>
                                <Select
                                    options={RATE_PARAMETER_OPTIONS}
                                    onChange={(selectedOption) => setFieldValue('rateParameter', selectedOption.value)}
                                    placeholder="Select Rate Parameter"
                                    className="w-full"
                                />
                                <ErrorMessage name="rateParameter" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Surcharge Percentage</label>
                                <Field type="number" name="surchargePercentage" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="surchargePercentage" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Night Hours (10:00 PM - 06:00 AM)</label>
                                <div className="flex items-center">
                                    <Field
                                        type="time"
                                        name="nightHoursFrom"
                                        min="22:00"
                                        max="23:59"
                                        className="p-2 w-full rounded-l-md border-gray-300 shadow-sm"
                                    />
                                    <span className="px-3 py-2 bg-gray-100 border-t border-b border-gray-300">to</span>
                                    <Field
                                        type="time"
                                        name="nightHoursTo"
                                        min="05:00"
                                        max="08:00"
                                        className="p-2 w-full rounded-r-md border-gray-300 shadow-sm"
                                    />
                                </div>
                                <ErrorMessage name="nightHoursFrom" component="div" className="text-red-500 text-sm" />
                                <ErrorMessage name="nightHoursTo" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Night Charge</label>
                                <Field type="number" name="nightCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="nightCharge" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Cancellation Mins</label>
                                <Field type="number" name="cancellationMins" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="cancellationMins" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Cancellation Charge</label>
                                <Field type="number" name="cancellationCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="cancellationCharge" component="div" className="text-red-500 text-sm" />
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <Button fullWidth onClick={() => navigate('/dashboard/users/master-price')} className="my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl">
                                Cancel
                            </Button>
                            <Button fullWidth color="black" onClick={handleSubmit} disabled={!dirty || !isValid} className="my-6 mx-2">
                                Continue
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default PriceAdd;
