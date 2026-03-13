import React, { useEffect, useState } from "react";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { API_ROUTES, MONTH_LIST } from "@/utils/constants";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import Select from "react-select";
import moment from "moment";

const STATUS_OPTIONS = ["", "PENDING", "SUCCESS", "FAILED"];
const PAGE_LIMIT = 10;
const PAYMENT_TYPE_OPTIONS = ["", "PAYU_SUBSCRIPTION", "SUBSCRIPTION", "PAYU_BOOKING","WALLET_SUBSCRIPTION"];
const formatOptionLabel = (value) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
const formatValueWithReadableLabel = (value) =>
  value ? formatOptionLabel(value) : "-";

const formatDateTime = (value) =>
  value ? moment(value).format("DD-MM-YYYY hh:mm A") : "-";

const firstNonEmpty = (...values) =>
  values.find((val) => val !== undefined && val !== null && String(val).trim() !== "");

const resolveDriverDetails = (row) => {
  const driver = row?.Driver || row?.driver;
  const account =
    row?.Account ||
    row?.account ||
    row?.Cab?.Account ||
    row?.cab?.Account ||
    row?.Auto?.Account ||
    row?.auto?.Account;
  const cab = row?.Cab || row?.cab;
  const auto = row?.Auto || row?.auto;

  const driverFullName = [driver?.firstName, driver?.lastName].filter(Boolean).join(" ").trim();

  const name = firstNonEmpty(
    driverFullName,
    row?.driverName,
    account?.name,
    cab?.name,
    auto?.name,
    row?.driverId ? `Driver #${row.driverId}` : ""
  ) || "-";

  const phone = firstNonEmpty(
    driver?.phoneNumber,
    account?.phoneNumber,
    cab?.phoneNumber,
    auto?.phoneNumber,
    row?.driverPhone,
    row?.phoneNumber
  ) || "-";

  const driverId = firstNonEmpty(
    row?.driverId,
    driver?.id,
    account?.driverId,
    row?.DriverId
  ) || "-";

  return { name, phone, driverId };
};

const parseTransactionsResponse = (payload, fallbackLimit) => {
  const body = payload?.data ?? payload?.result ?? payload;

  let rows = [];
  if (Array.isArray(body)) {
    rows = body;
  } else if (Array.isArray(body?.rows)) {
    rows = body.rows;
  } else if (Array.isArray(body?.items)) {
    rows = body.items;
  } else if (Array.isArray(body?.list)) {
    rows = body.list;
  } else if (Array.isArray(body?.data)) {
    rows = body.data;
  }

  const meta = payload?.meta || body?.meta || {};
  const pagination = payload?.pagination || body?.pagination || {};

  const itemsPerPage =
    Number(pagination?.itemsPerPage) ||
    Number(meta?.limit) ||
    Number(body?.limit) ||
    Number(payload?.limit) ||
    Number(fallbackLimit) ||
    10;

  const totalItems =
    Number(pagination?.totalItems) ||
    Number(meta?.total) ||
    Number(body?.total) ||
    Number(payload?.total) ||
    Number(body?.count) ||
    Number(payload?.count) ||
    0;

  const totalPages =
    Number(pagination?.totalPages) ||
    Number(meta?.totalPages) ||
    Number(body?.totalPages) ||
    Number(payload?.totalPages) ||
    (totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 1);

  const currentPage =
    Number(pagination?.currentPage) ||
    Number(meta?.page) ||
    Number(body?.page) ||
    Number(payload?.page) ||
    1;

  return {
    rows,
    pagination: {
      currentPage,
      totalPages,
      totalItems: Number(totalItems) || 0,
      itemsPerPage,
    },
  };
};

