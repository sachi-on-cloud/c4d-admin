import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { Button, Card, CardBody, Typography, Input, List, ListItem,Dialog, DialogHeader, DialogBody } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';
import { CAB_SCHEMA } from '@/utils/validations';
import moment from 'moment';

const LocationInput = ({ field, form, suggestions, onSearch, type }) => {
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        form.validateField(field.name);
    }, []);

    return (
        <div className="relative">
            <Input
                type="text"
                placeholder="Enter address"
                {...field}
                onChange={(e) => {
                    form.setFieldValue(field.name, e.target.value);
                    onSearch(e.target.value, type);
                    form.setFieldTouched(field.name, true, false);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                    field.onBlur(e);
                    setTimeout(() => setIsFocused(false), 200);
                    form.validateField(field.name);
                }}
                className="pr-10"
            />
            {suggestions.length > 0 && isFocused && (
                <List className="w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg ">
                    {suggestions.map((suggestion, index) => (
                        <ListItem
                            key={index}
                            onClick={() => {
                                form.setFieldValue(field.name, suggestion);
                                setIsFocused(false);
                            }}
                            className=" hover:bg-gray-100 cursor-pointer"
                        >
                            <Typography variant="small">{suggestion}</Typography>
                        </ListItem>
                    ))}
                </List>
            )}
        </div>
    );
};

