// import { Dimensions } from 'react';
import moment from "moment";
import {
    GPAY_NAME, GPAY_NUMBER, supportNumber,
    WHATSAPP_BOOKING_CONFIRMED_TEMPLATE,WHATSAPP_FARE_QUOTATION_TEMPLATE,WHATSAPP_TRIP_STARTED,WHATSAPP_TRIP_COMPLETED,WHATSAPP_BOOKING_CANCELLED,

} from "./constants";

export const Utils = {
    formatSelectedDate: (date) => {
        const selectedDate = new Date(date);
        //const today = new Date();

        // Normalize dates to remove time part for comparison
        const selectedDateString = selectedDate.toISOString().split('T')[0];
        //const todayString = today.toISOString().split('T')[0];
        return selectedDateString;
        // if (selectedDateString === todayString) {
        //     return `Today:${selectedDateString}`;
        // } else {
        //     return `${selectedDate.toLocaleDateString("en-GB", {
        //         day: "numeric",
        //         month: "short",
        //     })}:${selectedDateString}`;
        // }
    },
    formatTime: (date) => {
        return moment(date).format("DD-MM-YYYY hh:mm A");
    },

    formatRideTime: (time) => {
        const [hours, minutes] = time.split(':');
        let period = 'a.m.';
        let formattedHours = parseInt(hours, 10);

        // Convert hours to 12-hour format and determine the period (a.m. or p.m.)
        if (formattedHours > 12) {
            formattedHours -= 12;
            period = 'p.m.';
        } else if (formattedHours === 0) {
            formattedHours = 12;
        }

        return `${formattedHours}:${minutes} ${period}`;
    },

    convertTimeFormat: (time) => {
        let [hours, minutes, seconds] = time.split(':');
        hours = parseInt(hours);

        const period = hours >= 12 ? 'p.m.' : 'a.m.';
        hours = hours % 12 || 12;

        return `${hours}:${minutes} ${period}`;
    },

    generateBookingTimesForDay: (date) => {
        const selectedDate = new Date(date);
        const today = new Date();

        // Normalize dates to remove time part for comparison
        const selectedDateString = selectedDate.toISOString().split('T')[0];
        const todayString = today.toISOString().split('T')[0];

        if (selectedDateString === todayString) {
            return Utils.generateBookingTimes();
        } else {
            const intervalMinutes = 30; // Set the interval between booking times in minutes
            const totalIntervals = 24 * 60 / intervalMinutes; // Total intervals in a day

            const times = [];

            for (let i = 0; i < totalIntervals; i++) {
                const time = new Date();

                time.setHours(0, i * intervalMinutes, 0);

                const hours = time.getHours();
                const minutes = time.getMinutes();
                const formattedHours = hours < 10 ? '0' + hours : hours;
                const formattedTime = `${formattedHours}:${minutes < 10 ? '0' : ''}${minutes}:00`;

                times.push({
                    id: formattedTime,
                    data: `${formattedHours}:${minutes < 10 ? '0' : ''}${minutes} ${formattedHours >= 12 ? 'p.m' : 'a.m'}`
                });
            }

            return times;
        }

    },

    generateBookingTimes: () => {
        const intervalMinutes = 30; // Set the interval between booking times in minutes

        const times = [];

        const currentTime = new Date();
        if (currentTime.getMinutes() >= 30) {
            currentTime.setHours(currentTime.getHours() + 1, 0, 0, 0);
        } else {
            currentTime.setMinutes(30, 0, 0);
        }

        let numberOfSlots = (24 - new Date(currentTime).getHours()) * 2;

        for (let i = 0; i < numberOfSlots - 1; i++) {
            const time = new Date(currentTime);

            time.setMinutes(time.getMinutes() + i * intervalMinutes);

            const hours = time.getHours();
            const minutes = time.getMinutes();
            const formattedHours = hours < 10 ? '0' + hours : hours;
            const formattedTime = `${formattedHours}:${minutes < 10 ? '0' : ''}${minutes}:00`;

            times.push({
                id: formattedTime,
                data: `${formattedHours}:${minutes < 10 ? '0' : ''}${minutes} ${formattedHours >= 12 ? 'p.m' : 'a.m'}`
            });
        }
        return times;
    },

    // getLatLongDelta: () => {
    //     try {
    //         const screen = Dimensions.get('window');
    //         const ASPECT_RATIO = screen.width / screen.height;
    //         const LATITUDE_DELTA = 0.04;
    //         const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
    //         return {
    //             LATITUDE_DELTA,
    //             LONGITUDE_DELTA
    //         }
    //     } catch (err) {
    //         console.log('Error in getLatLongDelta: ', err);
    //     }
    // },

    formatDateTime: (dateStr, timeStr) => {
        const inputDate = new Date(`${dateStr}T${timeStr}`);
        const currentDate = new Date();

        // Get today's date at midnight
        const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

        // Get tomorrow's date at midnight
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const hours = inputDate.getHours();
        const minutes = inputDate.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'p.m' : 'a.m';
        const formattedTime = `${hours}:${minutes} ${ampm}`;

        // Check if the date is today or tomorrow
        if (inputDate >= today && inputDate < tomorrow) {
            return `Today:${formattedTime}`;
        } else {
            const day = inputDate.getDate().toString().padStart(2, '0');
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = monthNames[inputDate.getMonth()];

            return `${day} ${month}:${formattedTime}`;
        }
    },

    extractTime: (formattedString) => {
        // Split the string by the colon character
        const parts = formattedString.split(':');
        // Extract the time part
        const time = parts[1] + ':' + parts[2].trim().split(' ')[0] + ':00'; // Get the part before the space and trim any whitespace

        return time;
    },

    formatDate: (dateString) => {
        const inputDate = new Date(dateString);
        const currentDate = new Date();

        // Reset the time part for accurate comparison
        inputDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        if (inputDate.getTime() === currentDate.getTime()) {
            return `Today:${dateString}`;
        } else {
            const options = { day: '2-digit', month: 'short' };
            const formattedDate = inputDate.toLocaleDateString('en-GB', options).replace(' ', ' ');
            return `${formattedDate}:${dateString}`;
        }
    },

    getTimeDifferenceForCancellationTimer: (data) => {
        let time = new Date(`${data?.date}T${data?.time}`);
        let created_date = new Date(`${data?.created_at}`);
        let timeDifferenceVal = time - created_date;
        const timeDifference = new Date() - new Date(`${data?.updated_at}`);
        console.log('TIME DIFFERENCE -', timeDifference)
        const differenceInMinutes = timeDifference / (1000 * 60);
        console.log("differenceInMinutes---->>>>", differenceInMinutes);
        console.log("timeDifferenceVal---->>>>", timeDifferenceVal / (1000 * 60 * 60));
        timeDiff = timeDifferenceVal / (1000 * 60 * 60);

        return {
            diffInHours: timeDiff,
            diffInMins: differenceInMinutes
        }
    },

    formatTime: async ({ hours, minutes }) => {
        // Convert hours and minutes to seconds
        const totalSeconds = hours * 3600 + minutes * 60;

        // Calculate hours, minutes, and seconds
        const displayHours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const displayMinutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const displaySeconds = String(totalSeconds % 60).padStart(2, '0');

        return `${displayHours}:${displayMinutes}:${displaySeconds}`;
    },

    generateWhatsAppMessage: (bookingDetails) => {
        let text = '';



        // Trip Fare Quotation message
        if (bookingDetails?.status === "QUOTED") {
            const totalFare = parseFloat(bookingDetails.Package.price) + parseFloat(bookingDetails.extraPrice);
            const estimatedFare = bookingDetails.estimatedFare || totalFare.toFixed(2);
            const vehicleType = bookingDetails?.Cab?.carType || bookingDetails?.carType || 'Not assigned';
            const rawDateTime = bookingDetails.fromDate;
            const isValid = moment(rawDateTime).isValid();

            const startDate = isValid ? moment(rawDateTime).format("DD-MM-YYYY") : 'Not available';
            const startTime = isValid ? moment(rawDateTime).format("hh:mm A") : 'Not available';

            text = encodeURIComponent(
                WHATSAPP_FARE_QUOTATION_TEMPLATE
                    .replace('${bookingNumber}', bookingDetails.bookingNumber)
                    .replace('${customerName}', bookingDetails.Customer.firstName)
                    .replace('${pickup}', bookingDetails.pickupAddress?.name || 'Not specified')
                    .replace('${drop}', bookingDetails.dropAddress?.name || 'Not specified')
                    .replace('${startDate}', startDate)
                    .replace('${startTime}', startTime)
                    .replace('${carType}', vehicleType)
                    .replace('${totalAmount}', estimatedFare)
                    .replace('${supportNumber}', supportNumber)
            );
        }


        // BOOKING CONFIRMED
        if (bookingDetails?.status === "CONFIRMED") {

            const rawDateTime = bookingDetails.date && bookingDetails.time
                ? `${bookingDetails.date} ${bookingDetails.time}`
                : bookingDetails.fromDate;

            const isValid = moment(rawDateTime, ["DD-MM-YYYY hh:mm A", moment.ISO_8601], true).isValid();

            const startDate = isValid ? moment(rawDateTime).format("DD-MM-YYYY") : 'Not available';
            const startTime = isValid ? moment(rawDateTime).format("hh:mm A") : 'Not available';

            const vehicleType = bookingDetails?.Cab?.carType || bookingDetails?.carType || 'Not assigned';

            let packageRow = '';

            if (
                bookingDetails?.tripType === "LOCAL" &&
                bookingDetails?.Package?.period
            ) {
                packageRow = `\nPackage: ${bookingDetails.Package.period} hours`;
            }
            text = encodeURIComponent(
                WHATSAPP_BOOKING_CONFIRMED_TEMPLATE
                    .replace('${bookingNumber}', bookingDetails.bookingNumber)
                    .replace('${customerName}', bookingDetails.Customer.firstName)
                    .replace('${pickup}', bookingDetails.pickupAddress?.name || 'Not specified')
                    .replace('${drop}', bookingDetails.dropAddress?.name || 'Not specified')
                    .replace('${startDate}', startDate)
                    .replace('${startTime}', startTime)
                    .replace('${baseFare}', bookingDetails.Package.price)
                    .replace('${carType}', vehicleType)
                    .replace('${packageRow}', packageRow)
                    .replace('${supportNumber}', supportNumber)
            );
        }

        // Trip Started
        if (bookingDetails?.status === "STARTED") {
            const driverName = bookingDetails.Driver?.firstName || 'Not assigned';
            const vehicleType = bookingDetails?.Cab?.carType || bookingDetails?.carType || 'Not assigned';
            const pickup = bookingDetails.pickupAddress?.name || 'Not specified';
            const startTime = bookingDetails.startTime ? moment(bookingDetails.startTime).format("hh:mm A") : 'Not available';

            text = encodeURIComponent(
                WHATSAPP_TRIP_STARTED
                    .replace('${bookingNumber}', bookingDetails.bookingNumber)
                    .replace('${customerName}', bookingDetails.Customer.firstName)
                    .replace('${pickup}', pickup)
                    .replace('${carType}', vehicleType)
                    .replace('${driverName}', driverName)
                    .replace('${startTime}', startTime)
                    .replace('${supportNumber}', supportNumber)
            );
        }

        // Trip Compelted
        if (bookingDetails?.status === "ENDED" && bookingDetails?.paymentStatus === "PAID") {

            const carType = bookingDetails.Cab?.carType || 'Not assigned';
            const pickup = bookingDetails.pickupAddress?.name || 'Not specified';
            const drop = bookingDetails.endAddress?.name || bookingDetails.dropAddress?.name || 'Not specified';
            const startTime = bookingDetails.startTime ? moment(bookingDetails.startTime).format("DD-MM-YYYY hh:mm A") : 'N/A';
            const endTime = bookingDetails.endedTime ? moment(bookingDetails.endedTime).format("DD-MM-YYYY hh:mm A") : 'N/A';
            const bookedDuration = bookingDetails.Package?.period || '0';
            const extraTime = bookingDetails.extraHours || '0';
            const extraCharges = bookingDetails.extraPrice || '0'
            const totalFare = parseFloat(bookingDetails.Package.price) + parseFloat(bookingDetails.extraPrice);

            text = encodeURIComponent(
                WHATSAPP_TRIP_COMPLETED
                    .replace('${bookingNumber}', bookingDetails.bookingNumber)
                    .replace('${customerName}', bookingDetails.Customer.firstName)
                    .replace('${carType}', carType)
                    .replace('${pickup}', pickup)
                    .replace('${drop}', drop)
                    .replace('${startTime}', startTime)
                    .replace('${endTime}', endTime)
                    .replace('${endOtp}', bookingDetails.endOtp)
                    .replace('${totalAmount}', totalFare)
                    .replace('${bookedDuration}', bookedDuration)
                    .replace('${extraTime}', extraTime)
                    .replace('${extraCharges}', extraCharges)
                    .replace('${supportNumber}', supportNumber)
            );
        }

        // BOOKING CANCELLED
        if (bookingDetails?.status === "CUSTOMER_CANCELLED" || bookingDetails?.status === "SUPPORT_CANCELLED") {
            const pickup = bookingDetails.pickupAddress?.name || 'Not specified';
            const rawDateTime = bookingDetails.fromDate;
            const isValid = moment(rawDateTime).isValid();

            const startDate = isValid ? moment(rawDateTime).format("DD-MM-YYYY") : 'Not available';
            const startTime = isValid ? moment(rawDateTime).format("hh:mm A") : 'Not available';

            text = encodeURIComponent(
                
                WHATSAPP_BOOKING_CANCELLED
                    .replace('${bookingNumber}', bookingDetails.bookingNumber)
                    .replace('${customerName}', bookingDetails.Customer.firstName)
                    .replace('${pickup}', pickup)
                    .replace('${startDate}', startDate)
                    .replace('${startTime}', startTime)
                    .replace('${supportNumber}', supportNumber)
            );
        }

        if (text === '') {
            text = encodeURIComponent(
                (bookingDetails?.Driver ? `Driver Name: ${bookingDetails?.Driver.firstName}\nDriver Number: ${bookingDetails?.Driver.phoneNumber}\n` : '') +
                `Pickup Address: ${bookingDetails?.pickupAddress?.name}\n` +
                (bookingDetails?.dropAddress ? `Drop Address: ${bookingDetails?.dropAddress?.name}\n` : '')
            );
        }

        return `https://wa.me/${bookingDetails?.Customer?.phoneNumber.replace(/^(\+91)/, '')}?text=${text}`

    },

    calculateEndTime: (startTime, duration) => {
        return moment(startTime).add(duration, 'hours');
    },

    calculateDuration: (bookingDetails) => {
        const start = moment(bookingDetails?.startTime);
        const end = moment(`${start.format("YYYY-MM-DD")}T${bookingDetails?.endTime}`);
        const packageHours = parseFloat(bookingDetails?.Package?.period);
        const totalHours = end.diff(start, "hours", true);
        const extraHours = Math.max(0, totalHours - packageHours);

        return {
            total: `${Math.floor(totalHours)} hours`,
            extra: `${Math.floor(extraHours)} hours`
        };
    },

    convertTimeFormatToMinutes: (time) => {
        if (!time) return null;

        // Split time into hours, minutes, and seconds
        const [hours, minutes, seconds] = time.split(':').map(Number);

        // Convert to total minutes (ignoring seconds)
        return hours * 60 + minutes;
    },

    formatTimeWithSeconds: (timeValue) => {
        if (!timeValue) return null;
        return `${timeValue}:00`;  // Add ":00" for seconds
    },

    convertMinutesToTimeFormat: (minutes) => {
        if (minutes === null || minutes === undefined) return null;

        // Convert to number in case it's a string
        const mins = parseInt(minutes, 10);

        // Calculate hours and remaining minutes
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;

        // Format with leading zeros
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMins = remainingMins.toString().padStart(2, '0');

        // Return in hh:mm:ss format
        return `${formattedHours}:${formattedMins}:00`;
    }
};