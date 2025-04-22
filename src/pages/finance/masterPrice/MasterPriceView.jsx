import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from "react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { useNavigate } from 'react-router-dom';
import { Utils } from '@/utils/utils';

export function MasterPriceView() {
    const [localPackageList, setLocalPackageList] = useState([]);
    const [outstationPackageList, setOutstationPackageList] = useState([]);
    const navigate = useNavigate();
    const [serviceType, setServiceType] = useState("");
    const [ridesData, setRidesData] = useState([]);
    // const [rentalsData, setRentalsData] = useState([]);

    const handleChange = async (event) => {
        const selectedServiceType = event.target.value;
        setServiceType(selectedServiceType);
        try {
            if (selectedServiceType === 'DRIVER') {
                const data = await ApiRequestUtils.get(API_ROUTES.PACKAGES_LIST);
                if (data?.success) {
                    setLocalPackageList(data?.data.filter(item => item.type === "Local" && item.serviceType === "DRIVER"));
                    setOutstationPackageList(data?.data.filter(item => item.type === "Outstation" && item.serviceType === "DRIVER"));
                }
            } else if (selectedServiceType === 'RIDES') {
                const data = await ApiRequestUtils.get(API_ROUTES.RIDES_PRICE_TABLE_LIST);
                setRidesData(data?.data);
            } else if (selectedServiceType === 'RENTAL') {
                const data = await ApiRequestUtils.get(API_ROUTES.RENTALS_PRICE_DETAILS);
                if(data?.success) {
                    setLocalPackageList(data?.data.filter(item => item.type === "Local" && item.serviceType === "RENTAL"));
                    setOutstationPackageList(data?.data.filter(item => item.type === "Outstation" && item.serviceType === "RENTAL"));
                }
                // setRentalsData(data?.data);
            }
        } catch (err) {
            console.error("Error fetching subscription data:", err);
        }
    };

    const onHandleAddNew = async () => {
        if (serviceType === 'DRIVER') {
            navigate('/dashboard/users/master-price/driver-add');
        } else if (serviceType === 'RIDES') {
            navigate('/dashboard/users/master-price/rides-add');
        } else if (serviceType === 'RENTAL') {
            navigate('/dashboard/users/master-price/rentals-add');
        }
    };

    const renderLocalPriceTable = () => {
        return (
            <div className='my-6'>
                <h3 className="text-3xl font-bold mb-4 ml-2">Local</h3>
                <Card>
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2 rounded-2xl">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {[
                                        "Service Type",
                                        "Trip Type",
                                        "Hours",
                                        "Round Trip Rate",
                                        "Drop Only",
                                        "Round Trip Rate - MUV",
                                        "Night Hours (10PM TO 6AM)",
                                        "Night Charges (10PM TO 6AM)",
                                        "Cancel Charge",
                                        "Extra Hours",
                                        "Cancellation Mins"
                                    ]
                                        .map((el, index) => (
                                            <th key={index} className="border-b border-blue-gray-50 py-3 px-5 text-left bg-blue-gray-50 pb-4">
                                                <Typography
                                                    variant="small"
                                                    className="text-[11px] font-bold uppercase text-black"
                                                >
                                                    {el}
                                                </Typography>
                                            </th>
                                        ))
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {localPackageList.map(({ id, serviceType, type, period, dropPrice, priceSUV, addtionalmins, priceMVP, nighthours,nightHoursFrom,nightHoursTo, nightCharge, cancelCharge, extraPrice, cancelMins, surCharge, price }, key) => {
                                    const className = `py-3 px-5 ${key === localPackageList.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                                    return (
                                        <tr key={id}>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {serviceType}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {type}
                                                </Typography>
                                            </td>
                                            <td className='border-b border-blue-gray-50 py-3 px-5'>
                                                <div className="flex items-center gap-4">
                                                    <div onClick={() => navigate(`/dashboard/users/master-price/details/${id}`)}>
                                                        <Typography
                                                            variant="small"
                                                            color="blue"
                                                            className="font-semibold underline"
                                                        >
                                                            {period}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {price}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {dropPrice} Extra
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {priceMVP}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                {/* {`${nightHoursFrom} - ${nightHoursTo}` ? null : ""} */}
                                                {nightHoursFrom && nightHoursTo ? `${nightHoursFrom} - ${nightHoursTo}` : ""}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {nightCharge}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {cancelCharge}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {extraPrice}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {Utils.convertTimeFormatToMinutes(cancelMins)}
                                                </Typography>
                                            </td>
                                        </tr>
                                    );

                                })}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            </div>
        )
    };

    const renderOutstationPriceTable = () => {
        return (
            <div className='my-6'>
                <h3 className="text-3xl font-bold mb-4 ml-2">Outstation</h3>
                <Card>
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2 rounded-2xl">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {[
                                        "Service Type",
                                        "Trip Type",
                                        "Base Fare",
                                        "1 day trip Up to 300KM - Drop only",
                                        "1 day trip Up to 300KM - Round Trip",
                                        "Additional Hours",
                                        "Night Hours (10PM TO 6AM)",
                                        "Night Charges (10PM TO 6AM)",
                                        "Cancellation Charge",
                                        "Cancellation Time (In Mins)",
                                        "Additional Kms"
                                    ]
                                        .map((el, index) => (
                                            <th key={index} className="border-b border-blue-gray-50 py-3 px-5 text-left pb-4 bg-blue-gray-50">
                                                <Typography
                                                    variant="small"
                                                    className="text-[11px] font-bold uppercase text-black"
                                                >
                                                    {el}
                                                </Typography>
                                            </th>
                                        ))
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {outstationPackageList.map(({ id, serviceType, type, price, dropPrice, extraPrice,additionalMinCharge, extraKmPrice,cancelMins, nighthours, nightHoursFrom,nightHoursTo, nightCharge, cancelCharge, extrahours, cancellationMins, baseFare }, key) => {
                                    const className = `py-3 px-5 ${key === outstationPackageList.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                                    return (
                                        <tr key={id}>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {serviceType}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <div onClick={() => navigate(`/dashboard/users/master-price/details/${id}`)}>
                                                <Typography variant="small"
                                                            color="blue"
                                                            className="font-semibold underline">
                                                    {type}
                                                </Typography>
                                                </div>
                                                
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {baseFare}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {dropPrice} extra
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {price}
                                                </Typography>
                                            </td>
                                            {/* <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {extraPrice}
                                                </Typography>
                                            </td> */}
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {additionalMinCharge}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                {/* {nighthours} */}
                                                {nightHoursFrom && nightHoursTo ? `${nightHoursFrom} - ${nightHoursTo}` : ""}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {nightCharge}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {cancelCharge}
                                                </Typography>
                                            </td>
                                            {/* <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {extrahours}
                                                </Typography>
                                            </td> */}
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {cancelMins}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {extraKmPrice}
                                                </Typography>
                                            </td>

                                        </tr>
                                    );

                                })}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            </div>
        )
    };

    const renderRidesTable = () => {
        return (
            <div className='my-6'>
                <h3 className="text-3xl font-bold mb-4 ml-2">Rides</h3>
                <Card>
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2 rounded-2xl">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {[
                                        "Rate Parameter",
                                        "Base Fare (Mini,SUV,Sedan)",
                                        "Base Fare (MUV)",
                                        "Rate Per KM (Mini,SUV,Sedan)",
                                        "Rate Per KM (MUV)",
                                        "Rate Per Min",
                                        "Surcharge Percentage",
                                        "Status"
                                    ].map((el, index) => (
                                        <th key={index} className="border-b border-blue-gray-50 py-3 px-5 text-left bg-blue-gray-50">
                                            <Typography
                                                variant="small"
                                                className="text-[11px] font-bold uppercase text-black"
                                            >
                                                {el}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {ridesData.map(({
                                    id,
                                    baseFare,
                                    baseFareMVP,
                                    kilometerPrice,
                                    kilometerPriceMVP,
                                    rateParameter,
                                    minCharge,
                                    surChargePercentage,
                                    status,
                                }, key) => {
                                    const className = `py-3 px-5 ${key === ridesData?.length - 1 ? "" : "border-b border-blue-gray-50"}`;

                                    return (
                                        <tr key={id}>
                                            <td className='border-b border-blue-gray-50 py-3 px-5'>
                                                <div className="flex items-center gap-4">
                                                    <div onClick={() => navigate(`/dashboard/users/master-price/rides-details/${id}`)}>
                                                        <Typography
                                                            variant="small"
                                                            color="blue"
                                                            className="font-semibold underline"
                                                        >
                                                            {rateParameter}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {baseFare}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {baseFareMVP}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {kilometerPrice}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {kilometerPriceMVP}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {minCharge}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {surChargePercentage}%
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {status == 1 ? 'Active' : 'InActive'}
                                                </Typography>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            </div>
        );
    };

    const renderLocalRentalsTable = () => {
        return (
            <div className='my-6'>
                <h3 className="text-3xl font-bold mb-4 ml-2">Local</h3>
                <Card>
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2 rounded-2xl">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {[
                                        "Type",
                                        "Package",
                                        "Base Fare",
                                        "Kilometer",
                                        "Kilometer Rate",
                                        "Additional Mins",
                                        "Additional KM Rate",
                                        "Night Charge",
                                        // "Toll Charge",
                                        // "Driver Charge",
                                        "Cancellation Mins",
                                        "Cancel Charge",
                                        "Status"
                                    ].map((el, index) => (
                                        <th key={index} className="border-b border-blue-gray-50 py-3 px-5 text-left bg-blue-gray-50">
                                            <Typography
                                                variant="small"
                                                className="text-[11px] font-bold uppercase text-black"
                                            >
                                                {el}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {localPackageList.map(({
                                    id,
                                    type,
                                    carType,
                                    baseFare,
                                    kilometerPrice,
                                    kilometer,
                                    additionalMinCharge,
                                    nightCharge,
                                    // driverCharge,
                                    // tollCharge,
                                    period,
                                    extraKmPrice,
                                    cancelMins,
                                    cancelCharge,
                                    status
                                }, key) => {
                                    const className = `py-3 px-5 ${key === localPackageList?.length - 1 ? "" : "border-b border-blue-gray-50"}`;

                                    return (
                                        <tr key={id}>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {type.toUpperCase()}
                                                </Typography>
                                            </td>
                                            <td className='border-b border-blue-gray-50 py-3 px-5'>
                                                <div className="flex items-center gap-4">
                                                    <div onClick={() => navigate(`/dashboard/users/master-price/rentals-details/${id}`)}>
                                                        <Typography
                                                            variant="small"
                                                            color="blue"
                                                            className="font-semibold underline"
                                                        >
                                                            {period}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {baseFare}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {kilometer}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {kilometerPrice}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {additionalMinCharge}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {extraKmPrice}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {nightCharge}
                                                </Typography>
                                            </td>
                                            {/* <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {tollCharge}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {driverCharge}
                                                </Typography>
                                            </td> */}
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {cancelMins}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {cancelCharge}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {status == 1 ? 'Active' : 'InActive'}
                                                </Typography>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            </div>
        );
    };
    const renderOutstationRentalsTable = () => {
        return (
            <div className='my-2'>
                <h3 className="text-3xl font-bold mb-4 ml-2">OutStation</h3>
                <Card>
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2 rounded-2xl">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {[
                                        "Type",
                                        "Package",
                                        "Base Fare",
                                        "Kilometer",
                                        "Kilometer Rate",
                                        "Additional Mins",
                                        "Additional KM Rate",
                                        "Night Charge",
                                        "Toll Charge",
                                        "Driver Charge",
                                        "Cancellation Mins",
                                        "Cancel Charge",
                                        "Status"
                                    ].map((el, index) => (
                                        <th key={index} className="border-b border-blue-gray-50 py-3 px-5 text-left bg-blue-gray-50">
                                            <Typography
                                                variant="small"
                                                className="text-[11px] font-bold uppercase text-black"
                                            >
                                                {el}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {outstationPackageList.map(({
                                    id,
                                    type,
                                    carType,
                                    baseFare,
                                    kilometerPrice,
                                    kilometer,
                                    additionalMinCharge,
                                    nightCharge,
                                    driverCharge,
                                    tollCharge,
                                    period,
                                    extraKmPrice,
                                    cancelMins,
                                    cancelCharge,
                                    status
                                }, key) => {
                                    const className = `py-3 px-5 ${key === outstationPackageList?.length - 1 ? "" : "border-b border-blue-gray-50"}`;

                                    return (
                                        <tr key={id}>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {type.toUpperCase()}
                                                </Typography>
                                            </td>
                                            <td className='border-b border-blue-gray-50 py-3 px-5'>
                                                <div className="flex items-center gap-4">
                                                    <div onClick={() => navigate(`/dashboard/users/master-price/rentals-details/${id}`)}>
                                                        <Typography
                                                            variant="small"
                                                            color="blue"
                                                            className="font-semibold underline"
                                                        >
                                                            {period}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {baseFare}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {kilometer}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {kilometerPrice}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {additionalMinCharge}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {extraKmPrice}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {nightCharge}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {tollCharge}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {driverCharge}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {cancelMins}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {cancelCharge}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {status == 1 ? 'Active' : 'InActive'}
                                                </Typography>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            </div>
        );
    };
    return (
        <>
            <div className="p-4 border border-gray-300 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="relative flex-grow max-w-[500px]">
                        <div className="p-4 flex-row space-x-5">
                            <label className="text-base font-medium text-gray-700">Select Service Type:</label>
                            <select
                                value={serviceType}
                                onChange={handleChange}
                                className="p-2 w-[40%] rounded-lg border-2 border-gray-300"
                            >
                                <option value="">Select Service Type</option>
                                <option value="DRIVER">Acting Driver</option>
                                <option value="RIDES">Rides</option>
                                <option value="RENTAL">Rental</option>
                            </select>
                            {serviceType === "" && <div className="text-red-500 text-sm mt-1">Please select a service type</div>}
                        </div>
                    </div>
                    <button
                        onClick={onHandleAddNew}
                        className="ml-4 px-4 py-2 bg-green-500 text-white rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Add new
                    </button>
                </div>
            </div>

            {serviceType === 'DRIVER' && localPackageList && localPackageList.length > 0 ? (
                <div className=''>
                    {renderLocalPriceTable()}
                </div>
            ) : (<>
            </>)}

            {serviceType === 'DRIVER' && outstationPackageList && outstationPackageList.length > 0 ? (
                <div className=''>
                    {renderOutstationPriceTable()}
                </div>
            ) : (<>
            </>)}

            {serviceType === 'RIDES' && ridesData && ridesData.length > 0 ? (
                <div>
                    {renderRidesTable()}
                </div>
            ) : <></>}

            {serviceType === 'RENTAL' && localPackageList && localPackageList.length > 0 ? (
                <div>
                    {renderLocalRentalsTable()}
                </div>
            ) : (<>
            </>)}
            {serviceType === "RENTAL" && outstationPackageList && outstationPackageList.length > 0 ? (
                <div>{renderOutstationRentalsTable()}</div>
            ) : (<>
            </>)}
        </>

    );
}