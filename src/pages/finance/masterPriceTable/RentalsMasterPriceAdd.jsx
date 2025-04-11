import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Alert, Button } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
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
        baseFare: '',
        kilometer: '',
        kilometerPrice: '',
        additionalMinCharge: '',
        tollCharge: '',
        driverCharge: '',
        nightCharge: '',
        status: 'ACTIVE',
        price:'',
        priceMVP:'',
        priceSuv:'',
        priceSedan:'',
        baseFareMVP:'',
        baseFareSuv:'',
        baseFareSedan:'',
        kilometerPriceMVP:'',
        kilometerPriceSuv:'',
        kilometerPriceSedan:'',
        additionalMinChargeMVP:'',
        additionalMinChargeSuv:'',
        additionalMinChargeSedan:'',
        cancelMins: '',
        cancelCharge: '',
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
                'additionalMinCharge': Number(values.additionalMinCharge),
                'tollCharge': values?.type === 'Outstation' ? values.tollCharge : 0,
                'driverCharge': values?.type === 'Outstation' ? values.driverCharge : 0,
                'nightCharge': Number(values.nightCharge),
                'nightHoursFrom': Utils.formatTimeWithSeconds(values.nightHoursFrom),
                'nightHoursTo': Utils.formatTimeWithSeconds(values.nightHoursTo),
                'status': values.status === "ACTIVE" ? 1 : 0,
                "cancelMins": Number(values.cancelMins),
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
                            <div>
                                <label className="text-sm font-medium text-gray-700">Kilometer</label>
                                <Field type="number" name="kilometer" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="kilometer" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Kilometer Rate</label>
                                <Field type="number" name="kilometerPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="kilometerPrice" component="div" className="text-red-500 text-sm" />
                            </div>
                            {/* new entry price*/}
                            <div>
                                <label className="text-sm font-medium text-gray-700">Price</label>
                                <Field type="number" name="price" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="price" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Price (MUV)</label>
                                <Field type="number" name="priceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="priceMVP" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Price (Suv)</label>
                                <Field type="number" name="priceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="priceSuv" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Price (Sedan)</label>
                                <Field type="number" name="priceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="priceSedan" component="div" className="text-red-500 text-sm" />
                            </div>
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

export default RentalsPriceMasterAdd;
