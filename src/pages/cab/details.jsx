import React, { useEffect, useRef, useState } from 'react';
import { Formik, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { useParams, useNavigate } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';
import PriceTable from '@/components/PriceTable';
import { Button } from '@material-tailwind/react';
import WalletDetails from '@/components/WalletDetails';
import PrintDriverDetails from '@/components/PrintDriverDetails';

const CabDetails = () => {
    const [enablePrint, setEnablePrint] = useState(false);
    const printRef = useRef();

    const handlePrintClick = () => {
        setEnablePrint(true);
        if (printRef.current) {
            printRef.current.print();  // Trigger the print action
        }
    };

    const navigate = useNavigate();
    const [cab, setCab] = useState({});
    const [packageDetails, setPackageDetails] = useState([]);
    const { id } = useParams();
    const getPackageListDetails = async () => {
        const data = await ApiRequestUtils.get(API_ROUTES.PACKAGES_LIST);
        if (data?.success) {
            const packageData = data?.data.map(option => {
                const suffix = option.type === 'Intercity' ? 'hr' : option.type === 'Outstation' ? 'd' : '';
                return {
                    ...option,
                    period: `${option.period} ${suffix}`, // Append 'hr' or 'd'
                };
            });
            const intercityPackage = packageData.filter(val => val.type === 'Intercity');
            const outstationPackage = packageData.filter(val => { return val.type === 'Outstation' && val.period === '1 d' });
            const carWashPackage = packageData.filter(val => val.type === 'CarWash');
            setPackageDetails([...intercityPackage, ...outstationPackage, ...carWashPackage]);
        }
    };
    useEffect(() => {
        if (id) {
            getPackageListDetails();
            fetchItem(id);
        }
    }, [id]);
    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_CAB_BY_ID + `${itemId}`);
        setCab(data?.data);
    };
    const initialValues = {
        name: cab?.result?.name || "",
        phoneNumber: cab?.result?.phoneNumber ? cab?.result?.phoneNumber.replace(/^(\+91)/, '') : "",
        carNumber: cab?.result?.carNumber || "",
        address: cab?.result?.curAddress || "",
        company: cab?.result?.company || "",
        insurance: cab?.result?.insurance || "",
        preference: cab?.result?.preference || "",
        packages: cab?.result?.packages || "",
        carType: cab?.result?.carType || "",
        wallet: cab?.result?.wallet || "",
        mode: cab?.result?.mode ? cab?.result?.mode === 'PREPAID' ? 'PREPAID' : 'COMMISSION' : "",
        withDriver: cab?.result?.withDriver || "",
        driverName: cab?.result?.driverName || "",
    };
    return (
        <>
            <div className="p-4 mx-auto">
                <div className="flex flex-row justify-between pr-5">
                    <h2 className="text-2xl font-bold mb-4">Driver Details</h2>
                    <img src="/img/printing.png" height={30} width={30} alt="" onClick={() => {
                        handlePrintClick();
                    }} />
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
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                                    <Field type="text" name="name" disabled className="p-2 w-full rounded-md border border-gray-300 shadow-sm bg-gray-200" />
                                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                                </div>

                                <div>
                                    <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                    <Field type="tel" name="phoneNumber" disabled className="p-2 w-full rounded-md border border-gray-300 bg-gray-200" maxLength={10} />
                                    <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                                </div>

                                <div>
                                    <label htmlFor="carNumber" className="text-sm font-medium text-gray-700">Car Number</label>
                                    <Field type="text" name="carNumber" disabled className="p-2 w-full rounded-md border-gray-300 border bg-gray-200" maxLength={15} />
                                    <ErrorMessage name="carNumber" component="div" className="text-red-500 text-sm" />
                                </div>

                                <div>
                                    <label htmlFor="company" className="text-sm font-medium text-gray-700">Company</label>
                                    <Field type="text" name="company" disabled className="p-2 w-full rounded-md border-gray-300 border bg-gray-200" />
                                    <ErrorMessage name="company" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="address" className="text-sm font-medium text-gray-700">Address</label>
                                    <Field type="text" name="address" disabled className="p-2 w-full rounded-md border-gray-300 border bg-gray-200" />
                                    <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
                                </div>

                                <div>
                                    <label htmlFor="insurance" className="text-sm font-medium text-gray-700">Insurance</label>
                                    <Field type="text" name="insurance" disabled className="p-2 w-full rounded-md border-gray-300 border bg-gray-200" />
                                    <ErrorMessage name="insurance" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">With Driver</p>
                                    <div className="space-x-4">
                                        <label className="inline-flex items-center">
                                            <Field type="radio" name="withDriver" disabled value="Yes" className="form-radio" />
                                            <span className="ml-2">Yes</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <Field type="radio" name="withDriver" disabled value="No" className="form-radio" />
                                            <span className="ml-2">No</span>
                                        </label>
                                    </div>
                                    <ErrorMessage name="preference" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="driverName" className="text-sm font-medium text-gray-700">Driver Name</label>
                                    <Field type="text" name="driverName" disabled className="p-2 w-full rounded-md border-gray-300 border bg-gray-200" />
                                    <ErrorMessage name="driverName" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Car Type</p>
                                    <div className="space-x-4">
                                        <label className="inline-flex items-center">
                                            <Field type="radio" name="carType" disabled value="Sedan" className="form-radio" />
                                            <span className="ml-2">Sedan</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <Field type="radio" name="carType" disabled value="SUV" className="form-radio" />
                                            <span className="ml-2">SUV</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <Field type="radio" name="carType" disabled value="Hatchback" className="form-radio" />
                                            <span className="ml-2">Hatchback</span>
                                        </label>
                                    </div>
                                    <ErrorMessage name="carType" component="div" className="text-red-500 text-sm" />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Mode</p>
                                    <div className="space-x-4">
                                        <label className="inline-flex items-center">
                                            <Field type="radio" name="mode" disabled value="PREPAID" className="form-radio" />
                                            <span className="ml-2">Prepaid</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <Field type="radio" name="mode" disabled value="COMMISSION" className="form-radio" />
                                            <span className="ml-2">Commission</span>
                                        </label>
                                    </div>
                                    <ErrorMessage name="mode" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="packages" className="text-sm font-medium text-gray-700">Package</label>
                                    <Multiselect
                                        options={packageDetails}
                                        displayValue="period"
                                        selectedValues={packageDetails.filter(option => values.packages.includes(option.id))}
                                        placeholder=""
                                        className="w-full rounded-xl border-gray-300 bg-gray-200 border"
                                        disable={true}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </Formik>
            </div>
            {cab?.price && <PriceTable type={"cabId"} id={id} packages={packageDetails} selectedPackages={cab?.result?.packages} />}
            {cab?.wallet && <WalletDetails wallet={cab?.wallet} onFetch={() => fetchItem(id)} />}
            {enablePrint && <PrintDriverDetails ref={printRef} packages={packageDetails} cabId={id} />}
            <div className='flex justify-center w-full'>
                <Button
                    onClick={() => { navigate('/dashboard/cab'); }}
                    className='my-6 px-8 text-white border-2 rounded-xl'
                >
                    Back
                </Button>
            </div>
        </>
    );
};

export default CabDetails;