import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@material-tailwind/react';
import Select from 'react-select';
import { Utils } from "@/utils/utils";
import MasterPriceLog from "../masterPriceTable/MasterPriceLog";

export function MasterPriceDetailsAndEdit() {
    const navigate = useNavigate();
    const [masterPriceDetails, setMasterPriceDetails] = useState();
    const [initialValues, setInitialValues] = useState({});
    const { id } = useParams();
    
    useEffect(() => {
        if (id) {
            fetchItem(id);
        }
    }, [id]);
    // const STATUS_OPTIONS = [
    //     { value: 'ACTIVE', label: 'Active' },
    //     { value: 'INACTIVE', label: 'Inactive' },
    // ];
    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_PACKAGE_DETAIL + `${itemId}`);
        if (data?.success) {
            setInitialValues({
                serviceType: data?.data?.serviceType || '',
                type: data?.data?.type || '',
                period: data?.data?.period || '',
                priceMVP: data.data.priceMVP || '',
                price: data.data.price,
                waitingMins: Utils.convertTimeFormatToMinutes(data?.data?.waitingMins) || '',
                waitingCharge: data?.data?.waitingCharge || '',
                dropPrice: data?.data?.dropPrice || '',
                additionalMinCharge: data?.data?.additionalMinCharge || '',
                extraHours: data?.data?.extraPrice || '',
                nightHoursFrom: data?.data?.nightHoursFrom || '00:00',
                nightHoursTo: data?.data?.nightHoursTo || '00:00',
                nightCharge: data?.data?.nightCharge || '',
                cancelMins: Utils.convertTimeFormatToMinutes(data?.data?.cancelMins) || '',
                cancelCharge: data?.data?.cancelCharge || '',

                baseFare:data?.data?.baseFare || '',
                kilometer:data?.data?.kilometer || '',
                extraKmPrice:data?.data?.extraKmPrice || '',

                status: data.data.status == 1 ? "ACTIVE": 'IN_ACTIVE',
            })
        }
        setMasterPriceDetails(data?.data);
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
                additionalMinCharge: values.additionalMinCharge,
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

            <h2 className="text-2xl font-bold mb-4">Master Price Details</h2>
            <Formik
                initialValues={initialValues}
                // validationSchema={MASTERPRICE_ADD_SCHEME}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ handleSubmit, values, setFieldValue, errors, isValid, dirty }) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Service Type</label>
                                <Field type="string" name="serviceType" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Trip Type</label>
                                <Field type="string" name="type" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Package</label>
                                <Field type="number" name="period" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Price</label>
                                <Field type="number" name="price" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-700">Price (MUV)</label>
                                <Field type="number" name="priceMVP" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Free Waiting Time</label>
                                <Field type="number" name="waitingMins" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200"/>
                            </div>
                            {values?.type === 'Outstation' &&
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Base Fare</label>
                                    <Field type="number" name="baseFare" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                                    
                                </div>
                            }
                            {values?.type === 'Outstation' &&
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Kilometer</label>
                                    <Field type="number" name="kilometer" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                                    
                                </div>
                            }
                            {values?.type === 'Outstation' &&
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Extra Kilometer Price</label>
                                    <Field type="number" name="extraKmPrice" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                                    
                                </div>
                            }
                            <div>
                                <label className="text-sm font-medium text-gray-700">Waiting Charges</label>
                                <Field type="number" name="waitingCharge" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Drop Only</label>
                                <Field type="number" name="dropPrice" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Additional Mins</label>
                                <Field type="number" name="additionalMinCharge" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Extra Hours</label>
                                <Field type="number" name="extraHours" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
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
                                <Field type="number" name="cancelMins" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Cancellation Charge</label>
                                <Field type="number" name="cancelCharge" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                {/* <Select
                                    options={STATUS_OPTIONS}
                                    onChange={(selectedOption) => setFieldValue('status', selectedOption.value)}
                                    value={STATUS_OPTIONS.find(option => option.value === values?.status)}
                                    placeholder="Select Status"
                                    className="w-full"
                                    
                                /> */}
                                <Field type="string" name="status" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                                <ErrorMessage name="status" component="div" className="text-red-500 text-sm" />
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <Button fullWidth onClick={() => navigate('/dashboard/users/master-price')} className={`my-6 mx-2 ${ColorStyles.backButton}`}>
                                Back
                            </Button>
                            <Button fullWidth className={`my-6 mx-2  border-2 border-gray-400 rounded-xl ${ColorStyles.editButton}`} onClick={() => navigate(`/dashboard/users/master-price/driver-edit/${id}`)}>
                                Edit
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
            <MasterPriceLog id={id}/>
        </div>
    );
}
