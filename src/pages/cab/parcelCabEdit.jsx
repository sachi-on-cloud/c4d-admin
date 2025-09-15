import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { Button, Card, Alert, CardBody, Typography, Input, List, ListItem } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';
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
                <List className="w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    {suggestions.map((suggestion, index) => (
                        <ListItem
                            key={index}
                            onClick={() => {
                                form.setFieldValue(field.name, suggestion);
                                setIsFocused(false);
                            }}
                            className="hover:bg-gray-100 cursor-pointer"
                        >
                            <Typography variant="small">{suggestion}</Typography>
                        </ListItem>
                    ))}
                </List>
            )}
        </div>
    );
};

const ParcelCabEdit = () => {
    const [parcelCabVal, setParcelCabVal] = useState({});
    const [alert, setAlert] = useState(null);
    const [packageDetails, setPackageDetails] = useState([]);
    const [ownerAddressSuggestions, setOwnerAddressSuggestions] = useState([]);
    const [driverAddressSuggestions, setDriverAddressSuggestions] = useState([]);
    const [accountRelatedDrivers, setAccountRelatedDrivers] = useState([]);
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [blockedReason, setBlockedReason] = useState(parcelCabVal?.result?.blockedReason || '');

    const getAccountRelatedDrivers = async (accountId) => {
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_ACCOUNT_RELATED_DRIVERS, {
            accountId: accountId,
        });

        if (data?.success && data?.data.length > 0) {
            setAccountRelatedDrivers(data?.data);
        }
    };

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
            if (type === 'Parcel') {
                const weightA = parseFloat(a.period);
                const weightB = parseFloat(b.period);
                return weightA - weightB;
            }
            return 0;
        });
    };

    const getPackageListDetails = async () => {
        const data = await ApiRequestUtils.get(API_ROUTES.PARCEL_PACKAGE_LIST); // Assume a parcel package list endpoint
        if (data?.success) {
            const packageData = data?.data.map((option) => ({
                ...option,
                period: `${option.period} kg`, // Assuming parcel packages are based on weight
            }));
            const parcelPackages = orderPackages(packageData.filter((val) => val.type === 'Parcel'), 'Parcel');
            setPackageDetails([...parcelPackages]);
        }
    };

    useEffect(() => {
        getPackageListDetails();
        fetchItem(id);
    }, [id]);

    const fetchItem = async (itemId) => {
        try {
            const data = await ApiRequestUtils.get(API_ROUTES.GET_PARCEL_CAB_BY_ID + `${itemId}`);
            if (data?.data) {
                setParcelCabVal(data.data);
                getAccountRelatedDrivers(data?.data?.result?.Account?.id);
            } else {
                console.error('No parcel cab data received');
                navigate('/dashboard/vendors/account/allParcelVehicles');
            }
        } catch (error) {
            console.error('Error fetching parcel cab:', error);
            navigate('/dashboard/vendors/account/allParcelVehicles');
        }
    };

    const initialValues = {
        name: parcelCabVal?.result?.name || '',
        ownerName: parcelCabVal?.result?.Account ? parcelCabVal?.result?.Account?.name : '',
        assignedTo: parcelCabVal?.result?.assigned === 'Individual' ? 'Owner' : 'Driver',
        vehicleNumber: parcelCabVal?.result?.vehicleNumber || '',
        address: parcelCabVal?.result?.curAddress || '',
        insurance: parcelCabVal?.result?.insurance || '',
        withDriver: parcelCabVal?.result?.withDriver || '',
        assignOrAddDriver: 'Assign',
        driverId: parcelCabVal?.result?.Drivers[0] ? parcelCabVal?.result?.Drivers[0].id : '',
        accountId: parcelCabVal?.result?.Account?.id || '',
        driverName: '',
        phoneNumber: '',
        driverAddress: '',
        licenseNumber: '',
        vehicleType: parcelCabVal?.result?.vehicleType || '',
        weightCapacity: parcelCabVal?.result?.weightCapacity || '',
        dimensions: parcelCabVal?.result?.dimensions || '',
        modelYear: parcelCabVal?.result?.modelYear || '',
        packages: parcelCabVal?.result?.packages || [],
        prices: parcelCabVal?.price
            ? parcelCabVal?.price.filter((el) => parcelCabVal?.result?.packages.includes(el.packageId))
            : [],
        cabId: parcelCabVal?.result?.id || '',
        status: parcelCabVal?.result?.status || '',
        blockedReason: parcelCabVal?.result?.blockedReason || '',
    };

    const searchLocations = async (query, type) => {
        if (query.length > 2) {
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.SEARCH_ADDRESS, {
                address: query,
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
            const packageA = packageDetails.find((p) => p.id === a.packageId);
            const packageB = packageDetails.find((p) => p.id === b.packageId);
            const weightA = parseFloat(packageA.period);
            const weightB = parseFloat(packageB.period);
            return weightA - weightB;
        });

        return (
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <Card>
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {['Package', 'Base Fare', 'Per Kilometer Rate', 'Additional Charge'].map((el) => (
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
                                        {['baseFare', 'kilometerPrice', 'additionalCharge'].map((field) => (
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
        if (values.status === 'BLOCKED' && !blockedReason.trim()) {
            setAlert({
                message: 'Please enter a reason for blocking',
                color: 'red',
            });
            setTimeout(() => setAlert(null), 5000);
            return;
        }
        try {
            const parcelCabDetails = {
                name: values.name,
                vehicleNumber: values.vehicleNumber,
                curAddress: values.address,
                insurance: values.insurance,
                vehicleType: values.vehicleType,
                weightCapacity: values.weightCapacity,
                dimensions: values.dimensions,
                modelYear: values.modelYear,
                assigned: values.assignedTo,
                withDriver: values.withDriver,
                driverName: values.driverName,
                phoneNumber: values.phoneNumber,
                driverAddress: values.driverAddress,
                driverLicense: values.licenseNumber,
                packages: values.packages,
                accountId: values.accountId,
                driverId: values.assignOrAddDriver === 'Add' ? '' : values.driverId,
                cabId: values.cabId,
                status: values?.status || '',
                ...(values.status === 'BLOCKED' && { blockedReason: blockedReason }),
            };
            const prices = values.prices;
            let res = { parcelCabDetails: JSON.stringify(parcelCabDetails), prices: JSON.stringify(prices) };
            const resp = await ApiRequestUtils.update(API_ROUTES.UPDATE_PARCEL_CAB, res);
            if (!resp?.success && resp?.code === 401) {
                setAlert({ message: 'Driver with this phone number already exists', color: 'red' });
            }
            if (!resp?.success && resp?.code === 203) {
                setAlert({ message: 'Parcel cab already exists', color: 'red' });
                resetForm();
            } else if (resp?.success && resp?.code === 200) {
                setAlert({ message: 'Parcel Cab Updated Successfully', color: 'green' });
            }
        } catch (error) {
            console.error('Error updating parcel cab:', error);
        } finally {
            setIsSubmitting(false);
            setSubmitting(false);
        }
    };

    const currentDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    useEffect(() => {
        let timeoutId;
        if (alert?.message === 'Parcel Cab Updated Successfully') {
            timeoutId = setTimeout(() => {
                setAlert(null);
                navigate(`/dashboard/vendors/account/details/${parcelCabVal?.result?.Account?.id}`);
            }, 5000);
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [alert, parcelCabVal, navigate]);

    return (
        <div className="p-4 mx-auto">
            {alert && (
                <div className="mb-2">
                    <Alert color={alert.color} className="py-3 px-6 rounded-xl">
                        {alert.message}
                    </Alert>
                </div>
            )}
            <h2 className="text-2xl font-bold mb-4">Update Parcel Cab</h2>
            <Formik
                initialValues={initialValues}
                // validationSchema={PARCEL_CAB_SCHEMA}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ handleSubmit, values, errors, dirty, isValid, handleChange, setFieldValue }) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                                    Vehicle Name
                                </label>
                                <Field
                                    type="text"
                                    name="name"
                                    className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                                />
                                <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                            </div>
                            <div>
                                <label htmlFor="ownerName" className="text-sm font-medium text-gray-700">
                                    Owner Name
                                </label>
                                <Field
                                    type="text"
                                    name="ownerName"
                                    className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                                />
                                <ErrorMessage name="ownerName" component="div" className="text-red-500 text-sm my-1" />
                            </div>
                            <div>
                                <label htmlFor="vehicleNumber" className="text-sm font-medium text-gray-700">
                                    Vehicle Number
                                </label>
                                <Field
                                    type="text"
                                    name="vehicleNumber"
                                    className="p-2 w-full rounded-md border-gray-300"
                                    maxLength={10}
                                />
                                <ErrorMessage name="vehicleNumber" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="address" className="text-sm font-medium text-gray-700">
                                    Address
                                </label>
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
                                <label htmlFor="insurance" className="text-sm font-medium text-gray-700">
                                    Insurance Expiry Date
                                </label>
                                <Field
                                    type="date"
                                    name="insurance"
                                    className="p-2 w-full rounded-xl border-2 border-gray-300"
                                    min={currentDate()}
                                />
                                <ErrorMessage name="insurance" component="div" className="text-red-500 text-sm" />
                            </div>
                           
                           
                           
                            <div>
                                <label htmlFor="status" className="text-sm font-medium text-gray-700">
                                    Vehicle Status
                                </label>
                                <Field
                                    as="select"
                                    name="status"
                                    className="p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                >
                                    <option value="">Select status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="IN_ACTIVE">In_Active</option>
                                    <option value="BLOCKED">Blocked</option>
                                </Field>
                                <ErrorMessage name="status" component="div" className="text-red-500 text-sm" />
                                {values.status === 'BLOCKED' && (
                                    <div className="mt-2">
                                        <label
                                            htmlFor="blockedReason"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Block Reason
                                        </label>
                                        <input
                                            type="text"
                                            id="blockedReason"
                                            value={blockedReason}
                                            onChange={(e) => setBlockedReason(e.target.value)}
                                            className="p-2 w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        {values.packages.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Price Details</h2>
                                {renderPriceTable('PARCEL', values.prices, values, packageDetails)}
                            </div>
                        )}
                        <div className="flex flex-row">
                            <Button
                                fullWidth
                                onClick={() =>
                                    navigate(`/dashboard/vendors/account/details/${parcelCabVal?.result?.Account?.id}`)
                                }
                                className="my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                fullWidth
                                color="black"
                                onClick={handleSubmit}
                                className="my-6 mx-2 bg-[#1A73E8]"
                            >
                                Update
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ParcelCabEdit;