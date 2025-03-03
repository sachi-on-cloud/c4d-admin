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

export const ADD_USER_SCHEMA = Yup.object({
    name: Yup.string().required('Name is required'),
    phoneNumber: Yup.string().matches(/^[6-9][0-9]{9}$/, 'Must be a valid 10-digit number').required('Phone number is required'),
    email: Yup.string().email('Invalid email address').matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,4}$/, 'Invalid email address').required('Email address is required'),
    role: Yup.string().required('Role is required'),
    password : Yup.string().required('Password is required'),
    permission: Yup.array()
        .of(Yup.string().required('Each permission must be selected'))
        .required('At least one permission must be selected')
        .min(1, 'At least one permission must be selected'),
    status: Yup.string().required("Status is required"),
});

export const EDIT_USER_SCHEMA = Yup.object({
    name: Yup.string().required('Name is required'),
    phoneNumber: Yup.string().matches(/^[6-9][0-9]{9}$/, 'Must be a valid 10-digit number').required('Phone number is required'),
    email: Yup.string().email('Invalid email address').matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,4}$/, 'Invalid email address').required('Email address is required'),
    role: Yup.string().required('Role is required'),
    permission: Yup.array()
        .of(Yup.string().required('Each permission must be selected'))
        .required('At least one permission must be selected')
        .min(1, 'At least one permission must be selected'),
    password: Yup.lazy((value) =>
            !value
                ? Yup.string().notRequired()
                : Yup.string().min(3, 'Password must be at least 3 characters')),
    status: Yup.string().required('Status is required')
});

