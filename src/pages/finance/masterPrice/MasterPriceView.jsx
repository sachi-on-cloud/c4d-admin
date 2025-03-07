import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from "react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { useNavigate } from 'react-router-dom';

export function MasterPriceView() {
    const [masterPriceListLocal, setMasterPriceListLocal] = useState([]);
    const navigate = useNavigate();
    async function handleClick() {
        try {
            // console.log("Fetching from:", API_ROUTES.PACKAGES_LIST);
            const response = await ApiRequestUtils.get(API_ROUTES.PACKAGES_LIST);
            // console.log("API Raw Response:", response);

            if (response?.data && Array.isArray(response.data)) {
                setMasterPriceListLocal(response.data.filter(item => item.type === "Local"));
            }            
        } catch (err) {
            console.error("Error fetching subscription data:", err);
        }
    }
    
    return (
        <>
            <div className="p-4 border border-gray-300 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="relative flex-grow max-w-[500px]">
                        <input
                            type="text"
                            className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Search Subscription"

                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/finance/master-price/add')}
                        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Add new
                    </button>
                </div>
            </div>
            <div class="flex items-center gap-7 px-3 py-3 rounded-xl border border-blue-gray-100 bg-white mt-4">
                <div className="flex flex-col items-center gap-5 p-1">
                    <button
                        className="align-middle select-none font-sans font-bold text-center text-xs py-3 bg-gradient-to-tr from-gray-900 to-gray-800 text-white flex items-center px-4 rounded-2xl"
                        type="button"
                        onClick={handleClick}
                    >
                        <p className="block antialiased font-sans text-inherit font-medium capitalize text-lg">
                            Local
                        </p>
                    </button>
                </div>
            </div>


            <Card>
                {masterPriceListLocal && masterPriceListLocal.length > 0 ? (
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {[
                                        "Service Type",
                                        "Trip Type",
                                        "Hours",
                                        "Round Trip Rate (mini, Sedan,SUV)",
                                        "Drop Only",
                                        "Additional Mins",
                                        "Round Trip Rate - MVP",
                                        "Night Hours",
                                        "Night Charges (10PM TO 6AM)",
                                        "Cancel Charge",
                                        "Extra Hours",
                                        "Cancellation Mins",
                                        "Surcharge  (Weekend/ Rainy days / Peak hours)"
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

                                {masterPriceListLocal.map(({ id,servicetype, type, period, dropPrice, priceSUV, addtionalmins, priceMVP, nighthours, nightCharge, cancelCharge,extrahours , cancellationMins, surCharge }, key) => {
                                    const className = `py-3 px-5 ${key === masterPriceListLocal.length - 1 ? "" : "border-b border-blue-gray-50"}`;

                                    return (
                                        <tr key={id}>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {servicetype = "Driver Only"}
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
                                                    {dropPrice}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {priceSUV}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {addtionalmins}
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
                                                    {surCharge}
                                                </Typography>
                                            </td>

                                        </tr>
                                    );

                                })}
                            </tbody>
                        </table>
                    </CardBody>
                ) : (<>
                </>)}
            </Card>

        </>

    );
}