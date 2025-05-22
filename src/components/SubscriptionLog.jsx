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
                <h2 className="text-2xl font-bold mb-4">Credit Details </h2>
            </div>
            <Card>
                {subscriptionLog && subscriptionLog.length > 0 ? (
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {/* "Service Type", "Receipt", "Status", "Discount" */}
                                    {["Type", "Transaction Type", "Plan", "Base Credit", "Bonus Credit", "Utilized Credit", "Nett Credit",].map((el, index) => (
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

                                {subscriptionlog.map(({ id, type, transactionType, baseCredit, bonusCredit, utilizedCredit, nettCredit, Plan, startDate, endDate, remainingEarning, lapsedEarning, serviceType, receipt, status, subscribedDiscount }, key) => {
                                    const className = `py-3 px-5 ${key === subscriptionlog.length - 1 ? "" : "border-b border-blue-gray-50"
                                        }`;
                                    return (
                                        <tr key={id}>

                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {type}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {transactionType}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {Plan?.name}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {baseCredit}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {bonusCredit}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {utilizedCredit}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {nettCredit}
                                                </Typography>
                                            </td>
                                            {/* <td className={className}>
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
                                            </td> */}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardBody>
                ) : (
                    <h2 className="text-lg font-medium p-4">No Credit Details</h2>
                )
                }
            </Card>
        </>
    );

};
export default SubscriptionLog;