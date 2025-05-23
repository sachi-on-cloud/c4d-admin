import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { Button } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
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
                    kilometerRoundPrice: data?.data?.kilometerRoundPrice,
                    kilometerRoundPriceMVP: data?.data?.kilometerRoundPriceMVP,
                    kilometerRoundPriceSuv: data?.data?.kilometerRoundPriceSuv,
                    kilometerRoundPriceSedan: data?.data?.kilometerRoundPriceSedan,
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

                    extraKilometerPrice: data?.data?.extraKilometerPrice || 0,
                    extraKilometerPriceMVP: data?.data?.extraKilometerPriceMVP || 0,
                    extraKilometerPriceSuv: data?.data?.extraKilometerPriceSuv || 0,
                    extraKilometerPriceSedan: data?.data?.extraKilometerPriceSedan || 0,

                    extraKilometerRoundPrice: data?.data?.extraKilometerRoundPrice || 0,
                    extraKilometerRoundPriceMVP: data?.data?.extraKilometerRoundPriceMVP || 0,
                    extraKilometerRoundPriceSuv: data?.data?.extraKilometerRoundPriceSuv || 0,
                    extraKilometerRoundPriceSedan: data?.data?.extraKilometerRoundPriceSedan || 0,

                    additionalMinChargeMVP:data?.data?.additionalMinChargeMVP,
                    additionalMinChargeSuv:data?.data?.additionalMinChargeSuv,
                    additionalMinChargeSedan:data?.data?.additionalMinChargeSedan,
                    cancelMins: Utils.convertTimeFormatToMinutes(data?.data?.cancelMins),
                    cancelCharge: data?.data?.cancelCharge,

                    acKilometerPrice: data?.data?.acKilometerPrice || 0,
                    acKilometerPriceMVP: data?.data?.acKilometerPriceMVP || 0,
                    acKilometerPriceSuv: data?.data?.acKilometerPriceSuv || 0,
                    acKilometerPriceSedan: data?.data?.acKilometerPriceSedan || 0,

                    acKilometerRoundPrice: data?.data?.acKilometerRoundPrice || 0,
                    acKilometerRoundPriceMVP: data?.data?.acKilometerRoundPriceMVP || 0,
                    acKilometerRoundPriceSuv: data?.data?.acKilometerRoundPriceSuv || 0,
                    acKilometerRoundPriceSedan: data?.data?.acKilometerRoundPriceSedan || 0,

                    acExtraKilometerPrice: data?.data?.acExtraKilometerPrice || 0,
                    acExtraKilometerPriceMVP: data?.data?.acExtraKilometerPriceMVP || 0,
                    acExtraKilometerPriceSuv: data?.data?.acExtraKilometerPriceSuv || 0,
                    acExtraKilometerPriceSedan: data?.data?.acExtraKilometerPriceSedan || 0,

                    acExtraKilometerRoundPrice: data?.data?.acExtraKilometerRoundPrice || 0,
                    acExtraKilometerRoundPriceMVP: data?.data?.acExtraKilometerRoundPriceMVP || 0,
                    acExtraKilometerRoundPriceSuv: data?.data?.acExtraKilometerRoundPriceSuv || 0,
                    acExtraKilometerRoundPriceSedan: data?.data?.acExtraKilometerRoundPriceSedan || 0,
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
                            {initialValues?.type !== 'Outstation' && <div> 
                                <label className="text-sm font-medium text-gray-700">Kilometer</label>
                                <Field type="number" name="kilometer" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>}
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
                            { initialValues?.type && (<div className={initialValues.type === 'Outstation' ? 'grid grid-cols-10 gap-2' : 'grid grid-cols-4 gap-2'}>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare</label>
                                <Field type="number" name="baseFare" className="p-2  w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>
                            {initialValues?.type !== 'Outstation' &&
                            <div>
                                <label className="text-sm font-medium text-gray-700">Price</label>
                                <Field type="number" name="price" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled/>
                            </div>
                            }
                            {initialValues?.type === 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">kilometer Round Price</label>
                                <Field type="number" name="kilometerRoundPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>}
                            <div>
                                <label className="text-sm font-medium text-gray-700">Kilometer Rate</label>
                                <Field type="number" name="kilometerPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                            </div>
                                {initialValues?.type === 'Outstation' && 
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Ac Kilometer Price</label>
                                        <Field type="number" name="acKilometerPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Ac Kilometer Round Price</label>
                                        <Field type="number" name="acKilometerRoundPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}

                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Extra Kilometer Price</label>
                                        <Field type="number" name="extraKilometerPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}

                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Extra Kilometer Round Price</label>
                                        <Field type="number" name="extraKilometerRoundPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Ac Extra Kilometer Price</label>
                                        <Field type="number" name="acExtraKilometerPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Ac Extra Kilometer Round Price</label>
                                        <Field type="number" name="acExtraKilometerRoundPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Additional Min</label>
                                        <Field type="number" name="additionalMinCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>
                                </div>)}
                            </div>
                            {/* new entry Sedan */}
                            <br/>
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Sedan</h2>
                                { initialValues?.type && (<div className={initialValues.type === 'Outstation' ? 'grid grid-cols-10 gap-2' : 'grid grid-cols-4 gap-2'}>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">BaseFare (Sedan)</label>
                                        <Field type="number" name="baseFareSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>
                                    {initialValues?.type !== 'Outstation' &&
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Price (Sedan)</label>
                                            <Field type="number" name="priceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                        </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">kilometer Round Price (Sedan)</label>
                                        <Field type="number" name="kilometerRoundPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Kilometer Price (Sedan)</label>
                                        <Field type="number" name="kilometerPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>
                                    {initialValues?.type === 'Outstation' && 
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Ac Kilometer Price (Sedan)</label>
                                        <Field type="number" name="acKilometerPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Ac Kilometer Round Price Sedan</label>
                                        <Field type="number" name="acKilometerRoundPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}

                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Extra Kilometer Price Sedan</label>
                                        <Field type="number" name="extraKilometerPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}

                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Extra Kilometer Round Price Sedan</label>
                                        <Field type="number" name="extraKilometerRoundPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Ac Extra Kilometer Price Sedan</label>
                                        <Field type="number" name="acExtraKilometerPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Ac Extra Kilometer Round Price Sedan</label>
                                        <Field type="number" name="acExtraKilometerRoundPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Additional Min Charge (Sedan)</label>
                                        <Field type="number" name="additionalMinChargeSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>
                                </div>
                                )}
                            </div>
                            <br />
                            {/* new entry SUV */}
                            <div>
                                <h2 className="text-2xl font-bold mb-4">SUV</h2>
                                {initialValues?.type && (<div className={initialValues.type === 'Outstation' ? 'grid grid-cols-10 gap-2' : 'grid grid-cols-4 gap-2'}>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Base Fare (Suv)</label>
                                        <Field type="number" name="baseFareSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>
                                    {initialValues?.type !== 'Outstation' &&
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Price (Suv)</label>
                                            <Field type="number" name="priceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                        </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">kilometer Round Price (Suv)</label>
                                        <Field type="number" name="kilometerRoundPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Kilometer Price (Suv)</label>
                                        <Field type="number" name="kilometerPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>
                                    {initialValues?.type === 'Outstation' && 
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Ac Kilometer Price Suv</label>
                                        <Field type="number" name="acKilometerPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Ac Kilometer Round Price Suv</label>
                                        <Field type="number" name="acKilometerRoundPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Extra Kilometer Price Suv</label>
                                        <Field type="number" name="extraKilometerPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}

                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Extra Kilometer Round Price Suv</label>
                                        <Field type="number" name="extraKilometerRoundPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Ac Extra Kilometer Price Suv</label>
                                        <Field type="number" name="acExtraKilometerPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Ac Extra Kilometer Round Price Suv</label>
                                        <Field type="number" name="acExtraKilometerPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Additional Min Charge (Suv)</label>
                                        <Field type="number" name="additionalMinChargeSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>
                                </div>
                                )}
                            </div>
                            <br />
                            {/* new entry MUV */}
                            <div>
                                <h2 className="text-2xl font-bold mb-4">MUV</h2>
                                {initialValues?.type && (<div className={initialValues.type === 'Outstation' ? 'grid grid-cols-10 gap-2' : 'grid grid-cols-4 gap-2'}>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Base Fare (MUV)</label>
                                        <Field type="number" name="baseFareMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>
                                    {initialValues?.type !== 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Price (MUV)</label>
                                        <Field type="number" name="priceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">kilometer Round Price (MUV)</label>
                                        <Field type="number" name="kilometerRoundPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Kilometer Price (MUV)</label>
                                        <Field type="number" name="kilometerPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>
                                        {initialValues?.type === 'Outstation' && 
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Ac Kilometer Price (MUV)</label>
                                        <Field type="number" name="acKilometerPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Ac Kilometer Round Price MVP</label>
                                        <Field type="number" name="acKilometerRoundPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Extra Kilometer Price (MUV)</label>
                                        <Field type="number" name="extraKilometerPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}

                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Extra Kilometer Round Price (MUV)</label>
                                        <Field type="number" name="extraKilometerRoundPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Ac Extra Kilometer Price MVP</label>
                                        <Field type="number" name="acExtraKilometerPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    {initialValues?.type === 'Outstation' && <div>
                                        <label className="text-sm font-medium text-gray-700">Ac Extra Kilometer Round Price MVP</label>
                                        <Field type="number" name="acExtraKilometerRoundPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Additional Min Charge (MUV)</label>
                                        <Field type="number" name="additionalMinChargeMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                    </div>
                                </div>
                                )}
                                <br/>
                            </div>
                        </div>

                        <div className="flex flex-row">
                            <Button fullWidth onClick={() => navigate('/dashboard/users/master-price')} className={`my-6 mx-2 ${ColorStyles.backButton}`}>
                                Back
                            </Button>
                            <Button fullWidth className={`my-6 mx-2 border-2 border-gray-400 rounded-xl ${ColorStyles.editButton
                                }`} onClick={() => navigate(`/dashboard/users/master-price/rentals-edit/${id}`)}>
                                Edit
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
            <MasterPriceLog id={id} />
        </div>
    );
};

export default RentalsPriceMasterDetails;
