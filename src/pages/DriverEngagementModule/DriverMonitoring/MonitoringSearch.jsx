import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

function MonitoringSearch({ value, onChange }) {
  return (
    <div className="relative w-full">
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-gray-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by name or ID..."
        className="h-11 w-full rounded-lg border border-blue-gray-100 bg-white pl-10 pr-3 text-sm text-blue-gray-700 outline-none transition-all focus:border-blue-400"
      />
    </div>
  );
}

export default MonitoringSearch;
