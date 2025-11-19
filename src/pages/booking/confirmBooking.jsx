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
import { API_ROUTES, BOOKING_STATUS, BOOKING_TERMS_AND_CONDITIONS  } from "../../utils/constants";
import { Utils } from '../../utils/utils';
import 'react-datepicker/dist/react-datepicker.css';
import moment from "moment";
import TextBoxWithList from "@/components/BookingNotes";
import LandMarkBookingNotes from "@/components/LandMarkNotes";
import Swal from "sweetalert2";

const ConfirmBooking = (props) => {
    const [bookingDetails, setBookingDetails] = useState("");
    const [dateVal, setDateVal] = useState();
    const [kms, setKms] = useState();
    const [timeVal, setTimeVal] = useState();
    const [amount, setAmount] = useState();
    const [customerFeedback, setCustomerFeedback] = useState();
    const [driverFeedback, setDriverFeedback] = useState();
    const [showDetails, setShowDetails] = useState(true);
    const [finalPaymentPirces, setFinalPaymentPrices] = useState({});
    const [additionalPaymentDetails, setAdditionalPaymentDetails] = useState({
        tripType: "",
        tollCost: "",
        permitCost: "",
        fuelCost: "",
        tripFare: "",
        notes: "",
    });

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

    // Handler for additional payment details
    const handleAdditionalChange = (field, value) => {
        setAdditionalPaymentDetails((prev) => ({ ...prev, [field]: value }));
    };
      const minsToHHMM = (totalMins)=> {
        const hrs = Math.floor(totalMins / 60);
        const mins = Math.round(totalMins % 60);          // round to nearest minute
        return `${hrs} hrs : ${mins.toString().padStart(2, "0")} mins`;
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
        // console.log("CONFIRM BOOKING", data);
        if (data?.success) {
            //navigate("/dashboard/booking");
            props.onConfirm()
            setLoading(false);
        }
    };
    const getBookingById = async (bookingId, customerId) => {
        setLoading(true);
        const data = await ApiRequestUtils.get(API_ROUTES.GET_CONFIRMATION_BOOKING_BY_ID + "/" + bookingId, customerId);
        // console.log("BOOKING DATA", data);
        if (data?.success) {
           setBookingDetails({ ...data?.data, estimatedPrice: data?.estimatedPrice, discount: data?.discount,notesData: data?.notes,landmark: data?.data?.landmark,customerBookingCount: data?.customerBookingCount, lastBookingCreatedAt: data?.lastBookingCreatedAt });
            if(data?.data?.status === BOOKING_STATUS.END_OTP){
                const finalPrice = await ApiRequestUtils.get(API_ROUTES.GET_BOOKINGDETAILS_FINAL_PAYMENT + bookingId);
                setFinalPaymentPrices({
                    amountAfterGST: finalPrice?.data?.gstDetails?.details?.amountAfterGst,
                    customerWalledUsed: finalPrice?.data?.gstDetails?.details?.walletAmountUsed,
                    driverWalletAdded: Number(finalPrice?.data?.gstDetails?.details?.walletAmountUsed) + Number(finalPrice?.data?.gstDetails?.details?.discountAmount),
                    discountAmount: finalPrice?.data?.gstDetails?.details?.discountAmount,
                })
            }
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
            // console.log("PRICE DATA", data);
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
        if(props?.hideAllNewButton){
            setShowDetails(false);

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
        console.log("CANCELBOKING", data);

        if (data?.success) {
            props.onConfirm();
            props.setIsOpen(false);
        }
    };

    const addNotes = async (text) => {
        setLoading(true);
        text.bookingId = props.bookingData.id
        const response = await ApiRequestUtils.post(API_ROUTES.ADD_NOTES_BOOKING, text);
        if (response?.success) {
            getBookingById(props.bookingData.id, props.bookingData.customerId);
        }
    };
     const LandMarkNotes = async (text) => {
        setLoading(true);
        text.bookingId = props.bookingData.id
        const response = await ApiRequestUtils.update(API_ROUTES.UPDATE_LANDMARK, text);
        if (response?.success) {
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

        const convertTo12HourFormat = (time24) => {
        if (!time24) return '';

        const [hours, minutes] = time24.split(':');
        let hour = parseInt(hours, 10);
        const minute = minutes || '00';
        const period = hour >= 12 ? 'PM' : 'AM';

        hour = hour % 12;
        hour = hour === 0 ? 12 : hour;

        return `${hour}:${minute} ${period}`;
    };

    const bookingTimes = Utils.generateBookingTimesForDay(moment().add(1, 'days'));
    return (
        <div className="container mx-auto">
            {showDetails &&(
            <div className="grid grid-cols-5 gap-2 my-2">
                {/* <Button
                        color="blue"
                        ripple="light"
                        fullWidth
                        onClick={onBackPressHandler}
                    >
                        Back
                    </Button> */}

              {bookingDetails.status === "QUOTED" && bookingDetails.followup !== "FOLLOWUP" && (
                    <Button
                        color="green"
                        variant="outlined"
                        ripple="dark"
                        fullWidth
                        onClick={() => {
                            handleBookingAction(BOOKING_STATUS.CONFIRMED);
                        }}
                    >
                        Confirm
                    </Button>
                )}

                {bookingDetails.status !== "ENDED" &&
                    bookingDetails.status !== "STARTED" &&
                    bookingDetails.status !== "CANCELLED" && (
                        <>
                            {!showCancelReason && (bookingDetails?.status == 'QUOTED' || bookingDetails?.status == 'INITIATED' || bookingDetails?.status == 'DRIVER_ON_THE_WAY' || bookingDetails?.status == 'DRIVER_REACHED' || bookingDetails?.status == 'REQUEST_DRIVER' || bookingDetails?.status == 'CONFIRMED' || bookingDetails?.status == 'BOOKING_ACCEPTED') &&
                                (
                                    <Button
                                        color="red"
                                        variant="outlined"
                                        ripple="dark"
                                        fullWidth
                                        onClick={() => setShowCancelReason(true)}
                                    >
                                        Cancel
                                    </Button>
                                )
                            }
                        </>
                    )
                }

                {bookingDetails?.status === 'QUOTED' && (
                    <Button
                        color="black"
                        variant="outlined"
                        ripple="dark"
                        fullWidth
                        onClick={() => { props.onEdit(bookingDetails) }}
                    >
                        Edit
                    </Button>
                )}

                {/* {(['INITIATED', 'QUOTED', 'CONFIRMED'].includes(bookingDetails.status) || (bookingDetails.status == "REQUEST_DRIVER" && bookingDetails.serviceType == "RIDES" || bookingDetails.status == "REQUEST_DRIVER" && bookingDetails.serviceType == "DRIVER" || bookingDetails.status == "REQUEST_DRIVER" && bookingDetails.serviceType == "RENTAL")) &&
                    bookingDetails?.pickupAddress &&
                    !bookingDetails?.Driver?.id &&
                    !bookingDetails?.Cab?.id && (
                        <Button
                            color="blue"
                            variant="outlined"
                            ripple="light"
                            fullWidth
                            onClick={() => {
                                let obj = { ...bookingDetails };
                                obj.requestType = "REQUEST_ALL";
                                setBookingDetails(obj);

                                props.onAssignDriver(bookingDetails);

                            }}
                        >
                            {props.bookingData.serviceType != "CAB" && props.bookingData.serviceType != "DRIVER"
                                ? "Assign Cab"
                                : "Assign Captain"}
                        </Button>
                    )}

                {(['INITIATED', 'QUOTED', 'CONFIRMED'].includes(bookingDetails.status) || (bookingDetails.status == "REQUEST_DRIVER" && bookingDetails.serviceType == "RIDES" || bookingDetails.status == "REQUEST_DRIVER" && bookingDetails.serviceType == "DRIVER" || bookingDetails.status == "REQUEST_DRIVER" && bookingDetails.serviceType == "RENTAL")) &&
                    bookingDetails?.pickupAddress &&
                    !bookingDetails?.Driver?.id &&
                    !bookingDetails?.Cab?.id && (
                        <Button
                            color="blue"
                            variant="outlined"
                            ripple="light"
                            fullWidth
                            onClick={() => { props.onAssignDriver(bookingDetails); }}
                        >
                            {props.bookingData.serviceType != "CAB" && props.bookingData.serviceType != "DRIVER"
                                ? "Request Cab"
                                : "Request Captain"}
                        </Button>
                    )} */}

                {bookingDetails.status === 'ASSIGNED_TO_SUPPORT' &&
                    bookingDetails?.pickupAddress &&
                    !bookingDetails?.Driver?.id &&
                    !bookingDetails?.Cab?.id && (
                        <Button
                            color="black"
                            variant="outlined"
                            ripple="light"
                            fullWidth
                            onClick={() => { props.onAssignDriver(bookingDetails); }}
                        >
                            {props.bookingData.serviceType === "CAB"
                                ? "Assign Cab"
                                : "Assign Captain"}
                        </Button>
                    )}

                {['QUOTED', 'CONFIRMED', 'BOOKING_ACCEPTED'].includes(bookingDetails.status) &&
                    (bookingDetails?.Driver?.id || bookingDetails?.Cab?.id) && (
                        <Button
                            color="black"
                            variant="outlined"
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
        )}
            {showCancelReason && (
                <div className="mt-4 space-y-2">
                    <select
                        name="cancelBy"
                        value={cancelData.cancelBy}
                        onChange={handleCancelChange}
                        className="border border-gray-300 px-2 py-1 rounded-md w-full"
                    >
                        <option value="">Select who cancelled</option>
                        <option value="SUPPORT_CANCELLED">Cancelled By Support</option>
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
            {showDetails && (
            <div className="grid grid-cols-2 gap-4">
                <Card className="mb-2">
                    <CardBody>
                        <div className="border  p-2 rounded-md my-2 flex items-end gap-4 bg-gradient-to-r from-pink-300 to-orange-400">
                        <Typography color="white" className="font-bold text-sm">
                        Total Enquiry Count: {bookingDetails?.customerBookingCount || 'N/A'}
                    </Typography>
                    <Typography color="white" className="font-bold text-sm">
                        Last Enquired Date: {bookingDetails?.lastBookingCreatedAt
                            ? moment(bookingDetails?.lastBookingCreatedAt).format('DD-MM-YYYY')
                            : 'N/A'}
                    </Typography>
                    <Typography color="white" className="font-bold text-sm text-center">
                        
                    </Typography> 
                    </div>
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

                {(bookingDetails?.status == "SUPPORT_CANCELLED" || bookingDetails?.status == "CANCELLED" || bookingDetails?.status == "CUSTOMER_CANCELLED") &&
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
                                    <Typography>{bookingDetails?.cancelRequestedBy || 'Customer'}</Typography>
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
                                {bookingDetails?.Cab?.name != '' && bookingDetails?.Cab?.name !=null && 
                                (
                                    <>
                                 <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Cab Name:</Typography>
                                    <Typography>
                                        {bookingDetails?.Cab?.name || ''}
                                    </Typography>
                                </div>
                               
                                 <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Car Type:</Typography>
                                    <Typography>
                                        {bookingDetails?.Cab?.carType || ''}
                                    </Typography>
                                </div>
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Car Number:</Typography>
                                    <Typography>
                                        {bookingDetails?.Cab?.carNumber}
                                    </Typography>
                                </div>
                                </> )}
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
            )}
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
                                <Typography>{bookingDetails.serviceType === 'DRIVER' ? 'ACTING DRIVER' : bookingDetails.serviceType == "RIDES" ? 'Local Rides' : bookingDetails?.packageType == "Local" ? 'Hourly Package' : bookingDetails?.bookingType == "DROP ONLY" ? 'Drop Taxi' : 'Outstation'}</Typography>
                            </div>
                            {bookingDetails?.source !== "Mobile App" &&
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Source Type:</Typography>
                                 <Typography>
                                    {bookingDetails?.sourceType}
                                </Typography>
                            </div>
                            }
                            {(bookingDetails?.sourceType == 'Others' || bookingDetails?.sourceType == 'Offline Ads') && 
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Specification:</Typography>
                                 <Typography>
                                    {bookingDetails?.otherSourceType}
                                </Typography>
                            </div>
                             }

                            {bookingDetails?.source !== "Mobile App" &&
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Service Area:</Typography>
                                <Typography>{bookingDetails?.zone}</Typography>
                            </div>
                            }
                            {/* {bookingDetails?.zone > 0 &&
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Service Area:</Typography>
                                <Typography>{bookingDetails.zone}</Typography>
                            </div>
                            } */}
                            {/* {bookingDetails?.serviceType !='RIDES' && <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Package Type:</Typography>
                            <Typography>{bookingDetails.packageType}</Typography>
                        </div>} */}
                        {(
                            bookingDetails?.serviceType === 'DRIVER' || 
                            (bookingDetails?.serviceType === 'RENTAL' && 
                            bookingDetails?.packageType === 'Outstation' && 
                            bookingDetails?.bookingType !== 'Hourly Package')
                        ) && (
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Booking Type:</Typography>
                                <Typography>{bookingDetails?.bookingType}</Typography>
                            </div>
                        )}
                      {(bookingDetails?.serviceType === 'RENTAL' && bookingDetails?.packageType =='Local') && 
                        <div className="flex justify-between">
                        <Typography color="gray" variant="h6">KM:</Typography>
                        <Typography>
                        {bookingDetails?.packageType === 'Local' ? `${bookingDetails?.Package?.kilometer} Km` : ''}
                        </Typography>
                        </div>
                        }
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
                         {bookingDetails?.serviceType === 'RIDES' && (bookingDetails?.status === "STARTED" || bookingDetails?.status === "ENDED") && (
                        <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Cab Type:</Typography>
                            <Typography>{bookingDetails?.Cab?.carType || 'Mini'}</Typography>
                        </div>
                    )}
                            {bookingDetails?.serviceType != 'RIDES' &&
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Car Type:</Typography>
                                    <Typography>{bookingDetails?.carType || 'Mini'}</Typography>
                                </div>
                                
                            }
                            {bookingDetails?.serviceType != 'RIDES' &&
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Luggage:</Typography>
                                    <Typography>{bookingDetails.luggage || '0'}</Typography>
                                </div>
                                
                            }
                            {bookingDetails?.serviceType != 'RIDES' &&
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Seater Capacity:</Typography>
                                    <Typography>{bookingDetails.seaterCapacity || '0'}</Typography>
                                </div>
                                
                            }
                            {bookingDetails?.serviceType != 'RIDES' && bookingDetails?.packageType != 'Outstation' &&
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Package:</Typography>
                                    <Typography>{`${bookingDetails?.packageType == 'Local' ? bookingDetails?.Package?.period : ''}
                                            ${bookingDetails?.packageType === "Outstation" ? bookingDetails.totalDays ? bookingDetails?.totalDays + ' Days' : bookingDetails?.value?.differenceDays + ' Days' :
                                            bookingDetails?.packageType === "Local" ? "hours" : ""}`}</Typography>
                                </div>
                            }
                            {bookingDetails?.serviceType == 'DRIVER' && 
                              <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">KM:</Typography>
                                    <Typography>{`${bookingDetails?.packageType == 'Local' ? bookingDetails?.Package?.kilometer+ ' Km' : ''}
                                            ${bookingDetails?.packageType === "Outstation" ? bookingDetails?.value?.travelDistance + ' Km':''}`}</Typography>
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
                                    <Typography>{(Number(bookingDetails?.value?.estimatedDistance) + Number(bookingDetails?.Package?.baseKm)).toFixed(1)} Kms</Typography>
                                </div>
                            }
                                {bookingDetails?.serviceType != 'RIDES' && bookingDetails?.packageType != 'Outstation' &&  (bookingDetails?.status == "ENDED" || bookingDetails?.status == "END_OTP")   &&                
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Total Distance:</Typography>
                                    <Typography>{(Number(bookingDetails?.totalDistanceKilometer))} Kms</Typography>
                                </div>
                            }
                            {/* {(bookingDetails?.serviceType == 'RENTAL' && bookingDetails?.packageType == 'Outstation' && bookingDetails?.bookingType == 'ROUND TRIP') &&
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Total Days:</Typography>
                                    <Typography>{bookingDetails?.value?.displayTime}</Typography>
                                </div>
                            }
                            {(bookingDetails?.serviceType == 'RENTAL' && bookingDetails?.packageType == 'Outstation' && bookingDetails?.bookingType == 'DROP ONLY') &&
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Total Days:</Typography>
                                    <Typography>{bookingDetails?.value?.displayTime}</Typography>
                                </div>
                            } */}
                            {/* need to add logic for price */}
                            {bookingDetails?.status !== BOOKING_STATUS.ENDED && <>
                               <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Estimated Price:</Typography>
                                    <Typography>
                                        ₹ {
                                            bookingDetails?.serviceType === 'DRIVER' && bookingDetails?.packageType === 'Local'
                                                ? bookingDetails?.carType === "Sedan"
                                                    ? bookingDetails?.Package?.price
                                                    : bookingDetails?.carType === "MUV"
                                                        ? bookingDetails?.Package?.priceMVP
                                                        : bookingDetails?.carType === "SUV"
                                                            ? bookingDetails?.Package?.price
                                                            : bookingDetails?.Package?.price
                                                : (bookingDetails?.packageType === 'Local' && bookingDetails?.serviceType === 'RENTAL')
                                                    ? (
                                                        bookingDetails?.carType === "Sedan"
                                                            ? bookingDetails?.Package?.priceSedan
                                                            : bookingDetails?.carType === "MUV"
                                                                ? bookingDetails?.Package?.priceMVP
                                                                : bookingDetails?.carType === "SUV"
                                                                    ? bookingDetails?.Package?.priceSuv
                                                                    : bookingDetails?.Package?.price 
                                                    )
                                                    : bookingDetails?.value?.estimatedPrice
                                        }
                                    </Typography>
                                </div>
                              {bookingDetails?.offerPrice > 0 &&
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Driver Accepted Price:</Typography>
                                    {/* <Typography>₹ {bookingDetails?.Cab ? bookingDetails?.Cab?.Prices[0]?.baseFare : bookingDetails?.Driver ? bookingDetails?.Package?.price : bookingDetails?.Package?.baseFare ? bookingDetails?.Package?.baseFare : bookingDetails?.Package?.price}</Typography> */}
                                    <Typography>₹ {bookingDetails?.serviceType == 'DRIVER' ? bookingDetails?.offerPrice : (bookingDetails?.packageType == 'Local' && bookingDetails?.serviceType == 'RENTAL') ? bookingDetails?.offerPrice : bookingDetails?.offerPrice}</Typography>
                                </div>}
                                 {bookingDetails?.totalPrice > 0 &&
                                 <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Total Price:</Typography>
                                    {/* <Typography>₹ {bookingDetails?.Cab ? bookingDetails?.Cab?.Prices[0]?.baseFare : bookingDetails?.Driver ? bookingDetails?.Package?.price : bookingDetails?.Package?.baseFare ? bookingDetails?.Package?.baseFare : bookingDetails?.Package?.price}</Typography> */}
                                    <Typography>₹ {bookingDetails?.serviceType == 'DRIVER' ? bookingDetails?.totalPrice : (bookingDetails?.packageType == 'Local' && bookingDetails?.serviceType == 'RENTAL') ? bookingDetails?.totalPrice : bookingDetails?.totalPrice}</Typography>
                                </div>}
                                {bookingDetails?.discount?.percentage > 0 && (
                                <>
                                    <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Discount Applied</Typography>
                                    <Typography>{bookingDetails?.discount?.percentage} %</Typography>
                                    </div>
                            {bookingDetails?.status !== 'PAYMENT_REQUESTED' && 
                                    <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Total estimated Fare</Typography>
                                    <Typography className="font-roboto-medium text-lg text-gray-900">
                                        ₹ {(() => {
                                        let basePrice;
                                        const discountPercentage = bookingDetails?.discount?.percentage || 0;

                                        if (bookingDetails?.packageType === 'Local') {
                                            if (bookingDetails?.serviceType === 'RENTAL') {
                                            const carType = bookingDetails?.carType?.toUpperCase();
                                            basePrice = carType === 'MINI' ? bookingDetails?.Package?.price :
                                                        carType === 'SUV' ? bookingDetails?.Package?.priceSuv :
                                                        carType === 'MUV' ? bookingDetails?.Package?.priceMVP :
                                                        carType === 'SEDAN' ? bookingDetails?.Package?.priceSedan : 
                                                        bookingDetails?.Package?.price;
                                            } else if (bookingDetails?.serviceType === 'DRIVER') {
                                            basePrice = bookingDetails?.carType?.toUpperCase() === 'MUV'
                                                ? bookingDetails?.Package?.priceMVP
                                                : bookingDetails?.Package?.price;
                                            }
                                        } else {
                                            basePrice = bookingDetails?.value?.estimatedPrice;
                                        }

                                        return basePrice && basePrice !== 'N/A'
                                            ? (basePrice - (basePrice * discountPercentage / 100)).toFixed(2)
                                            : 'N/A';
                                        })()}
                                    </Typography>
                                    </div>
                                    }
                            {bookingDetails?.status === 'PAYMENT_REQUESTED' && 
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Total Incl (TAX) : </Typography>
                                    <Typography className="font-roboto-medium text-lg text-gray-900">
                                        ₹ {bookingDetails?.paymentDetails?.details?.amountAfterGst}
                                    </Typography>
                                    </div>
                                    }
                                </>
                                )}

                                </>
                            }

                            {bookingDetails?.status === BOOKING_STATUS.ENDED && <>
                                {bookingDetails?.offerPrice > 0 &&
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Driver Accepted Price:</Typography>
                                    {/* <Typography>₹ {bookingDetails?.Cab ? bookingDetails?.Cab?.Prices[0]?.baseFare : bookingDetails?.Driver ? bookingDetails?.Package?.price : bookingDetails?.Package?.baseFare ? bookingDetails?.Package?.baseFare : bookingDetails?.Package?.price}</Typography> */}
                                    <Typography>₹ {bookingDetails?.serviceType == 'DRIVER' ? bookingDetails?.offerPrice : (bookingDetails?.packageType == 'Local' && bookingDetails?.serviceType == 'RENTAL') ? bookingDetails?.offerPrice : bookingDetails?.offerPrice}</Typography>
                                </div>
                                }
                                {bookingDetails?.totalPrice > 0 &&
                                 <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Price:</Typography>
                                    {/* <Typography>₹ {bookingDetails?.Cab ? bookingDetails?.Cab?.Prices[0]?.baseFare : bookingDetails?.Driver ? bookingDetails?.Package?.price : bookingDetails?.Package?.baseFare ? bookingDetails?.Package?.baseFare : bookingDetails?.Package?.price}</Typography> */}
                                    <Typography>₹ {bookingDetails?.serviceType == 'DRIVER' ? bookingDetails?.totalPrice : (bookingDetails?.packageType == 'Local' && bookingDetails?.serviceType == 'RENTAL') ? bookingDetails?.totalPrice : bookingDetails?.totalPrice}</Typography>
                                </div>
                                }
                                {bookingDetails?.discount?.percentage > 0 && 
                                 <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Discount Applied :</Typography>
                                    <Typography>{bookingDetails?.discount?.percentage} %</Typography>
                                </div>
                                }
                               
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Total Incl (Tax):</Typography>
                                    <Typography className="font-bold">₹ {amount?.total}</Typography>
                                </div>
                                
                                 </>

                            }
                            {/* {bookingDetails?.status !== BOOKING_STATUS.INITIATED && <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Price:</Typography>
                            <Typography>₹ {bookingDetails?.Driver ? bookingDetails?.Driver?.Prices[0]?.price : bookingDetails?.Cab?.Prices[0]?.price}</Typography>
                        </div>} */}
                            {/* <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Car:</Typography>
                            <Typography>{bookingDetails?.Car?.nickName}</Typography>
                        </div> */}
                        {bookingDetails?.status === BOOKING_STATUS.END_OTP &&
                            <>
                                {finalPaymentPirces.discountAmount > 0 && <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Customer Discount Applied:</Typography>
                                    <Typography>₹ {finalPaymentPirces.discountAmount}</Typography>
                                </div>}
                                {finalPaymentPirces.customerWalledUsed > 0 && <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Customer Wallet Points Used:</Typography>
                                    <Typography>{finalPaymentPirces.customerWalledUsed}</Typography>
                                </div>}
                                {finalPaymentPirces.driverWalletAdded > 0 && <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Driver Wallet Points Added:</Typography>
                                    <Typography>{finalPaymentPirces.driverWalletAdded}</Typography>
                                </div>}
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Total (Incl. Tax)</Typography>
                                    <Typography>₹ {finalPaymentPirces.amountAfterGST}</Typography>
                                </div>
                            </>
                        }
                        </div>
                    </CardBody>
                </Card>

                <Card className="mb-2">
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
                                    {bookingDetails?.dropAddress?.name || bookingDetails?.endAddress?.name || "Not Added"}
                                </Typography>
                            </div>
                         { bookingDetails?.packageType !== 'Local' &&   bookingDetails?.serviceType !== 'DRIVER' &&
  <div className="flex justify-between">
    <Typography color="gray" variant="h6">Driver Starting Points: </Typography>
    <Typography>{bookingDetails?.driverStartAddress?.name || `${bookingDetails?.value?.driverWithin} km`}</Typography>
  </div>
}
                            {bookingDetails?.status !== "QUOTED" &&  <>
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Start OTP: </Typography>
                                <Typography>
                                    {bookingDetails?.startOtp || "Not Added"}
                                </Typography>
                            </div>
                             <div className="flex justify-between ">
                                <Typography color="gray" variant="h6">End OTP: </Typography>
                                <Typography>
                                    {bookingDetails?.endOtp || "Not Added"}
                                </Typography>
                            </div></>}
                        </div>
                    </CardBody>
                </Card>
            </div>
            {(bookingDetails?.sourceType === null && bookingDetails?.source === 'Mobile App' && bookingDetails?.packageType !== 'Local' && (bookingDetails?.Cab?.carType || bookingDetails?.value?.carType)
            ) && (
                    <div className="bg-white p-6 mt-6 mb-8 rounded-2xl shadow-lg border border-gray-100">
                        <Typography className="font-bold text-xl text-gray-900 pb-2">
                            Terms and Conditions
                        </Typography>
                        <div className="space-y-4 text-gray-700">
                            <Typography className="text-sm">
                                • Toll, parking, permit charges and state tax are <span className="font-bold">excluded</span>.
                            </Typography>
                            <Typography className="text-sm">
                                • For Every extra <span className="font-bold">15 minutes</span>,  <span className="font-bold text-black">₹ 
                                    {bookingDetails?.Cab?.carType === 'Mini'
                                        ? bookingDetails?.Package?.additionalMinCharge
                                        : bookingDetails?.Cab?.carType === 'Sedan'
                                            ? bookingDetails?.Package?.additionalMinChargeSedan
                                            : bookingDetails?.Cab?.carType === 'SUV'
                                                ? bookingDetails?.Package?.additionalMinChargeSuv
                                                : bookingDetails?.Package?.additionalMinChargeMVP}
                                </span> will be charged
                            </Typography>
                            <Typography className="text-sm">
                                • For every extra kilometer  <span className="font-bold text-black">₹ 
                                    {bookingDetails?.Cab?.carType === 'Mini'
                                        ? bookingDetails?.Package?.extraKilometerPrice
                                        : bookingDetails?.Cab?.carType === 'Sedan'
                                            ? bookingDetails?.Package?.extraKilometerPriceSedan
                                            : bookingDetails?.Cab?.carType === 'SUV'
                                                ? bookingDetails?.Package?.extraKilometerPriceSuv
                                                : bookingDetails?.Package?.extraKilometerPriceMVP}
                                </span> will be charged
                            </Typography>
                            <Typography className="text-sm">
                                • Night Charge of <span className="font-bold text-black">₹
                                    {bookingDetails?.Package?.nightCharge}
                                </span> applies if the trip extends past{' '}
                                <span className="font-bold text-black">
                                    {convertTo12HourFormat(bookingDetails?.Package?.nightHoursFrom)}
                                </span>.
                            </Typography>
                        <div className="border border-gray-300 bg-yellow-600 rounded-xl p-2">
                            <Typography
                                className=" text-center text-sm text-gray-700"
                            >
                                {BOOKING_TERMS_AND_CONDITIONS}
                            </Typography>
                        </div>
                        </div>
                    </div>
                )}
            {(bookingDetails?.sourceType === null && bookingDetails?.source === 'Mobile App' && (bookingDetails?.packageType === 'Local' && bookingDetails?.serviceType == 'RENTAL') && (bookingDetails?.Cab?.carType || bookingDetails?.value?.carType)
            ) && (
            <div className="bg-white p-6 mt-6 mb-8 rounded-2xl shadow-lg border border-gray-100">
                <Typography className="font-bold text-xl text-gray-900 pb-2">
                    Terms and Conditions
                </Typography>
                <div className="space-y-4 text-gray-700">                  
                    <Typography className="text-sm">• Toll, parking, permits charges and state tax are <span className="font-bold">excluded</span>.</Typography>                  
                    <Typography className="text-sm">• For every extra 15 minutes after <span className="font-bold">{bookingDetails?.Package?.period} hours</span>, <span className="font-bold">₹{bookingDetails?.Cab?.carType == 'Mini' ? bookingDetails?.Package?.additionalMinCharge : bookingDetails?.Cab?.carType == 'Sedan' ? bookingDetails?.Package?.additionalMinChargeSedan : bookingDetails?.Cab?.carType == 'SUV' ? bookingDetails?.Package?.additionalMinChargeSuv : bookingDetails?.Package?.additionalMinChargeMVP}</span> will be charged.</Typography>                                    
                    <Typography className="text-sm">• For every extra kilometer <span className="font-bold">₹{bookingDetails?.Cab?.carType == 'Mini' ? bookingDetails?.Package?.extraKilometerPrice : bookingDetails?.Cab?.carType == 'Sedan' ? bookingDetails?.Package?.extraKilometerPriceSedan : bookingDetails?.Cab?.carType == 'SUV' ? bookingDetails?.Package?.extraKilometerPriceSuv : bookingDetails?.Package?.extraKilometerPriceMVP}</span> will be charged.</Typography>
                    <Typography className="text-sm">• Night Charge of <span className="font-bold">₹{bookingDetails?.Package?.nightCharge}</span> will be charged after <span className="font-bold">{convertTo12HourFormat(bookingDetails?.Package?.nightHoursFrom)}</span>.</Typography>
                     <div className="border border-gray-300 bg-yellow-600 rounded-xl p-2">
                            <Typography
                                className=" text-center text-sm text-gray-700"
                            >
                                {BOOKING_TERMS_AND_CONDITIONS}
                            </Typography>
                        </div>
                  </div>
                </div>
          )}
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
                        <h2 className="text-2xl font-bold text-center">Receipt</h2>
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
                            {/* <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Package:</Typography>
                                <Typography>{`${bookingDetails?.Package?.period} ${bookingDetails?.packageType === "Outstation" ? "d" : bookingDetails?.packageType === "Local" ? "hr" : ""
                                    }`}</Typography>
                            </div> */}
                            {bookingDetails?.packageType === "Local" || bookingDetails?.packageType === "Outstation" ?
                                <>
                                    {/* <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Base Fare:</Typography>
                                        <Typography>₹ {amount?.price}</Typography>
                                    </div> */}
                                    {bookingDetails?.extraHours >0 && (bookingDetails?.serviceType == "RENTAL" && bookingDetails?.packageType != "Local")&&( 
                                        <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">{`Extra fare after ${bookingDetails?.Package?.period
                                            }hrs ${bookingDetails?.packageType === "Outstation" ? "d" : bookingDetails?.packageType === "Intercity" ? "hr" : ""}: (${bookingDetails.extraHours} x ${amount.extraHourPrice})`}</Typography>
                                        <Typography>₹ {bookingDetails?.extraPrice}</Typography>
                                    </div>)}
                                     {bookingDetails?.extraHours >0&&(bookingDetails?.serviceType === "RIDES" || bookingDetails?.serviceType === "DRIVER" ||(bookingDetails?.serviceType === "RENTAL" && bookingDetails?.packageType === "Local")) && (
                                         <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">{`Extra fare after ${bookingDetails?.Package?.period
                                            }hrs ${bookingDetails?.packageType === "Outstation" ? "d" : bookingDetails?.packageType === "Intercity" ? "hr" : ""}: (${minsToHHMM(bookingDetails.extraHours)} x ${amount.extraHourPrice})`}</Typography>
                                        <Typography>₹ {bookingDetails?.extraPrice}</Typography>
                                    </div>)}
                                    {amount.extraKMs > 0 &&
                                        <div className="flex justify-between">
<Typography color="gray" variant="h6">         {`Extra KM's Fare: (${Number(amount?.extraKMs).toFixed(2)} x ${Number(amount?.extraKMPrice)})`}</Typography>
                                            <Typography>
    ₹ {(amount?.extraKMs * amount?.extraKMPrice).toFixed(2)}
  </Typography>
                                        </div>
                                    }
                                    {amount.extraNightCharge > 0 &&
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">{`Night Charge: ₹ (${amount.extraNightCharge})`}</Typography>
                                            <Typography>₹ {amount?.extraNightCharge}</Typography>
                                        </div>
                                    }
                                </> : ""
                            }
                            {/* <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Total:</Typography>
                                <Typography style={{
                                    fontWeight: 'bold'
                                }}>₹ {amount?.total}</Typography>
                            </div> */}
                            {/* Amount After Gst:  */}
                                {bookingDetails?.paymentDetails?.details?.amountAfterGst !== 0 && bookingDetails?.paymentDetails?.details?.amountAfterGst &&
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Total:</Typography>
                                        <Typography className="font-bold">₹ {bookingDetails?.paymentDetails?.details?.amountAfterGst}</Typography>
                                    </div>
                                }
                                 <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">TAX:</Typography>
                                        <Typography className="font-bold">₹ {bookingDetails?.paymentDetails?.details?.gstAmount}</Typography>
                                    </div>
                                {bookingDetails?.paymentDetails?.details?.discountAmount !== 0 && bookingDetails?.paymentDetails?.details?.discountAmount &&
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Discount Applied:</Typography>
                                        <Typography>₹ {bookingDetails?.paymentDetails?.details?.discountAmount}</Typography>
                                    </div>
                                }
                                
                                 {bookingDetails?.paymentDetails?.details?.walletAmountUsed !== 0 && bookingDetails?.paymentDetails?.details?.walletAmountUsed &&
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Wallet Points Used:</Typography>
                                            <Typography>₹ {bookingDetails?.paymentDetails?.details?.walletAmountUsed}</Typography>
                                        </div>
                                 }
                                
                                
                                 
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Start Time:</Typography>
                                    <Typography>{moment(bookingDetails.startTime).format("DD-MM-YYYY / hh:mm A")}</Typography>
                                    {/* <Typography>moment{bookingDetails.startTime}</Typography> */}
                                </div>
                                
                                 
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">End Time:</Typography>
                                     <Typography>{moment(bookingDetails.endedTime).format("DD-MM-YYYY / hh:mm A")}</Typography>
                                    {/* <Typography>{bookingDetails?.endedTime}</Typography> */}
                                </div>
                                
                                {bookingDetails?.serviceType !== "RIDES" &&  <>
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Start KM:</Typography>
                                    <Typography>{bookingDetails?.startKM}</Typography>
                                </div>
                                
                                
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">End KM:</Typography>
                                    <Typography>{bookingDetails?.endKM}</Typography>
                                </div>

                                    <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Total KM:</Typography>
                                    <Typography>
                                        {bookingDetails?.endKM && bookingDetails?.startKM ? (bookingDetails.endKM - bookingDetails.startKM).toFixed(2): "0.00"}
                                    </Typography>
                                    </div>
                                </>
                                }
                                 
                               {bookingDetails?.extraHours > 0 &&(bookingDetails?.serviceType === "RIDES" || bookingDetails?.serviceType === "DRIVER" ||(bookingDetails?.serviceType === "RENTAL" && bookingDetails?.packageType === "Local")) && (
                                <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Extra Hrs:</Typography>
                                <Typography color="gray" variant="h6"> {minsToHHMM(bookingDetails.extraHours)} 
                                </Typography>
                                </div>
                            )}
                            {bookingDetails?.extraHours >0 &&  (bookingDetails?.serviceType == "RENTAL" && bookingDetails?.packageType != "Local")&&(
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Extra Hrs  : </Typography>
                                    <Typography color="gray" variant="h6">
                                        {`${Math.floor(bookingDetails.extraHours).toString().padStart(2, '0')} hrs : ${(Number(String(bookingDetails.extraHours).split('.')[1]?.padStart(2, '0') || '00')).toString().padStart(2, '0')} mins`}
                                    </Typography>
                                </div>
                                )}
                                 {/* {bookingDetails?.extraHourPrice >0 &&
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Extra Hrs:</Typography>
                                     <Typography>{bookingDetails?.extraHourPrice}</Typography>     
                                </div>
                                } */}
                                {bookingDetails?.extraHour> 0 &&
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Extra Hrs Price (For Each 15 Mins):</Typography>
                                     <Typography>₹ {bookingDetails?.extraHourPrice}</Typography>     
                                </div>
                                }
                                 {bookingDetails?.extraKMs > 0 &&
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Extra KMs:</Typography>
                                     <Typography> {Number(bookingDetails?.extraKMs).toFixed(2)}</Typography>     
                                </div>
                                }
                                 {bookingDetails?.extraKMPrice > 0 &&
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Extra Per KM Price:</Typography>
                                     <Typography>{bookingDetails?.extraKMPrice}</Typography>     
                                </div>
                                }
                                {bookingDetails?.extraNightChargePrice > 0 &&
                                <div className="flex justify-between">
                                    <Typography color="gray" variant="h6">Extra KM Price:</Typography>
                                     <Typography>{bookingDetails?.extraNightChargePrice}</Typography>     
                                </div>
                                }
                                
                                
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
                                <hr className="my-2" />
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
          {showDetails && bookingDetails?.status === 'ENDED' && (bookingDetails?.tripStatus === false) && (
    <Card className="mt-4">
        <CardBody>
            <div className="flex justify-between mb-2">
                <Typography variant="h5">TripMaster Details</Typography>
            </div>
            <hr className="my-2" />
            <div className="space-y-2">
                {/* Trip Type */}
                <div className="grid grid-cols-6 gap-x-4">
                    <Typography color="gray" variant="h6">Trip Type:</Typography>
                    <Select
                        label="Select Trip Type"
                        value={additionalPaymentDetails.tripType || ""}
                        onChange={(value) => handleAdditionalChange("tripType", value)}
                        disabled={bookingDetails?.tripStatus === true}
                    >
                        <Option value="Internal">Internal</Option>
                        <Option value="External">External</Option>
                    </Select>
                </div>
                {/* Toll Cost */}
                <div className="grid grid-cols-6 gap-x-4">
                    <Typography color="gray" variant="h6">Toll Cost:</Typography>
                    <Input
                        type="number"
                        value={additionalPaymentDetails.tollCost || ""}
                        onChange={(e) => handleAdditionalChange("tollCost", e.target.value)}
                        placeholder="Enter Toll Cost"
                        disabled={bookingDetails?.tripStatus === true}
                    />
                </div>
                {/* Permit Cost */}
                <div className="grid grid-cols-6 gap-x-4">
                    <Typography color="gray" variant="h6">Permit Cost:</Typography>
                    <Input
                        type="number"
                        value={additionalPaymentDetails.permitCost || ""}
                        onChange={(e) => handleAdditionalChange("permitCost", e.target.value)}
                        placeholder="Enter Permit Cost"
                        disabled={bookingDetails?.tripStatus === true}
                    />
                </div>
                {/* Fuel Cost */}
                <div className="grid grid-cols-6 gap-x-4">
                    <Typography color="gray" variant="h6">Fuel Cost:</Typography>
                    <Input
                        type="number"
                        value={additionalPaymentDetails.fuelCost || ""}
                        onChange={(e) => handleAdditionalChange("fuelCost", e.target.value)}
                        placeholder="Enter Fuel Cost"
                        disabled={bookingDetails?.tripStatus === true}
                    />
                </div>
                {/* Trip Fare */}
                <div className="grid grid-cols-6 gap-x-4">
                    <Typography color="gray" variant="h6">Trip Fare:</Typography>
                    <Input
                        type="number"
                        value={additionalPaymentDetails.tripFare || ""}
                        onChange={(e) => handleAdditionalChange("tripFare", e.target.value)}
                        placeholder="Enter Trip Fare"
                        disabled={bookingDetails?.tripStatus === true}
                    />
                </div>
                {/* Notes */}
                <div className="col-span-2">
                    <Typography color="gray" variant="h6" className="mb-1">
                        Notes
                    </Typography>
                    <textarea
                        name="notes"
                        value={additionalPaymentDetails.notes || ""}
                        onChange={(e) => handleAdditionalChange("notes", e.target.value)}
                        placeholder="Enter notes..."
                        className="p-2 w-full border rounded-md h-20"
                        disabled={bookingDetails?.tripStatus === true}
                    />
                </div>
            </div>
            <div className="mt-4">
               <Button
    color="green"
    onClick={async () => {
        setLoading(true);

        // Retrieve userId from local storage
          const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || "{}");
    const loggedInUserId = loggedInUser.id || 0; 

        // Calculate totalKm
        const startKm = bookingDetails?.startKM ? parseFloat(bookingDetails.startKM) : 0;
        const endKm = bookingDetails?.endKM ? parseFloat(bookingDetails.endKM) : 0;
        const totalKm = (endKm - startKm).toFixed(1);

        // Construct tripDetails payload
        const tripDetails = {
            bookingId: bookingDetails?.id || null,
            bookingNumber: bookingDetails?.bookingNumber || null,
            cabId: bookingDetails?.Cab?.id || null,
            driverId: bookingDetails?.Driver?.id || null,
            customerId: bookingDetails?.Customer?.id || null,
            tripDate: moment().format('YYYY-MM-DD'),
            vehicleNumber: bookingDetails?.Cab?.carNumber || null,
            driverName: bookingDetails?.Driver?.firstName || null,
            startAddress: bookingDetails?.pickupAddress?.name ? { address: bookingDetails.pickupAddress.name } : null,
            endAddress: (bookingDetails?.dropAddress?.name || bookingDetails?.endAddress?.name) 
                ? { address: bookingDetails?.dropAddress?.name || bookingDetails?.endAddress?.name } 
                : null,
            startKm: startKm,
            endKm: endKm,
            totalKm: parseFloat(totalKm),
            fuelType: additionalPaymentDetails.fuelType || 'CNG', // Use dynamic fuelType if available
            fuelCost: additionalPaymentDetails.fuelCost ? parseFloat(additionalPaymentDetails.fuelCost) : 0,
            tripFare: additionalPaymentDetails.tripFare ? parseFloat(additionalPaymentDetails.tripFare) : 0,
            notes: additionalPaymentDetails.notes || '',
            startLat: bookingDetails?.startLat ? parseFloat(bookingDetails.startLat) : 0,
            startLong: bookingDetails?.startLong ? parseFloat(bookingDetails.startLong) : 0,
            endLat: bookingDetails?.endLat ? parseFloat(bookingDetails.endLat) : 0,
            endLong: bookingDetails?.endLong ? parseFloat(bookingDetails.endLong) : 0,
            toll: additionalPaymentDetails.tollCost ? parseFloat(additionalPaymentDetails.tollCost) : 0,
            permit: additionalPaymentDetails.permitCost ? parseFloat(additionalPaymentDetails.permitCost) : 0,
            tripType: additionalPaymentDetails.tripType || 'Internal',
            latitude: bookingDetails?.startLat ? parseFloat(bookingDetails.startLat) : 0, // Included for compatibility
            userId: loggedInUserId || null, 
        };

        // Validate required fields
        const requiredFields = [
            'bookingId',
            'bookingNumber',
            'tripDate',
            'vehicleNumber',
            'driverName',
            'startAddress',
            'endAddress',
            'startKm',
            'endKm',
            // 'totalKm',
            'fuelType',
            'tripFare',
            'tripType',
            'userId', // Add userId to required fields if it's mandatory
        ];

        const missingFields = requiredFields.filter(field => 
            !tripDetails[field] || 
            tripDetails[field] === null || 
            (typeof tripDetails[field] === 'object' && !tripDetails[field]?.address)
        );

                                    if (missingFields.length > 0) {
                                        console.error("Missing required fields:", missingFields);
                                        Swal.fire({
                                            position: "center",
                                            icon: "error",
                                            title: `Please provide the following required fields: ${missingFields.join(', ')}`,
                                            showConfirmButton: false,
                                            timer: 1500
                                        });
            setLoading(false);
            return;
        }

        // Log the payload for debugging
        console.log("Trip Details to be sent:", JSON.stringify(tripDetails, null, 2));

        try {
            const response = await ApiRequestUtils.post(API_ROUTES.ADD_TRIP_DETAILS, tripDetails);
            console.log("API Response:", response);

            if (response?.success) {
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Trip details added successfully",
                    showConfirmButton: false,
                    timer: 1500
                });
                if (props.onConfirm) props.onConfirm();
                props.setIsOpen(false);
            } else {
                console.error("API Error:", response?.message || "Unknown error");
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: `Failed to add trip details: ${response?.message || "Unknown error"}`,
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (err) {
            console.error("Submission error:", err);
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Failed to add trip details. Please try again.",
                showConfirmButton: false,
                timer: 1500
            });
        } finally {
            setLoading(false);
        }
    }}
>
    Complete
</Button>
            </div>
        </CardBody>
    </Card>
)}
                {showDetails && <LandMarkBookingNotes addNotes={LandMarkNotes} landmark={bookingDetails?.landmark} />}
                {showDetails && <TextBoxWithList addNotes={addNotes} notesData={bookingDetails?.notesData} bookingId={bookingDetails?.id} />}
            </>
        </div>
    );
};

export default ConfirmBooking;