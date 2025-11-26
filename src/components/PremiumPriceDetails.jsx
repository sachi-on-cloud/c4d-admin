import React from "react";
import {Card,CardBody,Typography} from "@material-tailwind/react";

const PremiumPriceDetails = ({ premiumData = {} }) => {
    const config = premiumData?.premiumConfig || premiumData || {};
    const hasData = Object.keys(config).length > 0;

    if (!hasData) {
        return (
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Premium Price Table</h2>
                <Card>
                    <CardBody className="text-center py-10">
                        <Typography color="gray" className="text-lg">
                            No Premium  Available
                        </Typography>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Premium Price Table</h2>
            <Card>
                <CardBody className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max table-auto text-left">
                            <thead>
                                <tr className="bg-gray-100 border-b">
                                    {[
                                        "Vehicle Category",
                                        "Premium Status",
                                        "Price Multiplier"
                                    ].map((el, index) => (
                                        <th
                                            key={index}
                                            className="border-b border py-3 px-5 text-left"
                                        >
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
                            <tbody className="bg-white">
                                {Object.entries(config).map(([category, details]) => (
                                    <tr key={category} className="border-b">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {category}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${details.isPremium
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {details.isPremium ? "Active" : "In - Active"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {details.multiplier ? `${details.multiplier}x` : "1.0x (Default)"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default PremiumPriceDetails;