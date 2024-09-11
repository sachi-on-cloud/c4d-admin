import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Typography,
    Button
} from '@material-tailwind/react';
import { Formik, Form, Field } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';

const WalletDetails = ({ wallet, onFetch }) => {
    const navigate = useNavigate();
    const [editingId, setEditingId] = useState(null);

    const handleSave = async (values, { setSubmitting }) => {
        const walletData = {
            walletId: values.id,
            commission: values.commission
        };
        const data = await ApiRequestUtils.update(API_ROUTES.UPDATE_WALLET, walletData);
        setEditingId(null);
        setSubmitting(false);
        onFetch();
    };

    const handleEdit = (id) => {
        setEditingId(id);
        onFetch();
    };

    const handleCancel = (resetForm) => {
        setEditingId(null);
        resetForm();
    };

    return (
        <div>
            <br /><br />
            <div className='flex flex-row justify-between px-2 mb-2'>
                <h2 className="text-2xl font-bold mb-4">Wallet Details</h2>
            </div>
            <Card>
                {wallet.length > 0 ? (
                    <Formik
                        initialValues={wallet}
                        onSubmit={(values) => values}
                        enableReinitialize
                    >
                        {({ values, isSubmitting, setSubmitting, resetForm }) => (
                            <Form>
                                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                                    <table className="w-full min-w-[640px] table-auto">
                                        <thead>
                                            <tr>
                                                {["Mode", "Commission", "Actions"].map((el) => (
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
                                                                    {priceItem[field]}
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
                    <h2 className="text-2xl font-bold mt-4 mb-4 ml-4">No Wallet</h2>
                )}
            </Card>
        </div>
    );
};

export default WalletDetails;
