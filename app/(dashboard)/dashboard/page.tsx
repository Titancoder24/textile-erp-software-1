import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FactoryOwnerDashboard } from "@/components/dashboards/factory-owner-dashboard";
import { GeneralManagerDashboard } from "@/components/dashboards/general-manager-dashboard";
import { ProductionManagerDashboard } from "@/components/dashboards/production-manager-dashboard";
import { MerchandiserDashboard } from "@/components/dashboards/merchandiser-dashboard";
import { QualityManagerDashboard } from "@/components/dashboards/quality-manager-dashboard";
import { PurchaseManagerDashboard } from "@/components/dashboards/purchase-manager-dashboard";
import { StoreManagerDashboard } from "@/components/dashboards/store-manager-dashboard";
import { DyeingMasterDashboard } from "@/components/dashboards/dyeing-master-dashboard";
import { FinanceManagerDashboard } from "@/components/dashboards/finance-manager-dashboard";
import { HRManagerDashboard } from "@/components/dashboards/hr-manager-dashboard";
import { SewingSupervisorDashboard } from "@/components/dashboards/sewing-supervisor-dashboard";
import { MaintenanceEngineerDashboard } from "@/components/dashboards/maintenance-engineer-dashboard";
import { DataEntryOperatorDashboard } from "@/components/dashboards/data-entry-operator-dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const companyId = profile.company_id;

  switch (profile.role) {
    case "super_admin":
    case "factory_owner":
      return <FactoryOwnerDashboard companyId={companyId} />;

    case "general_manager":
      return <GeneralManagerDashboard />;

    case "production_manager":
      return <ProductionManagerDashboard companyId={companyId} />;

    case "data_entry_operator":
      return <DataEntryOperatorDashboard />;

    case "sewing_supervisor":
      return <SewingSupervisorDashboard />;

    case "merchandiser":
      return <MerchandiserDashboard companyId={companyId} />;

    case "quality_manager":
      return <QualityManagerDashboard companyId={companyId} />;

    case "purchase_manager":
      return <PurchaseManagerDashboard companyId={companyId} />;

    case "store_manager":
      return <StoreManagerDashboard companyId={companyId} />;

    case "dyeing_master":
      return <DyeingMasterDashboard companyId={companyId} />;

    case "finance_manager":
      return <FinanceManagerDashboard companyId={companyId} />;

    case "hr_manager":
      return <HRManagerDashboard companyId={companyId} />;

    case "maintenance_engineer":
      return <MaintenanceEngineerDashboard />;

    default:
      return <FactoryOwnerDashboard companyId={companyId} />;
  }
}
