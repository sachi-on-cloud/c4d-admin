import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Alert, Button } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { Utils } from '@/utils/utils';

const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
];

const PRICE_SCHEMA = Yup.object().shape({
    // carType: Yup.string().required('Cab Type is required'),
    // serviceType: Yup.string().required('Service Type is required'),
    type: Yup.string().required('Trip Type is required'),
    period: Yup.string().required('Package Type is required'),
    baseFare: Yup.number().required('Base Fare is required'),
    kilometer: Yup.number().required('Kilometer is required'),
    kilometerPrice: Yup.number().required('Kilometer Rate is required'),

    // kilometerRoundPrice: Yup.number().required('kilometer Round Price  is required'),
    // kilometerRoundPriceMVP: Yup.number().required('kilometer Round Price MVP  is required'),
    // kilometerRoundPriceSuv: Yup.number().required('kilometer Round Price Suv  is required'),
    // kilometerRoundPriceSedan: Yup.number().required('kilometer Round Price Sedan is required'),
    
    extraKmPrice: Yup.number().required('Additional Kilometer Price is required'),
    additionalMinCharge: Yup.number().required('Additional Min is required'),
    // tollCharge: Yup.number().required('Toll Charge is required'),
    // driverCharge: Yup.number().required('Driver Charge is required'),
    nightCharge: Yup.number().required('Night Charge is required'),
    cancelMins: Yup.number().required('Cancellation Mins is required'),
    cancelCharge: Yup.number().required('Cancellation Charge is required'),
    status: Yup.string().required('Status is required'),
});

