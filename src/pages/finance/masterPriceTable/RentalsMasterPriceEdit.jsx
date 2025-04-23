import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import Select from 'react-select';
import { Utils } from '@/utils/utils';



const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
];

const PRICE_SCHEMA = Yup.object().shape({
    // carType: Yup.string().required('Cab Type is required'),
    type: Yup.string().required('Trip Type is required'),
    period: Yup.string().required('Package Type is required'),
    baseFare: Yup.number().required('Base Fare is required'),
    kilometer: Yup.number().required('Kilometer is required'),
    kilometerPrice: Yup.number().required('Kilometer Rate is required'),
    extraKmPrice: Yup.number().required('Additional Kilometer Price is required'),
    additionalMinCharge: Yup.number().required('Additional Min is required'),
    nightCharge: Yup.number().required('Night Charge is required'),
    cancelMins: Yup.number().required('Cancellation Mins is required'),
    cancelCharge: Yup.number().required('Cancellation Charge is require'),
    status: Yup.string().required('Status is required'),
});

const RentalsMasterPriceEdit = () => {
    const [initialValues, setInitialValues] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) fetchPriceDetails(id);
    }, [id]);

    const fetchPriceDetails = async (packageId) => {
        try {
            const data = await ApiRequestUtils.get(`${API_ROUTES.RIDES_PRICE_DETAILS}/${packageId}`);
            if (data?.success) {
                setInitialValues({
                    // carType: data?.data?.carType || '',
                    type: data?.data?.type || '',
                    period: data?.data?.period || '',
                    baseFare: data?.data?.baseFare || 0,
                    kilometer: data?.data?.kilometer || 0,
                    kilometerPrice: data?.data?.kilometerPrice || 0,
                    additionalMinCharge: data?.data?.additionalMinCharge || 0,
                    tollCharge: data?.data?.tollCharge || 0,
                    driverCharge: data?.data?.driverCharge || 0,
                    extraKmPrice: data?.data?.extraKmPrice || 0,
                    nightHoursFrom: convertToTimeFormat(data?.data?.nightHoursFrom),
                    nightHoursTo: convertToTimeFormat(data?.data?.nightHoursTo),
                    nightCharge: data?.data?.nightCharge || 0,
                    cancelMins: Utils.convertTimeFormatToMinutes(data?.data?.cancelMins),
                    cancelCharge: data?.data?.cancelCharge || 0,
                    status: data?.data?.status == 1 ? "ACTIVE" : "INACTIVE",
                    price:data?.data?.price || 0,
                    priceMVP:data?.data?.priceMVP || 0,
                    priceSuv:data?.data?.priceSuv || 0,
                    priceSedan:data?.data?.priceSedan || 0,
                    baseFareMVP:data?.data?.baseFareMVP || 0,
                    baseFareSuv:data?.data?.baseFareSuv || 0,
                    baseFareSedan:data?.data?.baseFareSedan || 0,
                    kilometerPriceMVP:data?.data?.kilometerPriceMVP || 0,
                    kilometerPriceSuv:data?.data?.kilometerPriceSuv || 0,
                    kilometerPriceSedan:data?.data?.kilometerPriceSedan || 0,
                    additionalMinChargeMVP:data?.data?.additionalMinChargeMVP || 0,
                    additionalMinChargeSuv:data?.data?.additionalMinChargeSuv || 0,
                    additionalMinChargeSedan:data?.data?.additionalMinChargeSedan || 0,

                    kilometerRoundPrice:data?.data?.kilometerRoundPrice || 0,
                    kilometerRoundPriceMVP:data?.data?.kilometerRoundPriceMVP || 0,
                    kilometerRoundPriceSuv:data?.data?.kilometerRoundPriceSuv || 0,
                    kilometerRoundPriceSedan:data?.data?.kilometerRoundPriceSedan || 0,
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
                packageId: Number(id),
                // carType: String(values.carType),
                type: String(values.type),
                period: Number(values.period),
                kilometer: Number(values.kilometer),
                serviceType: 'RENTAL',
                baseFare: Number(values.baseFare),
                kilometerPrice: Number(values.kilometerPrice),
                additionalMinCharge: Number(values.additionalMinCharge),
                nightHoursFrom: Utils.formatTimeWithSeconds(values.nightHoursFrom),
                nightHoursTo: Utils.formatTimeWithSeconds(values.nightHoursTo),
                nightCharge: Number(values.nightCharge),
                tollCharge: Number(values.tollCharge),
                driverCharge: Number(values.driverCharge),
                extraKmPrice: Number(values.extraKmPrice),
                cancelMins: Utils.convertMinutesToTimeFormat(values.cancelMins),
                cancelCharge: Number(values.cancelCharge),
                status: values.status == 'ACTIVE' ? 1 : 0,
                price:Number(values.price),
                priceMVP:Number(values.priceMVP),
                priceSuv:Number(values.priceSuv),
                priceSedan:Number(values.priceSedan),
                baseFareMVP:Number(values.baseFareMVP),
                baseFareSuv:Number(values.baseFareSuv),
                baseFareSedan:Number(values.baseFareSedan),
                kilometerPriceMVP:Number(values.kilometerPriceMVP),
                kilometerPriceSuv:Number(values.kilometerPriceSuv),
                kilometerPriceSedan:Number(values.kilometerPriceSedan),
                additionalMinChargeMVP:Number(values.additionalMinChargeMVP),
                additionalMinChargeSuv:Number(values.additionalMinChargeSuv),
                additionalMinChargeSedan:Number(values.additionalMinChargeSedan),

                kilometerRoundPrice:Number(values.kilometerRoundPrice),
                kilometerRoundPriceMVP:Number(values.kilometerRoundPriceMVP),
                kilometerRoundPriceSuv:Number(values.kilometerRoundPriceSuv),
                kilometerRoundPriceSedan:Number(values.kilometerRoundPriceSedan),
            };

            const response = await ApiRequestUtils.post(API_ROUTES.RENDAL_PRICE_EDIT, reqBody);

            if (response?.success) {
                navigate('/dashboard/users/master-price');
            } else {
                console.error('Error updating data');
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
                                <label className="text-sm font-medium text-gray-700">Trip Type</label>
                                <Field type="string" name="type" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Package Type</label>
                                <Field type="string" name="period" className="p-2 w-full rounded-md border-gray-300 shadow-sm" disabled />
                                <ErrorMessage name="period" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare</label>
                                <Field type="number" name="baseFare" className="p-2 w-full rounded-md border-gray-300 shadow-sm"  />
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
                                <Field type="number" name="kilometer" className="p-2 w-full rounded-md border-gray-300 shadow-sm"  />
                                <ErrorMessage name="kilometer" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Kilometer Rate</label>
                                <Field type="number" name="kilometerPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm"  />
                                <ErrorMessage name="kilometerPrice" component="div" className="text-red-500 text-sm" />
                            </div>
                             {/* new entry price*/}
                             {values?.type !== 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">Price</label>
                                <Field type="number" name="price" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="price" component="div" className="text-red-500 text-sm" />
                            </div>}
                            {values?.type === 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">kilometer Round Price</label>
                                <Field type="number" name="kilometerRoundPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="kilometerRoundPrice" component="div" className="text-red-500 text-sm" />
                            </div>
                            }
                            {values?.type !== 'Outstation' &&                             <div>
                                <label className="text-sm font-medium text-gray-700">Price (MUV)</label>
                                <Field type="number" name="priceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="priceMVP" component="div" className="text-red-500 text-sm" />
                            </div>}
                            {values?.type === 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">kilometer Round Price (MUV) </label>
                                <Field type="number" name="kilometerRoundPriceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="kilometerRoundPriceMVP" component="div" className="text-red-500 text-sm" />
                            </div>
                            }
                            {values?.type !== 'Outstation' &&  <div>
                                <label className="text-sm font-medium text-gray-700">Price (Suv)</label>
                                <Field type="number" name="priceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="priceSuv" component="div" className="text-red-500 text-sm" />
                            </div>}
                            {values?.type === 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">kilometer Round Price Suv</label>
                                <Field type="number" name="kilometerRoundPriceSuv" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="kilometerRoundPriceSuv" component="div" className="text-red-500 text-sm" />
                            </div>
                            }
                            {values?.type !== 'Outstation' &&   <div>
                                <label className="text-sm font-medium text-gray-700">Price (Sedan)</label>
                                <Field type="number" name="priceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="priceSedan" component="div" className="text-red-500 text-sm" />
                            </div>}
                            {values?.type === 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">kilometer Round Price Sedan</label>
                                <Field type="number" name="kilometerRoundPriceSedan" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                <ErrorMessage name="kilometerRoundPriceSedan" component="div" className="text-red-500 text-sm" />
                            </div>
                            }
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
                                <Field type="number" name="additionalMinCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm"  />
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
                                <Field as="select" name="carType" className="p-2 w-full rounded-md border-2 border-gray-300" disabled >
                                    <option value="">Select Variant</option>
                                    <option value="Mini">Mini</option>
                                    <option value="Sedan">Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="MUV">MUV</option>
                                </Field>
                                <ErrorMessage name="carType" component="div" className="text-red-500 text-sm" />
                            </div> */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional KM Rate</label>
                                <Field type="number" name="extraKmPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm"  />
                                <ErrorMessage name="extraKmPrice" component="div" className="text-red-500 text-sm" />
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
                            {initialValues?.type === 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">Toll Charge</label>
                                <Field type="number" name="tollCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm"  />
                                <ErrorMessage name="tollCharge" component="div" className="text-red-500 text-sm" />
                            </div>}
                            {initialValues?.type === 'Outstation' && <div>
                                <label className="text-sm font-medium text-gray-700">Driver Charge</label>
                                <Field type="number" name="driverCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm"  />
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
                                    <ErrorMessage name="nightHoursFrom" component="div" className="text-red-500 text-sm" />
                                    <ErrorMessage name="nightHoursTo" component="div" className="text-red-500 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Night Charge</label>
                                <Field type="number" name="nightCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm"  />
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
                            <Button fullWidth color="black" type="submit" disabled={!dirty || !isValid} className="my-6 mx-2">
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
