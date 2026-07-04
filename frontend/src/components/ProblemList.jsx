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
    <div style={styles.grid}>
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

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
    padding: "16px 0",
    textAlign: "left",
  },
  emptyState: {
    background: "var(--code-bg)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "48px 24px",
    textAlign: "center",
    margin: "24px 0",
  },
  emptyText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--text-h)",
    marginBottom: "8px",
  },
  emptySubtext: {
    fontSize: "14px",
    color: "var(--text)",
  },
};

export default ProblemList;
