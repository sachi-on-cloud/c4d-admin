import { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Typography,
} from "@material-tailwind/react";
import moment from "moment";

const SubscriptionLog = ({ subscriptionlog }) => {
    const [subscriptionLog, setsubScriptionLog] = useState([]);
    useEffect(() => {
        if (subscriptionlog) {
            setsubScriptionLog(subscriptionlog);
        }
    }, [subscriptionlog]
    )
    return (
        <>
            <div className="flex flex-row justify-between px-2 mb-2 mt-4">
                <h2 className="text-2xl font-bold mb-4">Contract Details </h2>
            </div>
            <Card>
                {subscriptionLog && subscriptionLog.length > 0 ? (
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {["Package","Sub Type ", "Start date", "End date", "Remaining Earning", "Lapsed Earning", "Service Type", "Receipt","Status", "Discount"].map((el, index) => (
                                        <th key={index} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                            <Typography
                                                variant="small"
                                                className="text-[11px] font-bold uppercase text-blue-gray-700"
                                            >
                                                {el}
                                            </Typography>
                                        </th>
                                    ))}

                                </tr>
                            </thead>
                            <tbody>
                                
                                {subscriptionlog.map(({ id, subtype,Plan,startDate, endDate, remainingEarning, lapsedEarning, serviceType,receipt,status, subscribedDiscount }, key) => {
                                    const className = `py-3 px-5 ${key === subscriptionlog.length - 1 ? "" : "border-b border-blue-gray-50"
                                        }`;
                                    return (
                                        <tr key={id}>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                {Plan.name}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                {subtype = Plan?.name === "Free" ? "Free" : "paid" }                                            
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {moment(startDate).format("DD-MM-YYYY")}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {moment(endDate).format("DD-MM-YYYY")}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {remainingEarning}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {lapsedEarning}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {serviceType = "Driver Only"}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {receipt}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {status}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {subscribedDiscount}
                                                </Typography>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardBody>
                ) : (
                    <h2 className="text-lg font-medium p-4">No Contract Details</h2>
                )
                }
            </Card>
        </>
    );
    
};
export default SubscriptionLog;