const DriverTransactionsTable = () => {
  const today = new Date().toISOString().split("T")[0];
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filterType, setFilterType] = useState("daily");
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(String(currentYear));
  const [status, setStatus] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [driverId, setDriverId] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: PAGE_LIMIT,
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          sortOrder,
          page: pagination.currentPage,
          limit: PAGE_LIMIT,
        };
        params.filterType = filterType === "monthly" ? "date" : filterType;
        const formatDate = (val) => {
          const d = new Date(val);
          if (Number.isNaN(d.getTime())) return "";
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        };

        if (filterType === "daily") {
          params.date = today;
        } else if (filterType === "weekly") {
          const end = new Date(today);
          const start = new Date(end);
          start.setDate(end.getDate() - 6);
          params.startDate = formatDate(start);
          params.endDate = formatDate(end);
        } else if (filterType === "monthly") {
          const start = new Date(Number(year), Number(month) - 1, 1);
          const end = new Date(Number(year), Number(month), 0);
          params.startDate = formatDate(start);
          params.endDate = formatDate(end);
        }

        if (status) params.status = status;
        if (paymentType) params.paymentType = paymentType;
        if (driverId) params.driverId = Number(driverId);

        const response = await ApiRequestUtils.getWithQueryParam(
          API_ROUTES.GET_TRANSACTIONS_LIST,
          params
        );

        if (!response?.success) {
          setRows([]);
          setPagination((prev) => ({
            ...prev,
            totalItems: 0,
            totalPages: 1,
          }));
          setError("Failed to load transactions.");
          return;
        }

        const parsed = parseTransactionsResponse(response, PAGE_LIMIT);
        setRows(parsed.rows);
        setPagination((prev) => ({
          ...prev,
          currentPage: parsed.pagination.currentPage,
          totalPages: parsed.pagination.totalPages,
          totalItems: parsed.pagination.totalItems,
          itemsPerPage: PAGE_LIMIT,
        }));
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setRows([]);
        setPagination((prev) => ({
          ...prev,
          totalItems: 0,
          totalPages: 1,
        }));
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [
    filterType,
    month,
    year,
    status,
    paymentType,
    driverId,
    sortOrder,
    pagination.currentPage,
  ]);

  const MONTH_OPTIONS = MONTH_LIST.map((m) => {
    const monthIndex = parseInt(m.value, 10) - 1;
    const monthName = new Date(2000, monthIndex, 1).toLocaleString("en-US", {
      month: "long",
    });
    return {
      value: m.value,
      label: monthName,
    };
  });

  const visibleRows =
    rows.length > pagination.itemsPerPage
      ? rows.slice(
          (pagination.currentPage - 1) * pagination.itemsPerPage,
          pagination.currentPage * pagination.itemsPerPage
        )
      : rows;

  return (
    <Card className="border border-blue-gray-100 shadow-sm rounded-2xl">
      <CardBody className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Typography variant="h6" className="text-gray-900">
              Driver Transactions
            </Typography>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="inline-flex w-fit rounded-full bg-gray-100 p-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => {
                    setFilterType("daily");
                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  filterType === "daily"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-transparent text-gray-700"
                }`}
              >
                Daily
              </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterType("weekly");
                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  filterType === "weekly"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-transparent text-gray-700"
                }`}
              >
                Weekly
              </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterType("monthly");
                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  filterType === "monthly"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-transparent text-gray-700"
                }`}
              >
                Monthly
              </button>
            </div>

            {filterType === "monthly" ? (
              <>
                <div className="w-full sm:w-auto min-w-[160px]">
                  <Select
                    options={MONTH_OPTIONS}
                    value={MONTH_OPTIONS.find((opt) => opt.value === month)}
                    onChange={(opt) => {
                      setMonth(
                        opt?.value ||
                          String(new Date().getMonth() + 1).padStart(2, "0")
                      );
                      setPagination((prev) => ({ ...prev, currentPage: 1 }));
                    }}
                    classNamePrefix="month-select"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 40 }),
                      control: (base) => ({
                        ...base,
                        minHeight: 36,
                        borderRadius: 12,
                        fontSize: 14,
                      }),
                    }}
                    isSearchable={false}
                  />
                </div>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                  min="2025"
                  max="2100"
                  className="w-full sm:w-24 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </>
            ) : null}

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full sm:w-auto min-w-[160px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option || "all-status"} value={option}>
                  {option ? formatOptionLabel(option) : "All Status"}
                </option>
              ))}
            </select>

            <select
              value={paymentType}
              onChange={(e) => {
                setPaymentType(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full sm:w-auto min-w-[170px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {PAYMENT_TYPE_OPTIONS.map((option) => (
                <option key={option || "all-payment-type"} value={option}>
                  {option ? formatOptionLabel(option) : "All Payment Type"}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={driverId}
              onChange={(e) => {
                setDriverId(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              placeholder="Driver ID"
              className="w-full sm:w-auto min-w-[170px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
            />

            {filterType === "monthly" ? (
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="w-full sm:w-auto min-w-[150px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            ) : null}

          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[980px] table-auto">
              <thead>
                <tr>
                  {["Txn ID", "Driver ID", "Driver", "Phone Number","Amount", "Status", "Payment Type", "Payment Mode", "Date"].map((header) => (
                    <th key={header} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                        {header}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-4 px-4 text-center text-gray-500">
                      Loading transactions...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="py-4 px-4 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-4 px-4 text-center text-gray-500">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row, idx) => {
                    const driverDetails = resolveDriverDetails(row);
                    return (
                      <tr
                        key={row.transaction}
                        className="border-b border-blue-gray-50 text-sm"
                      >
                        <td className="py-3 px-4">
                          {row?.transaction ||
                            row?.response?.transaction_details?.[row?.transaction]?.txnid ||
                            row?.transaction_details?.txnid ||
                            row?.transactionId ||
                            row?.referenceId ||
                            row?.id ||
                            "-"}
                        </td>
                        <td className="py-3 px-4">
                          {driverDetails.driverId}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span>{driverDetails.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{driverDetails.phone}</td>
                        <td className="py-3 px-4">{row.amount ?? row.totalAmount ?? "-"}</td>
                        <td className="py-3 px-4">{formatValueWithReadableLabel(row.status)}</td>
                        <td className="py-3 px-4">{formatValueWithReadableLabel(row.paymentType)}</td>
                        <td className="py-3 px-4">{row.paymentMode || "-"}</td>
                        <td className="py-3 px-4">{formatDateTime(row.updated_at || row.updatedAt || row.createdAt || row.transactionDate || row.date)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="text-center text-sm text-gray-500 py-2">Loading transactions...</div>
            ) : error ? (
              <div className="text-center text-sm text-red-500 py-2">{error}</div>
            ) : visibleRows.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-2">No transactions found.</div>
            ) : (
              visibleRows.map((row, idx) => {
                const driverDetails = resolveDriverDetails(row);
                const txnId =
                  row?.transaction ||
                  row?.response?.transaction_details?.[row?.transaction]?.txnid ||
                  row?.transaction_details?.txnid ||
                  row?.transactionId ||
                  row?.referenceId ||
                  row?.id ||
                  "-";
                return (
                  <div
                    key={row.transaction || row.id || idx}
                    className="rounded-xl border border-blue-gray-50 p-3 bg-white"
                  >
                    <div className="text-xs text-blue-gray-500">Txn ID</div>
                    <div className="text-sm font-medium break-all">{txnId}</div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-blue-gray-500">Driver ID</div>
                        <div>{driverDetails.driverId}</div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-gray-500">Driver</div>
                        <div>{driverDetails.name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-gray-500">Phone</div>
                        <div>{driverDetails.phone}</div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-gray-500">Amount</div>
                        <div>{row.amount ?? row.totalAmount ?? "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-gray-500">Status</div>
                        <div>{formatValueWithReadableLabel(row.status)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-gray-500">Pay Type</div>
                        <div>{formatValueWithReadableLabel(row.paymentType)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-gray-500">Pay Mode</div>
                        <div>{row.paymentMode || "-"}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {formatDateTime(row.updated_at || row.updatedAt || row.createdAt || row.transactionDate || row.date)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Typography variant="small" className="text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages} | Total {pagination.totalItems}
            </Typography>
            <div className="flex items-center gap-2 justify-end">
              <Button
                size="sm"
                variant="outlined"
                disabled={pagination.currentPage <= 1 || loading}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: Math.max(1, prev.currentPage - 1),
                  }))
                }
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outlined"
                disabled={loading || pagination.currentPage >= pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: Math.min(prev.totalPages, prev.currentPage + 1),
                  }))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default DriverTransactionsTable;
