import { useTranslations } from "next-intl";
import Card from "@/components/atoms/Card";

export default function MetricCards() {
  const t = useTranslations("metrics");

  const metrics = [
    { title: t("purchasesOfMonth"), description: "425,120", color: "bg-blue-400" },
    { title: t("salesOfDay"), description: "89,540", color: "bg-[#1e3c8b]" },
    { title: t("productRotation"), description: "12,589", color: "bg-blue-400" },
    { title: t("service"), description: "78,458", color: "bg-[#1e3c8b]" },
    { title: t("suppliers"), description: "245", color: "bg-[#1e3c8b]" },
    { title: t("customers"), description: "1,589", color: "bg-blue-400" },
    { title: t("bestKnown30Days"), description: "15,789", color: "bg-[#1e3c8b]" },
    { title: t("pendingOrders"), description: "458", color: "bg-blue-400" },
  ];

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {metrics.map((metric, index) => (
        <div key={index} className="w-full xs:max-w-[300px] mx-auto">
          <Card 
            color={metric.color} 
            title={metric.title} 
            description={metric.description} 
          />
        </div>
      ))}
    </div>
  );
}