const CabEdit = () => {
    const [cabVal, setCabVal] = useState({});
    const [alert, setAlert] = useState(false);
    const [packageDetails, setPackageDetails] = useState([]);
    const [ownerAddressSuggestions, setOwnerAddressSuggestions] = useState([]);
    const [driverAddressSuggestions, setDriverAddressSuggestions] = useState([]);
    // const [accountOptions, setAccountOptions] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [insuranceImagePreview ,setInsuranceImagePreview] = useState(null);
    const [accountRelatedDrivers, setAccountRelatedDrivers] = useState([]);
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [modalData,setModalData] = useState(null);

    // const getAccountNames = async () => {
    //     try {
    //         const data = await ApiRequestUtils.get(API_ROUTES.GET_ACCOUNT);
    //         if (data?.success) {
    //             setAccountOptions(data.data.map(account => ({
    //                 value: account.name,
    //                 label: account.name
    //             })));
    //         }
    //     } catch (error) {
    //         console.error('Error fetching account names:', error);
    //         setAlert({ message: 'Error fetching account names', color: 'red' });
    //     }
    // };

    const getAccountRelatedDrivers = async (accountId) => {
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_ACCOUNT_RELATED_DRIVERS, {
                accountId: accountId
            });
    
            if (data?.success && data?.data.length > 0) {
                setAccountRelatedDrivers(data?.data);
            }
        }

    function getNameById(id, obj) {
        for (const key in obj) {
            if (obj[key].id === id) {
                return obj[key].period;
            }
        }
        return null;
    }

    const orderPackages = (packages, type) => {
        return packages.sort((a, b) => {
            if (type === 'Intercity') {
                const hoursA = parseInt(a.period);
                const hoursB = parseInt(b.period);
                return hoursA - hoursB;
            } else if (type === 'CarWash') {
                const numberA = parseInt(a.period.match(/\d+/)[0]);
                const numberB = parseInt(b.period.match(/\d+/)[0]);
                return numberA - numberB;
            }
            return 0;
        });
    };

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
            const intercityPackage = orderPackages(packageData.filter(val => val.type === 'Intercity'), 'Intercity');
            const outstationPackage = packageData.filter(val => { return val.type === 'Outstation' && val.period === '1 d' });
            const carWashPackage = orderPackages(packageData.filter(val => val.type === 'CarWash'),'CarWash');
            setPackageDetails([...intercityPackage, ...outstationPackage, ...carWashPackage]);
        }
    };

    useEffect(() => {
        getPackageListDetails();
        // getAccountNames();
        fetchItem(id);
    }, [id]);

    const fetchItem = async (itemId) => {
        try{
        const data = await ApiRequestUtils.get(API_ROUTES.GET_CAB_BY_ID + `${itemId}`);
        if(data?.data) {
            setCabVal(data.data);
            getAccountRelatedDrivers(data?.data?.result?.Account?.id)
        } else {
            console.error('No cab data received');
            navigate('/dashboard/vendors/account/allVehicles');
         }
        } catch (error) {
            console.error('Error fetching driver:', error);
            navigate('/dashboard/vendors/account/allVehicles');
        }
    };

    const initialValues = {
        name: cabVal?.result?.name || "",
        ownerName: cabVal?.result?.Account ? cabVal?.result?.Account?.name : "",
        // ownerPhoneNumber: cabVal?.result?.ownerPhoneNumber ? cabVal?.result?.ownerPhoneNumber.replace(/^(\+91)/, '') : "",
        driverId: cabVal?.result?.Drivers[0]?.id || "",
        carNumber: cabVal?.result?.carNumber || "",
        address: cabVal?.result?.curAddress || "",
        insurance: cabVal?.result?.insurance || "",
        withDriver: cabVal?.result?.withDriver || "",
        assignOrAddDriver: "Assign",
        driverName: cabVal?.result?.driverName || "",
        phoneNumber: cabVal?.result?.phoneNumber || "",
        driverAddress: cabVal?.result?.driverAddress || "",
        licenseNumber: cabVal?.result?.driverLicense || "",
        notify: cabVal?.result?.notify || "",
        packages: cabVal?.result?.packages || "",
        carType: cabVal?.result?.carType || "",
       // wallet: cabVal?.result?.wallet || "",
        prices: cabVal?.price ? cabVal?.price.filter((el) => cabVal?.result?.packages.includes(el.packageId)) : [],
        image1: cabVal?.result?.Proofs ? cabVal?.result?.Proofs[0]?.image1 : '',
        insuranceImg : cabVal?.result?.Proofs ? cabVal?.result?.Proofs[1]?.image1:'',
        fullDocVal : cabVal?.result?.Proofs ? cabVal?.result?.Proofs : '',
    };

    const searchLocations = async (query, type) => {
        if (query.length > 2) {
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.SEARCH_ADDRESS, {
                address: query
            });
            if (data?.success && data?.data) {
                if (type === 'owner') {
                    setOwnerAddressSuggestions(data?.data);
                    setDriverAddressSuggestions([]); 
                } else {
                    setDriverAddressSuggestions(data?.data);
                    setOwnerAddressSuggestions([]);
                }
            }
        } else {
            if (type === 'owner') {
                setOwnerAddressSuggestions([]);
            } else {
                setDriverAddressSuggestions([]);
            } 
        }
    };

    const renderPriceTable = (title, prices, values) => {
        if (prices.length === 0) return null;
        
        const sortedPrices = [...prices].sort((a, b) => {
            const packageA = packageDetails.find(p => p.id === a.packageId);
            const packageB = packageDetails.find(p => p.id === b.packageId);
            
            if (title === "INTERCITY") {
                const hoursA = parseInt(packageA.period);
                const hoursB = parseInt(packageB.period);
                return hoursA - hoursB;
            } else if (title === "CAR WASH") {
                const numberA = parseInt(packageA.period.match(/\d+/)[0]);
                const numberB = parseInt(packageB.period.match(/\d+/)[0]);
                return numberA - numberB;
            }
            return 0;
        });
        return (
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <Card>
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {["Package", "Price", "Extra Price", "Extra KM Price", "Night Charge", "Cancel Charge", "Cab Type"].map((el) => (
                                        <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                            <Typography variant="h6" className="text-[12px] font-bold uppercase text-black">
                                                {el}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedPrices.map((priceItem) => (
                                    <tr key={priceItem.packageId}>
                                        <td className="py-3 px-5 border-b border-blue-gray-50">
                                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                                {getNameById(priceItem.packageId, packageDetails)}
                                            </Typography>
                                        </td>
                                        {['price', 'extraPrice', 'extraKmPrice', 'nightCharge', 'cancelCharge', 'extraCabType'].map((field) => (
                                            <td key={field} className="py-3 px-5 border-b border-blue-gray-50">
                                                <Field
                                                    name={`prices[${values.prices.indexOf(priceItem)}].${field}`}
                                                    type="number"
                                                    className="w-full p-1 text-xs border rounded"
                                                />
                                                <ErrorMessage 
                                                    name={`prices[${values.prices.indexOf(priceItem)}].${field}`} 
                                                    component="div" 
                                                    className="text-red-500 text-xs" 
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            </div>
        );
    };

    const onSubmit = async (values, { setSubmitting, resetForm }) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        //console.log('onSubmit :', values)
        try {
            const cabDetails = {
                name: values.name,
                ownerPhoneNumber: "+91" + values.ownerPhoneNumber,
                carNumber: values.carNumber,
                curAddress: values.address,
                company: values.company,
                withDriver: values.withDriver,
                driverName: values.driverName,
                phoneNumber: values.phoneNumber,
                driverAddress: values.driverAddress,
                driverLicense: values.licenseNumber,
                notify: values.notify,
                insurance: values.insurance,
                packages: values.packages,
                carType: values.carType,
                //wallet: values.wallet,
                cabId: id
            };
            if (!cabDetails?.driverName) {
                cabDetails['driverId'] = values?.driverId
            }
            const formData = new FormData();
            
            if (cabVal?.result?.Proofs) {
                formData.append('documentId', cabVal?.result?.Proofs[0]?.id);
            }

            if (cabVal?.result?.Proofs) {
                formData.append('documentIdInsurance', cabVal?.result?.Proofs[1]?.id);
            }

            formData.append('cabDetails', JSON.stringify(cabDetails));
            formData.append('prices', JSON.stringify(values.prices));
            if (imagePreview) {
                formData.append('image1', values.image1);
                formData.append('extImage1', values.image1.name.split('.')[1]);
                formData.append('fileTypeImage1', values.image1.type);
            }

            if (insuranceImagePreview) {
                formData.append('insuranceImg', values.insuranceImg);
                formData.append('extInsuranceImg', values.insuranceImg.name.split('.')[1]);
                formData.append('fileTypeextInsuranceImg', values.insuranceImg.type);
            }

            const data = await ApiRequestUtils.updateDocs(API_ROUTES.UPDATE_CAB, formData);
            if (data?.success) {
                navigate('/dashboard/vendors/account/allVehicles', {
                    state: {
                        cabAdded: true,
                        cabName: data?.data?.name
                    }
                });
            } else {
                throw new Error(data?.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating cab:', error);
        } finally {
            setIsSubmitting(false);
            setSubmitting(false);
        }
    };
    const currentDate = () => {
        return (new Date()).toISOString().split('T')[0];
    };
    return (
        <div className="p-4 mx-auto">
            <h2 className="text-2xl font-bold mb-4">Update Cab</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={CAB_SCHEMA}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ handleSubmit, values, errors, dirty, isValid, handleChange, setFieldValue }) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">Cab Name</label>
                                <Field type="text" name="name" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" />
                                <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            <div>
                                <label htmlFor="ownerName" className="text-sm font-medium text-gray-700">Owner Name</label>
                                <Field type="text" name="ownerName" disabled className="p-2 w-full rounded-md border border-gray-300 shadow-sm bg-gray-200" />
                                <ErrorMessage name="ownerName" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            {/* <div>
                                <label htmlFor="ownerPhoneNumber" className="text-sm font-medium text-gray-700">Owner Phone Number</label>
                                <Field type="tel" name="ownerPhoneNumber" className="p-2 w-full rounded-md border border-gray-300 " maxLength={10} />
                                <ErrorMessage name="ownerPhoneNumber" component="div" className="text-red-500 text-sm" />
                            </div> */}

                            <div>
                                <label htmlFor="carNumber" className="text-sm font-medium text-gray-700">Car Number</label>
                                <Field type="text" name="carNumber" className="p-2 w-full rounded-md border-gray-300 border" maxLength={15} />
                                <ErrorMessage name="carNumber" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="address" className="text-sm font-medium text-gray-700">Address</label>
                                <Field name="address">
                                    {({ field, form }) => (
                                        <LocationInput
                                            field={field}
                                            form={form}
                                            suggestions={ownerAddressSuggestions}
                                            onSearch={searchLocations}
                                            type="owner"
                                        />
                                    )}
                                </Field>
                                <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
                            </div>
                            
                            <div>
                                <label htmlFor="insurance" className="text-sm font-medium text-gray-700">Insurance Expiry Date</label>
                                <Field type="date" name="insurance" className="p-2 w-full rounded-md border-gray-300 border"  min={currentDate()} />
                                <ErrorMessage name="insurance" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Car Type</p>
                                <div className="space-x-4">
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="carType" value="Sedan" className="form-radio" />
                                        <span className="ml-2">Sedan</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="carType" value="SUV" className="form-radio" />
                                        <span className="ml-2">SUV</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="carType" value="Hatchback" className="form-radio" />
                                        <span className="ml-2">Hatchback</span>
                                    </label>
                                </div>
                                <ErrorMessage name="carType" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">With Driver</p>
                                <div className="space-x-4">
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="withDriver" value="Yes" className="form-radio" 
                                            onChange={e => {
                                                handleChange(e);
                                                setFieldValue('driverName', values.driverName, true);
                                                setFieldValue('phoneNumber', values.phoneNumber, true);
                                                setFieldValue('driverAddress', values.driverAddress, true);
                                                setFieldValue('licenseNumber', values.licenseNumber, true);
                                            }} />
                                        <span className="ml-2">Yes</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="withDriver" value="No" className="form-radio"
                                            onChange={e => {
                                                handleChange(e);
                                                setFieldValue('driverName', '', true);
                                                setFieldValue('phoneNumber', '', true);
                                                setFieldValue('driverAddress','', true);
                                                setFieldValue('licenseNumber','' , true);
                                            }} />
                                        <span className="ml-2">No</span>
                                    </label>
                                </div>
                                <ErrorMessage name="preference" component="div" className="text-red-500 text-sm" />
                            </div>
                            {values.withDriver === 'Yes' && (
                                <>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Assign or Add Driver</p>
                                        <div className="space-x-4">
                                            <label className="inline-flex items-center">
                                                <Field type="radio" name="assignOrAddDriver" value="Assign" className="form-radio"
                                                    onChange={e => {
                                                        handleChange(e);
                                                        setFieldValue('driverId', values.driverId, true);
                                                        // setFieldValue('phoneNumber', values.phoneNumber, true);
                                                        // setFieldValue('driverAddress', values.driverAddress, true);
                                                        // setFieldValue('licenseNumber', values.licenseNumber, true);
                                                    }} />
                                                <span className="ml-2">Assign</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <Field type="radio" name="assignOrAddDriver" value="Add" className="form-radio"
                                                    onChange={e => {
                                                        handleChange(e);
                                                        // setFieldValue('driverName', '', true);
                                                        // setFieldValue('phoneNumber', '', true);
                                                        // setFieldValue('driverAddress','', true);
                                                        // setFieldValue('licenseNumber','' , true);
                                                    }} />
                                                <span className="ml-2">Add</span>
                                            </label>
                                        </div>
                                        <ErrorMessage name="assignOrAddDriver" component="div" className="text-red-500 text-sm" />
                                    </div>
                                    {values?.assignOrAddDriver === 'Assign' && accountRelatedDrivers.length > 0 &&
                                        <div>
                                            <label htmlFor="driverId" className="text-sm font-medium text-gray-700">Driver</label>
                                            <Field
                                                as="select"
                                                name="driverId"
                                                className="p-2 w-full rounded-md border-gray-300 shadow-sm"
                                            // onChange={(e) => {
                                            //     const selectedAccountId = e.target.value;
                                            //     console.log('selectedAccountId :', selectedAccountId)
                                            //     if (selectedAccountId) {
                                            //         getAccountRelatedDrivers(selectedAccountId);
                                            //     }
                                            // }}
                                            >
                                                <option value="">Select Driver</option>
                                                {accountRelatedDrivers.map((option) => (
                                                    <option key={option.id} value={option.id}>
                                                        {option.firstName}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                                        </div>
                                    }
                                    {values?.assignOrAddDriver === 'Add' && <div>
                                        <label htmlFor="driverName" className="text-sm font-medium text-gray-700">Driver Name</label>
                                        <Field type="text" name="driverName" className="p-2 w-full rounded-md border-gray-300" />
                                        <ErrorMessage name="driverName" component="div" className="text-red-500 text-sm" />
                                    </div>}
                                    {values?.assignOrAddDriver === 'Add' && <div>
                                        <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                        <Field type="tel" name="phoneNumber" className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                        <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                                    </div>}
                                    {values?.assignOrAddDriver === 'Add' && <div>
                                        <label htmlFor="driverAddress" className="text-sm font-medium text-gray-700">Driver Address</label>
                                        <Field name="driverAddress">
                                            {({ field, form }) => (
                                                <LocationInput
                                                    field={field}
                                                    form={form}
                                                    suggestions={driverAddressSuggestions}
                                                    onSearch={searchLocations}
                                                    type="driver"
                                                />
                                            )}
                                        </Field>
                                        <ErrorMessage name="driverAddress" component="div" className="text-red-500 text-sm" />
                                    </div>}
                                    {values?.assignOrAddDriver === 'Add' && <div>
                                        <label htmlFor="licenseNumber" className="text-sm font-medium text-gray-700">License Number</label>
                                        <Field type="text" name="licenseNumber" className="p-2 w-full rounded-md border-gray-300" maxLength={15} />
                                        <ErrorMessage name="licenseNumber" component="div" className="text-red-500 text-sm" />
                                    </div>}
                                </>
                            )}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Notify</p>
                                <div className="space-x-4">
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="notify" value="OWNER" className="form-radio" />
                                        <span className="ml-2">Owner</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="notify" value="DRIVER" className="form-radio" />
                                        <span className="ml-2">Driver</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field type="radio" name="notify" value="BOTH" className="form-radio" />
                                        <span className="ml-2">Both</span>
                                    </label>
                                </div>
                                <ErrorMessage name="notify" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="packages" className="text-sm font-medium text-gray-700">Package</label>
                                <Multiselect
                                    options={packageDetails}
                                    displayValue="period"
                                    selectedValues={packageDetails.filter(option => values.packages.includes(option.id))}
                                    onSelect={(selectedList) => {
                                        setFieldValue("packages", selectedList.map(item => item.id));
                                        const newPrices = selectedList.filter((el) => !values.packages.includes(el.id)).map(item => ({
                                            packageId: item.id,
                                            period: item.period,
                                            price: item.price,
                                            extraPrice: item.extra_price,
                                            extraKmPrice: item.extraKmPrice,
                                            nightCharge: item.nightCharge,
                                            cancelCharge: item.cancelCharge,
                                            extraCabType: item.extraCabType
                                        }));
                                        setFieldValue("prices", [...values.prices, ...newPrices]);
                                    }}
                                    onRemove={(selectedList) => {
                                        setFieldValue("packages", selectedList.map(item => item.id));
                                        setFieldValue("prices", values.prices.filter(price =>
                                            selectedList.some(item => item.id === price.packageId)
                                        ));
                                    }}
                                    placeholder="Select options"
                                    className="w-full rounded-md border-gray-300"
                                    showCheckbox={true}
                                />
                            </div>
                            </div>

                            <div className="mt-6">
                                <div className="flex flex-row justify-between px-2 mb-2">
                                    <h3 className="text-2xl font-bold">Document Upload</h3>
                                </div>
                                <Card>
                                    <>
                                        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                                            <table className="w-full min-w-[640px] table-auto">
                                                <thead>
                                                    <tr>
                                                        {["Type", "Status", "Action","View Details","Created At","Verified At"].map((el, index) => (
                                                            <th
                                                                key={index}
                                                                className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                                            >
                                                                <Typography
                                                                    variant="small"
                                                                    className="text-[11px] font-bold uppercase text-blue-gray-400"
                                                                >
                                                                    {el}
                                                                </Typography>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="py-3 px-5 border-b border-blue-gray-50">
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                Insurance
                                                            </Typography>
                                                        </td>
                                                        <td className="py-3 px-5 border-b border-blue-gray-50">
                                                            <Typography
                                                                className={`text-xs font-semibold ${
                                                                    values.insuranceImg ? "text-green-500" : "text-blue-500"
                                                                }`}
                                                            >
                                                                {values.insuranceImg ? "UPLOADED" : "NO DOCUMENTS"}
                                                            </Typography>
                                                        </td>
                                                        <td className="py-3 px-5 border-b border-blue-gray-50">
                                                            <div className="flex items-center gap-2">
                                                                <label
                                                                    htmlFor="insuranceImg"
                                                                    className="inline-block text-center text-white border border-gray-400 bg-black rounded-lg px-4 py-1 cursor-pointer"
                                                                >
                                                                    {values.insuranceImg ? "Update" : "Upload"}
                                                                </label>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    id="insuranceImg"
                                                                    name="insuranceImg"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files[0];
                                                                        if (file) {
                                                                            setFieldValue("insuranceImg", file);

                                                                            const reader = new FileReader();
                                                                            reader.onloadend = () => {
                                                                                setInsuranceImagePreview(reader.result);
                                                                            };
                                                                            reader.readAsDataURL(file);
                                                                        }
                                                                    }}
                                                                    className="hidden"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-5 border-b border-blue-gray-50">
                                                            {values.insuranceImg && (
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-semibold underline cursor-pointer text-blue-900"
                                                                    onClick={() =>
                                                                        setModalData({
                                                                            image: insuranceImagePreview || values.insuranceImg,
                                                                        })
                                                                    }
                                                                >
                                                                    View Details
                                                                </Typography>
                                                            )}
                                                        </td>
                                                        {values.insuranceImg && <><td className="py-3 px-5 border-b border-blue-gray-50">
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {moment(values.fullDocVal[0]?.created_at).format("DD-MM-YYYY")}
                                                            </Typography>
                                                        </td>
                                                        <td className="py-3 px-5 border-b border-blue-gray-50">
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {values.fullDocVal[0]?.status !== 'PENDING' ? moment(updated_at).format("DD-MM-YYYY") : ""}
                                                            </Typography>
                                                        </td></>}
                                                    </tr>
                                                    
                                                    <tr>
                                                        <td className="py-3 px-5 border-b border-blue-gray-50">
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                RC Book
                                                            </Typography>
                                                        </td>
                                                        <td className="py-3 px-5 border-b border-blue-gray-50">
                                                            <Typography
                                                                className={`text-xs font-semibold ${
                                                                    values.image1 ? "text-green-500" : "text-blue-500"
                                                                }`}
                                                            >
                                                                {values.image1 ? "UPLOADED" : "NO DOCUMENTS"}
                                                            </Typography>
                                                        </td>
                                                        <td className="py-3 px-5 border-b border-blue-gray-50">
                                                            <div className="flex items-center gap-2">
                                                                <label
                                                                    htmlFor="image1"
                                                                    className="inline-block text-center text-white border border-gray-400 bg-black rounded-lg px-4 py-1 cursor-pointer"
                                                                >
                                                                    {values.image1 ? "Update" : "Upload"}
                                                                </label>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    id="image1"
                                                                    name="image1"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files[0];
                                                                        if (file) {
                                                                            setFieldValue("image1", file);

                                                                            const reader = new FileReader();
                                                                            reader.onloadend = () => {
                                                                                setImagePreview(reader.result);
                                                                            };
                                                                            reader.readAsDataURL(file);
                                                                        }
                                                                    }}
                                                                    className="hidden"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-5 border-b border-blue-gray-50">
                                                            {values.image1 && (
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-semibold underline cursor-pointer text-blue-900"
                                                                    onClick={() =>
                                                                        setModalData({
                                                                            image: imagePreview || values.image1,
                                                                        })
                                                                    }
                                                                >
                                                                    View Details
                                                                </Typography>
                                                            )}
                                                        </td>
                                                        {values.image1 && <><td className="py-3 px-5 border-b border-blue-gray-50">
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {moment(values.fullDocVal[1]?.created_at).format("DD-MM-YYYY")}
                                                            </Typography>
                                                        </td>
                                                        <td className="py-3 px-5 border-b border-blue-gray-50">
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {values.fullDocVal[1]?.status !== 'PENDING' ? moment(updated_at).format("DD-MM-YYYY") : ""}
                                                            </Typography>
                                                        </td></>}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </CardBody>
                                    </>
                                </Card>
                            </div>

                        {values.packages.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Price Details</h2>
                                {renderPriceTable(
                                    "INTERCITY",
                                    values.prices.filter(price => {
                                        const package_ = packageDetails.find(p => p.id === price.packageId);
                                        return package_?.type === 'Intercity';
                                    }),
                                    values,
                                    packageDetails
                                )}

                                {renderPriceTable(
                                    "OUTSTATION",
                                    values.prices.filter(price => {
                                        const package_ = packageDetails.find(p => p.id === price.packageId);
                                        return package_?.type === 'Outstation';
                                    }),
                                    values,
                                    packageDetails
                                )}

                                {renderPriceTable(
                                    "CAR WASH",
                                    values.prices.filter(price => {
                                        const package_ = packageDetails.find(p => p.id === price.packageId);
                                        return package_?.type === 'CarWash';
                                    }),
                                    values,
                                    packageDetails
                                )}
                            </div>
                        )}
                        <div className='flex flex-row'>
                            <Button
                                fullWidth
                                onClick={() => { navigate('/dashboard/vendors/account/allVehicles'); }}
                                className='my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl'
                            >
                                Cancel
                            </Button>
                            <Button
                                fullWidth
                                color="black"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !isValid}
                                className='my-6 mx-2'
                            >
                                Update
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
            {modalData && (
                <Dialog open={Boolean(modalData)} handler={() => setModalData(null)} size="md">
                    <DialogHeader>
                    <div className="flex justify-between items-center w-full">
                        <Typography variant="h6">Document Details</Typography>
                        <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => setModalData(null)}
                        >
                        X
                        </button>
                    </div>
                    </DialogHeader>
                    <DialogBody divider>
                    <div className="flex flex-col items-center">
                        <img
                        src={modalData.image}
                        alt="Document"
                        className="max-w-full rounded-lg shadow-md"
                        style={{ height: "45vh", objectFit: "contain" }}
                        />
                    </div>
                    </DialogBody>
                </Dialog>
            )}
        </div>
    );
};

export default CabEdit;