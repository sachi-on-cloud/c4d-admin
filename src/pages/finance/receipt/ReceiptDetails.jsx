import React, { useEffect, useState, useRef } from 'react';
import { Button, Typography } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import moment from 'moment';
import { themeColors } from "@/theme/colors";
import { Dialog, DialogHeader, DialogBody } from '@material-tailwind/react';
import ConfirmBooking from "@/pages/booking/confirmBooking";

const ReceiptDetails = () => {
    const [receipt, setReceipt] = useState({});
    const [bookingDetails, setBookingDetails] = useState({});
    const [additionalCharges, setAdditionalCharges] = useState({
        permit: 0,
        toll: 0,
        parking: 0,
        hill: 0,
    });
    const [finalAmountAfterExtras, setFinalAmountAfterExtras] = useState(0);
    const { receiptNumber } = useParams();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const pdfRef = useRef();

    // Access payment details safely
    const payment = bookingDetails?.paymentDetails?.details || {};

    // Helper: Convert minutes to HH:MM format
    const minsToHHMM = (totalMins) => {
        if (!totalMins) return "0 hrs : 00 mins";
        const hrs = Math.floor(totalMins / 60);
        const mins = Math.round(totalMins % 60);
        return `${hrs} hrs : ${mins.toString().padStart(2, "0")} mins`;
    };

    useEffect(() => {
        if (receiptNumber) {
            fetchReceipt(receiptNumber);
        }
    }, [receiptNumber]);

    const fetchReceipt = async (receiptId) => {
        try {
            const res = await ApiRequestUtils.get(`${API_ROUTES.GET_RECEIPT_DETAILS}/${receiptId}`);
            if (res?.success && res?.data) {
                const data = res.data;
                setReceipt(data);

                if (data.receiptType === 'BOOKING' && data.Booking) {
                    const booking = data.Booking;
                    setBookingDetails(booking);

                    // Set additional charges
                    setAdditionalCharges({
                        permit: Number(booking.extraCharges?.permitCharge) || 0,
                        toll: Number(booking.extraCharges?.tollCharge) || 0,
                        parking: Number(booking.extraCharges?.parkingCharge) || 0,
                        hill: Number(booking.extraCharges?.hillStationCharge) || 0,
                    });

                    // Calculate final amount after extras
                    const baseAfterGst = booking.paymentDetails?.details?.amountAfterGst || 0;
                    const totalExtra = Object.values({
                        permit: Number(booking.extraCharges?.permitCharge) || 0,
                        toll: Number(booking.extraCharges?.tollCharge) || 0,
                        parking: Number(booking.extraCharges?.parkingCharge) || 0,
                        hill: Number(booking.extraCharges?.hillStationCharge) || 0,
                    }).reduce((a, b) => a + b, 0);
                    setFinalAmountAfterExtras(Math.round(baseAfterGst + totalExtra));
                }
            }
        } catch (error) {
            console.error("Error fetching receipt details:", error);
        }
    };

    function formatDate(isoDateString) {
        if (!isoDateString) return "";
        const date = new Date(isoDateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const handleDownloadPDF = () => {
        const input = pdfRef.current;
    
        html2canvas(input, {
            scale: 2,
            useCORS: true,
            backgroundColor: themeColors.white,
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 190; 
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.save(`Receipt_${receipt.receiptNumber}.pdf`);
        });
    };
    const handleDriverNavigation = (DriverId) => {
        if (DriverId) {
            navigate(`/dashboard/vendors/account/drivers/details/${DriverId}`);
        }
    };

    return (
        <div className="p-6  mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-8">Receipt Details</h2>
                 <div className="grid grid-cols-2 gap-4 mb-10">
                                  

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Receipt Number</label>
                        <div className="p-3 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300 flex items-center">
                            {receipt.receiptNumber || ""}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Booking Id</label>
                        <div
                            onClick={() => receipt.bookingId && setIsOpen(true)}
                            className="p-3 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300 flex items-center text-primary-900 underline font-medium cursor-pointer"
                        >
                            {receipt.bookingId || ""}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Receipt Type</label>
                        <div className="p-3 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300 flex items-center">
                            {receipt.receiptType || ""}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Created Date</label>
                        <div className="p-3 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300 flex items-center">
                            {formatDate(receipt.created_at) || ""}
                        </div>
                    </div>
                    {receipt.Driver?.firstName && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Driver Name</label>
                                <div
                                    onClick={() => handleDriverNavigation(receipt.DriverId)}
                                    className="p-3 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300 flex items-center text-primary-600 underline cursor-pointer"
                                >
                                    {receipt.Driver?.firstName || ""} {receipt.Driver?.lastName || ""}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Driver Phone Number</label>
                                <div className="p-3 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300 flex items-center">
                                    {receipt.Driver?.phoneNumber || ""}
                                </div>
                            </div>
                        </>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Payment Method</label>
                        <div className="p-3 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300 flex items-center">
                            {receipt.paymentType || ""}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Total Amount</label>
                        <div className="p-3 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300 flex items-center font-bold">
                            ₹ {finalAmountAfterExtras || "0.00"}
                        </div>
                    </div>
                </div>
            <div ref={pdfRef} className="bg-white rounded-xl shadow-lg border p-8 space-y-10">

                {/* Top Section - Basic Fields */}
               

                {/* Detailed Receipt Section - Only for BOOKING type */}
                {receipt.receiptType === 'BOOKING' && bookingDetails?.id && (
                    <>
                       

                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-blue-700">Receipt</h2>
                            </div>

                            <hr className="my-4 border border-black" />

                            <div className="space-y-3 text-base">

                                {/* Extra Hours */}
                                {bookingDetails?.extraHours > 0 && (bookingDetails?.serviceType === "RIDES" || bookingDetails?.serviceType === "DRIVER" || (bookingDetails?.serviceType === "RENTAL" && bookingDetails?.packageType === "Local")) && (
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Extra Hrs:</Typography>
                                        <Typography color="gray" variant="h6">{minsToHHMM(bookingDetails.extraHours)}</Typography>
                                    </div>
                                )}

                                {bookingDetails?.extraHours > 0 && (bookingDetails?.serviceType === "RENTAL" && bookingDetails?.packageType !== "Local") && (
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Extra Hrs:</Typography>
                                        <Typography color="gray" variant="h6">
                                            {`${Math.floor(bookingDetails.extraHours)} hrs : ${Math.round((bookingDetails.extraHours % 1) * 60).toString().padStart(2, '0')} mins`}
                                        </Typography>
                                    </div>
                                )}

                                {/* Total Hours */}
                                {bookingDetails?.serviceType !== "RIDES" && bookingDetails?.serviceType !== "AUTO" && bookingDetails?.bookingType !== "DROP ONLY" && (
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Total Hours:</Typography>
                                        <Typography>{bookingDetails?.totalHours || 'N/A'}</Typography>
                                    </div>
                                )}

                                {/* Estimated KM */}
                                {bookingDetails?.packageType !== 'Local' && bookingDetails?.serviceType !== 'RIDES' && bookingDetails?.serviceType !== 'AUTO' && bookingDetails?.serviceType !== 'DRIVER' && bookingDetails?.serviceType !== 'RENTAL_DROP_TAXI' && (
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Estimate km:</Typography>
                                        <Typography>{bookingDetails?.estimatedDistance || 0} Kms</Typography>
                                    </div>
                                )}

                                {/* Extra KMs */}
                                {bookingDetails?.extraKMs > 0 && (
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Extra KMs:</Typography>
                                        <Typography>{Number(bookingDetails?.extraKMs).toFixed(2)}</Typography>
                                    </div>
                                )}

                                {/* Total KM */}
                                {bookingDetails?.serviceType !== 'RIDES' && bookingDetails?.serviceType !== 'AUTO' && (
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Total KM:</Typography>
                                        <Typography>
                                            {bookingDetails?.endKM && bookingDetails?.startKM 
                                                ? (bookingDetails.endKM - bookingDetails.startKM).toFixed(2) 
                                                : "0.00"}
                                        </Typography>
                                    </div>
                                )}

                                {bookingDetails?.serviceType === 'AUTO' && bookingDetails?.value?.estimatedDistance > 0 && (
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Total KM:</Typography>
                                        <Typography>
                                            {(Number(bookingDetails?.value?.distanceEstimated) + Number(bookingDetails?.value?.driverWithin || 0)).toFixed(1)} Kms
                                        </Typography>
                                    </div>
                                )}

                                {/* Trip Timing */}
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Start Time:</Typography>
                                    <Typography>{moment(bookingDetails.startTime).format("DD-MM-YYYY / hh:mm A")}</Typography>
                                </div>
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">End Time:</Typography>
                                    <Typography>{moment(bookingDetails.endedTime).format("DD-MM-YYYY / hh:mm A")}</Typography>
                                </div>

                                {/* Start & End KM (non-RIDES/AUTO) */}
                                {bookingDetails?.serviceType !== "RIDES" && bookingDetails?.serviceType !== 'AUTO' && (
                                    <>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Start KM:</Typography>
                                            <Typography>{bookingDetails?.startKM || 'N/A'}</Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">End KM:</Typography>
                                            <Typography>{bookingDetails?.endKM || 'N/A'}</Typography>
                                        </div>
                                    </>
                                )}

                                {/* Extra Prices */}
                                {bookingDetails?.extraKMPrice > 0 && (
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Extra Per KM Price:</Typography>
                                        <Typography>₹ {bookingDetails?.extraKMPrice}</Typography>
                                    </div>
                                )}

                                {bookingDetails?.extraNightChargePrice > 0 && (
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Night Charge:</Typography>
                                        <Typography>₹ {bookingDetails?.extraNightChargePrice}</Typography>
                                    </div>
                                )}

                                {bookingDetails?.extraHourPrice > 0 && (
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Extra Hrs Price (Per 15 Mins):</Typography>
                                        <Typography>₹ {bookingDetails?.extraHourPrice}</Typography>
                                    </div>
                                )}

                                {/* Extra Fare Breakdown */}
                                {bookingDetails?.extraHours > 0 && (bookingDetails?.serviceType === "RENTAL" && bookingDetails?.packageType !== "Local") && (
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">
                                            Extra fare after {bookingDetails?.Package?.period} hrs: ({bookingDetails.extraHours} × ₹{payment.extraHourPrice || 0})
                                        </Typography>
                                        <Typography>₹ {bookingDetails?.extraPrice || 0}</Typography>
                                    </div>
                                )}

                                {bookingDetails?.extraHours > 0 && (bookingDetails?.serviceType === "RIDES" || bookingDetails?.serviceType === "DRIVER" || (bookingDetails?.serviceType === "RENTAL" && bookingDetails?.packageType === "Local")) && (
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">
                                            Extra fare after {bookingDetails?.Package?.period} hrs: ({minsToHHMM(bookingDetails.extraHours)} × ₹{payment.extraHourPrice || 0})
                                        </Typography>
                                        <Typography>₹ {bookingDetails?.extraPrice || 0}</Typography>
                                    </div>
                                )}

                                {payment.extraKMs > 0 && (
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">
                                            Extra KM's Fare: ({Number(payment.extraKMs).toFixed(2)} × ₹{payment.extraKMPrice || 0})
                                        </Typography>
                                        <Typography>₹ {(payment.extraKMs * payment.extraKMPrice || 0).toFixed(2)}</Typography>
                                    </div>
                                )}

                                {payment.extraNightCharge > 0 && (
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Night Charge:</Typography>
                                        <Typography>₹ {payment.extraNightCharge}</Typography>
                                    </div>
                                )}

                                <hr className="my-2 border border-gray-400" />

                                {/* Final Trip Fare */}
                                {bookingDetails?.totalPrice > 0 && (
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Final Trip Fare:</Typography>
                                        <Typography className="font-bold">₹ {bookingDetails.totalPrice}</Typography>
                                    </div>
                                )}

                                {/* Discounts & Wallet */}
                                {payment.discountAmount > 0 && (
                                    <div className="flex justify-between">
                                        <Typography color="red" variant="h6">Discount Applied:</Typography>
                                        <Typography color="red" variant="h6">- ₹ {payment.discountAmount}</Typography>
                                    </div>
                                )}

                                {payment.walletAmountUsed > 0 && (
                                    <div className="flex justify-between">
                                        <Typography variant="h6" className="text-red-400">Wallet Points Used:</Typography>
                                        <Typography variant="h6" className="text-red-400">- ₹ {payment.walletAmountUsed}</Typography>
                                    </div>
                                )}

                                {/* Tax */}
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">TAX:</Typography>
                                    <Typography className="font-bold">₹ {payment.gstAmount || 0}</Typography>
                                </div>

                                <hr className="my-1 border border-gray-400" />

                                {/* Total After GST */}
                                {payment.amountAfterGst > 0 && (
                                    <div className="flex justify-between">
                                        <Typography color="green" variant="h6">Total:</Typography>
                                        <Typography color="green" className="font-bold">₹ {payment.amountAfterGst}</Typography>
                                    </div>
                                )}

                                

                                {/* Additional Charges */}
                                {bookingDetails.serviceType !== 'RIDES' && bookingDetails.serviceType !== 'AUTO' && (
                                    <>
                                    <hr className="my-4 border border-gray-400" />
                                        <div className="mb-3">
                                            <Typography variant="h6" className="font-semibold text-blue-700">Additional Charges</Typography>
                                        </div>
                                        {additionalCharges.permit > 0 && <div className="flex justify-between"><span>Permit Charge:</span> <b>₹ {additionalCharges.permit}</b></div>}
                                        {additionalCharges.toll > 0 && <div className="flex justify-between"><span>Toll Charge:</span> <b>₹ {additionalCharges.toll}</b></div>}
                                        {additionalCharges.parking > 0 && <div className="flex justify-between"><span>Parking Charge:</span> <b>₹ {additionalCharges.parking}</b></div>}
                                        {additionalCharges.hill > 0 && <div className="flex justify-between"><span>Hill Charge:</span> <b>₹ {additionalCharges.hill}</b></div>}

                                        {(additionalCharges.permit + additionalCharges.toll + additionalCharges.parking + additionalCharges.hill) > 0 && (
                                            <>
                                                <hr className="my-4 border border-gray-400" />
                                                <div className="flex justify-between text-lg font-bold text-green-700">
                                                    <span>Final Amount:</span>
                                                    <span>₹ {finalAmountAfterExtras}</span>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div 
    ref={pdfRef} 
    className="fixed -top-[9999px] left-0 w-[800px] bg-white p-12 shadow-2xl font-sans"
    style={{ transform: 'scale(0.85)', transformOrigin: 'top left' }}
>
    {/* Simple Root Cabs Receipt - Matching the image exactly */}
   <div className="flex mb-5">
  {/* Logo - Left side */}
  <div >
    <img
      src="/img/app_icon_root.png"
      alt="ROOT CABS"
      className="h-16 w-16 mr-4 rounded-full ring-2 ring-primary-200"
    />
     
  </div>

  {/* Center content */}
  <div >
   <h3 className="text-3xl font-bold text-gray-800">Here’s your receipt for the ride.</h3>
  </div>
</div>



    <div className="space-y-6 text-lg">
         <div className="flex justify-between">
            <span className="font-medium">Receipt ID:</span>
            <span>{receipt.receiptNumber}</span> 
        </div>
         <div className="flex justify-between">
            <span className="font-medium">Booking ID:</span>
            <span> {bookingDetails?.bookingNumber}</span> 
        </div>
        <div className="flex justify-between">
            <span className="font-medium">Booking Date:</span>
            <span>{formatDate(bookingDetails?.startTime || receipt.created_at)}</span> 
        </div>
        
        <div className="flex justify-between">
            <span className="font-medium">Customer Name:</span>
            <span>{receipt?.Customer?.firstName}</span> 
        </div>
       

        <hr className="border-gray-400" />

        <div className="flex justify-between font-bold text-xl">
            <span>Total</span>
            <span>Rs. { finalAmountAfterExtras  || "0"}</span>
        </div>

        <div className="flex justify-between">
            <span>Payment Method</span>
            <span className="uppercase">{receipt.paymentType || "ONLINE"}</span>
        </div>

        <div className="flex justify-between">
            <span>Status</span>
            <span className="text-green-600 font-semibold">{bookingDetails?.paymentStatus || " "}</span>
        </div>
    </div>
    <hr className="border-gray-400 mt-10" />
    
    <div className="mt-10 space-y-3 text-base text-gray-700">
        
        
        <p className="font-semibold"> Driver Name: {receipt?.Driver?.firstName || "N/A"}</p>
        <p><strong>License Plate:</strong> {bookingDetails?.Cab?.car_number|| " "}</p>
        <p><strong>Service:</strong> {
    bookingDetails?.serviceType === 'DRIVER' ? 'ACTING DRIVER' :
    bookingDetails?.serviceType === 'RIDES' ? 'Local Rides' :
    bookingDetails?.packageType === 'Local' ? 'Hourly Package' :
    bookingDetails?.bookingType === 'DROP ONLY' ? 'Drop Taxi' :
    bookingDetails?.serviceType === 'AUTO' ? 'Auto' :
     bookingDetails?.serviceType === 'PARCEL' ? 'Parcel' :
    'Outstation'
  } | Kilometers: {Number(bookingDetails?.estimatedDistance || "1").toFixed(2)} | Duration: {bookingDetails?.totalHours ? `${bookingDetails.totalHours} hrs` : minsToHHMM(bookingDetails?.extraHours || 49)}</p>
        
        <p className="mt-4">
            {moment(bookingDetails.startTime).format("hh:mm A")}: {bookingDetails?.pickupFormatAddress?.name || "Not Added"}
        </p>
        <p>
             {moment(bookingDetails.endedTime).format("hh:mm A")}: {bookingDetails?.dropFormatAddress?.name || "Not Added"}
        </p>
    </div>
<hr className="border-gray-400 mt-10" />
    <div className="text-left text-sm text-gray-500 mt-10">
        <p>Thank you for riding with us!</p>
    </div>
</div>

            <div className="flex justify-center gap-6 mt-10">
                <Button onClick={() => navigate('/dashboard/finance/receipt')} className={`px-8 ${ColorStyles.backButton}`}>
                    Back
                </Button>
                <Button onClick={handleDownloadPDF} className="px-8 bg-green-500 text-white rounded-xl">
                    Download PDF
                </Button>
            </div>
            <Dialog open={isOpen}>
                <DialogHeader className="flex justify-end items-end">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-black text-xl font-bold focus:outline-none"
                    >
                        ×
                    </button>
                </DialogHeader>
                <DialogBody className="max-h-[80vh] overflow-y-auto">
                    <ConfirmBooking 
                        bookingData={{
                            id: receipt?.bookingId,
                            customerId: receipt?.customerId,
                        }}
                        setIsOpen={setIsOpen} onConfirm={setIsOpen}
                    />
                </DialogBody>
            </Dialog>
        </div>
    );
};

export default ReceiptDetails;