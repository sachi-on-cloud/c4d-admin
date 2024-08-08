export const constants = {
    andriodUrl: 'https://9728-103-171-10-244.ngrok-free.app/api/customer/dev',
    iosUrl: 'https://9728-103-171-10-244.ngrok-free.app/api/customer/dev',
    url_dev: 'https://tadpole-wealthy-daily.ngrok-free.app',
    url: 'https://api.c4d.smartapis.cyou'
};

export const getBaseUrl = () => {
    return constants.url + '/api/customer/dev';
}

export const GENDER = {
    MALE: 'Male',
    FEMALE: 'Female',
    OTHERS: 'Others'
};

export const TITLE_LIST = [
    { label: 'Mr', value: 'Mr' },
    { label: 'Mrs', value: 'Mrs' },
    { label: 'Miss', value: 'Miss' },
    { label: 'Others', value: 'Others' },
]

export const DAY_LIST = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '10', value: '10' },
    { label: '11', value: '11' },
    { label: '12', value: '12' }
]
export const MONTH_LIST = [
    { label: '1', value: '01' },
    { label: '2', value: '02' },
    { label: '3', value: '03' },
    { label: '4', value: '04' },
    { label: '5', value: '05' },
    { label: '6', value: '06' },
    { label: '7', value: '07' },
    { label: '8', value: '08' },
    { label: '9', value: '09' },
    { label: '10', value: '10' },
    { label: '11', value: '11' },
    { label: '12', value: '12' }
]
export const YEAR_LIST = [
    { label: '1990', value: '1990' },
    { label: '1991', value: '1991' },
    { label: '1992', value: '1992' },
    { label: '1993', value: '1993' },
    { label: '1994', value: '1994' },
    { label: '1995', value: '1995' },
    { label: '1996', value: '1996' },
    { label: '1997', value: '1997' },
    { label: '1998', value: '1998' },
    { label: '1999', value: '1999' },
    { label: '2000', value: '2000' },
    { label: '2001', value: '2001' },
    { label: '2002', value: '2002' },
    { label: '2003', value: '2003' },
    { label: '2004', value: '2004' },
    { label: '2005', value: '2005' },
    { label: '2006', value: '2006' },
    { label: '2007', value: '2007' },
    { label: '2008', value: '2008' },
    { label: '2009', value: '2009' },
    { label: '2010', value: '2010' },
]

