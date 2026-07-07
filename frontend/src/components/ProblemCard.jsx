import React from "react";

function ProblemCard({ problem, onDelete, onEdit }) {
  const getDifficultyClass = (diff) => {
    switch (diff) {
      case "Easy":
        return "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20";
      case "Medium":
        return "text-amber-500 bg-amber-500/10 border border-amber-500/20";
      case "Hard":
        return "text-red-500 bg-red-500/10 border border-red-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border border-gray-500/20";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Solved":
        return "text-blue-500 bg-blue-500/10 border border-blue-500/20";
      case "Attempting":
        return "text-purple-500 bg-purple-500/10 border border-purple-500/20";
      default: // "To Do"
        return "text-gray-500 bg-gray-500/10 border border-gray-500/20";
    }
  };

  return (
    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-5 text-left shadow-md flex flex-col gap-4 hover-lift duration-200">
      <div className="flex justify-between items-start gap-3">
        <h4 className="text-base sm:text-lg font-bold text-[var(--text-h)] leading-tight break-words flex-1">
          {problem.leetcode_link ? (
            <a
              href={problem.leetcode_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline transition-all duration-200"
            >
              {problem.title} ↗
            </a>
          ) : (
            problem.title
          )}
        </h4>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(problem)}
            className="bg-blue-500/10 border border-blue-500/30 text-blue-500 hover:bg-blue-500/20 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Edit Problem"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(problem.id)}
            className="bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Delete Problem"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${getDifficultyClass(problem.difficulty)}`}>
          {problem.difficulty}
        </span>
        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusClass(problem.status)}`}>
          {problem.status}
        </span>
        <span className="text-xs text-[var(--text)] font-semibold font-mono">#{problem.topic}</span>
      </div>

      {problem.notes && (
        <div className="bg-[var(--code-bg)] p-3 rounded-xl border-l-4 border-[var(--border)]">
          <strong className="block text-[10px] font-bold text-[var(--text-h)] uppercase tracking-wider mb-1">Notes:</strong>
          <p className="text-xs text-[var(--text)] leading-relaxed whitespace-pre-wrap break-words">{problem.notes}</p>
        </div>
      )}
    </div>
  );
}

export default ProblemCard;
