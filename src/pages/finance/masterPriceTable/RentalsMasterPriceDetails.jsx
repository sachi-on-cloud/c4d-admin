import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { Button } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { Utils } from '@/utils/utils';
import MasterPriceLog from './MasterPriceLog';

const RentalsPriceMasterDetails = () => {
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
                    // carType: data?.data?.carType,
                    type: data?.data?.type,
                    period: data?.data?.period,
                    baseFare: data?.data?.baseFare,
                    kilometer: data?.data?.kilometer,
                    kilometerPrice: data?.data?.kilometerPrice,
                    additionalMinCharge: data?.data?.additionalMinCharge,
                    tollCharge: data?.data?.tollCharge,
                    driverCharge: data?.data?.driverCharge,
                    extraKmPrice: data?.data?.extraKmPrice,
                    nightHoursFrom: convertToTimeFormat(data?.data?.nightHoursFrom),
                    nightHoursTo: convertToTimeFormat(data?.data?.nightHoursTo),
                    nightCharge: data?.data?.nightCharge,
                    // cancellationMins: Utils.convertTimeFormatToMinutes(data?.data?.cancelMins),
                    // cancellationCharge: data?.data?.cancelCharge,
                    status: data?.data?.status == 1 ? "ACTIVE" : "INACTIVE",
                    price:data?.data?.price,
                    priceMVP:data?.data?.priceMVP,
                    priceSuv:data?.data?.priceSuv,
                    priceSedan:data?.data?.priceSedan,
                    baseFareMVP:data?.data?.baseFareMVP,
                    baseFareSuv:data?.data?.baseFareSuv,
                    baseFareSedan:data?.data?.baseFareSedan,
                    kilometerPriceMVP:data?.data?.kilometerPriceMVP,
                    kilometerPriceSuv:data?.data?.kilometerPriceSuv,
                    kilometerPriceSedan:data?.data?.kilometerPriceSedan,
                    additionalMinChargeMVP:data?.data?.additionalMinChargeMVP,
                    additionalMinChargeSuv:data?.data?.additionalMinChargeSuv,
                    additionalMinChargeSedan:data?.data?.additionalMinChargeSedan,
                    cancelMins: Utils.convertTimeFormatToMinutes(data?.data?.cancelMins),
                    cancelCharge: data?.data?.cancelCharge,

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
            <h2 className="text-2xl font-bold mb-4">Rentals Pricing Details</h2>
            <Formik initialValues={initialValues} enableReinitialize>
                {() => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Trip Type</label>
                                <Field type="string" name="type" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Package Type</label>
                                <Field type="string" name="period" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Kilometer</label>
                                <Field type="number" name="kilometer" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <Field type="string" name="status" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional KM Rate</label>
                                <Field type="number" name="extraKmPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>
                            {initialValues?.type === 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">Toll Charge</label>
                                <Field type="number" name="tollCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>}
                            {initialValues?.type === 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">Driver Charge</label>
                                <Field type="number" name="driverCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>}
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
                                <label className="text-sm font-medium text-gray-700">Cancellation Mins</label>
                                <Field type="number" name="cancelMins" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Cancellation Charge</label>
                                <Field type="number" name="cancelCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Night Charge</label>
                                <Field type="number" name="nightCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>
                            </div>

                            <div>
                            {/* new entry Mini */}
                            <div>
                            <h2 className="text-2xl font-bold mb-4">Mini</h2>
                            <div className="grid grid-cols-4 gap-5">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare</label>
                                <Field type="number" name="baseFare" className="p-2  w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-700">Price</label>
                                <Field type="number" name="price" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled/>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-700">Kilometer Rate</label>
                                <Field type="number" name="kilometerPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional Min</label>
                                <Field type="number" name="additionalMinCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>
                            </div>
                            </div>
                            {/* new entry Sedan */}
                            <br/>
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Sedan</h2>
                            <div className="grid grid-cols-4 gap-5">
                           
                                <div>
                                    <label className="text-sm font-medium text-gray-700">BaseFare (Sedan)</label>
                                    <Field type="number" name="baseFareSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Price (Sedan)</label>
                                    <Field type="number" name="priceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Kilometer Price (Sedan)</label>
                                    <Field type="number" name="kilometerPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Additional Min Charge (Sedan)</label>
                                    <Field type="number" name="additionalMinChargeSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                </div>
                            </div>
                            </div>
                            <br/>
                            {/* new entry SUV */}
                            <div>
                            <h2 className="text-2xl font-bold mb-4">SUV</h2>     
                             <div className="grid grid-cols-4 gap-5">
                              <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare (Suv)</label>
                                <Field type="number" name="baseFareSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled/>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Price (Suv)</label>
                                <Field type="number" name="priceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled/>
                            </div>                            
                            <div>
                                <label className="text-sm font-medium text-gray-700">Kilometer Price (Suv)</label>
                                <Field type="number" name="kilometerPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>                            
                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional Min Charge (Suv)</label>
                                <Field type="number" name="additionalMinChargeSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled/>
                            </div>
                            </div>
                            </div>
                            <br/>
                            {/* new entry MUV */}
                            <div>
                            <h2 className="text-2xl font-bold mb-4">MUV</h2>
                            <div className="grid grid-cols-4 gap-5">
                              <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare (MUV)</label>
                                <Field type="number" name="baseFareMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled/>
                            </div>  
                            <div>
                                <label className="text-sm font-medium text-gray-700">Price (MUV)</label>
                                <Field type="number" name="priceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled/>
                            </div>                            
                            <div>
                                <label className="text-sm font-medium text-gray-700">Kilometer Price (MUV)</label>
                                <Field type="number" name="kilometerPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional Min Charge (MUV)</label>
                                <Field type="number" name="additionalMinChargeMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled/>
                            </div>
                            </div>
                            <br/>
                            </div>
                        </div>
                            
                        <div className="flex flex-row">
                            <Button fullWidth onClick={() => navigate('/dashboard/users/master-price')} className="my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl">
                                Back
                            </Button>
                            <Button fullWidth className="my-6 mx-2 text-white border-2 border-gray-400 bg-black rounded-xl" onClick={() => navigate(`/dashboard/users/master-price/rentals-edit/${id}`)}>
                                Edit
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
            <MasterPriceLog id={id}/>
        </div>
    );
};

export default RentalsPriceMasterDetails;
