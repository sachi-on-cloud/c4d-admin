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
    // carSelected: Yup.object().test('carSelected', 'Car details are required', (value) => {
    //     return value && Object.values(value).some(field => field !== '');
    // }).optional(),
    packageSelected: Yup.number().required('Ride Package is required'),
    customerId: Yup.object().shape({
        id: Yup.string().required('Customer ID is required'),
        // Add additional fields and validation rules for the customer object as needed
    }).required('Customer information is required')
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

export const DRIVER_SCHEMA = Yup.object({
    salutation: Yup.string().required('Salutation is required'),
    firstName: Yup.string().required('Name is required'),
    phoneNumber: Yup.string().matches(/^[6-9]{1}[0-9]{9}/, 'Must be a valid mobile number').required('Phone number is required'),
    license: Yup.string().matches('^[a-zA-Z]{2}[0-9]{13}$', 'Invalid Driver\'s License').required('Driving License is required'),
    address: Yup.string()
        .required('Address is required')
        .min(5, 'Address must be at least 5 characters')
        .matches(
            /^[a-zA-Z0-9\s,.-/#]+$/,
            'Address can only contain letters, numbers, spaces, and common symbols (,./#-)'
        )
        .test(
            'no-multiple-spaces',
            'Address should not contain multiple consecutive spaces',
            value => !value || !/\s\s+/.test(value)
        )
        .test(
            'not-only-numbers',
            'Address cannot contain only numbers',
            value => !value || !/^\d+$/.test(value.replace(/[\s,.-/#]/g, ''))
        )
        .trim(),
    reference: Yup.string().required('Reference is required'),
    preference: Yup.string().required('Preference is required'),
    mode: Yup.string().required('Mode is required'),
    packages: Yup.array()
        .of(Yup.string().required('Each package must be selected'))
        .required('At least one package must be selected')
        .min(1, 'At least one package must be selected'),
    wallet: Yup.string().required('Wallet is required'),
    prices: Yup.array().of(
        Yup.object().shape({
            price: Yup.number().required('Price is required'),
            extraPrice: Yup.number().required('Extra price is required'),
            extraKmPrice: Yup.number().required('Extra KM price is required'),
            nightCharge: Yup.number().required('Night charge is required'),
            cancelCharge: Yup.number().required('Cancel charge is required'),
            extraCabType: Yup.string().required('Cab type is required'),
        })
    ).test('at-least-one-price', 'At least one price must be added', function (prices) {
        return prices.some(price =>
            price.price || price.extraPrice || price.extraKmPrice ||
            price.nightCharge || price.cancelCharge || price.extraCabType
        );
    })
});

export const CAB_SCHEMA = Yup.object({
    name: Yup.string().required('Name is required'),
    phoneNumber: Yup.string().matches(/^[6-9]{1}[0-9]{9}/, 'Must be a valid mobile number').required('Phone number is required'),
    carNumber: Yup.string().matches('^[a-zA-Z]{2}[0-9]{2}[a-zA-Z]{2}[0-9]{4}$', 'Invalid Car Number').required('Car Number is required'),
    address: Yup.string()
        .required('Address is required')
        .min(5, 'Address must be at least 5 characters')
        .matches(
            /^[a-zA-Z0-9\s,.-/#]+$/,
            'Address can only contain letters, numbers, spaces, and common symbols (,./#-)'
        )
        .test(
            'no-multiple-spaces',
            'Address should not contain multiple consecutive spaces',
            value => !value || !/\s\s+/.test(value)
        )
        .test(
            'not-only-numbers',
            'Address cannot contain only numbers',
            value => !value || !/^\d+$/.test(value.replace(/[\s,.-/#]/g, ''))
        )
        .trim(),
    company: Yup.string().required('Company is required'),
    insurance: Yup.string().required('Insurance is required'),
    withDriver: Yup.string().required('Driver is required'),
    driverName: Yup.string(),
    mode: Yup.string().required('Mode is required'),
    carType: Yup.string().required('Car Type is required'),
    packages: Yup.array()
        .of(Yup.string().required('Each package must be selected'))
        .required('At least one package must be selected')
        .min(1, 'At least one package must be selected'),
    wallet: Yup.string().required('Wallet is required'),
    prices: Yup.array().of(
        Yup.object().shape({
            price: Yup.number().required('Price is required'),
            extraPrice: Yup.number().required('Extra price is required'),
            extraKmPrice: Yup.number().required('Extra KM price is required'),
            nightCharge: Yup.number().required('Night charge is required'),
            cancelCharge: Yup.number().required('Cancel charge is required'),
            extraCabType: Yup.string().required('Cab type is required'),
        })
    ).test('at-least-one-price', 'At least one price must be added', function (prices) {
        return prices.some(price =>
            price.price || price.extraPrice || price.extraKmPrice ||
            price.nightCharge || price.cancelCharge || price.extraCabType
        );
    })
});