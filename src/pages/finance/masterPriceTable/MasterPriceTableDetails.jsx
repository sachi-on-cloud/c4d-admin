import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { Button } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { Utils } from '@/utils/utils';

const PriceDetails = () => {
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
                    baseFare: data?.data?.baseFare,
                    baseFareMVP: data?.data?.baseFareMVP,
                    ratePerKm: data?.data?.kilometerPrice,
                    ratePerKmMVP: data?.data?.kilometerPriceMVP,
                    ratePerMin: data?.data?.minCharge,
                    additionalMin: data?.data?.additionalMinCharge,
                    rateParameter: data?.data?.rateParameter,
                    surchargePercentage: data?.data?.surChargePercentage,
                    nightHoursFrom: convertToTimeFormat(data?.data?.nightHoursFrom),
                    nightHoursTo: convertToTimeFormat(data?.data?.nightHoursTo),
                    nightCharge: data?.data?.nightCharge,
                    cancellationMins: Utils.convertTimeFormatToMinutes(data?.data?.cancelMins),
                    cancellationCharge: data?.data?.cancelCharge,
                });
            }
        } catch (error) {
            console.error("Error fetching price details:", error);
        }
    };

    const convertToTimeFormat = (timeString) => {
        return timeString ? timeString.slice(0, 5) : "";
    };

    return (
        <div className="p-4 mx-auto">
            <h2 className="text-2xl font-bold mb-4">Pricing Details</h2>
            <Formik initialValues={initialValues} enableReinitialize>
                {() => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare (Mini, SUV, Sedan)</label>
                                <Field type="number" name="baseFare" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare (MVP)</label>
                                <Field type="number" name="baseFareMVP" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Rate Per Km (Mini, SUV, Sedan)</label>
                                <Field type="number" name="ratePerKm" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Rate Per Km (MVP)</label>
                                <Field type="number" name="ratePerKmMVP" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Rate Per Min</label>
                                <Field type="number" name="ratePerMin" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional Min</label>
                                <Field type="number" name="additionalMin" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Rate Parameter</label>
                                <Field type="text" name="rateParameter" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Surcharge Percentage</label>
                                <Field type="number" name="surchargePercentage" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
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
                                        disabled
                                    />
                                    <span className="px-3 py-2 bg-gray-100 border-t border-b border-gray-300">to</span>
                                    <Field
                                        type="time"
                                        name="nightHoursTo"
                                        min="05:00"
                                        max="08:00"
                                        className="p-2 w-full rounded-r-md border-gray-300 shadow-sm"
                                        disabled
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Night Charge</label>
                                <Field type="number" name="nightCharge" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Cancellation Mins</label>
                                <Field type="number" name="cancellationMins" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Cancellation Charge</label>
                                <Field type="number" name="cancellationCharge" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <Button fullWidth onClick={() => navigate('/dashboard/users/master-price')} className="my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl">
                                Back
                            </Button>
                            <Button fullWidth className="my-6 mx-2 text-white border-2 border-gray-400 bg-black rounded-xl" onClick={()=>navigate(`/dashboard/users/master-price/rides-edit/${id}`)}>
                                Edit
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default PriceDetails;
