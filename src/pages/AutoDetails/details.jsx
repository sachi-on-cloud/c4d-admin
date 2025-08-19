import React, { useEffect, useRef, useState } from 'react';
import { Formik, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { useParams, useNavigate } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';
import PriceTable from '@/components/PriceTable';
import { Button } from '@material-tailwind/react';
// import WalletDetails from '@/components/WalletDetails';
import PrintCabDetails from '@/components/PrintCabDetails';
import DocumentsList from '@/components/DocumentsList';
// import CabPriceTableLog from './CabPriceTableLog';
import SubscriptionLog from '@/components/SubscriptionLog';
import CabDriverWalletLog from '@/components/CabDriverWallet';
import DriverBookingNotes from '@/components/DriverBookingNotes';

const DetailsAuto = ({ btnShow = false, noApprove = false }) => {
    //const [enablePrint, setEnablePrint] = useState(false);
    const printRef = useRef();

    const handlePrintClick = () => {
        //   setEnablePrint(true);
        if (printRef.current) {
            printRef.current.print();  // Trigger the print action
        }
    };

    const navigate = useNavigate();
    const [cab, setCab] = useState({});
    const [packageDetails, setPackageDetails] = useState([]);
    const { id } = useParams();
    const getPackageListDetails = async () => {
        const data = await ApiRequestUtils.get(API_ROUTES.PACKAGE_CABS_LIST);
        if (data?.success) {
            const packageData = data?.data.map(option => {
                const suffix = option.type === 'Local' ? 'hr' : option.type === 'Outstation' ? 'd' : '';
                return {
                    ...option,
                    period: `${option.period} ${suffix}`, // Append 'hr' or 'd'
                };
            });
            const intercityPackage = packageData.filter(val => val.type === 'Local');
            const outstationPackage = packageData.filter(val => { return val.type === 'Outstation' && val.period === '1 d' });
            // const carWashPackage = packageData.filter(val => val.type === 'CarWash');
            const ridesPackage = packageData.filter(val => { return val.type === 'Rides' })
            setPackageDetails([...intercityPackage, ...outstationPackage, ...ridesPackage]);
        }
    };
    useEffect(() => {
        if (id) {
            getPackageListDetails();
            fetchItem(id);
        }
    }, [id]);
    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_AUTO_BY_ID+ `${itemId}`);
        setCab(data?.data);
    };
    const initialValues = {
        name: cab?.result?.name || "",
        ownerName: cab?.result?.Account ? cab?.result?.Account?.name : "",
        ownerPhoneNumber: cab?.result?.ownerPhoneNumber ? cab?.result?.ownerPhoneNumber.replace(/^(\+91)/, '') : "",
        carNumber: cab?.result?.autoNumber || "",
        address: cab?.result?.curAddress || "",
        status: cab?.result?.status || "",
        insurance: cab?.result?.insurance || "",
        driverName: cab?.result?.Drivers[0] ? cab?.result?.Drivers[0].firstName : cab?.result?.driverName ? cab?.result?.driverName : "",
        phoneNumber: cab?.result?.phoneNumber || "",
        driverAddress: cab?.result?.driverAddress || "",
        licenseNumber: cab?.result?.driverLicense || "",
        assignedTo: cab?.result?.assigned || "",
        notify: cab?.result?.notify || "",
        packages: cab?.result?.packages || "",
        carType: cab?.result?.carType || "",
        vehicleType: cab?.result?.vehicleType || "",
        seater: cab?.result?.seater || "",
        luggage: cab?.result?.luggage || "",
        modelYear: cab?.result?.modelYear || "",
        //wallet: cab?.result?.wallet || "",
        withDriver: cab?.result?.withDriver || "",
    };
    return (
        <>
            <div className="p-4 mx-auto">
                <div className="flex flex-row justify-between pr-5">
                    <h2 className="text-2xl font-bold mb-4">Auto Details</h2>
                    {/* <img src="/img/printing.png" height={30} width={30} alt="" onClick={handlePrintClick} /> */}
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
                                    <label htmlFor="carNumber" className="text-sm font-medium text-gray-700">Auto Number</label>
                                    <Field type="text" name="carNumber" disabled className="p-2 w-full rounded-md border-gray-300 border bg-gray-200" maxLength={10} />
                                    <ErrorMessage name="carNumber" component="div" className="text-red-500 text-sm" />
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
                                    <label htmlFor="seater" className="text-sm font-medium text-gray-700">Seater</label>
                                    <Field type="text" name="seater" disabled className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                    <ErrorMessage name="seater" component="div" className="text-red-500 text-sm" />
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
            <DriverBookingNotes cabId={id} />
            <CabDriverWalletLog cabId={id} />
            {cab && cab?.creditLog && <SubscriptionLog subscriptionlog={cab?.creditLog} />}
            {/* {cab?.price && <PriceTable type={"cabId"} id={id} packages={packageDetails} selectedPackages={cab?.result?.packages} />} */}
            {/* {cab?.wallet && <WalletDetails wallet={cab?.wallet} onFetch={() => fetchItem(id)} />} */}
            {/* <PrintCabDetails ref={printRef} packages={packageDetails} cabId={id} /> */}
            {/* {cab && cab?.result?.id && <DocumentsList id={cab?.result?.id} type={'cab'} noApprove={noApprove}/>} */}
            {/* <CabPriceTableLog id={id} /> */}
            {!btnShow && <div className='flex justify-center w-full'>
                <Button
                    onClick={() => navigate(`/dashboard/vendors/account/details/${cab?.result?.AccountId}`)}
                    className={`my-6 px-8 ${ColorStyles.backButton}`}
                >
                    Back
                </Button>
                <Button
                    onClick={() => navigate(`/dashboard/vendors/account/autoDetails/details/edit/${id}`)}
                    className='my-6 px-8 text-white border-2 rounded-xl'
                >
                    Edit
                </Button>
            </div>}
        </>
    );
};

export default DetailsAuto;
