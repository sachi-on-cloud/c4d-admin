import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Typography,
    Button,
    Spinner,
} from "@material-tailwind/react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiRequestUtils } from "../../utils/apiRequestUtils";
import { API_ROUTES, BOOKING_STATUS } from "../../utils/constants";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import moment from "moment";

const currentDate = () => {
    return (new Date()).toISOString().split('T')[0];
};

const ConfirmBooking = () => {
    const [bookingDetails, setBookingDetails] = useState("");
    const [selectedDate, setSelectedDate] = useState(currentDate());
    const [dateVal, setDateVal] = useState();
    const [amount, setAmount] = useState();

    const navigate = useNavigate();
    const location = useLocation();
    const paramsPassed = location.state;

    const [loading, setLoading] = useState(true);

    const onConfirmPressHandler = async () => {
        setLoading(true);
        const reqBody = {
            bookingId: bookingDetails?.id,
            driverId: bookingDetails?.Driver?.id,
            date: moment(dateVal).format("YYYY-MM-DD HH:mm:ss.SSSZ"),
            amount: 0
        };
        if (bookingDetails.status == BOOKING_STATUS.INITIATED) {
            reqBody.type = "start";
        } else if (bookingDetails.status == BOOKING_STATUS.STARTED) {
            reqBody.type = "end";
            reqBody.amount = amount.total;
        }
        //console.log("reqBody", reqBody)
        const data = await ApiRequestUtils.update(API_ROUTES.ADMIN_BOOKING_STATUS, reqBody, bookingDetails?.customerId);
        if (data?.success) {
            navigate("/dashboard/booking");
        }
    };
    const getBookingById = async (bookingId) => {
        setLoading(true);
        const data = await ApiRequestUtils.get(API_ROUTES.GET_CONFIRMATION_BOOKING_BY_ID + "/" + bookingId, paramsPassed?.customerId);
        if (data?.success) {
            setBookingDetails(data?.data);
        }
        setLoading(false);
    };

    const getPriceForBooking = async (date) => {
        setDateVal(date)
        if (bookingDetails?.status == BOOKING_STATUS.STARTED) {
            //const date = moment(dateVal).format("YYYY-MM-DD HH:mm:ss.SSSZ");
            setLoading(true);
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.ADMIN_BOOKING_PRICE, {
                bookingId: bookingDetails?.id,
                driverId: bookingDetails?.Driver?.id,
                date: moment(date).format("YYYY-MM-DD HH:mm:ss.SSSZ"),
            });
            if (data?.success) {
                setAmount(data?.data);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        if (paramsPassed?.bookingId) {
            getBookingById(paramsPassed?.bookingId);
        }
    }, []);

    const onCancelPressHandler = async () => {
        const reqBody = {
            status: BOOKING_STATUS.CANCELLED,
            bookingId: bookingDetails?.id,
        };
        const data = await ApiRequestUtils.update(API_ROUTES.CONFIRM_BOOKING, reqBody);
        if (data?.success) {
            navigate("/dashboard/booking");
        }
    };
    const convertTimeFormat = (time) => {
        let [hours, minutes, seconds] = time.split(':');
        hours = parseInt(hours);

        const period = hours >= 12 ? 'p.m.' : 'a.m.';
        hours = hours % 12 || 12;

        return `${hours}:${minutes} ${period}`;
    }
    const handleDateChange = (e) => {
        const formattedDate = moment(e.target.value).format('YYYY-MM-DD');
        setSelectedDate(formattedDate);
        console.log('HANDLE DATE CHANGE :', e.target.value)
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner className="h-12 w-12" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-4">
                <CardBody>
                    <div className="flex justify-between mb-2">
                        <Typography variant="h5">Ride Details</Typography>
                    </div>
                    <hr className="my-2" />
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Package Type:</Typography>
                            <Typography>{bookingDetails.packageType}</Typography>
                        </div>
                        <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Date:</Typography>
                            <Typography>{`${bookingDetails.date}, ${bookingDetails.time}`}</Typography>
                        </div>
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
                        <Typography variant="h5">Location Details</Typography>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Pickup:</Typography>
                            <Typography>{bookingDetails?.pickupAddress?.name}</Typography>
                        </div>
                        <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Drop-off:</Typography>
                            <Typography>
                                {bookingDetails?.dropAddress?.name || "Not Added"}
                            </Typography>
                        </div>
                    </div>
                </CardBody>
            </Card>
            {amount && (
                <Card className="my-4">
                    <CardBody>
                        <Typography variant="h5">
                            Package Details
                        </Typography>
                        <hr className="my-2" />
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Package:</Typography>
                                <Typography>{`${bookingDetails?.Package?.period} ${bookingDetails?.packageType === "Outstation" ? "d" : "hr"
                                    }`}</Typography>
                            </div>
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Estimated Base Fare:</Typography>
                                <Typography>₹{amount?.price}</Typography>
                            </div>
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">{`Extra fare after ${bookingDetails?.Package?.period
                                    } ${bookingDetails?.packageType === "Outstation" ? "d" : "hr"}:`}</Typography>
                                <Typography>₹{amount?.extraPrice}</Typography>
                            </div>
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Total: </Typography>
                                <Typography>₹{amount?.total}</Typography>
                            </div>
                        </div>
                        {/* <div className="bg-gray-100 p-3 rounded-md mt-4">
                            <Typography variant="small" color="gray">
                                Price might vary at the time of trip closure, based on other charges like
                                parking, toll, trip extension and so on.
                            </Typography>
                        </div> */}
                    </CardBody>
                </Card>
            )}

            {(bookingDetails?.status === 'STARTED') ||
                (bookingDetails?.status === 'INITIATED' && !!bookingDetails?.Driver?.id) ?
                <>
                    <Card className="my-4 gap-4">
                        <CardBody >
                            <Typography variant="h5" className="mb-2">
                                {bookingDetails?.status === 'STARTED' ? "End" : "Start"} Trip Details
                            </Typography>
                            <div className='flex gap-x-5'>
                                <div className='w-48 rounded-xl border-2 border-gray-300'>
                                    <DatePicker
                                        //minDate={bookingDetails?.startTime || new Date()}
                                        //minTime={bookingDetails?.startTime || new Date()}
                                        selected={dateVal}
                                        onChange={(date) => { getPriceForBooking(date) }}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="MMMM d, yyyy hh:mm aa"
                                    />
                                </div>
                                {/* <input
                                    type="datetime-local"
                                    value={selectedDate}
                                    className="p-2 w-full rounded-xl border-2 border-gray-300"
                                    min={currentDate()}
                                    onChange={handleDateChange}
                                /> */}
                            </div>
                        </CardBody>
                    </Card>
                    <div className="mt-6 flex flex-row space-x-4">
                        <Button
                            color="gray"
                            variant="outlined"
                            ripple="dark"
                            fullWidth
                            onClick={onCancelPressHandler}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="black"
                            ripple="light"
                            fullWidth
                            onClick={onConfirmPressHandler}
                        >
                            Confirm
                        </Button>
                    </div>
                </> : ""
            }
        </div>
    );
};

export default ConfirmBooking;