import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Typography,
    Button,
    Spinner,
} from "@material-tailwind/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ApiRequestUtils } from "../../utils/apiRequestUtils";
import { API_ROUTES, BOOKING_STATUS } from "../../utils/constants";

const ConfirmBooking = () => {
    const [bookingDetails, setBookingDetails] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const paramsPassed = location.state;

    const [loading, setLoading] = useState(true);

    const onConfirmPressHandler = async () => {
        const reqBody = {
            status: BOOKING_STATUS.INITIATED,
            bookingId: bookingDetails?.id,
        };
        const data = await ApiRequestUtils.update(API_ROUTES.CONFIRM_BOOKING, reqBody, bookingDetails?.customerId);
        if (data?.success) {
            navigate("/dashboard/search-drivers", { state: { bookingDetails } });
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
                        {/* <Button
                            color="black"
                            buttonType="link"
                            size="sm"
                            ripple="dark"
                            onClick={() => navigate("/", { state: { bookingDetails } })}
                        >
                            Edit
                        </Button> */}
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
                    <hr className="my-2" />
                    <Typography variant="h5" className="mt-4">
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
                            <Typography>₹{bookingDetails?.Package?.price}</Typography>
                        </div>
                        <div className="flex justify-between">
                            <Typography color="gray" variant="h6">{`Extra fare after ${bookingDetails?.Package?.period
                                } ${bookingDetails?.packageType === "Outstation" ? "d" : "hr"}:`}</Typography>
                            <Typography>₹{bookingDetails?.Package?.extra_price}</Typography>
                        </div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-md mt-4">
                        <Typography variant="small" color="gray">
                            Price might vary at the time of trip closure, based on other charges like
                            parking, toll, trip extension and so on.
                        </Typography>
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <div className="flex justify-between mb-2">
                        <Typography variant="h5">Location Details</Typography>
                        {/* <Button
                            color="black"
                            buttonType="link"
                            size="sm"
                            ripple="dark"
                            onClick={() =>
                                navigate("/select-location", {
                                    state: {
                                        bookingDetails,
                                        mode: true,
                                        bookingId,
                                    },
                                })
                            }
                        >
                            Edit
                        </Button> */}
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

            {!paramsPassed?.edit && <div className="mt-6 space-y-4">
                <Button
                    color="black"
                    ripple="light"
                    fullWidth
                    onClick={onConfirmPressHandler}
                >
                    Confirm
                </Button>
                <Button
                    color="gray"
                    variant="outlined"
                    ripple="dark"
                    fullWidth
                    onClick={onCancelPressHandler}
                >
                    Cancel
                </Button>
            </div>}
        </div>
    );
};

export default ConfirmBooking;