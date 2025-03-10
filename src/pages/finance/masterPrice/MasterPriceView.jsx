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

    const handleChange = async (event) => {
        const selectedServiceType = event.target.value;
        setServiceType(selectedServiceType);
        try {
            if (selectedServiceType === 'DRIVER') {
                const data = await ApiRequestUtils.get(API_ROUTES.PACKAGES_LIST);
                // console.log("API Raw Response:", data);

                if (data?.success) {
                    setLocalPackageList(data?.data.filter(item => item.type === "Local"));
                    setOutstationPackageList(data?.data.filter(item => item.type === "Outstation"));
                }
            }
        } catch (err) {
            console.error("Error fetching subscription data:", err);
        }
    };

    const onHandleAddNew = async () => {
        if (serviceType === 'DRIVER') {
            navigate('/dashboard/users/master-price/add');
        }
    }
    const renderLocalPriceTable = () => {
        return (
            <div className='my-2'>
                <h3 className="text-3xl font-bold mb-4 ml-2">Local</h3>
                <Card>
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {[
                                        "Service Type",
                                        "Trip Type",
                                        "Hours",
                                        "Round Trip Rate",
                                        "Drop Only",
                                        "Round Trip Rate - MVP",
                                        "Night Hours",
                                        "Night Charges (10PM TO 6AM)",
                                        "Cancel Charge",
                                        "Extra Hours",
                                        "Cancellation Mins"
                                    ]
                                        .map((el, index) => (
                                            <th key={index} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                                <Typography
                                                    variant="small"
                                                    className="text-[11px] font-bold uppercase text-blue-gray-700"
                                                >
                                                    {el}
                                                </Typography>
                                            </th>
                                        ))
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {localPackageList.map(({ id, serviceType, type, period, dropPrice, priceSUV, addtionalmins, priceMVP, nighthours, nightCharge, cancelCharge, extraPrice, cancelMins, surCharge, price }, key) => {
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
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {period}
                                                </Typography>
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
                                                    {nighthours}
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
            <div className='my-2'>
                <h3 className="text-3xl font-bold mb-4 ml-2">Outstation</h3>
                <Card>
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
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
                                        "Additional Km/s"
                                    ]
                                        .map((el, index) => (
                                            <th key={index} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                                <Typography
                                                    variant="small"
                                                    className="text-[11px] font-bold uppercase text-blue-gray-700"
                                                >
                                                    {el}
                                                </Typography>
                                            </th>
                                        ))
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {outstationPackageList.map(({ id, serviceType, type, price, dropPrice, extraPrice, extraKmPrice, nighthours, nightCharge, cancelCharge, extrahours, cancellationMins, baseFare }, key) => {
                                    const className = `py-3 px-5 ${key === outstationPackageList.length - 1 ? "" : "border-b border-blue-gray-50"}`;
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
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {extraPrice}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {nighthours}
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
                                                    {extrahours}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {cancellationMins}
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
    }
    return (
        <>
            <div className="p-4 border border-gray-300 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="relative flex-grow max-w-[500px]">
                        {/* <input
                            type="text"
                            className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Search Master Price Table"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        </div> */}
                    </div>
                    <button
                        onClick={onHandleAddNew}
                        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Add new
                    </button>
                </div>
            </div>

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

        </>

    );
}