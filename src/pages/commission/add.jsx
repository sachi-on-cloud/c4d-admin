import React, { useEffect, useState } from 'react';
import {
    Card,
    CardBody,
    Typography,
    Button
} from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { Formik, Form, Field } from 'formik';
import { useNavigate } from 'react-router-dom';

function Commission({ driverId, packages, priceDetails }) {
    const [editingId, setEditingId] = useState(null);
    const [packageDetails, setPackageDetails] = useState([]);
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
    };

    const handleCancel = (resetForm) => {
        setEditingId(null);
        resetForm()
    };

    const handleSave = async (values, { setSubmitting }) => {
        //console.log("values", values);
        const commissionData = {
            packageId: values.id,
            commission: values.commission,
        };
        const data = await ApiRequestUtils.update(API_ROUTES.UPDATE_COMMISSION, commissionData);
        getPackageListDetails();
        setEditingId(null);
        setSubmitting(false);
    };
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
                    >
                        {({ values, isSubmitting, setSubmitting, resetForm }) => (
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
                                                    {['commission'].map((field) => (
                                                        <td key={field} className="py-3 px-5 border-b border-blue-gray-50">
                                                            {editingId === priceItem.id ? (
                                                                <Field
                                                                    name={`[${index}].${field}`}
                                                                    className="w-full p-1 text-xs border rounded"
                                                                />
                                                            ) : (
                                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                    {priceItem[field]} %
                                                                </Typography>
                                                            )}
                                                        </td>
                                                    ))}
                                                    <td className="py-3 px-5 border-b border-blue-gray-50">
                                                        {editingId === priceItem.id ? (
                                                            <>
                                                                <Button type="button" onClick={() => handleSave(priceItem, { setSubmitting })} disabled={isSubmitting} className="mr-2">
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