const RentalsPriceMasterAdd = () => {
    const [alert, setAlert] = useState(false);
    const navigate = useNavigate();

    const initialValues = {
        // carType: '',
        serviceType: '',
        type: '',
        period: '',
        kilometer: '',
        tollCharge: '',
        driverCharge: '',
        cancelMins: Utils.convertMinutesToTimeFormat || 0,
        cancelCharge: '',
        nightCharge: '',
        status: 'ACTIVE',

        // baseFare Drop only and Round Trip
        baseFare: '',
        baseFareMVP: '',
        baseFareSuv: '',
        baseFareSedan: '',

        // Price Drop only and Round Trip
        price: '',
        priceMVP: '',
        priceSuv: '',
        priceSedan: '',

        // kilometerPrice Drop only
        kilometerPrice: '',
        kilometerPriceMVP: '',
        kilometerPriceSuv: '',
        kilometerPriceSedan: '',

        // kilometerPrice Round Trip
        kilometerRoundPrice: '',
        kilometerRoundPriceMVP: '',
        kilometerRoundPriceSuv: '',
        kilometerRoundPriceSedan: '',

        // additionalMinCharge Drop and Round Trip
        additionalMinCharge: '',
        additionalMinChargeMVP: '',
        additionalMinChargeSuv: '',
        additionalMinChargeSedan: '',

        // extraKilometerPrice Drop 
        extraKilometerPrice: '',
        extraKilometerPriceMVP: '',
        extraKilometerPriceSuv: '',
        extraKilometerPriceSedan: '',

        // extraKilometerRoundPrice Round Trip
        extraKilometerRoundPrice: '',
        extraKilometerRoundPriceMVP: '',
        extraKilometerRoundPriceSuv: '',
        extraKilometerRoundPriceSedan: '',

        // acKilometerPrice Drop only
        acKilometerPrice: "",
        acKilometerPriceMVP: "",
        acKilometerPriceSuv: "",
        acKilometerPriceSedan: "",

        //acKilometerRoundPrice Round Trip
        acKilometerRoundPrice: "",
        acKilometerRoundPriceMVP: "",
        acKilometerRoundPriceSuv: "",
        acKilometerRoundPriceSedan: "",

        //acExtraKilometerPrice Drop Only
        acExtraKilometerPrice: "",
        acExtraKilometerPriceMVP: "",
        acExtraKilometerPriceSuv: "",
        acExtraKilometerPriceSedan: "",

        //acExtraKilometerRoundPrice Round Trip
        acExtraKilometerRoundPrice: "",
        acExtraKilometerRoundPriceMVP: "",
        acExtraKilometerRoundPriceSuv: "",
        acExtraKilometerRoundPriceSedan: "",
    };

    const onSubmit = async (values, { setSubmitting }) => {
        try {
            const reqBody = {
                // 'carType': values.carType,
                'serviceType': 'RENTAL',
                'type': String(values.type),
                'period': String(values.period),
                'baseFare': Number(values.baseFare),
                'kilometer': Number(values.kilometer),
                'kilometerPrice': Number(values.kilometerPrice),

                'kilometerRoundPrice': values?. type === 'Outstation' ? values.kilometerRoundPrice : 0,
                'kilometerRoundPriceMVP': values?. type === 'Outstation' ? values.kilometerRoundPriceMVP : 0,
                'kilometerRoundPriceSuv': values?. type === 'Outstation' ? values.kilometerRoundPriceSuv : 0,
                'kilometerRoundPriceSedan': values?. type === 'Outstation' ? values.kilometerRoundPriceSedan : 0,

                'extraKilometerPrice': values?.type === 'Outstation' ? values.extraKilometerPrice : 0,
                'extraKilometerPriceMVP': values?.type === 'Outstation' ? values.extraKilometerPriceMVP : 0,
                'extraKilometerPriceSuv': values?.type === 'Outstation' ? values.extraKilometerPriceSuv : 0,
                'extraKilometerPriceSedan': values?.type === 'Outstation' ? values.extraKilometerPriceSedan : 0,

                'extraKilometerRoundPrice': values?.type === 'Outstation' ? values.extraKilometerRoundPrice : 0,
                'extraKilometerRoundPriceMVP': values?.type === 'Outstation' ? values.extraKilometerRoundPriceMVP : 0,
                'extraKilometerRoundPriceSuv': values?.type === 'Outstation' ? values.extraKilometerRoundPriceSuv : 0,
                'extraKilometerRoundPriceSedan': values?.type === 'Outstation' ? values.extraKilometerRoundPriceSedan : 0,

                'acKilometerRoundPrice': values?.type === 'Outstation' ? values.acKilometerRoundPrice : 0,
                'acKilometerRoundPriceMVP': values?.type === 'Outstation' ? values.acKilometerRoundPriceMVP : 0,
                'acKilometerRoundPriceSuv': values?.type === 'Outstation' ? values.acKilometerRoundPriceSuv : 0,
                'acKilometerRoundPriceSedan': values?.type === 'Outstation' ? values.acKilometerRoundPriceSedan : 0,

                'acExtraKilometerPrice': values?.type === 'Outstation' ? values.acExtraKilometerPrice : 0,
                'acExtraKilometerPriceMVP': values?.type === 'Outstation' ? values.acExtraKilometerPriceMVP : 0,
                'acExtraKilometerPriceSuv': values?.type === 'Outstation' ? values.acExtraKilometerPriceSuv : 0,
                'acExtraKilometerPriceSedan': values?.type === 'Outstation' ? values.acExtraKilometerPriceSedan : 0,

                'acExtraKilometerRoundPrice': values?.type === 'Outstation' ? values.acExtraKilometerRoundPrice : 0,
                'acExtraKilometerRoundPriceMVP': values?.type === 'Outstation' ? values.acExtraKilometerRoundPriceMVP : 0,
                'acExtraKilometerRoundPriceSuv': values?.type === 'Outstation' ? values.acExtraKilometerRoundPriceSuv : 0,
                'acExtraKilometerRoundPriceSedan': values?.type === 'Outstation' ? values.acExtraKilometerRoundPriceSedan : 0,

                'price': values?.type !== 'Outstation' ? values.price : '',
                'priceMVP':values?.type !== 'Outstation' ? values.priceMVP : '',
                'priceSuv':values?.type !== 'Outstation' ? values.priceSuv : '',
                'priceSedan':values?.type !== 'Outstation' ? values.priceSedan : '',

                'additionalMinCharge': Number(values.additionalMinCharge),
                'tollCharge': values?.type === 'Outstation' ? values.tollCharge : 0,
                'driverCharge': values?.type === 'Outstation' ? values.driverCharge : 0,
                'nightCharge': Number(values.nightCharge),
                'nightHoursFrom': Utils.formatTimeWithSeconds(values.nightHoursFrom),
                'nightHoursTo': Utils.formatTimeWithSeconds(values.nightHoursTo),
                'status': values.status === "ACTIVE" ? 1 : 0,
                "cancelMins": Utils.convertMinutesToTimeFormat(values.cancelMins),
                "cancelCharge": Number(values.cancelCharge),
                'extraKmPrice': Number(values.extraKmPrice),
                "price":Number(values.price),
                "priceMVP":Number(values.priceMVP),
                "priceSuv":Number(values.priceSuv),
                "priceSedan":Number(values.priceSedan),
                "baseFareMVP":Number(values.baseFareMVP),
                "baseFareSuv":Number(values.baseFareSuv),
                "baseFareSedan":Number(values.baseFareSedan),
                "kilometerPriceMVP":Number(values.kilometerPriceMVP),
                "kilometerPriceSuv":Number(values.kilometerPriceSuv),
                "kilometerPriceSedan":Number(values.kilometerPriceSedan),
                "additionalMinChargeMVP":Number(values.additionalMinChargeMVP),
                "additionalMinChargeSuv":Number(values.additionalMinChargeSuv),
                "additionalMinChargeSedan":Number(values.additionalMinChargeSedan),

                "acKilometerPrice": Number(values.acKilometerPrice),
                "acKilometerPriceMVP": Number(values.acKilometerPriceMVP),
                "acKilometerPriceSuv": Number(values.acKilometerPriceSuv),
                "acKilometerPriceSedan": Number(values.acKilometerPriceSedan),
            };
            const data = await ApiRequestUtils.post(API_ROUTES.ADD_RENTALS_PRICE_TABLE, reqBody);
            if (data?.success) {
                navigate('/dashboard/users/master-price');
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
            <h2 className="text-2xl font-bold mb-4">Add Rentals Price Details</h2>
            <Formik initialValues={initialValues} validationSchema={PRICE_SCHEMA} onSubmit={onSubmit} enableReinitialize>
                {({ handleSubmit, setFieldValue, isValid, dirty, errors, values }) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Trip Type</label>
                                <Field as="select" name="type" className="p-2 w-full rounded-md border-2 border-gray-300">
                                    <option value="">Select Trip Type</option>
                                    <option value="Local">Local</option>
                                    <option value="Outstation">Outstation</option>
                                </Field>
                                <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Package Type</label>
                                <Field as="select" name="period" className="p-2 w-full rounded-md border-2 border-gray-300">
                                    <option value="">Select Package Type</option>
                                    {values.type === 'Outstation' && <option value="1">1</option>}
                                    {values.type !== 'Outstation' && <option value="2">2</option>}
                                    {values.type !== 'Outstation' && <option value="4">4</option>}
                                    {values.type !== 'Outstation' && <option value="6">6</option>}
                                    {values.type !== 'Outstation' && <option value="8">8</option>}
                                    {values.type !== 'Outstation' && <option value="10">10</option>}
                                    {values.type !== 'Outstation' && <option value="12">12</option>}
                                </Field>
                                <ErrorMessage name="period" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare</label>
                                <Field type="number" name="baseFare" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="baseFare" component="div" className="text-red-500 text-sm" />
                            </div>
                            {/* new entry baseFare*/}
                            <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare (MUV)</label>
                                <Field type="number" name="baseFareMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="baseFareMVP" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare(Suv)</label>
                                <Field type="number" name="baseFareSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="baseFareSuv" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare (Sedan)</label>
                                <Field type="number" name="baseFareSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="baseFareSedan" component="div" className="text-red-500 text-sm" />
                            </div>

                            {values.type !== 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">Kilometer</label>
                                <Field type="number" name="kilometer" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="kilometer" component="div" className="text-red-500 text-sm" />
                            </div>}
                            <div>
                                <label className="text-sm font-medium text-gray-700">Kilometer Rate</label>
                                <Field type="number" name="kilometerPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="kilometerPrice" component="div" className="text-red-500 text-sm" />
                            </div>
                            {/* new entry price*/}
                            {values?.type === 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">kilometer Round Price</label>
                                <Field type="number" name="kilometerRoundPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="kilometerRoundPrice" component="div" className="text-red-500 text-sm" />
                            </div>
                            }
                            {values?.type === 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">kilometer Round Price MVP</label>
                                <Field type="number" name="kilometerRoundPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="kilometerRoundPriceMVP" component="div" className="text-red-500 text-sm" />
                            </div>
                            }
                            {values?.type === 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">kilometer Round Price Suv</label>
                                <Field type="number" name="kilometerRoundPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="kilometerRoundPriceSuv" component="div" className="text-red-500 text-sm" />
                            </div>
                            }
                            {values?.type === 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">kilometer Round Price Sedan</label>
                                <Field type="number" name="kilometerRoundPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="kilometerRoundPriceSedan" component="div" className="text-red-500 text-sm" />
                            </div>
                            }
                            {values.type !== 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">Price</label>
                                <Field type="number" name="price" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="price" component="div" className="text-red-500 text-sm" />
                            </div>}
                            {values.type !== 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">Price (MUV)</label>
                                <Field type="number" name="priceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="priceMVP" component="div" className="text-red-500 text-sm" />
                            </div>}
                            {values.type !== 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">Price (Suv)</label>
                                <Field type="number" name="priceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="priceSuv" component="div" className="text-red-500 text-sm" />
                            </div>}
                            {values.type !== 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">Price (Sedan)</label>
                                <Field type="number" name="priceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="priceSedan" component="div" className="text-red-500 text-sm" />
                            </div>}
                            {/* new entry kilometerPrice*/}
                            <div>
                                <label className="text-sm font-medium text-gray-700">Kilometer Price (MUV)</label>
                                <Field type="number" name="kilometerPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="kilometerPriceMVP" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Kilometer Price (Suv)</label>
                                <Field type="number" name="kilometerPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="kilometerPriceSuv" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Kilometer Price (Sedan)</label>
                                <Field type="number" name="kilometerPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="kilometerPriceSedan" component="div" className="text-red-500 text-sm" />
                            </div>

                            {/* new entry ackilometerPrice*/}
                            <div>
                                <label className="text-sm font-medium text-gray-700">Ac Kilometer Price</label>
                                <Field type="number" name="acKilometerPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="acKilometerPrice" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Ac Kilometer Price MVP</label>
                                <Field type="number" name="acKilometerPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="acKilometerPriceMVP" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Ac Kilometer Price Suv</label>
                                <Field type="number" name="acKilometerPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="acKilometerPriceSuv" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Ac Kilometer Price Sedan</label>
                                <Field type="number" name="acKilometerPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="acKilometerPriceSedan" component="div" className="text-red-500 text-sm" />
                            </div>

                            {values?.type === 'Outstation' && <>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Ac Kilometer Round Price</label>
                                    <Field type="number" name="acKilometerRoundPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="acKilometerRoundPrice" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Ac Kilometer Round Price MVP</label>
                                    <Field type="number" name="acKilometerRoundPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="acKilometerRoundPriceMVP" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Ac Kilometer Round Price Suv</label>
                                    <Field type="number" name="acKilometerRoundPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="acKilometerRoundPriceSuv" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Ac Kilometer Round Price Sedan</label>
                                    <Field type="number" name="acKilometerRoundPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="acKilometerRoundPriceSedan" component="div" className="text-red-500 text-sm" />
                                </div>
                            </>}
                            {/* {acExtraKilometerPrice} */}
                            {values?.type === 'Outstation' && <>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Ac Extra Kilometer Price</label>
                                    <Field type="number" name="acExtraKilometerPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="acExtraKilometerPrice" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Ac Extra Kilometer Price MVP</label>
                                    <Field type="number" name="acExtraKilometerPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="acExtraKilometerPriceMVP" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Ac Extra Kilometer Price Suv</label>
                                    <Field type="number" name="acExtraKilometerPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="acExtraKilometerPriceSuv" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Ac Extra Kilometer Price Sedan</label>
                                    <Field type="number" name="acExtraKilometerPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="acExtraKilometerPriceSedan" component="div" className="text-red-500 text-sm" />
                                </div>
                            </>}

                            {/* extraKilometerPrice and Drop Only Round Trip */}
                            {values?.type === "Outstation" &&
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Extra Kilometer Price</label>
                                    <Field type="number" name="extraKilometerPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="extraKilometerPrice" component="div" className="text-red-500 text-sm" />
                                </div>}
                            {values?.type === "Outstation" &&
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Extra Kilometer Price (MUV)</label>
                                    <Field type="number" name="extraKilometerPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="extraKilometerPriceMVP" component="div" className="text-red-500 text-sm" />
                                </div>}
                            {values?.type === "Outstation" &&
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Extra Kilometer Price Suv</label>
                                    <Field type="number" name="extraKilometerPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="extraKilometerPriceSuv" component="div" className="text-red-500 text-sm" />
                                </div>}
                            {values?.type === "Outstation" &&
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Extra Kilometer Price Sedan</label>
                                    <Field type="number" name="extraKilometerPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="extraKilometerPriceSedan" component="div" className="text-red-500 text-sm" />
                                </div>}
                            {values?.type === "Outstation" &&
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Extra Kilometer Round Price</label>
                                    <Field type="number" name="extraKilometerRoundPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="extraKilometerRoundPrice" component="div" className="text-red-500 text-sm" />
                                </div>}
                            {values?.type === "Outstation" &&
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Extra Kilometer Round Price (MUV)</label>
                                    <Field type="number" name="extraKilometerRoundPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="extraKilometerRoundPriceMVP" component="div" className="text-red-500 text-sm" />
                                </div>}
                            {values?.type === "Outstation" &&
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Extra Kilometer Round Price Suv</label>
                                    <Field type="number" name="extraKilometerRoundPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="extraKilometerRoundPriceSuv" component="div" className="text-red-500 text-sm" />
                                </div>}
                            {values?.type === "Outstation" &&
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Extra Kilometer Round Price Sedan</label>
                                    <Field type="number" name="extraKilometerRoundPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="extraKilometerRoundPriceSedan" component="div" className="text-red-500 text-sm" />
                                </div>}

                                {values?.type === "Outstation" &&
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Ac Extra Kilometer Round Price</label>
                                    <Field type="number" name="acExtraKilometerRoundPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="acExtraKilometerRoundPrice" component="div" className="text-red-500 text-sm" />
                                </div>}
                            {values?.type === "Outstation" &&
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Ac Extra Kilometer Round Price (MUV)</label>
                                    <Field type="number" name="acExtraKilometerRoundPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="acExtraKilometerRoundPriceMVP" component="div" className="text-red-500 text-sm" />
                                </div>}
                            {values?.type === "Outstation" &&
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Ac Extra Kilometer Round Price Suv</label>
                                    <Field type="number" name="acExtraKilometerRoundPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="acExtraKilometerRoundPriceSuv" component="div" className="text-red-500 text-sm" />
                                </div>}
                            {values?.type === "Outstation" &&
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Ac Extra Kilometer Round Price Sedan</label>
                                    <Field type="number" name="acExtraKilometerRoundPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="acExtraKilometerRoundPriceSedan" component="div" className="text-red-500 text-sm" />
                                </div>}

                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional Min</label>
                                <Field type="number" name="additionalMinCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="additionalMinCharge" component="div" className="text-red-500 text-sm" />
                            </div>
                            {/* new entry additionalMinCharge*/}
                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional Min Charge (MUV)</label>
                                <Field type="number" name="additionalMinChargeMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="additionalMinChargeMVP" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional Min Charge (Suv)</label>
                                <Field type="number" name="additionalMinChargeSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="additionalMinChargeSuv" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional Min Charge (Sedan)</label>
                                <Field type="number" name="additionalMinChargeSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="additionalMinChargeSedan" component="div" className="text-red-500 text-sm" />
                            </div>
                            {/* <div>
                                <label className="text-sm font-medium text-gray-700">Variant</label>
                                <Field as="select" name="carType" className="p-2 w-full rounded-md border-2 border-gray-300">
                                    <option value="">Select Variant</option>
                                    <option value="Mini">Mini</option>
                                    <option value="Sedan">Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="MVP">MVP</option>
                                </Field>
                                <ErrorMessage name="carType" component="div" className="text-red-500 text-sm" />
                            </div> */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional KM Rate</label>
                                <Field type="number" name="extraKmPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="extraKmPrice" component="div" className="text-red-500 text-sm" />
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
                            {values?.type === 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">Toll Charge</label>
                                <Field type="number" name="tollCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="tollCharge" component="div" className="text-red-500 text-sm" />
                            </div>}
                            {values?.type === 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">Driver Charge</label>
                                <Field type="number" name="driverCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="driverCharge" component="div" className="text-red-500 text-sm" />
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
                                <Field type="number" name="cancelMins" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="cancelMins" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Cancellation Charge</label>
                                <Field type="number" name="cancelCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="cancelCharge" component="div" className="text-red-500 text-sm" />
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <Button fullWidth onClick={() => navigate('/dashboard/users/master-price')} className="my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl">
                                Cancel
                            </Button>
                            <Button fullWidth  onClick={handleSubmit} disabled={!dirty || !isValid} 
                            className={`my-6 mx-2 ${ColorStyles.continueButtonColor}`}>
                                Continue
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default RentalsPriceMasterAdd;