export const BOOKING_DETAILS_SCHEMA = Yup.object().shape({
    packageTypeSelected: Yup.string().when('serviceType', {
        is: (val) => val !== 'Outstation',
        then: (schema) => schema.required('Package Type is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    rideTime: Yup.string().required('RideTime is required'),
    rideDate: Yup.string().required('RideDate is required'),
    // carSelected: Yup.object().test('carSelected', 'Car details are required', (value) => {
    //     return value && Object.values(value).some(field => field !== '');
    // }).optional(),
    // packageSelected: Yup.number().required('Ride Package is required'),
    customerId: Yup.object().shape({
        id: Yup.string().required('Customer ID is required'),
    }).required('Customer information is required'),
    cabType: Yup.string().when('serviceType', {
        is: 'CAB',
        then: () => Yup.string().required('Cab type is required'),
        otherwise: () => Yup.string(),
    }),
    carType: Yup.string().required('Car Type is required'),
    transmissionType: Yup.string().required('Transmission Type is required'),
    tripType: Yup.string().required('Trip Type is required'),
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
    thaluk : Yup.string().required('Thaluk is required'),
    district: Yup.string().required('District is required'),
    state: Yup.string().required('State is required'),
    pincode: Yup.string()
        .required('Pincode is required')
        .matches(/^[1-9][0-9]{5}$/, 'Must be a valid 6-digit pincode'),
    image1: Yup.string().required('Aadhaar Image is required'),
});
export const ACCOUNT_EDIT_SCHEMA = Yup.object({
    name: Yup.string().required('Name is required'),
    phoneNumber: Yup.string().matches(/^[6-9][0-9]{9}$/, 'Must be a valid 10-digit number').required('Phone number is required'),      
    type: Yup.string().required('Type is required'),   
    email: Yup.string().email('Invalid email address').matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,4}$/, 'Invalid email address').required('Email address is required'),
    street: Yup.string().required('Street is required').min(3,'Street name must be atleast 3 characters'),
    thaluk : Yup.string().required('Thaluk is required'),
    district: Yup.string().required('District is required'),
    state: Yup.string().required('State is required'),
    pincode: Yup.string()
        .required('Pincode is required')
        .matches(/^[1-9][0-9]{5}$/, 'Must be a valid 6-digit pincode'),
    image1: Yup.string().optional(),
});
export const DRIVER_ADD_SCHEMA = Yup.object({
    salutation: Yup.string().required('Salutation is required'),
    firstName: Yup.string().required('Name is required'),
    fatherName: Yup.string().optional(),
    dateOfBirth: Yup.date()
        .max(new Date(), 'Date of birth cannot be in the future')
        .test('age', 'Driver must be at least 18 years old', function(value) {
            if (!value) return true;
            const cutoff = new Date();
            cutoff.setFullYear(cutoff.getFullYear() - 18);
            return value <= cutoff;
        }),
    phoneNumber: Yup.string().matches(/^[6-9]{1}[0-9]{9}/, 'Must be a valid mobile number').required('Phone number is required'),
    license: Yup.string().matches('^[a-zA-Z]{2}[0-9]{13}$', 'Invalid Driver\'s License').required('Driving License is required'),
    licenseType: Yup.string().required('License Type is required'),
    licenseExpiryDate: Yup.date()
        .min(new Date(), 'License expiry date must be in the future')
        .required('License expiry date is required'),
    source: Yup.string()
        .required("Source is required"),
    serviceType: Yup.string()
        .required("Service type is required"),
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
        .required('Reference 1 is required')
        .min(2, 'Reference name must be at least 2 characters')
        .matches(/^[a-zA-Z\s]*$/, 'Reference name can only contain letters'),
    phoneNumber1: Yup.string()
        .required('Phone number 1 is required')
        .matches(/^[6-9]{1}[0-9]{9}$/, 'Must be a valid mobile number'),
    reference2: Yup.string()
        .required('Reference 2 is required')
        .min(2, 'Reference name must be at least 2 characters')
        .matches(/^[a-zA-Z\s]*$/, 'Reference name can only contain letters'),
    phoneNumber2: Yup.string()
        .required('Phone number 2 is required')
        .matches(/^[6-9]{1}[0-9]{9}$/, 'Must be a valid mobile number'),
    transmissionType: Yup.string().required('Transmission Type is required'),
    packages: Yup.array().when(['jobType'], {
        is: (jobType) => jobType === 'CAB',
        then: () =>
            Yup.array()
                .of(Yup.string().required('Each package must be selected'))
                .required('At least one package must be selected'),
        otherwise: () => Yup.array().nullable(),
    }),
    prices: Yup.array().when(['jobType'], {
        is: (jobType) => jobType !== 'CAB',
        then: () =>
            Yup.array()
                .of(
                    Yup.object().shape({
                        price: Yup.number().required('Price is required'),
                        extraPrice: Yup.number().required('Extra price is required'),
                        extraKmPrice: Yup.number().required('Extra KM price is required'),
                        nightCharge: Yup.number().required('Night charge is required'),
                        cancelCharge: Yup.number().required('Cancel charge is required'),
                        extraCabType: Yup.string().required('Cab type is required'),
                    })
                )
                .test(
                    'at-least-one-price',
                    'At least one price must be added',
                    function (prices) {
                        return prices && prices.some(price =>
                            price.price || price.extraPrice || price.extraKmPrice ||
                            price.nightCharge || price.cancelCharge || price.extraCabType
                        );
                    }
                )
                .required('At least one price must be added'),
        otherwise: () => Yup.array().nullable(),
    })
});

export const DRIVER_SCHEMA = Yup.object({
    salutation: Yup.string().required('Salutation is required'),
    firstName: Yup.string().required('Name is required'),
    fatherName: Yup.string().optional(),
    dateOfBirth: Yup.date()
        .max(new Date(), 'Date of birth cannot be in the future')
        .test('age', 'Driver must be at least 18 years old', function(value) {
            if (!value) return true;
            const cutoff = new Date();
            cutoff.setFullYear(cutoff.getFullYear() - 18);
            return value <= cutoff;
        }),
    phoneNumber: Yup.string().matches(/^[6-9]{1}[0-9]{9}/, 'Must be a valid mobile number').required('Phone number is required'),
    license: Yup.string().matches('^[a-zA-Z]{2}[0-9]{13}$', 'Invalid Driver\'s License').required('Driving License is required'),
    licenseType: Yup.string().required('License Type is required'),
    licenseExpiryDate: Yup.date()
        .min(new Date(), 'License expiry date must be in the future')
        .required('License expiry date is required'),
    source: Yup.string()
        .required("Source is required"),
    serviceType: Yup.string()
        .required("Service type is required"),
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
    transmissionType: Yup.string().required('Transmission Type is required'),
    packages: Yup.array()
        .of(Yup.string().required('Each package must be selected'))
        .required('At least one package must be selected')
        .min(1, 'At least one package must be selected'),
    //wallet: Yup.string().required('Wallet is required'),
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
    // ownerPhoneNumber: Yup.string().matches(/^[6-9]{1}[0-9]{9}/, 'Must be a valid mobile number').required('Phone number is required'),
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
    insurance: Yup.string().required('Insurance Expiry Date is required'),
    withDriver: Yup.string().required('Driver is required'),
    assignOrAddDriver: Yup.string().when(['withDriver'], {
        is: (withDriver) => withDriver === 'Yes',
        then: () => Yup.string().required('Assign Or Add Driver is required'),
        otherwise: () => Yup.string()
    }),
    driverId: Yup.string().when(['assignOrAddDriver'], {
        is: (assignOrAddDriver) => assignOrAddDriver === 'Yes',
        then: () => Yup.string().required('Driver Id is required'),
        otherwise: () => Yup.string()
    }),
    driverName: Yup.string().when(['assignOrAddDriver'], {
        is: (assignOrAddDriver) => assignOrAddDriver === 'Add',
        then: () => Yup.string().required('Driver Name is required'),
        otherwise: () => Yup.string()
    }),
    phoneNumber: Yup.string().when(['assignOrAddDriver'], {
        is: (assignOrAddDriver) => assignOrAddDriver === 'Add',
        then: () => Yup.string().matches(/^[6-9]{1}[0-9]{9}/, 'Must be a valid mobile number').required('Phone number is required'),
        otherwise: () => Yup.string()
    }),
    driverAddress: Yup.string().when(['assignOrAddDriver'], {
        is: (assignOrAddDriver) => assignOrAddDriver === 'Add',
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
    licenseNumber: Yup.string().when(['assignOrAddDriver'], {
        is: (assignOrAddDriver) => assignOrAddDriver === 'Add',
        then: () => Yup.string().matches('^[a-zA-Z]{2}[0-9]{13}$', 'Invalid Driver\'s License').required('Driving License is required'),
        otherwise: () => Yup.string()
    }),
    notify: Yup.string().required('Notification Recipients is required'),
    carType: Yup.string().required('Car Type is required'),
    packages: Yup.array()
        .of(Yup.string().required('Each package must be selected'))
        .required('At least one package must be selected')
        .min(1, 'At least one package must be selected'),
    //wallet: Yup.string().required('Wallet is required'),
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
    }),
    insuranceImg: Yup.string().optional(),
    image1: Yup.string().optional(),
});

export const REASSIGN_DRIVER = Yup.object({
    withDriver: Yup.string().required('Driver is required'),
    assignOrAddDriver: Yup.string().when(['withDriver'], {
        is: (withDriver) => withDriver === 'Yes',
        then: () => Yup.string().required('Assign Or Add Driver is required'),
        otherwise: () => Yup.string()
    }),
    driverId: Yup.string().when(['assignOrAddDriver'], {
        is: (assignOrAddDriver) => assignOrAddDriver === 'Yes',
        then: () => Yup.string().required('Driver Id is required'),
        otherwise: () => Yup.string()
    }),
    driverName: Yup.string().when(['assignOrAddDriver'], {
        is: (assignOrAddDriver) => assignOrAddDriver === 'Add',
        then: () => Yup.string().required('Driver Name is required'),
        otherwise: () => Yup.string()
    }),
    phoneNumber: Yup.string().when(['assignOrAddDriver'], {
        is: (assignOrAddDriver) => assignOrAddDriver === 'Add',
        then: () => Yup.string().matches(/^[6-9]{1}[0-9]{9}/, 'Must be a valid mobile number').required('Phone number is required'),
        otherwise: () => Yup.string()
    }),
    driverAddress: Yup.string().when(['assignOrAddDriver'], {
        is: (assignOrAddDriver) => assignOrAddDriver === 'Add',
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
    licenseNumber: Yup.string().when(['assignOrAddDriver'], {
        is: (assignOrAddDriver) => assignOrAddDriver === 'Add',
        then: () => Yup.string().matches('^[a-zA-Z]{2}[0-9]{13}$', 'Invalid Driver\'s License').required('Driving License is required'),
        otherwise: () => Yup.string()
    }),
})

export const CAB_ADD_SCHEMA = Yup.object({
    name: Yup.string().required('Owner Name is required'),
    // ownerPhoneNumber: Yup.string().matches(/^[6-9]{1}[0-9]{9}/, 'Must be a valid mobile number').required('Phone number is required'),
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
    insurance: Yup.string().required('Insurance Expiry Date is required'),
    withDriver: Yup.string().required('Driver is required'),
    assignOrAddDriver: Yup.string().when(['withDriver'], {
        is: (withDriver) => withDriver === 'Yes',
        then: () => Yup.string().required('Assign Or Add Driver is required'),
        otherwise: () => Yup.string()
    }),
    driverId: Yup.string().when(['assignOrAddDriver'], {
        is: (assignOrAddDriver) => assignOrAddDriver === 'Assign',
        then: () => Yup.string().required('Driver Id is required'),
        otherwise: () => Yup.string()
    }),
    driverName: Yup.string().when(['assignOrAddDriver'], {
        is: (assignOrAddDriver) => assignOrAddDriver === 'Add',
        then: () => Yup.string().required('Driver Name is required'),
        otherwise: () => Yup.string()
    }),
    phoneNumber: Yup.string().when(['assignOrAddDriver'], {
        is: (assignOrAddDriver) => assignOrAddDriver === 'Add',
        then: () => Yup.string().matches(/^[6-9]{1}[0-9]{9}/, 'Must be a valid mobile number').required('Phone number is required'),
        otherwise: () => Yup.string()
    }),
    driverAddress: Yup.string().when(['assignOrAddDriver'], {
        is: (assignOrAddDriver) => assignOrAddDriver === 'Add',
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
    licenseNumber: Yup.string().when(['assignOrAddDriver'], {
        is: (assignOrAddDriver) => assignOrAddDriver === 'Add',
        then: () => Yup.string().matches('^[a-zA-Z]{2}[0-9]{13}$', 'Invalid Driver\'s License').required('Driving License is required'),
        otherwise: () => Yup.string()
    }),
    notify: Yup.string().required('Notification Recipients is required'),
    carType: Yup.string().required('Car Type is required'),
    packages: Yup.array()
        .of(Yup.string().required('Each package must be selected'))
        .required('At least one package must be selected'),
    //.min(1, 'At least one package must be selected'),
    //wallet: Yup.string().required('Wallet is required'),
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
    }),
    insuranceImg: Yup.string().required('Insurance Image is required'),
    image1: Yup.string().required('RC Book Image is required'),
});

export const SUBSCRIPTION_ADD_SCHEME = Yup.object().shape({
    serviceType: Yup.string().required("Service Type is required"),
    packagePrice: Yup.number()
      .typeError("Subscription Amount must be a number")
      .positive("Subscription Amount must be greater than zero")
      .required("Subscription Amount is required"),
    price: Yup.number()
      .typeError("Earnings Threshold must be a number")
      .positive("Earnings Threshold must be greater than zero")
      .required("Earnings Threshold is required"),
    discount: Yup.number()
      .typeError("Discount must be a number")
      .min(0, "Discount cannot be negative")
      .max(100, "Discount cannot exceed 100%")
      .notRequired(),
    discountPrice: Yup.number()
      .typeError("Discount Price must be a number")
      .min(0, "Discount Price cannot be negative")
      .notRequired(),
    discountStartDate: Yup.date().nullable().notRequired(),
    discountEndDate: Yup.date()
    .nullable()
    .notRequired()
    .test("required-if-start-exists", "Discount End Date is required if Start Date is entered", function (value) {
      return !this.parent.discountStartDate || value;
    })
    .test("valid-end-date", "Discount End Date must be after Start Date", function (value) {
      const { discountStartDate } = this.parent;
      return !discountStartDate || !value || new Date(value) > new Date(discountStartDate);
    }),
});