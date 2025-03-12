import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import Multiselect from 'multiselect-react-dropdown';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@material-tailwind/react';
import { MASTERPRICE_ADD_SCHEME } from "@/utils/validations";
import { Utils } from "@/utils/utils";

export function MasterPriceDetailsAndEdit() {
    const navigate = useNavigate();
    const [masterPriceDetails, setMasterPriceDetails] = useState();
    const [initialValues, setInitialValues] = useState({});
    const [isEditable, setIsEditable] = useState(false);
    const { id } = useParams();
    
    useEffect(() => {
        if (id) {
            fetchItem(id);
        }
    }, [id]);

    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_PACKAGE_DETAIL + `${itemId}`);
        if (data?.success) {
            setInitialValues({
                serviceType: data?.data?.serviceType || '',
                type: data?.data?.type || '',
                period: data?.data?.period || '',
                waitingMins: data?.data?.waitingMins || '',
                waitingCharge: data?.data?.waitingCharge || '',
                dropPrice: data?.data?.dropPrice || '',
                additionalMins: data?.data?.additionalMins || '',
                extraHours: data?.data?.extraPrice || '',
                nightHoursFrom: data?.data?.nightHoursFrom || '',
                nightHoursTo: data?.data?.nightHoursTo || '',
                nightCharge: data?.data?.nightCharge || '',
                cancelMins: data?.data?.cancelMins || '',
                cancelCharge: data?.data?.cancelCharge || '',
                active: data?.data?.active === 1 ? 'Active' : 'In Active',
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
                                <label className="text-sm font-medium text-gray-700">Price (MVP)</label>
                                <Field type="number" name="priceMVP" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Base Fare</label>
                                <Field type="number" name="baseFare" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Night Hours</label>
                                <Field type="number" name="nightHours" disabled className="p-2 w-full rounded-md border-gray-300 bg-gray-200" />
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
                            <Button fullWidth className="my-6 mx-2 text-white border-2 border-gray-400 bg-black rounded-xl" onClick={() => navigate(`/dashboard/users/master-price/rides-edit/${id}`)}>
                                Edit
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
