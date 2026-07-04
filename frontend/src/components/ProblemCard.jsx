import React from "react";

function ProblemCard({ problem, onDelete, onEdit }) {
  const getDifficultyStyle = (diff) => {
    switch (diff) {
      case "Easy":
        return {
          color: "#10b981",
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
        };
      case "Medium":
        return {
          color: "#f59e0b",
          background: "rgba(245, 158, 11, 0.1)",
          border: "1px solid rgba(245, 158, 11, 0.2)",
        };
      case "Hard":
        return {
          color: "#ef4444",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
        };
      default:
        return {};
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Solved":
        return {
          color: "#3b82f6",
          background: "rgba(59, 130, 246, 0.1)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
        };
      case "Attempting":
        return {
          color: "#8b5cf6",
          background: "rgba(139, 92, 246, 0.1)",
          border: "1px solid rgba(139, 92, 246, 0.2)",
        };
      default: // "To Do"
        return {
          color: "#6b7280",
          background: "rgba(107, 114, 128, 0.1)",
          border: "1px solid rgba(107, 114, 128, 0.2)",
        };
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h4 style={styles.title}>
          {problem.leetcode_link ? (
            <a
              href={problem.leetcode_link}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              {problem.title} ↗
            </a>
          ) : (
            problem.title
          )}
        </h4>
        <div style={styles.actionButtons}>
          <button
            onClick={() => onEdit(problem)}
            style={styles.editButton}
            title="Edit Problem"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(problem.id)}
            style={styles.deleteButton}
            title="Delete Problem"
          >
            Delete
          </button>
        </div>
      </div>

      <div style={styles.metaRow}>
        <span style={{ ...styles.badge, ...getDifficultyStyle(problem.difficulty) }}>
          {problem.difficulty}
        </span>
        <span style={{ ...styles.badge, ...getStatusStyle(problem.status) }}>
          {problem.status}
        </span>
        <span style={styles.topic}>#{problem.topic}</span>
      </div>

      {problem.notes && (
        <div style={styles.notesContainer}>
          <strong style={styles.notesHeader}>Notes:</strong>
          <p style={styles.notesText}>{problem.notes}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "left",
    boxShadow: "var(--shadow)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    transition: "transform 0.2s, border-color 0.2s",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--text-h)",
  },
  link: {
    color: "var(--accent)",
    textDecoration: "none",
    transition: "opacity 0.2s",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
  },
  editButton: {
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    color: "#3b82f6",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s",
  },
  deleteButton: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#ef4444",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s",
  },
  metaRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  badge: {
    fontSize: "12px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "20px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  topic: {
    fontSize: "13px",
    color: "var(--text)",
    fontFamily: "var(--mono)",
  },
  notesContainer: {
    background: "var(--code-bg)",
    padding: "10px 12px",
    borderRadius: "8px",
    borderLeft: "3px solid var(--border)",
  },
  notesHeader: {
    display: "block",
    fontSize: "12px",
    color: "var(--text-h)",
    marginBottom: "4px",
  },
  notesText: {
    margin: 0,
    fontSize: "13px",
    lineHeight: "1.4",
    color: "var(--text)",
    whiteSpace: "pre-wrap",
  },
};

export default ProblemCard;
