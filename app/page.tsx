import Dashboard from "../src/sections/Dashboard";
import {
  accountMetrics,
  followerSeries,
  viewsSeries,
} from "../src/data/mockData";

export default function DashboardPage() {
  return (
    <Dashboard
      accountMetrics={accountMetrics}
      followerSeries={followerSeries}
      viewsSeries={viewsSeries}
    />
  );
}
