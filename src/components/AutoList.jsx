import {
    Card,
    CardBody,
    Typography,
    Button
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { ColorStyles } from "@/utils/constants";

const AutoList = ({ cabsList, ownerName, type, id }) => {
    const navigate = useNavigate();
    console.log("cabsList:", cabsList);

    // Ensure cabsList is an array, default to empty array if null/undefined
    const autos = Array.isArray(cabsList) ? cabsList : [cabsList].filter(Boolean);

    return (
        <>
            <div className='flex flex-row justify-between px-2 mb-2 mt-4'>
                <h2 className="text-2xl font-bold mb-4">Auto List</h2>
                {(!(type === 'Auto' && autos?.length >= 1) || (type === 'Company')) && (
                    <div>
                        <Button 
                            className={`text-white ${ColorStyles.addButtonColor}`}
                            onClick={() => navigate('/dashboard/vendors/account/autoView/details/add', {
                                state: {
                                    ownerName: ownerName,
                                    type: type,
                                    accountId: id,
                                    fromDetails: true 
                                }
                            })}
                        >
                            Add new Auto
                        </Button>
                    </div>
                )}
            </div>
            <Card>
                {autos && autos.length > 0 ? (
                    <>
                        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                            <table className="w-full min-w-[640px] table-auto">
                                <thead>
                                    <tr>
                                        {[
                                            "Auto Name",
                                            "Auto Number",
                                            "Created At",
                                            "Driver Name",
                                            "Insurance Expiry Date",
                                            "Assign/Reassign"
                                        ].filter((el) => !(type === 'Individual' && el === "Assign/Reassign"))
                                        .map((el, index) => (
                                            <th
                                                key={index}
                                                className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                            >
                                                <Typography
                                                    variant="small"
                                                    className="text-[11px] font-bold uppercase text-blue-gray-700"
                                                >
                                                    {el}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {autos.map(
                                        ({ id, name, autoNumber, insurance, created_at, Drivers }, key) => {
                                            const className = `py-3 px-5 ${key === autos.length - 1
                                                    ? ""
                                                    : "border-b border-blue-gray-50"
                                                }`;
                                            return (
                                                <tr key={id}>
                                                    <td className={className}>
                                                        <Typography 
                                                            className="font-semibold underline cursor-pointer text-blue-900"
                                                            onClick={() => navigate(`/dashboard/vendors/account/autoDetails/details/${id}`)}
                                                        >
                                                            {name}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                                            {autoNumber}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                                            {moment(created_at).format("DD-MM-YYYY")}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                                            {Drivers && Drivers[0]?.firstName ? Drivers[0]?.firstName : ownerName}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                                            {moment(insurance).format("DD-MM-YYYY")}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        {Drivers?.length > 0 && (
                                                            (type === 'Company') || (type === 'Individual' && autos.length < 1)
                                                        ) && (
                                                            <Button
                                                                as="a"
                                                                onClick={() => navigate(`/dashboard/vendors/account/allVehicles/assignDriver/${id}`)}
                                                                className="text-xs font-semibold text-white bg-[#1A73E8]"
                                                            >
                                                                RE ASSIGN
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </CardBody>
                    </>
                ) : (
                    <h2 className="text-lg font-medium p-4">No Autos</h2>
                )}
            </Card>
        </>
    );
};

export default AutoList;