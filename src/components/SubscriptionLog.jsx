import { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Typography,
    Button
} from "@material-tailwind/react";
import moment from "moment";

const SubscriptionLog = ({ subscriptionlog }) => {
    const [subscriptionLog, setSubscriptionLog] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
    });
    useEffect(() => {
        if (subscriptionlog) {
            const itemsPerPage = 10;
            const totalItems = subscriptionlog.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            setSubscriptionLog(subscriptionlog);
            setPagination({
                currentPage: 1,
                totalPages,
                totalItems,
                itemsPerPage,
            });
        }
    }, [subscriptionlog]);
    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            setPagination((prev) => ({ ...prev, currentPage: page }));
        }
    };
    const generatePageButtons = () => {
        const buttons = [];
        const maxVisible = 3;
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <Button
                    key={i}
                    size="sm"
                    variant={i === pagination.currentPage ? "filled" : "outlined"}
                    className="mx-1 bg-blue-500 text-white"
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </Button>
            );
        }
        return buttons;
    };
    // Slice data for current page
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    const paginatedData = subscriptionLog.slice(startIndex, endIndex);
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
                                    {["Type", "Transaction Type", "ReceiptId", "Date", "Plan", "Amount", "End Date", "Base Credit", "Bonus Credit", "Booking Number", "Booking Status", "Utilized Credit", "Nett Credit", "Remaining Credit"].map((el, index) => (
                                        <th key={index} className="border-b border-blue-gray-50 py-3 px-5 text-left">
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

                                {/* {subscriptionlog.map(({ id, type, transactionType, baseCredit, bonusCredit, utilizedCredit, nettCredit, Plan, startDate, endDate, remainingEarning, lapsedEarning, serviceType, receipt, status, subscribedDiscount }, key) => {
                                    const className = `py-3 px-5 ${key === subscriptionlog.length - 1 ? "" : "border-b border-blue-gray-50"
                                        }`; */}
                                {paginatedData.map(({ id, type, transactionType, ReceiptId, amount, baseCredit, bonusCredit, utilizedCredit, nettCredit, remainingCredit, Subscription, Plan, Booking, startDate, endDate, remainingEarning, lapsedEarning, serviceType, receipt, status, created_at }, key) => {
                                    const className = `py-3 px-5 ${key === paginatedData.length - 1 ? "" : "border-b border-blue-gray-50"
                                        }`;
                                    return (
                                        <tr key={id}>

                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-black">
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
                                                    {ReceiptId}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {moment(created_at).format("DD-MM-YYYY")}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {Plan?.name}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {amount > 0 && amount}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {Subscription?.endDate && moment(Subscription?.endDate).format("DD-MM-YYYY")}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {baseCredit > 0 && baseCredit}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {bonusCredit > 0 && bonusCredit}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {Booking?.bookingNumber || " - "}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {Booking?.status || " - "}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {utilizedCredit > 0 && utilizedCredit}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {nettCredit > 0 && nettCredit}
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
                        <div className="flex items-center justify-center mt-4">
                            <Button
                                size="sm"
                                variant="text"
                                disabled={pagination.currentPage === 1}
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                className="mx-1"
                            >
                                {"<"}
                            </Button>
                            {generatePageButtons()}
                            <Button
                                size="sm"
                                variant="text"
                                disabled={pagination.currentPage === pagination.totalPages}
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                className="mx-1"
                            >
                                {">"}
                            </Button>
                        </div>
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