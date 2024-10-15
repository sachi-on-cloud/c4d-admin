import React, { useEffect, useState } from 'react';
import {
    Card,
    CardBody,
    Typography,
    Button
} from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

function Commission({ driverId, packages, priceDetails }) {
    const [editingId, setEditingId] = useState(null);
    const [packageDetails, setPackageDetails] = useState([]);
    const [saveError, setSaveError] = useState(null);
    const navigate = useNavigate();

    const getPackageListDetails = async () => {
        const data = await ApiRequestUtils.get(API_ROUTES.PACKAGES_LIST);
        if (data?.success) {
            const packageData = data?.data.map(option => {
                const suffix = option.type === 'Intercity' ? 'hr' : option.type === 'Outstation' ? 'd' : '';
                return {
                    ...option,
                    period: `${option.period} ${suffix}`, // Append 'hr' or 'd'
                };
            });
            const intercityPackage = packageData.filter(val => val.type === 'Intercity');
            const outstationPackage = packageData.filter(val => { return val.type === 'Outstation' && val.period === '1 d' });
            const carWashPackage = packageData.filter(val => val.type === 'CarWash');
            setPackageDetails([...intercityPackage, ...outstationPackage, ...carWashPackage]);
        }
    };
    useEffect(() => {
        getPackageListDetails();
    }, []);

    const handleEdit = (id) => {
        setEditingId(id);
        setSaveError(null);
    };

    const handleCancel = (resetForm) => {
        setEditingId(null);
        setSaveError(null);
        resetForm();
    };

    const handleSave = async (values, { setSubmitting, validateForm }) => {
        const errors = await validateForm(values);
        if (Object.keys(errors).length === 0) {
            const commissionData = {
                packageId: values.id,
                commission: values.commission,
            };
            try {
                const data = await ApiRequestUtils.update(API_ROUTES.UPDATE_COMMISSION, commissionData);
                if (data?.success) {
                    getPackageListDetails();
                    setEditingId(null);
                    setSaveError(null);
                } else {
                    setSaveError("Failed to update commission. Please try again.");
                }
            } catch (error) {
                setSaveError("An error occurred while saving. Please try again.");
            }
        } else {
            setSaveError("The commission rate must be between 10% and 25%");
        }
        setSubmitting(false);
    };

    const validationSchema = Yup.object().shape({
        commission: Yup.number()
            .typeError('Commission must be a number')
            .min(10, 'Commission must be at least 10')
            .max(25, 'Commission must not exceed 25')
            .required('Commission is required'),
    });

    return (
        <div>
            <br /><br />
            <div className='flex flex-row justify-between px-2 mb-2'>
                <h2 className="text-2xl font-bold mb-4">Commission Details</h2>
            </div>
            <Card>
                {packageDetails.length > 0 ? (
                    <Formik
                        initialValues={packageDetails}
                        onSubmit={(values) => values}
                        enableReinitialize
                        validationSchema={validationSchema}
                    >
                        {({ values, isSubmitting, setSubmitting, resetForm, validateForm }) => (
                            <Form>
                                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                                    <table className="w-full min-w-[640px] table-auto">
                                        <thead>
                                            <tr>
                                                {["Package", "Type", "Commission", "Actions"].map((el) => (
                                                    <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                                        <Typography variant="h6" className="text-[12px] font-bold uppercase text-black">
                                                            {el}
                                                        </Typography>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {values.map((priceItem, index) => (
                                                <tr key={priceItem.id}>
                                                    <td className="py-3 px-5 border-b border-blue-gray-50">
                                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                                            {priceItem.period}
                                                        </Typography>
                                                    </td>
                                                    <td className="py-3 px-5 border-b border-blue-gray-50">
                                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                                            {priceItem.type}
                                                        </Typography>
                                                    </td>
                                                    <td className="py-3 px-5 border-b border-blue-gray-50">
                                                        {editingId === priceItem.id ? (
                                                            <div>
                                                                <Field
                                                                    name={`[${index}].commission`}
                                                                    className="w-full p-1 text-xs border rounded"
                                                                />
                                                                <ErrorMessage
                                                                    name={`[${index}].commission`}
                                                                    component="div"
                                                                    className="text-red-500 text-xs mt-1"
                                                                />
                                                                {saveError && (
                                                                    <div className="text-red-500 text-sm mb-2 px-5">{saveError}</div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {priceItem.commission} %
                                                            </Typography>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-5 border-b border-blue-gray-50">
                                                        {editingId === priceItem.id ? (
                                                            <>
                                                                <Button 
                                                                    type="button" 
                                                                    onClick={() => handleSave(priceItem, { setSubmitting, validateForm })} 
                                                                    disabled={isSubmitting} 
                                                                    className="mr-2"
                                                                >
                                                                    Save
                                                                </Button>
                                                                <Button type="button" onClick={() => handleCancel(resetForm)}>
                                                                    Cancel
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button type="button" onClick={() => handleEdit(priceItem.id)}>
                                                                Edit
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardBody>
                            </Form>
                        )}
                    </Formik>
                ) : (
                    <h2 className="text-2xl font-bold mt-4 mb-4 ml-4">No Commission</h2>
                )}
            </Card>
        </div>
    );
}

export default Commission;