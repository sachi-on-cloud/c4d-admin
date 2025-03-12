import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import Select from 'react-select';
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
    baseFareMVP: Yup.number().required('Base Fare (MVP) is required'),
    ratePerKm: Yup.number().required('Rate Per Km is required'),
    ratePerKmMVP: Yup.number().required('Rate Per Km (MVP) is required'),
    ratePerMin: Yup.number().required('Rate Per Min is required'),
    additionalMin: Yup.number().required('Additional Min is required'),
    rateParameter: Yup.string().required('Rate Parameter is required'),
    surchargePercentage: Yup.number().required('Surcharge Percentage is required'),
    // nightHours: Yup.number().required('Night Hours is required'),
    nightCharge: Yup.number().required('Night Charge is required'),
    cancellationMins: Yup.number().required('Cancellation Mins is required'),
    cancellationCharge: Yup.number().required('Cancellation Charge is required'),
    status: Yup.string().required('Status is required'),
});

const RentalsMasterPriceEdit = () => {
    const [initialValues, setInitialValues] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPriceDetails();
    }, []);

    const fetchPriceDetails = async () => {
        try {
            const data = await ApiRequestUtils.get(`${API_ROUTES.RIDES_PRICE_DETAILS}/${id}`);
            if (data?.success) {
                setInitialValues({
                    baseFare: data.data.baseFare,
                    baseFareMVP: data.data.baseFareMVP,
                    ratePerKm: data.data.kilometerPrice,
                    ratePerKmMVP: data.data.kilometerPriceMVP,
                    ratePerMin: data.data.minCharge,
                    additionalMin: data.data.additionalMinCharge,
                    rateParameter: data.data.rateParameter,
                    surchargePercentage: data.data.surChargePercentage,
                    nightHoursFrom: convertToTimeFormat(data?.data?.nightHoursFrom),
                    nightHoursTo: convertToTimeFormat(data?.data?.nightHoursTo),
                    nightCharge: data.data.nightCharge,
                    cancellationMins: Utils.convertTimeFormatToMinutes(data.data.cancelMins),
                    cancellationCharge: data.data.cancelCharge,
                    status: data.data.status == 1 ? "ACTIVE": 'IN_ACTIVE',
                });
            }
        } catch (error) {
            console.error("Error fetching price details:", error);
        }
    };

    const convertToTimeFormat = (timeString) => {
        return timeString ? timeString.slice(0, 5) : "";
    };

    const onSubmit = async (values) => {
        try {
            const reqBody = {
                packageId:Number(id),
                baseFare: Number(values.baseFare),
                baseFareMVP: Number(values.baseFareMVP),
                kilometerPrice: Number(values.ratePerKm),
                kilometerPriceMVP: Number(values.ratePerKmMVP),
                minCharge: Number(values.ratePerMin),
                additionalMinCharge: Number(values.additionalMin),
                rateParameter: values.rateParameter,
                surChargePercentage: Number(values.surchargePercentage),
                nightHoursFrom: Utils.formatTimeWithSeconds(values.nightHoursFrom),
                nightHoursTo: Utils.formatTimeWithSeconds(values.nightHoursTo),
                nightCharge: Number(values.nightCharge),
                cancelMins: Utils.convertMinutesToTimeFormat(values.cancellationMins),
                cancelCharge: Number(values.cancellationCharge),
                status: values.status == 'ACTIVE' ? 1 : 0,
            };
            const response = await ApiRequestUtils.update(API_ROUTES.RIDES_PRICE_EDIT, reqBody);
            console.log("RESPOSNSE",response);
            if (response?.success) {
                navigate('/dashboard/users/master-price', { state: { priceUpdated: true } });
            }
        } catch (error) {
            console.error("Error updating price details:", error);
        }
    };

    return (
        <div className="p-4 mx-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Pricing Details</h2>
            <Formik initialValues={initialValues} validationSchema={PRICE_SCHEMA} onSubmit={onSubmit} enableReinitialize>
                {({ handleSubmit, setFieldValue, isValid, dirty, values }) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare (Mini, SUV, Sedan)</label>
                                <Field type="number" name="baseFare" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="baseFare" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare (MVP)</label>
                                <Field type="number" name="baseFareMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="baseFareMVP" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Rate Per Km (Mini, SUV, Sedan)</label>
                                <Field type="number" name="ratePerKm" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="ratePerKm" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Rate Per Km (MVP)</label>
                                <Field type="number" name="ratePerKmMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="ratePerKmMVP" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <Select
                                    options={STATUS_OPTIONS}
                                    onChange={(selectedOption) => setFieldValue('status', selectedOption.value)}
                                    value={STATUS_OPTIONS.find(option => option.value === values?.status)}
                                    placeholder="Select Status"
                                    className="w-full"
                                />
                                <ErrorMessage name="status" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Rate Per Min</label>
                                <Field type="number" name="ratePerMin" className="p-2 w-full rounded-md border-gray-300" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional Min</label>
                                <Field type="number" name="additionalMin" className="p-2 w-full rounded-md border-gray-300" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Surcharge Percentage</label>
                                <Field type="number" name="surchargePercentage" className="p-2 w-full rounded-md border-gray-300" />
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
                                <Field type="number" name="nightCharge" className="p-2 w-full rounded-md border-gray-300" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Cancellation Mins</label>
                                <Field type="number" name="cancellationMins" className="p-2 w-full rounded-md border-gray-300" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Cancellation Charge</label>
                                <Field type="number" name="cancellationCharge" className="p-2 w-full rounded-md border-gray-300" />
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <Button fullWidth onClick={() => navigate('/dashboard/users/master-price')} className="my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl">
                                Cancel
                            </Button>
                            <Button fullWidth color="black" onClick={handleSubmit} disabled={!dirty || !isValid} className="my-6 mx-2">
                                Save Changes
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default RentalsMasterPriceEdit;
