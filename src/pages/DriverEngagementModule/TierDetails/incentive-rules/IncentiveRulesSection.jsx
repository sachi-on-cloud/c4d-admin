import React, { useEffect, useMemo, useState } from "react";
import { Typography } from "@material-tailwind/react";

function IncentiveRulesSection({ registerBuilder, initialConfig = {} }) {
  const [weeklyTierBonus, setWeeklyTierBonus] = useState({
    enabled: true,
    payoutFrequency: "WEEKLY",
    silver: "",
    gold: "",
    elite: "",
  });

  useEffect(() => {
    if (!initialConfig || typeof initialConfig !== "object") return;
    const components = Array.isArray(initialConfig.components) ? initialConfig.components : [];

    const weeklyTierBonusComponent = components.find((component) => component?.code === "WEEKLY_TIER_BONUS");
    if (weeklyTierBonusComponent) {
      setWeeklyTierBonus({
        enabled: Boolean(weeklyTierBonusComponent?.enabled),
        payoutFrequency: weeklyTierBonusComponent?.payoutFrequency || "WEEKLY",
        silver: String(weeklyTierBonusComponent?.payoutByTier?.SILVER ?? ""),
        gold: String(weeklyTierBonusComponent?.payoutByTier?.GOLD ?? ""),
        elite: String(weeklyTierBonusComponent?.payoutByTier?.ELITE ?? ""),
      });
    }
  }, [initialConfig]);

  const onBonusInputChange = (setter, field, nextValue) => {
    setter((prev) => ({ ...prev, [field]: nextValue }));
  };

  const payloadBuilder = useMemo(
    () => () => ({
      components: [
        {
          code: "WEEKLY_TIER_BONUS",
          enabled: Boolean(weeklyTierBonus.enabled),
          payoutFrequency: weeklyTierBonus.payoutFrequency || "WEEKLY",
          payoutByTier: {
            SILVER: Number(weeklyTierBonus.silver || 0),
            GOLD: Number(weeklyTierBonus.gold || 0),
            ELITE: Number(weeklyTierBonus.elite || 0),
          },
        },
      ],
    }),
    [weeklyTierBonus]
  );

  registerBuilder(payloadBuilder);

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border border-blue-gray-100 p-4">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={weeklyTierBonus.enabled} onChange={(event) => onBonusInputChange(setWeeklyTierBonus, "enabled", event.target.checked)} className="h-4 w-4 rounded border-blue-gray-300" />
          <Typography variant="small" color="blue-gray" className="font-semibold">Weekly Bonus</Typography>
        </div>
        <div className="hidden">
          <Typography variant="small" color="blue-gray" className="mb-1 text-xs font-semibold">Payout Frequency</Typography>
          <select
            value={weeklyTierBonus.payoutFrequency}
            onChange={(event) => onBonusInputChange(setWeeklyTierBonus, "payoutFrequency", event.target.value)}
            disabled
            className="w-full rounded-md border border-blue-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="DAILY">Daliy</option>
            <option value="WEEKLY">Weekly</option>
          </select>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <Typography variant="small" color="blue-gray" className="mb-1 text-xs font-semibold">Silver</Typography>
            <input type="number" value={weeklyTierBonus.silver} onChange={(event) => onBonusInputChange(setWeeklyTierBonus, "silver", event.target.value)} className="w-full rounded-md border border-blue-gray-200 bg-white px-3 py-2 text-sm" placeholder="SILVER payout" />
          </div>
          <div>
            <Typography variant="small" color="blue-gray" className="mb-1 text-xs font-semibold">Gold</Typography>
            <input type="number" value={weeklyTierBonus.gold} onChange={(event) => onBonusInputChange(setWeeklyTierBonus, "gold", event.target.value)} className="w-full rounded-md border border-blue-gray-200 bg-white px-3 py-2 text-sm" placeholder="GOLD payout" />
          </div>
          <div>
            <Typography variant="small" color="blue-gray" className="mb-1 text-xs font-semibold">Elite</Typography>
            <input type="number" value={weeklyTierBonus.elite} onChange={(event) => onBonusInputChange(setWeeklyTierBonus, "elite", event.target.value)} className="w-full rounded-md border border-blue-gray-200 bg-white px-3 py-2 text-sm" placeholder="ELITE payout" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncentiveRulesSection;
