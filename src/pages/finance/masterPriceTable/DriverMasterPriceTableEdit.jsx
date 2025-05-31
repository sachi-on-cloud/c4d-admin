import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { Utils } from '@/utils/utils';
import Select from 'react-select';

const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
];

const DRIVER_SCHEMA = Yup.object().shape({
    serviceType: Yup.string().required('Service Type is required'),
    type: Yup.string().required('Type is required'),
    period: Yup.number().required('Period is required'),
    price: Yup.number().required('Price is required'),
    priceMVP: Yup.number().required('Price MUV is required'),
    // dropPrice: Yup.number().required('Drop Price is required'),
    nightCharge: Yup.number().required('Night Charge is required'),
    cancelCharge: Yup.number().required('Cancel Charge is required'),
    extraPrice: Yup.number().required('Extra Price is required'),
    status: Yup.string().required('Status is required'),

});

const DriverMasterPriceTableEdit = () => {
    const [initialValues, setInitialValues] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDriverDetails(id);
        console.log(id);
    }, [id]);


    const fetchDriverDetails = async (id) => {
        if (!id) return;
        try {
            const data = await ApiRequestUtils.get(API_ROUTES.GET_PACKAGE_DETAIL + `${id}`);
            if (data?.success) {
                setInitialValues({
                    packageId: data?.data?.id,

                    serviceType: data.data.serviceType,
                    type: data.data.type,
                    period: data.data.period,
                    price: data.data.price,
                    priceMVP: data.data.priceMVP,

                    waitingMins: Utils.convertTimeFormatToMinutes(data.data.waitingMins),
                    waitingCharge: data.data.waitingCharge,
                    dropPrice: data.data.dropPrice,
                    additionalMinCharge: data.data.additionalMinCharge,

                    extraPrice: data.data.extraPrice,
                    nightHoursFrom: convertToTimeFormat(data.data.nightHoursFrom) || '00:00',
                    nightHoursTo: convertToTimeFormat(data.data.nightHoursTo) || '00:00',
                    nightCharge: data.data.nightCharge,

                    cancelMins: Utils.convertTimeFormatToMinutes(data.data.cancelMins),
                    cancelCharge: data.data.cancelCharge,

                    baseFare:data.data.baseFare,
                    kilometer:data.data.kilometer,
                    extraKmPrice:data.data.extraKmPrice,
                    dropPriceAbove:data.data.dropPriceAbove,


                    status: data.data.status == 1 ? "ACTIVE" : 'IN_ACTIVE',
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
            const reqdata = {
                packageId: Number(id),

                serviceType: String(values.serviceType),
                type: String(values.type),
                period: Number(values.period),
                priceMVP: Number(values.priceMVP),
                price: Number(values.price),

                waitingMins: Utils.convertMinutesToTimeFormat(values.waitingMins),
                waitingCharge: Number(values.waitingCharge),
                additionalMinCharge: Number(values.additionalMinCharge),
                extraPrice: Number(values.extraPrice),

                dropPrice: Number(values.dropPrice),

                nightHoursFrom: Utils.formatTimeWithSeconds(values.nightHoursFrom),
                nightHoursTo: Utils.formatTimeWithSeconds(values.nightHoursTo),
                nightCharge: Number(values.nightCharge),

                cancelMins: Utils.convertMinutesToTimeFormat(values.cancelMins),
                cancelCharge: Number(values.cancelCharge),
                dropPriceAbove:Number(values.dropPriceAbove),
                kilometer : Number(values.kilometer),

                status: values.status === 'ACTIVE' ? 1 : 0,
            };

            // Include Outstation-specific fields
            if (values.type === 'Outstation') {
                reqdata.baseFare = Number(values.baseFare);
                reqdata.kilometer = Number(values.kilometer);
                reqdata.extraKmPrice = Number(values.extraKmPrice);
            }

            let response;
            if (values.type === 'Local') {
                response = await ApiRequestUtils.post(API_ROUTES.ACTING_DRIVER_EDIT_LOCAL_PACKAGE, reqdata);
            } else if (values.type === 'Outstation') {
                response = await ApiRequestUtils.post(API_ROUTES.ACTING_DRIVER_EDIT_OUTSTATION_PACKAGE, reqdata);
            }

            if (response?.success) {
                navigate(`/dashboard/users/master-price/`);
            }
        } catch (error) {
            console.error("Error updating price details:", error);
        }
    };


    return (
        <>
            <div className="p-4 mx-auto">
                <h2 className="text-2xl font-bold mb-4">Edit Driver Details</h2>

                <Formik
                    initialValues={initialValues}
                    onSubmit={onSubmit}
                    validationSchema={DRIVER_SCHEMA}
                    enableReinitialize >
                    {({ handleSubmit, isValid, dirty, errors, setFieldValue, values }) => (
                        <Form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* <pre>{JSON.stringify(errors, null, 2)}</pre> */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Service Type</label>
                                    <Field type="string" name="serviceType" disabled className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Trip Type</label>
                                    <Field type="string" name="type" disabled className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Package</label>
                                    <Field type="number" name="period"  disabled className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="period" component="div" className="text-red-500 text-sm" />
                                </div>
                                   <div>
                                        <label className="text-sm font-medium text-gray-700">Kilometer</label>
                                        <Field type="number" name="kilometer" className="p-2 w-full rounded-md border-gray-300 shadow-sm" min='0' />
                                        <ErrorMessage name="kilometer" component="div" className="text-red-500 text-sm" />
                                    </div>
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
                                    <label className="text-sm font-medium text-gray-700">Free Waiting Time</label>
                                    <Field type="number" name="waitingMins" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="waitingMins" component="div" className="text-red-500 text-sm" />
                                </div>
                                {values?.type === 'Outstation' &&
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Base Fare</label>
                                        <Field type="number" name="baseFare" className="p-2 w-full rounded-md border-gray-300 shadow-sm" min='0' />
                                        <ErrorMessage name="baseFare" component="div" className="text-red-500 text-sm" />
                                    </div>
                                }                                 
                                {values?.type === 'Outstation' && 
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Extra Kilometer Price</label>
                                        <Field type="number" name="extraKmPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" min='0' />
                                        <ErrorMessage name="extraKmPrice" component="div" className="text-red-500 text-sm" />
                                    </div>
                                }
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Waiting Charges</label>
                                    <Field type="number" name="waitingCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="waitingCharge" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Drop Only</label>
                                    <Field type="number" name="dropPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="dropPrice" component="div" className="text-red-500 text-sm" />
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Drop Price Above</label>
                                    <Field type="number" name="dropPriceAbove" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="dropPriceAbove" component="div" className="text-red-500 text-sm" />
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Additional Mins</label>
                                    <Field type="number" name="additionalMinCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="additionalMinCharge" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Extra Hours</label>
                                    <Field type="number" name="extraPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="extraPrice" component="div" className="text-red-500 text-sm" />
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
                                    <label className="text-sm font-medium text-gray-700">Night Charges</label>
                                    <Field type="number" name="nightCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="nightCharge" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Cancellation Time</label>
                                    <Field type="number" name="cancelMins" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="cancelMins" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Cancellation Charges</label>
                                    <Field type="number" name="cancelCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="cancelCharge" component="div" className="text-red-500 text-sm" />
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
                            </div>
                            <div className="flex flex-row">
                                <Button fullWidth onClick={() => navigate('/dashboard/users/master-price')} className={`my-6 mx-2 ${ColorStyles.backButton}`}>
                                    Back
                                </Button>
                                <Button fullWidth color="blue" onClick={handleSubmit} disabled={!dirty || !isValid} className="my-6 mx-2">
                                    Save Changes
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>

        </>
    )
}
export default DriverMasterPriceTableEdit;