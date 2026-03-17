import React, { useEffect, useMemo, useState } from "react";
import { Typography } from "@material-tailwind/react";
import AuditSummaryCards from "./AuditSummaryCards";
import AuditLogsTable from "./AuditLogsTable";
import {
  fetchDriverEngagementAuditActionView,
  fetchDriverEngagementAuditLogs,
  fetchDriverEngagementAuditSummary,
} from "./auditLogApi";
import { buildAuditSummary, mapAuditRows } from "./auditLogMapper";
import ActionViewModal from "../common/ActionViewModal";

const resolvePartnerId = (source = {}, partnerType = "CAB") => {
  const normalizedType = String(partnerType || "").toUpperCase();
  if (normalizedType === "AUTO") {
    return source.autoId || source.autoPartnerId || source.partnerId || source.partner?.id || source.partner?._id;
  }
  if (normalizedType === "DRIVER") {
    return source.driverId || source.partnerId || source.partner?.id || source.partner?._id;
  }
  return source.cabId || source.cabPartnerId || source.partnerId || source.partner?.id || source.partner?._id;
};

function DriverEngagementAuditLogs() {
  const [rows, setRows] = useState([]);
  const [summaryPayload, setSummaryPayload] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: null,
  });
  const [loading, setLoading] = useState(true);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState("");
  const [viewPayload, setViewPayload] = useState(null);

  useEffect(() => {
    const loadAuditLogs = async () => {
      setLoading(true);
      try {
        const [response, summaryResponse] = await Promise.all([
          fetchDriverEngagementAuditLogs({
            page: pagination.currentPage,
            limit: pagination.itemsPerPage,
            partnerType: "CAB",
          }),
          fetchDriverEngagementAuditSummary({ partnerType: "CAB" }),
        ]);

        const auditRows = Array.isArray(response?.rows) ? response.rows : response?.data || [];
        const mappedRows = mapAuditRows(auditRows);
        const nextPagination = response?.pagination || {};
        const summaryData = summaryResponse?.data || summaryResponse?.summary || null;

        setRows(mappedRows);
        setSummaryPayload(summaryData);
        setPagination((prev) => ({
          ...prev,
          currentPage: Number(nextPagination.currentPage || prev.currentPage || 1),
          totalPages: Number(nextPagination.totalPages || 1),
          totalItems: Number(nextPagination.totalItems || mappedRows.length),
          itemsPerPage: Number(nextPagination.itemsPerPage || prev.itemsPerPage || 10),
        }));
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        setRows([]);
        setSummaryPayload(null);
      } finally {
        setLoading(false);
      }
    };

    loadAuditLogs();
  }, [pagination.currentPage, pagination.itemsPerPage]);

  const summary = useMemo(() => buildAuditSummary(rows, summaryPayload), [rows, summaryPayload]);

  const onPageChange = (nextPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: Math.max(1, Math.min(nextPage, prev.totalPages || 1)),
    }));
  };

  const onView = async (row) => {
    setIsViewOpen(true);
    setViewLoading(true);
    setViewError("");
    setViewPayload(row?.raw || null);

    try {
      const source = row?.raw || {};
      const partnerType = source.partnerType || "CAB";
      const partnerId = resolvePartnerId(source, partnerType);
      const response = await fetchDriverEngagementAuditActionView({
        partnerType,
        partnerId,
        limit: 20,
        offset: 0,
      });

      const records = Array.isArray(response?.rows)
        ? response.rows
        : Array.isArray(response?.data)
          ? response.data
          : [];


      setViewPayload({
        selectedRow: source,
        relatedHistory: records,
      });
    } catch (error) {
      setViewError(error?.message || "Failed to load audit details");
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <div className="mt-5 mb-10 space-y-4 px-4 bg-white p-2 shadow-sm">
      <div>
        <Typography variant="h5" color="blue-gray" className="font-bold">Audit Logs</Typography>
        <Typography color="gray" className="mt-1 text-base font-normal">Track automated tier upgrades and downgrades</Typography>
      </div>

      <AuditSummaryCards summary={summary} />

      <AuditLogsTable
        rows={rows}
        loading={loading}
        pagination={pagination}
        onPageChange={onPageChange}
        onView={onView}
      />

      <ActionViewModal
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Audit Details"
        loading={viewLoading}
        error={viewError}
        payload={viewPayload}
      />
    </div>
  );
}

export default DriverEngagementAuditLogs;
