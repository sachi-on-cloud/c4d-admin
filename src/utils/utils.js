// import { Dimensions } from 'react';

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

    generateBookingTimesForDay: (date) => {
        const selectedDate = new Date(date);
        const today = new Date();

        // Normalize dates to remove time part for comparison
        const selectedDateString = selectedDate.toISOString().split('T')[0];
        const todayString = today.toISOString().split('T')[0];

        if (selectedDateString === todayString) {
            return generateBookingTimes();
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
    }
};