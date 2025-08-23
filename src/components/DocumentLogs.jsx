import { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Typography,
} from "@material-tailwind/react";
import moment from "moment";

const DocumentLogs = ({ documentlogs }) => {
    const [documentslogs, setDocumentLogs] = useState([]);

    useEffect(() => {
        if (documentlogs) {
            setDocumentLogs(documentlogs);
            
        }
    }, [documentlogs]);

        return (
        <>
            <div className="flex flex-row justify-between px-2 mb-2 mt-4">
                <h2 className="text-2xl font-bold mb-4">Log</h2>
            </div>
            <Card>
                {documentslogs && documentslogs.length > 0 ? (
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {["document Id", "Log Type","Document Type","status", "action", "verified by", "verified at"].map((el, index) => (
                                        <th key={index} className="border-b border-blue-gray-50 py-3 px-5 text-left">
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
                                {documentlogs.map(({ id, LogType,Proof,documentId, action, status, updated_at, User }, key) => {
                                    const className = `py-3 px-5 ${key === documentlogs.length - 1 ? "" : "border-b border-blue-gray-50"
                                        }`;

                                    return (
                                        <tr key={id}>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {documentId}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {LogType = "KYC Document"}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {Proof.type}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography
                                                    className={`text-xs font-semibold ${status === "PENDING"
                                                            ? "text-primary-500"
                                                            : status === "APPROVED"
                                                                ? "text-green-500"
                                                                : status === "DECLINED"
                                                                    ? "text-red-500"
                                                                    : ""
                                                        }`}
                                                >
                                                    {status}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {action}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {User?.name}
                                                </Typography>
                                            </td>


                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {moment(updated_at).format("DD-MM-YYYY")}
                                                </Typography>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardBody>
                ) : (
                    <h2 className="text-lg font-medium p-4">No Logs</h2>
                )}
            </Card>
        </>
    );
};

export default DocumentLogs;