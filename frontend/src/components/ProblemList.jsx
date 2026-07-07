import React from "react";
import ProblemCard from "./ProblemCard";
import EmptyState from "./dashboard/EmptyState";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

function ProblemList({ problems, onDelete, onEdit }) {
  if (!problems || problems.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-5">
        <EmptyState
          title="No Problems Added Yet"
          description="Add a problem above to start tracking your progress!"
          icon={ClipboardDocumentListIcon}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4 text-left w-full">
      {problems.map((problem) => (
        <ProblemCard 
          key={problem.id} 
          problem={problem} 
          onDelete={onDelete} 
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

export default ProblemList;
