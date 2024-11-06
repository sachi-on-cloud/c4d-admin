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

function PriceTable({ type, id, packages, selectedPackages }) {
    const [price, setPrice] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const navigate = useNavigate();

    const getPrice = async (type, driverId) => {

        const data = await ApiRequestUtils.get(API_ROUTES.GET_PRICE + `?${type}=${driverId}`);
        if (data?.success) {
            const priceData = data?.data.filter((el) => selectedPackages.includes(el.packageId));
            setPrice(priceData);
        }
    };
    useEffect(() => {
        getPrice(type, id);

    }, [])
    
 const getPackageDetails = (packageId) => {
    const packageItem = packages.find(pkg => pkg.id === packageId);
    console.log('Found package:', packageItem); 
    return packageItem || null;
};

 const extractHours = (period) => {
    const match = period.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
};

const extractCarWashNumber = (period) => {
    const match = period.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
};

const sortPrices = (prices, category) => {
    return prices.sort((a, b) => {
        const packageA = getPackageDetails(a.packageId);
        const packageB = getPackageDetails(b.packageId);
        
        if (!packageA || !packageB) return 0;

        if (category === 'Intercity') {
            return extractHours(packageA.period) - extractHours(packageB.period);
        } else if (category === 'CarWash') {
            return extractCarWashNumber(packageA.period) - extractCarWashNumber(packageB.period);
        }
        return 0;
    });
};

    const filterPricesByCategory = (prices, category) => {
        const filteredPrices = prices.filter(priceItem => {
            const packageDetails = getPackageDetails(priceItem.packageId);
            if(!packageDetails) return false;
            if (category === 'Intercity') {
                return packageDetails.type === 'Intercity';
            } else if (category === 'Outstation') {
                
                return packageDetails.type === 'Outstation' && packageDetails.period === '1 d';
            } else if (category === 'CarWash') {
                return packageDetails.type === 'CarWash';
            }
            return false;
        });

        return sortPrices(filteredPrices, category);
    };

    const handleEdit = (id) => {
        setEditingId(id);
    };

    const handleCancel = (resetForm) => {
        setEditingId(null);
        resetForm();
    };

    const handleSave = async (values, { setSubmitting }) => {
        const priceData = {
            packageId: values.packageId,
            price: values.price,
            extraPrice: values.extraPrice,
            extraKmPrice: values.extraKmPrice,
            nightCharge: values.nightCharge,
            cancelCharge: values.cancelCharge,
            extraCabType: values.extraCabType,
            priceId: values.id,
        };
        const data = await ApiRequestUtils.update(API_ROUTES.UPDATE_PRICE, priceData);
        getPrice(type, id);
        setEditingId(null);
        setSubmitting(false);
    };
    const PriceTableContent = ({ prices }) => (
        <Formik
            initialValues={prices}
            onSubmit={(values) => values}
            enableReinitialize
        >
            {({ values, isSubmitting, setSubmitting, resetForm }) => (
                <Form>
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {["Package", "Price", "Extra Price", "Extra KM Price", "Night Charge", "Cancel Charge", "Cab Type", "Actions"].map((el) => (
                                        <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                            <Typography variant="h6" className="text-[12px] font-bold uppercase text-black">
                                                {el}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {values.map((priceItem, index) => {
                                    const packageDetails = getPackageDetails(priceItem.packageId);
                                    return(
                                    <tr key={priceItem.id}>
                                        <td className="py-3 px-5 border-b border-blue-gray-50">
                                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                                {packageDetails?.period || 'Unknown Package'}
                                            </Typography>
                                        </td>
                                        {['price', 'extraPrice', 'extraKmPrice', 'nightCharge', 'cancelCharge', 'extraCabType'].map((field) => (
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
                                    );
})}
                            </tbody>
                        </table>
                    </CardBody>
                </Form>
            )}
        </Formik>
    );

    const CategorySection = ({ title, category }) => (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 bg-gray-100 p-4 rounded">{title}</h2>
            <Card>
                {filterPricesByCategory(price, category).length > 0 ? (
                    <PriceTableContent prices={filterPricesByCategory(price, category)} />
                ) : (
                    <h2 className="text-lg font-medium p-4">No {category} Prices Available</h2>
                )}
            </Card>
        </div>
    );

    return (
        <div>
            <br /><br />
            <div className='flex flex-row justify-between px-2 mb-2'>
                <h2 className="text-2xl font-bold mb-4">Price Details</h2>
            </div>
             <CategorySection 
                title="INTERCITY" 
                category="Intercity" 
            />
            
            <CategorySection 
                title="OUTSTATION" 
                category="Outstation" 
            />
            
            <CategorySection 
                title="CAR WASH" 
                category="CarWash" 
            />
        </div>
    );
}

export default PriceTable;