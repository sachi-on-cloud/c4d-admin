import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Typography,
    Button,
    Spinner,
    Select,
    Option,
    Input,
} from "@material-tailwind/react";
import { Formik, Form, Field, ErrorMessage, validateYupSchema } from 'formik';
import { useLocation, useNavigate } from "react-router-dom";
import { ApiRequestUtils } from "../../utils/apiRequestUtils";
import { API_ROUTES, BOOKING_STATUS, COMPANY_NAME, GST_NUMBER, supportNumber, WHATSAPP_DRIVER_ASSIGNED_TEMPLATE, WHATSAPP_TRIP_START_TEMPLATE, WHATSAPP_PAYMENT_REQUEST_TEMPLATE, WHATSAPP_TRIP_COMPLETION_TEMPLATE, GPAY_NAME, GPAY_NUMBER } from "../../utils/constants";
import { Utils } from '../../utils/utils';
import 'react-datepicker/dist/react-datepicker.css';
import moment from "moment";
import TextBoxWithList from "@/components/BookingNotes";

const ConfirmBooking = (props) => {
    const [bookingDetails, setBookingDetails] = useState("");
    const [dateVal, setDateVal] = useState();
    const [kms, setKms] = useState();
    const [timeVal, setTimeVal] = useState();
    const [amount, setAmount] = useState();
    const [customerFeedback, setCustomerFeedback] = useState();
    const [driverFeedback, setDriverFeedback] = useState();

    const [paymentDetails, setPaymentDetails] = useState({
        paymentCollected: "",
        paymentMethod: "",
        paymentStatus: "NOT PAID",
        enable: false // Default value
    });

    const navigate = useNavigate();
    const location = useLocation();
    const paramsPassed = location.state;

    const [loading, setLoading] = useState(true);

    // Handler to update state
    const handleChange = (field, value) => {
        setPaymentDetails((prev) => ({ ...prev, [field]: value }));
    };

    const onConfirmPressHandler = async () => {
        setLoading(true);
        let dateTime = dateVal + " " + timeVal;
        const reqBody = {
            bookingId: bookingDetails?.id,
            id: bookingDetails?.serviceType == "CAB" ? bookingDetails?.Cab?.id : bookingDetails?.Driver?.id,
            bookingType: bookingDetails?.serviceType,
            date: moment(dateTime).format("YYYY-MM-DD HH:mm:ss.SSSZ"),
            amount: 0,
            extraHours: 0,
            price: 0,
            extraPrice: 0,
            extraHourPrice: 0,
            kilometer: bookingDetails?.serviceType !== "CAR_WASH" ? kms : 0
        };
        if (bookingDetails.status == BOOKING_STATUS.INITIATED || bookingDetails.status === 'BOOKING_ACCEPTED') {
            reqBody.type = "start";
        } else if (bookingDetails.status == BOOKING_STATUS.STARTED) {
            reqBody.type = "end";
            if (amount?.total) {
                reqBody.amount = amount?.total;
                reqBody.extraHours = amount?.extraHours;
                reqBody.price = amount?.price;
                reqBody.extraPrice = amount?.extraPrice;
                reqBody.extraHourPrice = amount?.extraHourPrice;
                reqBody.extraKMs = amount?.extraKMs;
                reqBody.extraKMPrice = amount?.extraKMPrice;
                reqBody.extraNightCharge = amount?.extraNightCharge;
                reqBody.extraNightChargePrice = amount?.extraNightChargePrice;
                reqBody.totalPrice = amount?.total;
                reqBody.totalDistance = amount?.totalKM;
                reqBody.paymentCollected = paymentDetails?.paymentCollected;
                reqBody.paymentMethod = paymentDetails?.paymentMethod;
                reqBody.paymentStatus = paymentDetails?.paymentStatus;
                reqBody.endKM = kms;
            } else {
                alert("Please check price before end the trip");
                setLoading(false);
                return false;
            }
        }
        const data = await ApiRequestUtils.update(API_ROUTES.ADMIN_BOOKING_STATUS, reqBody, bookingDetails?.customerId);
        if (data?.success) {
            //navigate("/dashboard/booking");
            props.onConfirm()
            setLoading(false);
        }
    };
    const getBookingById = async (bookingId, customerId) => {
        setLoading(true);
        const data = await ApiRequestUtils.get(API_ROUTES.GET_CONFIRMATION_BOOKING_BY_ID + "/" + bookingId, customerId);
        if (data?.success) {
            setBookingDetails({...data?.data, estimatedPrice:data?.estimatedPrice, notesData:data?.notes});
            if (data?.data?.status == BOOKING_STATUS.ENDED) {
                setAmount({
                    price: data?.data?.price,
                    extraPrice: data?.data.extraHours * data?.data.extraHourPrice || 0,
                    total: data?.data.endPayment,
                    extraHours: data?.data.extraHours,
                    extraHourPrice: data?.data.extraHourPrice,
                    extraKMs: data?.data.extraKMs,
                    extraKMPrice: data?.data.extraKMPrice,
                    extraNightCharge: data?.data?.extraNightCharge,
                    extraNightChargePrice: data?.data?.extraNightChargePrice,
                });
                setCustomerFeedback({
                    rating: data?.data?.CustomerFeedbacks?.[0]?.rating,
                    comment: data?.data?.CustomerFeedbacks?.[0]?.comments,

                });

                setDriverFeedback({
                    rating: data?.data?.Feedbacks?.[0]?.rating,
                    comment: data?.data?.Feedbacks?.[0]?.message,
                });
                setPaymentDetails({
                    paymentCollected: data?.data?.paymentCollected,
                    paymentMethod: data?.data?.paymentMethod,
                    paymentStatus: data?.data?.paymentStatus,
                    enable: true
                })
            } else {
                setAmount();
            }
        }
        setLoading(false);
    };

    const getPriceForBooking = async () => {
        if (bookingDetails?.status == BOOKING_STATUS.STARTED && dateVal && timeVal) {
            //const date = moment(dateVal).format("YYYY-MM-DD HH:mm:ss.SSSZ");
            setLoading(true);
            let dateTime = dateVal + " " + timeVal;
            //console.log(dateTime, "dateTime");
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.ADMIN_BOOKING_PRICE, {
                bookingId: bookingDetails?.id,
                id: bookingDetails?.serviceType == "CAB" ? bookingDetails?.Cab?.id : bookingDetails?.Driver?.id,
                date: moment(dateTime).format("YYYY-MM-DD HH:mm:ss.SSSZ"),
                bookingType: bookingDetails?.serviceType,
                kilometer: kms ? kms : 0
            });
            if (data?.success) {
                setAmount(data?.data);
                handleChange('enable', true);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        if (paramsPassed?.bookingId) {
            getBookingById(paramsPassed?.bookingId, paramsPassed?.customerId);
        }

    }, []);

    useEffect(() => {
        if (props.bookingData) {
            getBookingById(props.bookingData.id, props.bookingData.customerId);
        }
    }, [props.bookingData]);

    const onBackPressHandler = async () => {
        props.onConfirm()
        props.setIsOpen(false)
    };

    const [showCancelReason, setShowCancelReason] = useState(false);
    const [cancelData, setCancelData] = useState({
        cancelReason: "",
        cancelBy: "",
        cancelCharge: "",
    });

    const handleCancelChange = (e) => {
        const { name, value } = e.target;
        setCancelData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleBookingAction = async (actionType) => {
        if (actionType === BOOKING_STATUS.CANCELLED && !cancelData.cancelReason.trim()) return;

        const reqBody = {
            status: actionType,
            bookingId: bookingDetails?.id,
            ...(actionType === BOOKING_STATUS.CANCELLED && {
                cancelReason: cancelData.cancelReason,
                cancelRequestedBy: cancelData.cancelBy,
                isCancelChargeApplicable: cancelData.cancelCharge,
            }),
        };
        const data = await ApiRequestUtils.update(
            actionType === BOOKING_STATUS.CANCELLED
                ? API_ROUTES.CANCEL_ADMIN_BOOKING
                : API_ROUTES.CONFIRM_ADMIN_BOOKING,
            reqBody
        );
        console.log("CANCELBOKING",data);

        if (data?.success) {
            props.onConfirm();
        }
    };

    const addNotes = async(text) => {
        setLoading(true);
        text.bookingId = props.bookingData.id
        const response = await ApiRequestUtils.post(API_ROUTES.ADD_NOTES_BOOKING, text);
        if(response?.success){
            getBookingById(props.bookingData.id, props.bookingData.customerId);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner className="h-12 w-12" />
            </div>
        );
    }

    const bookingTimes = Utils.generateBookingTimesForDay(moment().add(1, 'days'));
    return (
        <div className="container mx-auto">
            <div className="grid grid-cols-2 gap-4">
            <Card className="mb-2">
                <CardBody>
                    <div className="flex justify-between mb-2">
                        <Typography variant="h5">Customer Details </Typography>
                    </div>
                    <hr className="my-2" />
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Name:</Typography>
                            <Typography>{bookingDetails?.Customer?.firstName}</Typography>
                        </div>
                        <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Phone Number:</Typography>
                            <Typography>
                                {bookingDetails?.Customer?.phoneNumber}
                            </Typography>
                        </div>
                    </div>
                        <div className="mt-6">
                            <Typography variant="h6" className="mb-2">Customer Feedback</Typography>
                            {customerFeedback ? (
                                <div className="text-sm">
                                    <div className="text-yellow-500 text-2xl">
                                        {"★".repeat(Math.round(customerFeedback.rating)) + "☆".repeat(5 - Math.round(customerFeedback.rating))}
                                    </div>
                                    <div className="italic">"{customerFeedback.comment}"</div>
                                </div>
                            ) : (
                                <Typography>No feedback given.</Typography>
                            )} 
                        </div>

                </CardBody>
            </Card>

            {(bookingDetails?.status == "SUPPORT_CANCELLED" || bookingDetails?.status == "CANCELLED") &&
                <Card className="mb-2">
                    <CardBody>
                        <div className="flex justify-between mb-2">
                            <Typography variant="h5">Cancellation Reason</Typography>
                        </div>
                        <hr className="my-2" />
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Reason:</Typography>
                                <Typography>{bookingDetails?.cancelReason}</Typography>
                            </div>
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Cancel Requested By:</Typography>
                                <Typography>{bookingDetails?.cancelRequestedBy}</Typography>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            }
            {bookingDetails?.Driver?.id &&
                <Card className="mb-2">
                    <CardBody>
                        <div className="flex justify-between mb-2">
                            <Typography variant="h5">Driver Details </Typography>
                        </div>
                        <hr className="my-2" />
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Name:</Typography>
                                <Typography>{bookingDetails?.Driver?.firstName}</Typography>
                            </div>
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Phone Number:</Typography>
                                <Typography>
                                    {bookingDetails?.Driver?.phoneNumber}
                                </Typography>
                            </div>
                        </div>
                            <div className="mt-6">
                                <Typography variant="h6" className="mt-4 mb-2">Driver Feedback</Typography>
                                {driverFeedback ? (
                                    <div className="text-sm">
                                        <div className="text-yellow-500 text-2xl">
                                            {"★".repeat(Math.round(driverFeedback.rating)) + "☆".repeat(5 - Math.round(driverFeedback.rating))}
                                        </div>
                                        <div className="italic">"{driverFeedback.comment}"</div>
                                    </div>
                                ) : (
                                    <Typography>No feedback given.</Typography>
                                )}
                            </div>

                    </CardBody>
                </Card>
            }
            </div>
            <div className="grid grid-cols-2 gap-4">
            <Card className="mb-2">
                <CardBody>
                    <div className="flex justify-between mb-2">
                        <Typography variant="h5">Ride Details</Typography>
                        <Typography variant="h6" color="green"><a target="_blank" href={Utils.generateWhatsAppMessage(bookingDetails)}>Share on Whatsapp</a></Typography>
                    </div>
                    <hr className="my-2" />
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Service Type:</Typography>
                            <Typography>{bookingDetails.serviceType === 'DRIVER' ? 'ACTING DRIVER' : bookingDetails.serviceType == "RIDES" ? 'Rides' : bookingDetails?.packageType == "Local" ? 'Hourly Package' : bookingDetails?.bookingType == "DROP ONLY" ? 'Drop Taxi' : 'Outstation' }</Typography>
                        </div>
                        {/* {bookingDetails?.serviceType !='RIDES' && <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Package Type:</Typography>
                            <Typography>{bookingDetails.packageType}</Typography>
                        </div>} */}
                        <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Start Date:</Typography>
                            <Typography>{moment(bookingDetails.fromDate).format("DD-MM-YYYY / hh:mm A")}</Typography>
                        </div>
                        {bookingDetails?.toDate &&
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">End Date:</Typography>
                                <Typography>{moment(bookingDetails.toDate).format("DD-MM-YYYY / hh:mm A")}</Typography>
                            </div>
                        }
                        {bookingDetails?.packageType == "Outstation" &&
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">AC Type:</Typography>
                                <Typography>{bookingDetails?.acType}</Typography>
                            </div>
                        }
                        {bookingDetails?.serviceType !='RIDES' && 
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Package:</Typography>
                                <Typography>{`${bookingDetails?.packageType == 'Local' ? bookingDetails?.Package?.period : ''}
                                            ${bookingDetails?.packageType === "Outstation" ? bookingDetails.totalDays ? bookingDetails?.totalDays + ' Days' : bookingDetails?.value?.differenceDays + ' Days' : 
                                            bookingDetails?.packageType === "Local" ? "hours" : ""}`}</Typography>
                            </div>
                        }
                        {bookingDetails?.value?.baseFare > 0 && 
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Base Fare:</Typography>
                                <Typography>₹ {bookingDetails?.value?.baseFare}</Typography>
                            </div>
                        }
                        {bookingDetails?.value?.kilometerPriceVal > 0 &&
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Per KM Rate:</Typography>
                                <Typography>₹ {bookingDetails?.value?.kilometerPriceVal}</Typography>
                            </div>
                        }
                        {bookingDetails?.value?.estimatedDistance > 0 &&
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Total Distance:</Typography>
                                <Typography>{(Number(bookingDetails?.value?.estimatedDistance)).toFixed(1)} Kms</Typography>
                            </div>
                        }
                        {/* need to add logic for price */}
                        {bookingDetails?.status !== BOOKING_STATUS.ENDED &&
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Price:</Typography>
                                {/* <Typography>₹ {bookingDetails?.Cab ? bookingDetails?.Cab?.Prices[0]?.baseFare : bookingDetails?.Driver ? bookingDetails?.Package?.price : bookingDetails?.Package?.baseFare ? bookingDetails?.Package?.baseFare : bookingDetails?.Package?.price}</Typography> */}
                                <Typography>₹ {bookingDetails?.serviceType == 'DRIVER' ? bookingDetails?.Package?.price : (bookingDetails?.packageType == 'Local' && bookingDetails?.serviceType == 'RENTAL' ) ? bookingDetails?.Package?.price : bookingDetails?.value?.estimatedPrice}</Typography>
                            </div>
                        }
                        {bookingDetails?.status === BOOKING_STATUS.ENDED &&
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Price:</Typography>
                                <Typography>₹ {amount?.total}</Typography>
                            </div>
                        }
                        {/* {bookingDetails?.status !== BOOKING_STATUS.INITIATED && <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Price:</Typography>
                            <Typography>₹ {bookingDetails?.Driver ? bookingDetails?.Driver?.Prices[0]?.price : bookingDetails?.Cab?.Prices[0]?.price}</Typography>
                        </div>} */}
                        {/* <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Car:</Typography>
                            <Typography>{bookingDetails?.Car?.nickName}</Typography>
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
                            <Typography color="gray" variant="h6">Pickup: </Typography>
                            <Typography>{bookingDetails?.pickupAddress?.name}</Typography>
                        </div>
                        <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Drop-off: </Typography>
                            <Typography>
                                {bookingDetails?.dropAddress?.name || "Not Added"}
                            </Typography>
                        </div>
                    </div>
                </CardBody>
            </Card>
            </div>  
            {/*{(bookingDetails?.status === 'STARTED') ||
                ((bookingDetails?.status === 'INITIATED' || bookingDetails?.status === 'BOOKING_ACCEPTED') && (!!bookingDetails?.Driver?.id || !!bookingDetails?.Cab?.id)) &&
                <Card className="my-4 gap-4">
                    <CardBody >
                        <Typography variant="h5" className="mb-2">
                            {bookingDetails?.status === 'STARTED' ? "End" : "Start"} Time
                        </Typography>
                        <div className='flex gap-x-5'>
                            <div className=''>
                                <Formik>
                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <div className="flex flex-col">
                                            <label htmlFor="dateVal" className="text-sm font-medium text-gray-700">
                                                Select Date
                                            </label>
                                            <Field
                                                type="date"
                                                name="dateVal"
                                                id="dateVal"
                                                className="p-2 w-full rounded-xl border-2 border-gray-300"
                                                min={bookingDetails?.date}
                                                onChange={(e) => setDateVal(e.target.value)}
                                                value={dateVal}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <label htmlFor="rideTime" className="text-sm font-medium text-gray-700">
                                                Select Time
                                            </label>
                                            <Field
                                                as="select"
                                                name="rideTime"
                                                id="rideTime"
                                                className="p-2 w-full rounded-xl border-2 border-gray-300"
                                                onChange={(e) => setTimeVal(e.target.value)}
                                                value={timeVal}
                                            >
                                                <option value="">Select time</option>
                                                {bookingTimes.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {Utils.convertTimeFormat(item.id)}
                                                    </option>
                                                ))}
                                            </Field>
                                        </div>

                                        {bookingDetails?.serviceType !== 'CAR_WASH' &&
                                            <div className="flex flex-col">
                                                <label htmlFor="kms" className="text-sm font-medium text-gray-700">
                                                    Distance (KM)
                                                </label>
                                                <div className="relative flex items-center">
                                                    <Field
                                                        type="number"
                                                        name="kms"
                                                        id="kms"
                                                        placeholder="Enter KM"
                                                        className="p-2 w-full rounded-xl border-2 border-gray-300"
                                                        onChange={(e) => {
                                                            const inputValue = e.target.value;
                                                            const value = parseFloat(inputValue);
                                                            if (inputValue === "" || (value > 0 && !isNaN(value))) {
                                                                setKms(inputValue);
                                                            }

                                                        }}
                                                        value={kms}
                                                    />
                                                </div>
                                            </div>
                                        }
                                        {bookingDetails.status == BOOKING_STATUS.STARTED && (
                                            <div className="flex flex-col">
                                                <label htmlFor="kms" className="text-sm font-medium text-white">
                                                    Distance (KM)
                                                </label>
                                                <Button onClick={getPriceForBooking} className=" justify-center items-center">
                                                    Check Price
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Formik>
                            </div>
                        </div>
                    </CardBody>
                </Card>  
            }*/}
            {amount && (
                <Card className="my-6">
                    <div className="border rounded-xl bg-gray-200 p-4">
                        <h2 className="text-2xl font-bold text-center">Invoice</h2>
                        {/* <div className="mt-3">
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Company Name: </Typography>
                                <Typography color="gray" variant="small">{COMPANY_NAME}</Typography>
                            </div>
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">GST Number: </Typography>
                                <Typography color="gray" variant="small">{GST_NUMBER}</Typography>
                            </div>
                        </div> */}
                        <hr className="my-2 border border-black" />
                        <div className="mt-4">
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Package:</Typography>
                                <Typography>{`${bookingDetails?.Package?.period} ${bookingDetails?.packageType === "Outstation" ? "d" : bookingDetails?.packageType === "Local" ? "hr" : ""
                                    }`}</Typography>
                            </div>
                            {bookingDetails?.packageType === "Local" || bookingDetails?.packageType === "Outstation" ?
                                <>
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Base Fare:</Typography>
                                        <Typography>₹ {amount?.price}</Typography>
                                    </div>
                                    {amount.extraKMs > 0 && <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">{`Extra fare after ${bookingDetails?.Package?.period
                                            } ${bookingDetails?.packageType === "Outstation" ? "d" : bookingDetails?.packageType === "Intercity" ? "hr" : ""}: (${amount.extraHours} x ${amount.extraHourPrice})`}</Typography>
                                        <Typography>₹ {amount?.extraPrice}</Typography>
                                    </div>}
                                    {amount.extraKMs > 0 &&
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">{`Extra KM's Fare: (${amount.extraKMs} x ${amount.extraKMPrice})`}</Typography>
                                            <Typography>₹ {amount?.extraKMs * amount?.extraKMPrice}</Typography>
                                        </div>
                                    }
                                    {amount.extraNightCharge > 0 &&
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">{`Night Charge: (${amount.extraNightCharge} x ${amount.extraNightChargePrice})`}</Typography>
                                            <Typography>₹ {amount?.extraNightCharge * amount?.extraNightChargePrice}</Typography>
                                        </div>
                                    }
                                </> : ""
                            }
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Total:</Typography>
                                <Typography style={{
                                    fontWeight: 'bold'
                                }}>₹ {amount?.total}</Typography>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
            <>
            <div className="">
                {(bookingDetails?.status === 'ENDED' || paymentDetails.enable) &&
                    <Card>
                        <CardBody>
                            <div className="flex justify-between mb-2">
                                <Typography variant="h5">Payment Details</Typography>
                            </div>
                            <hr className="my-2"/>
                                <div className="space-y-2">
                                    {/* Payment Collected */}
                                    <div className="grid grid-cols-6 gap-x-4">
                                        <Typography color="gray" variant="h6" className="">Collected By:</Typography>
                                        <Select
                                            value={paymentDetails.paymentCollected}
                                            onChange={(value) => handleChange("paymentCollected", value)}
                                            disabled={bookingDetails?.status === 'ENDED'}
                                        >
                                            <Option value="C4D">C4D</Option>
                                            <Option value="DRIVER">DRIVER</Option>
                                        </Select>
                                    </div>
                                    {/* Payment Method */}
                                    <div className="grid grid-cols-6 gap-x-4">
                                        <Typography color="gray" variant="h6">Method:</Typography>
                                        <Select
                                            value={paymentDetails.paymentMethod}
                                            onChange={(value) => handleChange("paymentMethod", value)}
                                            disabled={bookingDetails?.status === 'ENDED'}
                                        >
                                            <Option value="CASH">CASH</Option>
                                            <Option value="ONLINE">ONLINE</Option>
                                        </Select>
                                    </div>
                                    {/* Payment Status */}
                                    <div className="grid grid-cols-6 gap-x-4">
                                        <Typography color="gray" variant="h6">Status:</Typography>
                                        <Select
                                            value={paymentDetails.paymentStatus}
                                            onChange={(value) => handleChange("paymentStatus", value)}
                                            disabled={bookingDetails?.status === 'ENDED'}
                                        >
                                            <Option value="PAID">PAID</Option>
                                            <Option value="NOT PAID">NOT PAID</Option>
                                        </Select>
                                    </div>
                            </div>
                            
                        </CardBody>
                    </Card>
                }
                </div>
                <div className="grid grid-cols-3 gap-4 my-2">
                    <Button
                        color="blue"
                        ripple="light"
                        fullWidth
                        onClick={onBackPressHandler}
                    >
                        Back
                    </Button>

                    {bookingDetails.status === "QUOTED" && (
                        <Button
                            color="blue"
                            variant="outlined"
                            ripple="dark"
                            fullWidth
                            onClick={() => {handleBookingAction(BOOKING_STATUS.CONFIRMED);
                                setIsOpen(false);
                            }}
                        >
                            Confirm Booking
                        </Button>
                    )}

                    {bookingDetails.status !== "ENDED" &&
                        bookingDetails.status !== "STARTED" &&
                        bookingDetails.status !== "CANCELLED" && (
                            <>
                                {!showCancelReason && (bookingDetails?.status == 'QUOTED' || bookingDetails?.status == 'INITIATED' || bookingDetails?.status == 'DRIVER_ON_THE_WAY' || bookingDetails?.status == 'DRIVER_REACHED' || bookingDetails?.status == 'REQUEST_DRIVER' || bookingDetails?.status == 'CONFIRMED' || bookingDetails?.status == 'BOOKING_ACCEPTED') &&
                                    (
                                        <Button
                                            color="blue"
                                            variant="outlined"
                                            ripple="dark"
                                            fullWidth
                                            onClick={() => setShowCancelReason(true)}
                                        >
                                            Cancel Booking
                                        </Button>
                                    )
                                }
                            </>
                        )
                    }

                    {bookingDetails?.status === 'QUOTED' && (
                        <Button
                            color="blue"
                            variant="outlined"
                            ripple="dark"
                            fullWidth
                            onClick={() => { props.onEdit(bookingDetails) }}
                        >
                            Edit Booking
                        </Button>
                    )}

                    {(['INITIATED', 'QUOTED', 'CONFIRMED'].includes(bookingDetails.status) || (bookingDetails.status == "REQUEST_DRIVER" && bookingDetails.serviceType == "RIDES")) &&
                        bookingDetails?.pickupAddress &&
                        !bookingDetails?.Driver?.id &&
                        !bookingDetails?.Cab?.id && (
                            <Button
                                color="blue"
                                ripple="light"
                                fullWidth
                                onClick={() => { props.onAssignDriver(bookingDetails); }}
                            >
                                {props.bookingData.serviceType != "CAB" && props.bookingData.serviceType !="DRIVER"
                                    ? "Assign Cab"
                                    : "Assign Captain"}
                            </Button>
                        )}

                    {bookingDetails.status === 'ASSIGNED_TO_SUPPORT' &&
                        bookingDetails?.pickupAddress &&
                        !bookingDetails?.Driver?.id &&
                        !bookingDetails?.Cab?.id && (
                            <Button
                                color="black"
                                ripple="light"
                                fullWidth
                                onClick={() => { props.onAssignDriver(bookingDetails); }}
                            >
                                {props.bookingData.serviceType === "CAB"
                                    ? "Assign Cab"
                                    : "Assign Captain"}
                            </Button>
                        )}

                    {['QUOTED','CONFIRMED', 'BOOKING_ACCEPTED'].includes(bookingDetails.status) &&
                        (bookingDetails?.Driver?.id || bookingDetails?.Cab?.id) && (
                            <Button
                                color="black"
                                ripple="light"
                                fullWidth
                                onClick={() => { props.onAssignDriver(bookingDetails); }}
                            >
                                {props.bookingData.serviceType !== "DRIVER"
                                    ? "Choose Another Cab"
                                    : "Choose Another Captain"}
                            </Button>
                        )}

                    {/* {(bookingDetails.status === 'BOOKING_ACCEPTED' && //start
                        dateVal &&
                        timeVal &&
                        kms) ? (
                            <Button
                                color="black"
                                ripple="light"
                                fullWidth
                                onClick={onConfirmPressHandler}
                            >
                                Start Trip
                            </Button>
                            ) : 
                        (bookingDetails?.serviceType === 'CAR_WASH' && bookingDetails.status === 'INITIATED' && dateVal && timeVal ) ?
                            (<Button
                                    color="black"
                                    ripple="light"
                                    fullWidth
                                    onClick={onConfirmPressHandler}
                                >
                                    Start Trip
                            </Button> 
                        ) : <></>
                    } */}

                    {/* {(bookingDetails.status === 'STARTED' &&
                        dateVal &&
                        timeVal &&
                        kms &&
                        paymentDetails.paymentCollected &&
                        paymentDetails.paymentMethod &&
                        paymentDetails.paymentStatus ) ? (
                            <Button
                                color="black"
                                ripple="light"
                                fullWidth
                                onClick={onConfirmPressHandler}
                            >
                                End Trip
                            </Button>
                        ) : (
                        bookingDetails?.serviceType === 'CAR_WASH' &&
                        bookingDetails.status === 'STARTED' &&
                        dateVal &&
                        timeVal &&
                        paymentDetails.paymentCollected &&
                        paymentDetails.paymentMethod &&
                        paymentDetails.paymentStatus) ? (
                            <Button
                                color="black"
                                ripple="light"
                                fullWidth
                                onClick={onConfirmPressHandler}
                            >
                                End Trip
                            </Button>
                        ) :<></>
                    } */}
                </div>

                {showCancelReason && (
                    <div className="mt-4 space-y-2">
                        <select
                            name="cancelBy"
                            value={cancelData.cancelBy}
                            onChange={handleCancelChange}
                            className="border border-gray-300 px-2 py-1 rounded-md w-full"
                        >
                            <option value="">Select who cancelled</option>
                            <option value="Customer">Cancelled by Customer</option>
                            <option value="Driver">Cancelled by Driver</option>
                        </select>
                        <Input
                            type="text"
                            name="cancelReason"
                            value={cancelData.cancelReason}
                            onChange={handleCancelChange}
                            placeholder="Enter cancellation reason..."
                            className="border border-gray-300 px-2 py-1 rounded-md w-full"
                        />
                        <div className="flex items-center space-x-4">
                            <label className="font-medium">Cancellation Charge Applicable:</label>
                            <label className="inline-flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="cancelCharge"
                                    value="Yes"
                                    checked={cancelData.cancelCharge === "Yes"}
                                    onChange={handleCancelChange}
                                />
                                <span>Yes</span>
                            </label>
                            <label className="inline-flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="cancelCharge"
                                    value="No"
                                    checked={cancelData.cancelCharge === "No"}
                                    onChange={handleCancelChange}
                                />
                                <span>No</span>
                            </label>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                color="red"
                                onClick={() => handleBookingAction(BOOKING_STATUS.CANCELLED, cancelData)}
                                disabled={!cancelData.cancelReason.trim() || !cancelData.cancelBy || !cancelData.cancelCharge}
                            >
                                Confirm Cancel
                            </Button>
                            <Button
                                color="gray"
                                variant="outlined"
                                onClick={() => setCancelData({ cancelReason: "", cancelBy: "", cancelCharge: "" })}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
                <TextBoxWithList addNotes={addNotes} notesData={bookingDetails?.notesData}/>
            </>
        </div>
    );
};

export default ConfirmBooking;