export const REGION = {
    latitude: 37.78,
    longitude: -122.43,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

export const RIDE_DETAILS = [
    {
        pickup: 'Block 2, Vhhs Villa, perungudi',
        drop: 'Street 2, Church road, Nungambakkam',
        driverName: 'Gowtham',
        packageType: 'Intercity',
        carDetails: {
            licenseNumber: 'TN09DB1244',
            nickName: 'My Car'
        },
        amount: '668'
    },
    {
        pickup: 'Block 1, ABC Villa, velachery',
        drop: 'Street 2, Church road, Kanchipurram',
        driverName: 'Kiran Kumar',
        packageType: 'Outstation',
        carDetails: {
            licenseNumber: 'TN09AB0077',
            nickName: 'My Car'
        },
        amount: '1140'
    },
    {
        pickup: 'Street 2, Church road, Nungambakkam',
        drop: 'Block 1, ABC Villa, velachery',
        driverName: 'Gowtham',
        packageType: 'Intercity',
        carDetails: {
            licenseNumber: 'TN09BD5656',
            nickName: 'My Car'
        },
        amount: '400'
    }
];

export const WALLET_AMOUNT = ['200', '500', '1000', '2000'];

export const DRIVER_SEARCH_TYPES = {
    CHOOSE_DRIVER: 'ChooseDriver',
    SEARCH_DRIVER_WITHIN_2KMS: 'SearchDriverWithin2Kms',
    SEARCH_DRIVER_OVER_2KMS: 'SearchDriverOver2Kms',
};

export const IMPRESSIVE_FACTORS_ARR = ['On Time', 'Professional', 'Polite', 'Superfast', 'Knows route', 'Good Communication'];
export const WHAT_WENT_WRONG_ARR = ['Late arrival', 'Route Confussion', 'Aggressive Driver', 'Unprofessional & Rude', 'Poor Communication'];
export const IMPROVEMENT_SUGGESTIONS_ARR = ['Overall Service', 'Customer support', 'Transparency', 'Speed & Efficiency'];
export const TIP_ARR = [10, 20, 30, 40];
export const CONTEXT_LESS_THAN_2 = 'What went wrong?';
export const CONTEXT = 'What were you impressed with?';

export const API_ROUTES = {
    'SESSION_START': '/session/start',
    'LOGOUT': '/logout',
    'MOBILENUMBER_VERIFICATION': '/verify',
    'OTP_VERIFICATION': '/otp-verify',
    'REGISTER_CUSTOMER': '/register',
    'GET_CUSTOMER': '/customer',
    'REGISTER_CAR_DETAILS': '/car-number',
    'ADD_CAR_DETAILS': '/car',
    'GET_ALL_CARS': '/cars',
    'GET_SPECIFIC_CAR': '/car',
    'PACKAGES_LIST': '/package-list',
    'ADD_NEW_BOOKING': '/add-booking',
    'CONFIRM_BOOKING': '/confirm-booking',
    'UPDATE_BOOKING': '/update-booking',
    'ADD_LOCATION': '/add-location',
    'GET_BOOKING_BY_ID': '/booking',
    'GET_CONFIRMATION_BOOKING_BY_ID': '/bookingConfirmation',
    'GET_DRIVERS': '/drivers',
    'GET_DRIVER_BY_ID': '/driver/',
    'REQUEST_DRIVER': '/request-driver',
    'BASE_AMOUNT': '/base-payment',
    'EXTEND_REQUEST': '/extend-request',
    'ADD_FEEDBACK': '/add-feedback',
    'RIDES': '/rides',
    'GET_ADDRESS': '/get-address',
    'GET_LATLONG': '/get-latlong',
    'SEARCH_ADDRESS': '/search-address',
    'ADD_ADDRESS': '/add-address',
    'ADDRESS': '/address',
    'CANCEL_BOOKING': '/booking-cancel',
    'ADD_PAYMENT': '/add-payment',
    'CASH_PAYMENT': '/offline-payment',
    'DRIVER_CURRENT_LOCATION': '/driver-location',
    'EXPIRE_REQUEST': '/expire-request',
    'GET_NEWS': '/news'
};

export const ASYNC_STORAGE_KEYS = {
    'TOKEN': 'token',
    'PHONE_NUMBER': 'phoneNumber',
    'LOCATION': 'location',
    'USER': 'user',
    'DEVICE_TOKEN': 'device_token',
    'PERMISSION_SUCCESS': 'permission_success'
};

export const BOOKING_STATUS = {
    INITIATED: 'INITIATED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    IN_PROGRESS: 'IN PROGRESS',
    STARTED: 'STARTED',
    ASSIGNED_TO_SUPPORT: 'ASSIGNED_TO_SUPPORT'
};

export const PUSH_NOTIFICATION_TYPE = {
    BOOKING_ACCEPTED: "BOOKING_ACCEPTED",
    BOOKING_REJECTED: "BOOKING_REJECTED",
    DRIVER_LOCATION: "DRIVER_LOCATION",
    DRIVER_ON_THE_WAY: "DRIVER_ON_THE_WAY",
    DRIVER_REACHED: "DRIVER_REACHED",
    STARTED: "STARTED",
    ENDED: "ENDED",
    ACCEPT_EXTENSION: "ACCEPT_EXTENSION",
    REJECT_EXTENSION: "REJECT_EXTENSION",
    REQUEST_DRIVER: "REQUEST_DRIVER",
    BASEPAYMENT_COMPLETED: "BASEPAYMENT_COMPLETED",
    EXTENSION_REQUEST: "EXTENSION_REQUEST",
    TRIP_ENDED: "TRIP_ENDED",
    PAYMENT_REQUESTED: "PAYMENT_REQUESTED"
};

export const USER = {
    ADMIN: 'ADMIN',
    CUSTOMER: 'CUSTOMER',
    DRIVER: 'DRIVER'
};
export const whatsappNumber = "9999999999";
export const whatsappMessage = "Hello, I would like to chat with you!";

export const supportNumber = "+919999999999";
export const supportEmail = "c4dsupport@texve.com";
export const supportMessage = `Welcome to C4D.\n Please raise your query!`;

export const CAROUSEL_DATA = [
    {
        title: "Aenean leo",
        body: "Ut tincidunt tincidunt erat. Sed cursus turpis vitae tortor. Quisque malesuada placerat nisl. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.",
        imgUrl: "https://w0.peakpx.com/wallpaper/220/99/HD-wallpaper-new-york-yellow-taxi-street-skyscrapers-taxi-cab-usa-america-nyc.jpg",
    },
    {
        title: "In turpis",
        body: "Aenean ut eros et nisl sagittis vestibulum. Donec posuere vulputate arcu. Proin faucibus arcu quis ante. Curabitur at lacus ac velit ornare lobortis. ",
        imgUrl: "https://w0.peakpx.com/wallpaper/168/769/HD-wallpaper-new-york-street-yellow-taxi-winter-skyscrapers-usa-nyc-america.jpg",
    },
    {
        title: "Lorem Ipsum",
        body: "Phasellus ullamcorper ipsum rutrum nunc. Nullam quis ante. Etiam ultricies nisi vel augue. Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc.",
        imgUrl: "https://w0.peakpx.com/wallpaper/385/370/HD-wallpaper-new-york-city-street-traffic-jam-manhattan-nyc-traffic-new-york-usa-evening-city-america.jpg",
    },
];

export const MAP_DIRECTIONS_KEY = 'AIzaSyAgrNDTpj86zJdxMN9-3sRCMHxspDapIgY';