import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Typography,
    Button,
    Spinner,
} from "@material-tailwind/react";
import { Formik, Form, Field, ErrorMessage, validateYupSchema } from 'formik';
import { useLocation, useNavigate } from "react-router-dom";
import { ApiRequestUtils } from "../../utils/apiRequestUtils";
import { API_ROUTES, BOOKING_STATUS, COMPANY_NAME, GST_NUMBER } from "../../utils/constants";
import { Utils } from '../../utils/utils';
import 'react-datepicker/dist/react-datepicker.css';
import moment from "moment";

const currentDate = () => {
    return (new Date()).toISOString().split('T')[0];
};

function convertTimeFormat(time) {
    let [hours, minutes, seconds] = time.split(':');
    hours = parseInt(hours);

    const period = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${period}`;
}
const ConfirmBooking = (props) => {
    const [bookingDetails, setBookingDetails] = useState("");
    const [dateVal, setDateVal] = useState();
    const [timeVal, setTimeVal] = useState();
    const [amount, setAmount] = useState();
    const [whatsappMsg, setWhatsappMsg] = useState();

    const navigate = useNavigate();
    const location = useLocation();
    const paramsPassed = location.state;

    const [loading, setLoading] = useState(true);

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
        };
        if (bookingDetails.status == BOOKING_STATUS.INITIATED) {
            reqBody.type = "start";
        } else if (bookingDetails.status == BOOKING_STATUS.STARTED) {
            reqBody.type = "end";
            if (amount?.total) {
                reqBody.amount = amount?.total;
                reqBody.extraHours = amount?.extraHours;
                reqBody.price = amount?.price;
                reqBody.extraPrice = amount?.extraPrice;
                reqBody.extraHourPrice = amount?.extraHourPrice;
            } else {
                alert("Please check price before end the trip");
                setLoading(false);
                return false;
            }
        }
        //console.log("reqBody", reqBody)
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
            console.log("DAATA:", data?.data);
            setBookingDetails(data?.data);
            const msg = (data?.data?.Driver ? `Driver Name: ${data?.data?.Driver.firstName}\n Driver Number: ${data?.data?.Driver.phoneNumber}\n` : '') +
                `Pickup Address: ${data?.data?.pickupAddress?.name}\n` +
                (data?.data?.dropAddress ? `Drop Address: ${data?.data?.dropAddress?.name}\n` : '');

            setWhatsappMsg(encodeURIComponent(msg));
            if (data?.data?.status == BOOKING_STATUS.ENDED) {
                setAmount({ price: data?.data?.price, extraPrice: data?.data.extraHours * data?.data.extraHourPrice || 0, total: data?.data.endPayment, extraHours: data?.data.extraHours, extraHourPrice: data?.data.extraHourPrice });
            } else {
                setAmount();
            }
        }
        setLoading(false);
    };

    const getPriceForBooking = async () => {
        //date && setDateVal(date);
        //time && setTimeVal(time);
        //console.log(dateVal, timeVal, "DATETIME");
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
            });
            if (data?.success) {
                setAmount(data?.data);
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
            //console.log("props.bookingData", props.bookingData)
            getBookingById(props.bookingData.id, props.bookingData.customerId);
        }
    }, [props.bookingData]);

    const onCancelPressHandler = async () => {
        setLoading(true);
        const reqBody = {
            status: BOOKING_STATUS.CANCELLED,
            bookingId: bookingDetails?.id,
        };
        const data = await ApiRequestUtils.update(API_ROUTES.CONFIRM_BOOKING, reqBody);
        if (data?.success) {
            //navigate("/dashboard/booking");
            props.onConfirm()
            setLoading(false);
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
        <div className="container mx-auto p-4">
            <Card className="mb-4">
                <CardBody>
                    <div className="flex justify-between mb-2">
                        <Typography variant="h5">Ride Details</Typography>
                        <Typography variant="h6" color="green"><a target="_blank" href={`https://wa.me/${bookingDetails?.Customer?.phoneNumber.replace(/^(\+91)/, '')}?text=${whatsappMsg}`}>Share on Whatsapp</a></Typography>
                    </div>
                    <hr className="my-2" />
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Service Type:</Typography>
                            <Typography>{bookingDetails.serviceType}</Typography>
                        </div>
                        <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Package Type:</Typography>
                            <Typography>{bookingDetails.packageType}</Typography>
                        </div>
                        <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Date:</Typography>
                            <Typography>{`${bookingDetails.date}, ${bookingDetails.time}`}</Typography>
                        </div>
                        <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Package:</Typography>
                            <Typography>{`${bookingDetails?.Package?.period} ${bookingDetails?.packageType === "Outstation" ? "days" : bookingDetails?.packageType === "Intercity" ? "hours" : ""}`}</Typography>
                        </div>
                        <div className="flex justify-between">
                            <Typography color="gray" variant="h6">Price:</Typography>
                            <Typography>₹ {bookingDetails.Package.price}</Typography>
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
                        <Typography variant="h5">Location Details </Typography>
                    </div>
                    <hr className="my-2" />
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
                <Card className="my-6">
                    {/* <CardBody> */}
                    {/* <Typography variant="h5">
                            Package Details
                        </Typography>
                        <hr className="my-2" /> */}
                    {/* <div className="space-y-2">
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Package:</Typography>
                                <Typography>{`${bookingDetails?.Package?.period} ${bookingDetails?.packageType === "Outstation" ? "d" : "hr"
                                    }`}</Typography>
                            </div>
                            {amount?.price !== 0 &&
                                <>
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Estimated Base Fare:</Typography>
                                        <Typography>₹{amount?.price}</Typography>
                                    </div>
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">{`Extra fare after ${bookingDetails?.Package?.period
                                            } ${bookingDetails?.packageType === "Outstation" ? "d" : "hr"}:`}</Typography>
                                        <Typography>₹{amount?.extraPrice}</Typography>
                                    </div>
                                </>
                            }
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Total: </Typography>
                                <Typography>₹{amount?.total}</Typography>
                            </div>
                        </div> */}
                    {/* <div className="bg-gray-100 p-3 rounded-md mt-4">
                            <Typography variant="small" color="gray">
                                Price might vary at the time of trip closure, based on other charges like
                                parking, toll, trip extension and so on.
                            </Typography>
                        </div> */}
                    <div className="border rounded-xl bg-gray-200 p-4">
                        <h2 className="text-2xl font-bold text-center">Invoice</h2>
                        <div className="mt-3">
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Company Name: </Typography>
                                <Typography color="gray" variant="small">{COMPANY_NAME}</Typography>
                            </div>
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">GST Number: </Typography>
                                <Typography color="gray" variant="small">{GST_NUMBER}</Typography>
                            </div>
                        </div>
                        <hr className="my-2 border border-black" />
                        <div className="mt-4">
                            <div className="flex justify-between">
                                <Typography color="gray" variant="h6">Package:</Typography>
                                <Typography>{`${bookingDetails?.Package?.period} ${bookingDetails?.packageType === "Outstation" ? "d" : bookingDetails?.packageType === "Intercity" ? "hr" : ""
                                    }`}</Typography>
                            </div>
                            {bookingDetails?.packageType === "Intercity" || bookingDetails?.packageType === "Outstation" ?
                                <>
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">Estimated Base Fare:</Typography>
                                        <Typography>₹ {amount?.price}</Typography>
                                    </div>
                                    <div className="flex justify-between">
                                        <Typography color="gray" variant="h6">{`Extra fare after ${bookingDetails?.Package?.period
                                            } ${bookingDetails?.packageType === "Outstation" ? "d" : bookingDetails?.packageType === "Intercity" ? "hr" : ""}: (${amount.extraHours} x ${amount.extraHourPrice})`}</Typography>
                                        <Typography>₹ {amount?.extraPrice}</Typography>
                                    </div>
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
                    {/* </CardBody> */}
                </Card>
            )}

            {(bookingDetails?.status === 'STARTED') ||
                (bookingDetails?.status === 'INITIATED' && (!!bookingDetails?.Driver?.id || !!bookingDetails?.Cab?.id)) ?

                <Card className="my-4 gap-4">
                    <CardBody >
                        <Typography variant="h5" className="mb-2">
                            {bookingDetails?.status === 'STARTED' ? "End" : "Start"} Time
                        </Typography>
                        <div className='flex gap-x-5'>
                            <div className=''>
                                {/* <DatePicker
                                        //minDate={bookingDetails?.startTime || new Date()}
                                        //minTime={bookingDetails?.startTime || new Date()}
                                        selected={dateVal}
                                        onChange={(date) => { getPriceForBooking(date) }}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="MMMM d, yyyy hh:mm aa"
                                    /> */}
                                <Formik>
                                    <div className='flex gap-x-2'>
                                        <Field type="date" name="dateVal" className="p-2 w-full rounded-xl border-2 border-gray-300" min={bookingDetails?.date} onChange={(e) => {
                                            setDateVal(e.target.value);
                                        }} value={dateVal}></Field>
                                        <Field as="select" name="rideTime" className="p-2 w-full rounded-xl border-2 border-gray-300" onChange={(e) => {
                                            setTimeVal(e.target.value);
                                        }} value={timeVal}>
                                            <option value="">Select time</option>
                                            {(bookingTimes).map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {convertTimeFormat(item.id)}
                                                </option>
                                            ))}
                                        </Field>
                                        {bookingDetails.status == BOOKING_STATUS.STARTED && <Button onClick={getPriceForBooking}>Check Price</Button>}
                                    </div>
                                </Formik>
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
                : ""}
            <>
                <div className="mt-6 flex flex-row space-x-4">

                    {bookingDetails.status != "ENDED" && bookingDetails.status != "STARTED" &&
                        <>
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
                                color="gray"
                                variant="outlined"
                                ripple="dark"
                                fullWidth
                                onClick={() => { props.onEdit(bookingDetails) }}
                            >
                                Edit
                            </Button>
                        </>
                    }
                    {bookingDetails.status === 'INITIATED' && bookingDetails?.pickupAddress && !bookingDetails?.Driver?.id && !bookingDetails?.Cab?.id &&
                        <Button
                            color="black"
                            ripple="light"
                            fullWidth
                            onClick={() => { props.onAssignDriver(bookingDetails) }}
                        >
                            {props.bookingData.serviceType === "CAB" ? "Assign Cab" : "Assign Captain"}
                        </Button>
                    }
                    {bookingDetails.status === 'INITIATED' && (bookingDetails?.Driver?.id || bookingDetails?.Cab?.id) &&
                        <Button
                            color="black"
                            ripple="light"
                            fullWidth
                            onClick={() => { props.onAssignDriver(bookingDetails) }}
                        >
                            {props.bookingData.serviceType === "CAB" ? "Choose Another Cab" : "Choose Another Captain"}
                        </Button>
                    }
                    {dateVal && timeVal && <Button
                        color="black"
                        ripple="light"
                        fullWidth
                        onClick={onConfirmPressHandler}
                    >
                        Confirm
                    </Button>}
                </div>
            </>
        </div>
    );
};

export default ConfirmBooking;