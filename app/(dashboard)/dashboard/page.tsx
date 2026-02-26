import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FactoryOwnerDashboard } from "@/components/dashboards/factory-owner-dashboard";
import { ProductionManagerDashboard } from "@/components/dashboards/production-manager-dashboard";
import { MerchandiserDashboard } from "@/components/dashboards/merchandiser-dashboard";
import { QualityManagerDashboard } from "@/components/dashboards/quality-manager-dashboard";
import { StoreManagerDashboard } from "@/components/dashboards/store-manager-dashboard";

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
    case "general_manager":
      return <FactoryOwnerDashboard companyId={companyId} />;

    case "production_manager":
    case "sewing_supervisor":
    case "data_entry_operator":
      return <ProductionManagerDashboard companyId={companyId} />;

    case "merchandiser":
      return <MerchandiserDashboard companyId={companyId} />;

    case "quality_manager":
      return <QualityManagerDashboard companyId={companyId} />;

    case "store_manager":
    case "purchase_manager":
      return <StoreManagerDashboard companyId={companyId} />;

    case "dyeing_master":
    case "finance_manager":
    case "hr_manager":
    case "maintenance_engineer":
      return <FactoryOwnerDashboard companyId={companyId} />;

    default:
      return <FactoryOwnerDashboard companyId={companyId} />;
  }
}
