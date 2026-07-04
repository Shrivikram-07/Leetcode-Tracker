import { useAnalyticsData } from "../../hooks/useAnalyticsData";
import ConsistencyCard from "./ConsistencyCard";
import InterviewReadinessCard from "./InterviewReadinessCard";
import PerformanceGradeCard from "./PerformanceGradeCard";
import DifficultyBalanceCard from "./DifficultyBalanceCard";
import RecommendationsCard from "./RecommendationsCard";
import StrengthWeaknessCard from "./StrengthWeaknessCard";
import GrowthPredictionCard from "./GrowthPredictionCard";
import { SkeletonCard, SkeletonChart } from "./LoadingSkeleton";
import EmptyState from "./EmptyState";
import { CpuChipIcon } from "@heroicons/react/24/outline";

export default function AIInsightsSection({ solved, streak }) {
  const { data: analytics, isLoading, error } = useAnalyticsData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <SkeletonChart />
      </div>
    );
  }

  if (error) {
    const isNotConnected = error.response?.status === 404;
    return (
      <EmptyState
        title={isNotConnected ? "LeetCode account not connected" : "Failed to load insights"}
        description={isNotConnected ? "Please connect your LeetCode account to see AI insights." : "Check your connection and try refreshing stats."}
        icon={CpuChipIcon}
      />
    );
  }

  if (!analytics) {
    return (
      <EmptyState
        title="No insights available"
        description="Connect your account and sync stats to generate AI insights."
        icon={CpuChipIcon}
      />
    );
  }

  const {
    difficultyBalance,
    topicStrength,
    strongAreas,
    weakAreas,
    consistency,
    readiness,
    growth,
    habits,
    grade,
    recommendations
  } = analytics;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ConsistencyCard consistency={consistency} streak={streak} />
        <InterviewReadinessCard readiness={readiness} solved={solved} />
        <PerformanceGradeCard grade={grade} habits={habits} />
        <DifficultyBalanceCard balance={difficultyBalance} />
      </div>

      {/* Recommendations & Strengths/Weaknesses Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecommendationsCard recommendations={recommendations} />
        </div>
        <div>
          <StrengthWeaknessCard strongAreas={strongAreas} weakAreas={weakAreas} />
        </div>
      </div>

      {/* Target/Growth Prediction Timeline */}
      <GrowthPredictionCard growth={growth} />
    </div>
  );
}
