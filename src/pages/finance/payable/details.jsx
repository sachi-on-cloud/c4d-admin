import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES} from '@/utils/constants';
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardBody, Typography, Dialog, DialogHeader, DialogBody, DialogFooter} from '@material-tailwind/react';
import moment from 'moment';

const PayableDetails = () => {
    const navigate = useNavigate();
    const [accountVal, setAccountVal] = useState({});
    const { id } = useParams();
    const [modalData, setModalData]= useState(null);

    useEffect(() => {
        if (id) {
            fetchItem(id);
        }
    }, [id]); 

    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(`${API_ROUTES.GET_PAYABLE_DETAILS}/${itemId}`);
        console.log("DATA OF PAYABLE DETAILS",data?.data);
        setAccountVal(data.data);
    };

    return (
        <>
            <div className="p-4">

                <h2 className="text-2xl font-bold mb-4">Invoice Number - {accountVal[0]?.PaymentRequest?.invoiceNumber}</h2>
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
                                                ({BookingId, Booking, status, Driver, total, commissionAmount, amount, commission, paymentType}, key) => {
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
                                                                                Booking
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
                    className='my-6 px-8 text-white border-2 rounded-xl'
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
                                            <Typography>{modalData?.Booking?.Driver?.firstName}</Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Phone Number:</Typography>
                                            <Typography>
                                                {modalData?.Booking?.Driver?.phoneNumber}
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
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Package Type:</Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Trip Date:</Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Package:</Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Price:</Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Price:</Typography>
                                        </div>
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
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Drop-off:</Typography>
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
                                            </div>
                                            <div className="flex justify-between items-center gap-x-4">
                                                <Typography color="gray" variant="h6">Method:</Typography>
                                            </div>
                                            <div className="flex justify-between items-center gap-x-4">
                                                <Typography color="gray" variant="h6">Status:</Typography>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card className="my-6">
                                <div className="border rounded-xl bg-gray-200 p-4">
                                    <h2 className="text-2xl font-bold text-center">Invoice</h2>
                                    <div className="mt-3">
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Company Name: </Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">GST Number: </Typography>
                                        </div>
                                    </div>
                                    <hr className="my-2 border border-black" />
                                    <div className="mt-4">
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Package:</Typography>
                                        </div>
                                            <>
                                                <div className="flex justify-between">
                                                    <Typography color="gray" variant="h6">Base Fare:</Typography>
                                                </div>
                                                <div className="flex justify-between">
                                                    <Typography color="gray" variant="h6"></Typography>
                                                </div>
                                            </>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Total:</Typography>
                                        </div>
                                    </div>
                                </div>
                            </Card>
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