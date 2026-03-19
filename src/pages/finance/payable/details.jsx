import React, { useState, useEffect } from 'react';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button, Card, CardBody, Typography, Dialog, DialogHeader, DialogBody, DialogFooter } from '@material-tailwind/react';
import moment from 'moment';

const PayableDetails = () => {
    const navigate = useNavigate();
    const [accountVal, setAccountVal] = useState({});
    const { id } = useParams();
    const [modalData, setModalData] = useState(null);
    const location = useLocation();
    const state = location.state || {};

    useEffect(() => {
        if (id) {
            fetchItem(id);
        }
    }, [id]);

    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(`${API_ROUTES.GET_PAYABLE_DETAILS}/${itemId}`);
        console.log("PROPDATA",location)
        setAccountVal(data.data);
    };

    return (
        <>
            <div className="p-4">

                <h2 className="text-2xl font-bold mb-4">Invoice Number - {accountVal[0]?.PaymentRequest?.invoiceNumber}</h2>
                <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-md shadow-md">

                    <div>
                        <label className="text-sm font-medium text-gray-700">Total Amount</label>
                        <div className="p-2 mt-1 rounded-md border bg-gray-100 text-gray-800 font-semibold">
                        {state?.totalAmount}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Total Payout</label>
                        <div className="p-2 mt-1 rounded-md border bg-gray-100 text-gray-800 font-semibold">
                        {state?.totalPayout}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Cash Amount</label>
                        <div className="p-2 mt-1 rounded-md border bg-gray-100 text-gray-800 font-semibold">
                        {state?.cashAmount}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Online Amount</label>
                        <div className="p-2 mt-1 rounded-md border bg-gray-100 text-gray-800 font-semibold">
                        {state?.onlineAmount}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Commission Amount</label>
                        <div className="p-2 mt-1 rounded-md border bg-gray-100 text-gray-800 font-semibold">
                        {state?.commissionAmount}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Total Payables</label>
                        <div className="p-2 mt-1 rounded-md border bg-gray-100 text-gray-800 font-semibold">
                        {state?.totalPayables}
                        </div>
                    </div>

                    {state?.reviewer?.name && <div>
                        <label className="text-sm font-medium text-gray-700">Reviewer</label>
                        <div className="p-2 mt-1 rounded-md border bg-gray-100 text-gray-800 font-semibold">
                        {state?.reviewer?.name}
                        </div>
                    </div>}

                    {state?.reviewedTime && <div>
                        <label className="text-sm font-medium text-gray-700">Reviewed Time</label>
                        <div className="p-2 mt-1 rounded-md border bg-gray-100 text-gray-800 font-semibold">
                        {moment(state?.reviewedTime).format("DD-MM-YYYY")}
                        </div>
                    </div>}

                    {state?.approver?.name && <div>
                        <label className="text-sm font-medium text-gray-700">Approver</label>
                        <div className="p-2 mt-1 rounded-md border bg-gray-100 text-gray-800 font-semibold">
                        {state?.approver?.name}
                        </div>
                    </div>}

                    {state?.approvedTime && <div>
                        <label className="text-sm font-medium text-gray-700">Approved Time</label>
                        <div className="p-2 mt-1 rounded-md border bg-gray-100 text-gray-800 font-semibold">
                        {moment(state?.approvedTime).format("DD-MM-YYYY")}
                        </div>
                    </div>}

                    <div>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <div className="p-2 mt-1 rounded-md border bg-gray-100 text-gray-800 font-semibold">
                        {state?.status}
                        </div>
                    </div>
                    </div>

                <>
                    <div className='flex flex-row justify-between px-2 mb-2 mt-4'>
                        <h2 className="text-2xl font-bold mb-4">Trip Details</h2>
                    </div>
                    <Card>
                        {accountVal && accountVal.length > 0 ? (
                            <>
                                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                                    <table className="w-full min-w-[640px] table-auto">
                                        <thead>
                                            <tr>
                                                {[
                                                    "Booking Number",
                                                    "Status",
                                                    "Start Date",
                                                    "End Date",
                                                    "Total Amount",
                                                    "Commission",
                                                    "Commission Amount",
                                                    "Amount",
                                                    "Payment Method"
                                                ].map((el, index) => (
                                                    <th
                                                        key={index}
                                                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                                    >
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
                                            {accountVal.map(
                                                ({ BookingId, Booking, status, Driver, total, commissionAmount, amount, commission, paymentType }, key) => {
                                                    const className = `py-3 px-5 ${key === accountVal.length - 1
                                                        ? ""
                                                        : "border-b border-blue-gray-50"
                                                        }`;
                                                    return (
                                                        <>
                                                            <tr key={id}>
                                                                <td className={className}>
                                                                    <div className="flex items-center gap-4">
                                                                        <div onClick={() => {
                                                                            setModalData({
                                                                                Booking,
                                                                                Driver
                                                                            });
                                                                        }}>
                                                                            <Typography
                                                                                variant="small"
                                                                                color="blue"
                                                                                className="font-semibold underline"
                                                                            >
                                                                                {Booking?.bookingNumber}
                                                                            </Typography>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className={className}>
                                                                    <Typography
                                                                        className="text-xs font-semibold text-blue-gray-600">
                                                                        {status}
                                                                    </Typography>
                                                                </td>
                                                                <td className={className}>
                                                                    <Typography
                                                                        className="text-xs font-semibold text-blue-gray-600">
                                                                        {moment(Booking?.startTime).format("DD-MM-YYYY")}
                                                                    </Typography>
                                                                </td>
                                                                <td className={className}>
                                                                    <Typography
                                                                        className="text-xs font-semibold text-blue-gray-600">
                                                                        {moment(Booking?.endDate).format("DD-MM-YYYY")}
                                                                    </Typography>
                                                                </td>
                                                                <td className={className}>
                                                                    <Typography
                                                                        className="text-xs font-semibold text-blue-gray-600">
                                                                        {amount}
                                                                    </Typography>
                                                                </td>
                                                                <td className={className}>
                                                                    <Typography
                                                                        className="text-xs font-semibold text-blue-gray-600">
                                                                        {commission} %
                                                                    </Typography>
                                                                </td>
                                                                <td className={className}>
                                                                    <Typography
                                                                        className="text-xs font-semibold text-blue-gray-600">
                                                                        {commissionAmount}
                                                                    </Typography>
                                                                </td>
                                                                <td className={className}>
                                                                    <Typography
                                                                        className="text-xs font-semibold text-blue-gray-600">
                                                                        {total}
                                                                    </Typography>
                                                                </td>
                                                                <td className={className}>
                                                                    <Typography
                                                                        className="text-xs font-semibold text-blue-gray-600">
                                                                        {paymentType === "TRANSACTION" ? "Online" : "Cash"}
                                                                    </Typography>
                                                                </td>
                                                            </tr>
                                                        </>
                                                    );
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </CardBody>
                            </>) : (
                            <h2 className="text-lg font-medium p-4">No Trips</h2>
                        )
                        }
                    </Card>
                </>
            </div>
            <div className='flex justify-center w-full'>
                <Button
                    onClick={() => { navigate('/dashboard/finance/payable'); }}
                    className={`my-6 px-8 ${ColorStyles.backButton}`}
                >
                    Back
                </Button>
            </div>
            {modalData && (
                <Dialog open={Boolean(modalData)} handler={() => setModalData(null)} size="lg">
                    <DialogHeader>
                        <div className="flex justify-between items-center w-full">
                            <Typography variant="h6" className="font-bold text-gray-800">
                                Booking Id : {modalData?.Booking?.bookingNumber}
                            </Typography>
                            <button
                                className="text-gray-500 hover:text-gray-900 transition duration-150"
                                onClick={() => setModalData(null)}
                                aria-label="Close"
                            >
                                ✖
                            </button>
                        </div>
                    </DialogHeader>
                    <DialogBody divider>
                        <div className="gap-5 grid grid-cols-3">
                            <Card className="mb-4">
                                <CardBody>
                                    <div className="flex justify-between mb-2">
                                        <Typography variant="h5">Customer Details </Typography>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Name:</Typography>
                                            <Typography>{modalData?.Booking.Customer?.firstName}</Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Phone Number:</Typography>
                                            <Typography>
                                                {modalData?.Booking?.Customer?.phoneNumber}
                                            </Typography>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card className="mb-4">
                                <CardBody>
                                    <div className="flex justify-between mb-2">
                                        <Typography variant="h5">Driver Details </Typography>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Name:</Typography>
                                            <Typography>{modalData?.Driver?.firstName}</Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Phone Number:</Typography>
                                            <Typography>
                                                {modalData?.Driver?.phoneNumber}
                                            </Typography>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card className="mb-4">
                                <CardBody>
                                    <div className="flex justify-between mb-2">
                                        <Typography variant="h5">Ride Details</Typography>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Service Type:</Typography>
                                            <Typography>
                                                {modalData?.Booking?.serviceType}
                                            </Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Package Type:</Typography>
                                            <Typography>
                                                {modalData?.Booking?.packageType}
                                            </Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Trip Date:</Typography>
                                            <Typography>
                                                {modalData?.Booking?.startTime}
                                            </Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Package:</Typography>
                                            <Typography>
                                                {modalData?.Booking?.Package?.period}
                                                {modalData?.Booking?.packageType == "Intercity" ? ' hr' : ' days'}
                                            </Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Price:</Typography>
                                        </div>
                                        {/* <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Price:</Typography>
                                        </div> */}
                                    </div>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody>
                                    <div className="flex justify-between mb-2">
                                        <Typography variant="h5">Location Details </Typography>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Pickup:</Typography>
                                            <Typography>
                                                {modalData?.Booking?.pickupAddress?.name}
                                            </Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Drop-off:</Typography>
                                            <Typography>
                                                {modalData?.Booking?.dropAddress?.name}
                                            </Typography>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody>
                                    <div className="flex justify-between mb-2">
                                        <Typography variant="h5">Payment Details</Typography>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center gap-x-4">
                                                <Typography color="gray" variant="h6">Collected By:</Typography>
                                                <Typography>
                                                    {modalData?.Booking?.paymentCollected}
                                                </Typography>
                                            </div>
                                            <div className="flex justify-between items-center gap-x-4">
                                                <Typography color="gray" variant="h6">Method:</Typography>
                                                <Typography>
                                                    {modalData?.Booking?.paymentMethod}
                                                </Typography>
                                            </div>
                                            <div className="flex justify-between items-center gap-x-4">
                                                <Typography color="gray" variant="h6">Status:</Typography>
                                                <Typography>
                                                    {modalData?.Booking?.paymentStatus}
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                            {/* <Card className="my-6">
                                <div className="border rounded-xl bg-gray-200 p-4">
                                    <h2 className="text-2xl font-bold text-center">Invoice</h2>
                                    <div className="mt-3">
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Company Name: </Typography>
                                            <Typography>
                                                Rathaa
                                            </Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">GST Number: </Typography>
                                            <Typography>
                                                33TMSKDSHKHH
                                            </Typography>
                                        </div>
                                    </div>
                                    <hr className="my-2 border border-black" />
                                    <div className="mt-4">
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Package:</Typography>
                                            <Typography>
                                                {modalData?.Booking?.Package?.period}
                                                {modalData?.Booking?.packageType == "Intercity" ? ' hr' : ' days'}
                                            </Typography>
                                        </div>
                                        <>
                                            <div className="flex justify-between">
                                                <Typography color="gray" variant="h6">Base Fare:</Typography>
                                                <Typography>
                                                    Rs. {modalData?.Booking?.Package?.price}
                                                </Typography>
                                            </div>
                                            <div className="flex justify-between">
                                                <Typography color="gray" variant="h6"></Typography>
                                            </div>
                                        </>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Total:</Typography>
                                            <Typography>
                                                Rs. {modalData?.Booking?.totalPrice}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            </Card> */}
                        </div>

                    </DialogBody>
                    <DialogFooter>
                        <div className="flex justify-end w-full gap-x-3">
                            {modalData.type === "Review" && (
                                <>
                                    <Button
                                        onClick={() => handleVerify(modalData.type, modalData.id, "VERIFIED")}
                                        className="mr-3 text-xs font-semibold text-black bg-white border border-black"
                                    >
                                        Verify
                                    </Button>
                                    <Button
                                        onClick={() => handleVerify(modalData.type, modalData.id, "CANCELLED")}
                                        className="text-xs font-semibold text-white"
                                    >
                                        Cancel
                                    </Button>
                                </>
                            )}
                            {modalData.type === "Approve" && (
                                <>
                                    <Button
                                        onClick={() => {
                                            if (!transactionId.trim()) {
                                                setTransactionIdError(true);
                                                return;
                                            }
                                            setTransactionIdError(false);
                                            handleVerify(
                                                modalData.type,
                                                modalData.id,
                                                "COMPLETED",
                                                transactionId,
                                                comments
                                            );
                                        }}
                                        className="mr-3 text-xs font-semibold text-black bg-white border border-black"
                                    >
                                        Completed
                                    </Button>
                                    <Button
                                        onClick={() => handleVerify(modalData.type, modalData.id, "CANCELLED", transactionId, comments)}
                                        className="text-xs font-semibold text-white"
                                    >
                                        Cancel
                                    </Button>
                                </>
                            )}
                        </div>
                    </DialogFooter>
                </Dialog>
            )}
        </>
    );
};

export default PayableDetails;
