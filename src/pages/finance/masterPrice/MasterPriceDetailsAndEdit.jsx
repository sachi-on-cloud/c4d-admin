import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import Multiselect from 'multiselect-react-dropdown';
import { useNavigate } from 'react-router-dom';
import { Button } from '@material-tailwind/react';
import { MASTERPRICE_ADD_SCHEME } from "@/utils/validations";
import { Utils } from "@/utils/utils";

export function MasterPriceDetailsAndEdit() {
    const navigate = useNavigate();
    const [masterPriceDetails, setMasterPriceDetails] = useState();
     const [isEditable, setIsEditable] = useState(false);
    const { id } = useParams();
    
    useEffect(() => {
        if (id) {
            fetchItem(id);
        }
    }, [id]);
    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_PACKAGE_DETAIL + `${itemId}`);
        setMasterPriceDetails(data?.data);
    };

    const initialValues = {
        serviceType: masterPriceDetails?.serviceType || '',
        type: masterPriceDetails?.type || '',
        period: masterPriceDetails?.period || '',
        waitingMins: masterPriceDetails?.waitingMins || '',
        waitingCharge: masterPriceDetails?.waitingCharge || '',
        dropPrice: masterPriceDetails?.dropPrice || '',
        additionalMins: masterPriceDetails?.additionalMins || '',
        extraHours: masterPriceDetails?.extraPrice || '',
        nightHoursFrom: masterPriceDetails?.nightHoursFrom || '',
        nightHoursTo: masterPriceDetails?.nightHoursTo || '',
        nightCharge: masterPriceDetails?.nightCharge || '',
        cancelMins: masterPriceDetails?.cancelMins || '',
        cancelCharge: masterPriceDetails?.cancelCharge || '',
        active: masterPriceDetails?.active === 1 ? 'Active' : 'In Active',
    };

    const handleSubmit = async (values) => {
        try {
            const masterpriceList = {
                serviceType: values.serviceType,
                type: values.type,
                period: values.period,
                price: values.price,
                priceMVP: values.priceMVP,
                dropPrice: values.dropPrice,
                nightCharge: values.nightCharge,
                cancelCharge: values.cancelCharge,
                cancelMins: Utils.convertMinutesToTimeFormat(values.cancelMins),
                waitingMins: Utils.convertMinutesToTimeFormat(values.waitingMins),
                waitingCharge: values.waitingCharge,
                nightHoursFrom: Utils.formatTimeWithSeconds(values.nightHoursFrom),
                nightHoursTo: Utils.formatTimeWithSeconds(values.nightHoursTo),
                extraPrice: values.extraHours,
                status: values.status === 'Active' ? 1 : 0,
            };
            if (values.type === 'Outstation') {
                masterpriceList['baseFare'] = values.baseFare;
                masterpriceList['kilometer'] = values.kilometer;
                masterpriceList['extraKmPrice'] = values.extraKmPrice;
            }
            console.log('masterpriceList -> ', masterpriceList);
            let data;

            if (values.type === 'Local') {
                data = await ApiRequestUtils.post(API_ROUTES.ACTING_DRIVER_ADD_LOCAL_PACKAGE, masterpriceList);
            } else {
                data = await ApiRequestUtils.post(API_ROUTES.ACTING_DRIVER_ADD_OUTSTAION_PACKAGE, masterpriceList);
            }
            if (data?.success) {
                navigate('/dashboard/users/master-price');
            }
        } catch (err) {
            console.log('ERROR IN SUBMIT :', err)
        }
    };
    return (
        <div className="p-4">

            <h2 className="text-2xl font-bold mb-4">Add Master Price List</h2>
            <Formik
                initialValues={initialValues}
                // validationSchema={MASTERPRICE_ADD_SCHEME}
                onSubmit={handleSubmit}

            >
                {({ handleSubmit, values, setFieldValue, errors, isValid, dirty }) => (
                    <Form>
                        {/* <p>Form Errors (Debug):</p><p>{JSON.stringify(errors, null, 2)}</p>
                        <pre>{JSON.stringify(errors, null, 2)}</pre>
                        <p>Package Debug: {JSON.stringify(values.package, null, 2)}</p> */}

                        <div className="p-4 bg-gray-50 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Service Type</label>
                                <Field as="select" name="serviceType" className="p-2 w-full rounded-md border-2 border-gray-300">
                                    <option value="">Select Service Type</option>
                                    <option value="DRIVER">Acting Driver</option>
                                    <option value="RIDES">Rides</option>
                                    <option value="RENTAL">Rental</option>
                                </Field>
                                <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
                            </div>
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
                                <label className="text-sm font-medium text-gray-700">Package</label>
                                <Field type="number" name="period" className="p-2 w-full rounded-md border-gray-300 shadow-sm" min='1' />
                                <ErrorMessage name="period" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Price</label>
                                <Field type="number" name="price" className="p-2 w-full rounded-md border-gray-300 shadow-sm" min='0' />
                                <ErrorMessage name="price" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Price (MVP)</label>
                                <Field type="number" name="priceMVP" className="p-2 w-full rounded-md border-gray-300 shadow-sm" min='0' />
                                <ErrorMessage name="priceMVP" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Free Waiting Time</label>
                                <Field type="number" name="waitingMins" className="p-2 w-full rounded-md border-gray-300 shadow-sm" min='0' />
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
                                    <label className="text-sm font-medium text-gray-700">Kilometer</label>
                                    <Field type="number" name="kilometer" className="p-2 w-full rounded-md border-gray-300 shadow-sm" min='0' />
                                    <ErrorMessage name="kilometer" component="div" className="text-red-500 text-sm" />
                                </div>
                            }
                            {values?.type === 'Oustation' &&
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Extra Kilometer Price</label>
                                    <Field type="number" name="extraKilometerPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" min='0' />
                                    <ErrorMessage name="extraKilometerPrice" component="div" className="text-red-500 text-sm" />
                                </div>
                            }
                            <div>
                                <label className="text-sm font-medium text-gray-700">Waiting Charges</label>
                                <Field type="number" name="waitingCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" min='0' />
                                <ErrorMessage name="waitingCharge" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Drop Only</label>
                                <Field type="number" name="dropPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" min='0' />
                                <ErrorMessage name="dropPrice" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional Mins</label>
                                <Field type="number" name="additionalMins" className="p-2 w-full rounded-md border-gray-300 shadow-sm" min='0' />
                                <ErrorMessage name="additionalMins" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Extra Hours</label>
                                <Field type="number" name="extraHours" className="p-2 w-full rounded-md border-gray-300 shadow-sm" min='0' />
                                <ErrorMessage name="extraHours" component="div" className="text-red-500 text-sm" />
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
                                <Field type="number" name="nightCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" min='0' />
                                <ErrorMessage name="nightCharge" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Cancellation Time</label>
                                <Field type="number" name="cancelMins" className="p-2 w-full rounded-md border-gray-300 shadow-sm" min='0' />
                                <ErrorMessage name="cancelMins" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Cancellation Charges</label>
                                <Field type="number" name="cancelCharge" className="p-2 w-full rounded-md border-gray-300 shadow-sm" min='0' />
                                <ErrorMessage name="cancelCharge" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <Field as="select" name="status" className="p-2 w-full rounded-md border-2 border-gray-300">
                                    <option value="">Select Status</option>
                                    <option value="Active">Active</option>
                                    <option value="In Active">In Active</option>
                                </Field>
                                <ErrorMessage name="status" component="div" className="text-red-500 text-sm" />
                            </div>
                        </div>
                        <div className='flex flex-row'>
                            <Button
                                fullWidth
                                onClick={() => navigate('/dashboard/finance/master-price')}
                                className='my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl'
                            >
                                Back
                            </Button>
                            <Button
                                fullWidth
                                color="black"
                                onClick={() => {
                                    if (!isEditable) {
                                        setIsEditable(true);
                                    } else {
                                        handleSubmit();
                                    }
                                }}
                                disabled={!dirty || !isValid}
                                className='my-6 mx-2'
                            >
                                {`${isEditable ? 'Save' : 'Edit'}`}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
