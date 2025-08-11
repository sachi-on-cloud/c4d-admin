import React, { useEffect, useRef, useState } from 'react';
import { Formik, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@material-tailwind/react';
import SubscriptionLog from '@/components/SubscriptionLog';
import CabDriverWalletLog from '@/components/CabDriverWallet';
import DriverBookingNotes from '@/components/DriverBookingNotes';

const ParcelCabDetails = ({ btnShow = false, noApprove = false }) => {


    const navigate = useNavigate();
    const [cab, setCab] = useState({});
    const { accountId } = useParams();
    // console.log('id------>',accountId)

    useEffect(() => {
        if (accountId) {
            fetchItem(accountId);
        }
    }, [accountId]);
    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_CAB_BY_ID + `${itemId}`);
        setCab(data?.data);
    };
    const initialValues = {
        accountId:cab?.result?.accountId || "",
        name: cab?.result?.name || "",
        ownerName: cab?.result?.Account ? cab?.result?.Account?.name : "",
        ownerPhoneNumber: cab?.result?.ownerPhoneNumber ? cab?.result?.ownerPhoneNumber.replace(/^(\+91)/, '') : "",
        vehicleNumber: cab?.result?.vehicleNumber || "",
        address: cab?.result?.curAddress || "",
        status: cab?.result?.status || "",
        insurance: cab?.result?.insurance || "",
        driverName: cab?.result?.Drivers[0] ? cab?.result?.Drivers[0].firstName : cab?.result?.driverName ? cab?.result?.driverName : "",
        phoneNumber: cab?.result?.phoneNumber || "",
        driverAddress: cab?.result?.driverAddress || "",
        licenseNumber: cab?.result?.driverLicense || "",
        notify: cab?.result?.notify || "",
        vehicleType: cab?.result?.vehicleType || "",
        seater: cab?.result?.seater || "",
        luggage: cab?.result?.luggage || "",
        modelYear: cab?.result?.modelYear || "",
    };
    return (
        <>
            <div className="p-4 mx-auto">
                <div className="flex flex-row justify-between pr-5">
                    <h2 className="text-2xl font-bold mb-4">Bike Cab Details</h2>
                </div>
                <Formik
                    initialValues={initialValues}
                    enableReinitialize={true}
                    onSubmit={() => { }}
                >
                    {({ values }) => (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700">Vehicle Name</label>
                                    <Field type="text" name="name" disabled className="p-2 w-full rounded-md border border-gray-300 shadow-sm bg-gray-200" />
                                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                                </div>
                                <div>
                                    <label htmlFor="ownerName" className="text-sm font-medium text-gray-700">Owner Name</label>
                                    <Field type="text" name="ownerName" disabled className="p-2 w-full rounded-md border border-gray-300 shadow-sm bg-gray-200" />
                                    <ErrorMessage name="ownerName" component="div" className="text-red-500 text-sm my-1" />
                                </div>
                                <div>
                                    <label htmlFor="vehicleNumber" className="text-sm font-medium text-gray-700">Vehicle Number</label>
                                    <Field type="text" name="vehicleNumber" disabled className="p-2 w-full rounded-md border-gray-300 border bg-gray-200" maxLength={10} />
                                    <ErrorMessage name="vehicleNumber" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="address" className="text-sm font-medium text-gray-700">Address</label>
                                    <Field type="text" name="address" disabled className="p-2 w-full rounded-md border-gray-300 border bg-gray-200" />
                                    <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="insurance" className="text-sm font-medium text-gray-700">Insurance Expiry Date</label>
                                    <Field type="text" name="insurance" disabled className="p-2 w-full rounded-md border-gray-300 border bg-gray-200" />
                                    <ErrorMessage name="insurance" component="div" className="text-red-500 text-sm" />
                                </div>

                                <div>
                                    <label htmlFor="vehicleType" className="text-sm font-medium text-gray-700">Vehicle Type</label>
                                    <Field type="text" name="vehicleType" disabled className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                    <ErrorMessage name="vehicleType" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="seater" className="text-sm font-medium text-gray-700">Seater</label>
                                    <Field type="text" name="seater" disabled className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                    <ErrorMessage name="seater" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="luggage" className="text-sm font-medium text-gray-700">Luggage</label>
                                    <Field type="text" name="luggage" disabled className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                    <ErrorMessage name="luggage" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="modelYear" className="text-sm font-medium text-gray-700">Year of Model</label>
                                    <Field type="text" name="modelYear" disabled className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                    <ErrorMessage name="modelYear" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="status" className="text-sm font-medium text-gray-700">Status</label>
                                    <Field type="text" name="status" disabled className="p-2 w-full rounded-md border border-gray-300 shadow-sm bg-gray-200" />
                                    <ErrorMessage name="status" component="div" className="text-red-500 text-sm my-1" />
                                </div>
                            </div>
                        </div>
                    )}
                </Formik>
            </div>
            <DriverBookingNotes cabId={accountId} />
            <CabDriverWalletLog cabId={accountId} />
            {cab && cab?.creditLog && <SubscriptionLog subscriptionlog={cab?.creditLog} />}
            
            {/* {cab?.wallet && <WalletDetails wallet={cab?.wallet} onFetch={() => fetchItem(id)} />} */}
            {/* <PrintCabDetails ref={printRef} packages={packageDetails} cabId={id} /> */}
            {/* {cab && cab?.result?.id && <DocumentsList id={cab?.result?.id} type={'cab'} noApprove={noApprove}/>} */}
            
            {!btnShow && <div className='flex justify-center w-full'>
                <Button
                    onClick={() => navigate(`/dashboard/vendors/account/details/${cab?.result?.accountId}`)}
                    className={`my-6 px-8 ${ColorStyles.backButton}`}
                >
                    Back
                </Button>
                <Button
                    onClick={() => navigate(`/dashboard/vendors/account/allVehicles/edit/${id}`)}
                    className='my-6 px-8 text-white border-2 rounded-xl'
                >
                    Edit
                </Button>
            </div>}
        </>
    );
};

export default ParcelCabDetails;