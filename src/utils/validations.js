import * as Yup from 'yup'

export const PERSONALINFO_SCHEMA = Yup.object().shape({
    salutation: Yup.string().required('Salutation is required'),
    firstName: Yup.string().required('Your Name is required'),
    // lastName: Yup.string(),
    // email: Yup.string()
    //     .email('Invalid email address')
    //     .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/, 'Invalid email address')
    //     .required('Email address is required')
});

export const VEHICLEINFO_SCHEMA = Yup.object().shape({
    nickName: Yup.string().required('Nickname is required'), // Nickname is required
    carNumber: Yup.string()
        .matches('^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$', 'Invalid Car Number')
        .required('Car Number is required'),
    carType: Yup.string().required('Car Type is required'),
    fuelType: Yup.string().required('Fuel Type is required'),
    transmissionType: Yup.string().required('Transmission Type is required'),
    // insuranceNumber: Yup.string()
    //     .when(['nickName'], {
    //         is: (nickName) => nickName && nickName.trim().length > 0,
    //         then: () => Yup.string().required('Insurance Number is required when Nickname is provided')
    //     }),
    // insuranceExpiryDate: Yup.string()
    //     .when(['nickName', 'insuranceNumber'], {
    //         is: (nickName, insuranceNumber) =>
    //             (nickName && nickName.trim().length > 0) || (insuranceNumber && insuranceNumber.trim().length > 0),
    //         then: () => Yup.string().required('Insurance Expiry Date is required when Nickname or Insurance Number is provided'),
    //         otherwise: Yup.string().optional(),
    //     }),
});

export const BOOKING_DETAILS_SCHEMA = Yup.object().shape({
    packageTypeSelected: Yup.string().required('Package Type is required'),
    rideTime: Yup.string().required('RideTime is required'),
    rideDate: Yup.string().required('RideDate is required'),
    carSelected: Yup.object().test('carSelected', 'Car details are required', (value) => {
        return value && Object.values(value).some(field => field !== '');
    }),
    packageSelected: Yup.number().required('Ride Package is required')
});

export const PERSONAL_INFO_DETAILS_EDIT_SCHEMA = Yup.object().shape({
    salutation: Yup.string().required('Salutation is required'),
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string(),
    email: Yup.string()
        .email('Invalid email address')
        .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/, 'Invalid email address')
        .required('Email address is required')
});