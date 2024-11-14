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
    }).required('Customer information is required'),
    cabType: Yup.string().when('serviceType', {
        is: 'CAB',
        then: () => Yup.string().required('Cab type is required'),
        otherwise: () => Yup.string()
    })
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

export const ACCOUNT_ADD_SCHEMA = Yup.object({
    name: Yup.string().required('Name is required'),
    phoneNumber: Yup.string().matches(/^[6-9][0-9]{9}$/, 'Must be a valid 10-digit number').required('Phone number is required'),      
    type: Yup.string().required('Type is required'),   
    email: Yup.string().email('Invalid email address').matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,4}$/, 'Invalid email address').required('Email address is required'),
    street: Yup.string().required('Street is required').min(3,'Street name must be atleast 3 characters'),
    district: Yup.string().required('District is required'),
    state: Yup.string().required('State is required'),
    pincode: Yup.string()
        .required('Pincode is required')
        .matches(/^[1-9][0-9]{5}$/, 'Must be a valid 6-digit pincode'),
    // image1: Yup.object().shape({
    //     file: Yup.string().required('Image is required'),
    // }).required('Image is required'),
});
export const ACCOUNT_EDIT_SCHEMA = Yup.object({
    name: Yup.string().required('Name is required'),
    phoneNumber: Yup.string().matches(/^[6-9][0-9]{9}$/, 'Must be a valid 10-digit number').required('Phone number is required'),      
    type: Yup.string().required('Type is required'),   
    email: Yup.string().email('Invalid email address').matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,4}$/, 'Invalid email address').required('Email address is required'),
    street: Yup.string().required('Street is required').min(3,'Street name must be atleast 3 characters'),
    district: Yup.string().required('District is required'),
    state: Yup.string().required('State is required'),
    pincode: Yup.string()
        .required('Pincode is required')
        .matches(/^[1-9][0-9]{5}$/, 'Must be a valid 6-digit pincode'),
    // image1: Yup.object().shape({
    //     file: Yup.string().required('Image is required'),
    // }).required('Image is required'),
});
export const DRIVER_ADD_SCHEMA = Yup.object({
    salutation: Yup.string().required('Salutation is required'),
    firstName: Yup.string().required('Name is required'),
    fatherName: Yup.string().required('Father Name is required'),
    motherName: Yup.string().required('Mother Name is required'),
    dateOfBirth: Yup.date()
        .max(new Date(), 'Date of birth cannot be in the future')
        .test('age', 'Driver must be at least 18 years old', function(value) {
            if (!value) return true;
            const cutoff = new Date();
            cutoff.setFullYear(cutoff.getFullYear() - 18);
            return value <= cutoff;
        }),
    // age: Yup.number()
    //     .required('Age is required')
    //     .min(18, 'Driver must be at least 18 years old')
    //     .max(70, 'Driver must be under 70 years old')
    //     .typeError('Age must be a number'),
    phoneNumber: Yup.string().matches(/^[6-9]{1}[0-9]{9}/, 'Must be a valid mobile number').required('Phone number is required'),
    license: Yup.string().matches('^[a-zA-Z]{2}[0-9]{13}$', 'Invalid Driver\'s License').required('Driving License is required'),
    licenseType: Yup.string().required('License Type is required'),
    licenseExpiryDate: Yup.date()
        .min(new Date(), 'License expiry date must be in the future')
        .required('License expiry date is required'),
    professionalLicense: Yup.string()
        .required('Professional License Status is required')
        .oneOf(['Yes', 'No'], 'Must select Yes or No'),
    policeClearanceCertificate: Yup.string()
         .required('Police Certificate Status is required')
         .oneOf(['Yes', 'No'], 'Must select Yes or No'),
    address: Yup.string()
        .required('Address is required')
        .min(5, 'Address must be at least 5 characters')
        // .matches(
        //     /^[a-zA-Z0-9\s,.-/#]+$/,
        //     'Address can only contain letters, numbers, spaces, and common symbols (,./#-)'
        // )
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
    streetName: Yup.string().required('Street is required').min(3,'Street name must be atleast 3 characters'),
    thaluk: Yup.string().required('Thaluk is required'),
    district: Yup.string().required('District is required'),
    state: Yup.string().required('State is required'),
    pinCode: Yup.string()
        .required('Pincode is required')
        .matches(/^[1-9][0-9]{5}$/, 'Must be a valid 6-digit pincode'),
    reference1: Yup.string()
        .min(2, 'Reference name must be at least 2 characters')
        .matches(/^[a-zA-Z\s]*$/, 'Reference name can only contain letters'),
    phoneNumber1: Yup.string()
        .matches(/^[6-9]{1}[0-9]{9}$/, 'Must be a valid mobile number'),
    reference2: Yup.string()
        .min(2, 'Reference name must be at least 2 characters')
        .matches(/^[a-zA-Z\s]*$/, 'Reference name can only contain letters'),
    phoneNumber2: Yup.string()
        .matches(/^[6-9]{1}[0-9]{9}$/, 'Must be a valid mobile number'),
    preference: Yup.string().required('Preference is required'),
    carType: Yup.string().required('Car type is required'),
    packages: Yup.array()
        .of(Yup.string().required('Each package must be selected'))
        .required('At least one package must be selected'),
    // .min(1, 'At least one package must be selected'),
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

export const DRIVER_SCHEMA = Yup.object({
    salutation: Yup.string().required('Salutation is required'),
    firstName: Yup.string().required('Name is required'),
    fatherName: Yup.string().required('Father Name is required'),
    motherName: Yup.string().required('Mother Name is required'),
    dateOfBirth: Yup.date()
        .max(new Date(), 'Date of birth cannot be in the future')
        .test('age', 'Driver must be at least 18 years old', function(value) {
            if (!value) return true;
            const cutoff = new Date();
            cutoff.setFullYear(cutoff.getFullYear() - 18);
            return value <= cutoff;
        }),
    age: Yup.number()
        .required('Age is required')
        .min(18, 'Driver must be at least 18 years old')
        .max(70, 'Driver must be under 70 years old')
        .typeError('Age must be a number'),
    phoneNumber: Yup.string().matches(/^[6-9]{1}[0-9]{9}/, 'Must be a valid mobile number').required('Phone number is required'),
    license: Yup.string().matches('^[a-zA-Z]{2}[0-9]{13}$', 'Invalid Driver\'s License').required('Driving License is required'),
    licenseType: Yup.string().required('License Type is required'),
    licenseExpiryDate: Yup.date()
        .min(new Date(), 'License expiry date must be in the future')
        .required('License expiry date is required'),
    professionalLicense: Yup.string()
        .required('Professional License Status is required')
        .oneOf(['Yes', 'No'], 'Must select Yes or No'),
    policeClearanceCertificate: Yup.string()
         .required('Police Certificate Status is required')
         .oneOf(['Yes', 'No'], 'Must select Yes or No'),
    address: Yup.string()
        .required('Address is required')
        .min(5, 'Address must be at least 5 characters')
        // .matches(
        //     /^[a-zA-Z0-9\s,.-/#]+$/,
        //     'Address can only contain letters, numbers, spaces, and common symbols (,./#-)'
        // )
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
        streetName: Yup.string().required('Street is required').min(3,'Street name must be atleast 3 characters'),
        thaluk: Yup.string().required('Thaluk is required'),
        district: Yup.string().required('District is required'),
        state: Yup.string().required('State is required'),
        pinCode: Yup.string()
            .required('Pincode is required')
            .matches(/^[1-9][0-9]{5}$/, 'Must be a valid 6-digit pincode'),
        reference1: Yup.string()
            .min(2, 'Reference name must be at least 2 characters')
            .matches(/^[a-zA-Z\s]*$/, 'Reference name can only contain letters'),
        phoneNumber1: Yup.string()
            .matches(/^[6-9]{1}[0-9]{9}$/, 'Must be a valid mobile number'),
        reference2: Yup.string()
            .min(2, 'Reference name must be at least 2 characters')
            .matches(/^[a-zA-Z\s]*$/, 'Reference name can only contain letters'),
        phoneNumber2: Yup.string()
            .matches(/^[6-9]{1}[0-9]{9}$/, 'Must be a valid mobile number'),
    preference: Yup.string().required('Preference is required'),
    carType: Yup.string().required('Car type is required'),
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
    name: Yup.string().required('Owner Name is required'),
    phoneNumber: Yup.string().matches(/^[6-9]{1}[0-9]{9}/, 'Must be a valid mobile number').required('Phone number is required'),
    carNumber: Yup.string().matches('^[a-zA-Z]{2}[0-9]{2}[a-zA-Z]{2}[0-9]{4}$', 'Invalid Car Number').required('Car Number is required'),
    address: Yup.string()
        .required('Address is required')
        .min(5, 'Address must be at least 5 characters')
        // .matches(
        //     /^[a-zA-Z0-9\s,.-/#]+$/,
        //     'Address can only contain letters, numbers, spaces, and common symbols (,./#-)'
        // )
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
    insurance: Yup.string().required('Insurance Expiry Date is required'),
    withDriver: Yup.string().required('Driver is required'),
    driverName: Yup.string().when(['withDriver'], {
        is: (withDriver) => withDriver === 'Yes',
        then: () => Yup.string().required('Driver Name is required'),
        otherwise: () => Yup.string()
    }),
    driverPhoneNumber: Yup.string().when(['withDriver'], {
        is: (withDriver) => withDriver === 'Yes',
        then: () => Yup.string().matches(/^[6-9]{1}[0-9]{9}/, 'Must be a valid mobile number').required('Phone number is required'),
        otherwise: () => Yup.string()
    }),
    driverAddress: Yup.string().when(['withDriver'], {
        is: (withDriver) => withDriver === 'Yes',
        then: () => Yup.string()
            .required('Address is required')
            .min(5, 'Address must be at least 5 characters')
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
        otherwise: () => Yup.string()
    }),
    licenseNumber: Yup.string().when(['withDriver'], {
        is: (withDriver) => withDriver === 'Yes',
        then: () => Yup.string().matches('^[a-zA-Z]{2}[0-9]{13}$', 'Invalid Driver\'s License').required('Driving License is required'),
        otherwise: () => Yup.string()
    }),
    notify: Yup.string().required('Notification Recipients is required'),
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