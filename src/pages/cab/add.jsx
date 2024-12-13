import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { Alert, Button, Card, CardBody, Typography, Input, List, ListItem } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';
import { CAB_ADD_SCHEMA } from '@/utils/validations';

const LocationInput = ({ field, form, suggestions, onSearch, type}) => {
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
                <List className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                        <ListItem
                            key={index}
                            onClick={() => {
                                form.setFieldValue(field.name, suggestion);
                                setIsFocused(false);
                                form.validateField(field.name);
                            }}
                            className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                        >
                            <Typography variant="small">{suggestion}</Typography>
                        </ListItem>
                    ))}
                </List>
            )}
        </div>
    );
};

const CabAdd = () => {
    const [cabVal, setCabVal] = useState({});
    const [alert, setAlert] = useState(false);
    const [packageDetails, setPackageDetails] = useState([]);
    const [owneraddressSuggestions, setOwnerAddressSuggestions] = useState([]);
    const [driverAddressSuggestions, setDriverAddressSuggestions] = useState([]);
    const [accountOptions, setAccountOptions] = useState([]);
    const { id } = useParams();
    const [imagePreview, setImagePreview] = useState(null);
    const [insuranceImagePreview , setInsuranceImagePreview] = useState(null);
    const navigate = useNavigate();

    const getAccountNames = async () => {
        try {
            const data = await ApiRequestUtils.get(API_ROUTES.GET_ACCOUNT);
            if (data?.success) {
                setAccountOptions(data.data.map(account => ({
                    value: account.id,
                    label: account.name
                })));
            }
        } catch (error) {
            console.error('Error fetching account names:', error);
            setAlert({ message: 'Error fetching account names', color: 'red' });
        }
    };

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
        getAccountNames();
        // if (isEditMode) {
        //     fetchItem(id);
        // }
    }, [id]);

    // const fetchItem = async (itemId) => {
    //     const data = await ApiRequestUtils.get(API_ROUTES.GET_DRIVER_BY_ID + `${itemId}`);
    //     setCabVal(data.data);
    // };

    const initialValues = {
        name: cabVal?.name || "",
        accountId: "",
        ownerPhoneNumber: cabVal?.ownerPhoneNumber ? cabVal?.ownerPhoneNumber.replace(/^(\+91)/, '') : "",
        carNumber: cabVal?.carNumber || "",
        address: cabVal?.address || "",
        company: cabVal?.company || "",
        insurance: cabVal?.insurance || "",
        withDriver: cabVal?.withDriver || "",
        driverName: cabVal?.driverName || "",
        phoneNumber: cabVal?.phoneNumber || "",
        driverAddress: cabVal?.driverAddress || "",
        licenseNumber: cabVal?.driverLicense || "",
        notify: cabVal?.notify || "",
        carType: cabVal?.carType || "",
        packages: cabVal?.packages || [],
        //wallet: cabVal?.wallet || "",
        prices: [],
        image1: "",
        insuranceImg:""
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
                                                {priceItem.period}
                                            </Typography>
                                        </td>
                                        {['price', 'extraPrice', 'extraKmPrice', 'nightCharge', 'cancelCharge', 'extraCabType'].map((field) => (
                                            <td key={field} className="py-3 px-5 border-b border-blue-gray-50">
                                                <Field
                                                    name={`prices[${values.prices.indexOf(priceItem)}].${field}`}
                                                    type= "number"
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
        try {
            const cabDetails = {
                name: values.name,
                ownerPhoneNumber: "+91" + values.ownerPhoneNumber,
                carNumber: values.carNumber,
                curAddress: values.address,
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
                accountId: values.accountId
            };
            // let cabData = { cabDetails, prices: values.prices };
            const formData = new FormData();
        
            formData.append('cabDetails', JSON.stringify(cabDetails));
            formData.append('prices', JSON.stringify(values.prices));
            formData.append('insuranceImg',values.insuranceImg);
            formData.append('extInsurance',values.insuranceImg.name.split('.')[1]);
            formData.append('fileTypeInsurance',values.insuranceImg.type);
            formData.append('image1', values.image1);
            formData.append('extImage1', values.image1.name.split('.')[1]);
            formData.append('fileTypeImage1', values.image1.type);

            const data = await ApiRequestUtils.postDocs(API_ROUTES.REGISTER_CAB, formData);
            console.log('CAB DATA :', data);
            if (!data?.success && data?.code === 203) {
                setAlert({ message: 'Cab already exists', color: 'red' });
                setTimeout(() => setAlert(null), 2000);
                resetForm();
            } else {
                navigate('/dashboard/cab', {
                    state: {
                        cabAdded: true,
                        cabName: data?.data?.name
                    }
                });
            }
        } catch (error) {
            console.error('Error creating driver and car:', error);
        }
        setSubmitting(false);
    };
    const currentDate = () => {
        return (new Date()).toISOString().split('T')[0];
    };
    return (
        <div className="p-4 mx-auto">
            {alert && <div className='mb-2'>
                <Alert
                    color={alert.color}
                    className='py-3 px-6 rounded-xl'
                >
                    {alert.message}
                </Alert>
            </div>}
            <h2 className="text-2xl font-bold mb-4">Add New Cab</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={CAB_ADD_SCHEMA}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ handleSubmit, values, errors, dirty, isValid, handleChange, setFieldValue, touched }) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">

                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">Cab Name</label>
                                <Field type="text" name="name" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" />
                                <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                            </div>
                            <div>
                                <label htmlFor="accountId" className="text-sm font-medium text-gray-700">Owner Name</label>
                                <Field
                                    as="select"
                                    name="accountId"
                                    className="p-2 w-full rounded-md border-gray-300 shadow-sm"
                                >
                                    <option value="">Select Owner</option>
                                    {accountOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Field>
                                <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            {/* <div>
                                <label htmlFor="ownerPhoneNumber" className="text-sm font-medium text-gray-700">Owner Phone Number</label>
                                <Field type="tel" name="ownerPhoneNumber" className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                <ErrorMessage name="ownerPhoneNumber" component="div" className="text-red-500 text-sm" />
                            </div> */}

                            <div>
                                <label htmlFor="carNumber" className="text-sm font-medium text-gray-700">Car Number</label>
                                <Field type="text" name="carNumber" className="p-2 w-full rounded-md border-gray-300" maxLength={15} />
                                <ErrorMessage name="carNumber" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="address" className="text-sm font-medium text-gray-700">Address</label>
                                <Field name="address">
                                    {({ field, form }) => (
                                        <LocationInput
                                            field={field}
                                            form={form}
                                            suggestions={owneraddressSuggestions}
                                            onSearch={searchLocations}
                                            type="owner"
                                        />
                                    )}
                                </Field>
                                <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="insurance" className="text-sm font-medium text-gray-700">Insurance Expiry Date</label>
                                <Field type="date" name="insurance" className="p-2 w-full rounded-xl border-2 border-gray-300" value={values.rideDate} min={currentDate()} ></Field>
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
                                <ErrorMessage name="withDriver" component="div" className="text-red-500 text-sm" />
                            </div>
                            {values.withDriver === 'Yes' && (
                            <>
                            <div>
                                <label htmlFor="driverName" className="text-sm font-medium text-gray-700">Driver Name</label>
                                <Field type="text" name="driverName" className="p-2 w-full rounded-md border-gray-300" />
                                <ErrorMessage name="driverName" component="div" className="text-red-500 text-sm" />   
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                <Field type="tel" name="phoneNumber" className="p-2 w-full rounded-md border-gray-300" maxLength={10} />
                                <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
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
                            </div>
                            <div>
                                <label htmlFor="licenseNumber" className="text-sm font-medium text-gray-700">License Number</label>
                                <Field type="text" name="licenseNumber" className="p-2 w-full rounded-md border-gray-300" maxLength={15} />
                                <ErrorMessage name="licenseNumber" component="div" className="text-red-500 text-sm" />
                            </div>
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
                            {/* <div>
                                <label htmlFor="wallet" className="text-sm font-medium text-gray-700">Wallet</label>
                                <Field type="text" name="wallet" className="p-2 w-full rounded-md border-gray-300" />
                                <ErrorMessage name="wallet" component="div" className="text-red-500 text-sm" />
                            </div> */}
                            <div>
                                <label htmlFor="packages" className="text-sm font-medium text-gray-700">Package</label>
                                <Multiselect
                                    options={packageDetails}
                                    displayValue="period"
                                    selectedValues={packageDetails.filter(option => values.packages.includes(option.id))}
                                    onSelect={(selectedList) => {
                                        setFieldValue("packages", selectedList.map(item => item.id));
                                        const newPrices = selectedList.map(item => ({
                                            packageId: item.id,
                                            period: item.period,
                                            price: item.price,
                                            extraPrice: item.extra_price,
                                            extraKmPrice: item.extraKmPrice,
                                            nightCharge: item.nightCharge,
                                            cancelCharge: item.cancelCharge,
                                            extraCabType: item.extraCabType
                                        }));
                                        setFieldValue("prices", newPrices);
                                    }}
                                    onRemove={(selectedList, removedItem) => {
                                        //console.log("selectedList", removedItem.id);
                                        setFieldValue("packages", selectedList.map(item => item.id));

                                        setFieldValue("prices", values.prices.filter(price => price.packageId !== removedItem.id));

                                    }}
                                    placeholder="Select options"
                                    className="w-full rounded-md border-gray-300"
                                    showCheckbox={true}
                                />
                            </div>

                            <div className='grid grid-cols-2'>
                                <div>
                                    <label htmlFor="insuranceImg" className="text-sm font-medium text-gray-700">
                                        Insurance
                                    </label>
                                    <div className="mt-1">
                                        <div className="relative w-40 h-40 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                                            {values?.insuranceImg ? (
                                                <img
                                                    src={insuranceImagePreview ? insuranceImagePreview : values?.insuranceImg}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain rounded-md"
                                                />
                                            ) : (
                                                <div className="text-gray-500 font-medium p-2">No image selected. Click below to upload.</div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="insuranceImg"
                                            name='insuranceImg'
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
                                            className="hidden" // Hide the native input
                                        />
                                        <label
                                            htmlFor="insuranceImg"
                                            className="p-2 mt-2 inline-block text-center text-white border border-gray-400 bg-black rounded-xl cursor-pointer"
                                        >
                                            Upload Image
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="image1" className="text-sm font-medium text-gray-700">
                                        RC Book
                                    </label>
                                    <div className="mt-1">
                                        <div className="relative w-40 h-40 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                                            {values?.image1 ? (
                                                <img
                                                    src={imagePreview ? imagePreview : values?.image1}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain rounded-md"
                                                />
                                            ) : (
                                                <div className="text-gray-500 font-medium p-2">No image selected. Click below to upload.</div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="image1"
                                            name='image1'
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
                                            className="hidden" // Hide the native input
                                        />
                                        <label
                                            htmlFor="image1"
                                            className="p-2 mt-2 inline-block text-center text-white border border-gray-400 bg-black rounded-xl cursor-pointer"
                                        >
                                            Upload Image
                                        </label>
                                    </div>
                                </div>
                            </div>
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
                                    values
                                )}

                                {renderPriceTable(
                                    "OUTSTATION",
                                    values.prices.filter(price => {
                                        const package_ = packageDetails.find(p => p.id === price.packageId);
                                        return package_?.type === 'Outstation';
                                    }),
                                    values
                                )}

                                {renderPriceTable(
                                    "CAR WASH",
                                    values.prices.filter(price => {
                                        const package_ = packageDetails.find(p => p.id === price.packageId);
                                        return package_?.type === 'CarWash';
                                    }),
                                    values
                                )}
                            </div>
                        )}
                        <div className='flex flex-row'>
                            <Button
                                fullWidth
                                onClick={() => { navigate('/dashboard/cab'); }}
                                className='my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl'
                            >
                                Cancel
                            </Button>
                            <Button
                                fullWidth
                                color="black"
                                onClick={handleSubmit}
                                 disabled={!dirty || !isValid}
                                className='my-6 mx-2'
                            >
                                Continue
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CabAdd;