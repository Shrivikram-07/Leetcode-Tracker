import { useState, useEffect } from "react";
import api from "../api";

function AddProblem({ onProblemAdded, editingProblem, setEditingProblem }) {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState("To Do");
  const [leetcodeLink, setLeetcodeLink] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingProblem) {
      setTitle(editingProblem.title || "");
      setDifficulty(editingProblem.difficulty || "Easy");
      setTopic(editingProblem.topic || "");
      setStatus(editingProblem.status || "To Do");
      setLeetcodeLink(editingProblem.leetcode_link || "");
      setNotes(editingProblem.notes || "");
    } else {
      resetForm();
    }
  }, [editingProblem]);

  const resetForm = () => {
    setTitle("");
    setDifficulty("Easy");
    setTopic("");
    setStatus("To Do");
    setLeetcodeLink("");
    setNotes("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!title || !difficulty || !topic) {
      setError("Title, difficulty, and topic are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        title,
        difficulty,
        topic,
        status,
        leetcode_link: leetcodeLink,
        notes,
      };

      if (editingProblem) {
        await api.put(
          `/problems/${editingProblem.id}`,
          payload
        );
        setEditingProblem(null);
      } else {
        await api.post(
          "/problems",
          payload
        );
      }

      resetForm();

      if (onProblemAdded) {
        onProblemAdded();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save problem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>
        {editingProblem ? "Edit Tracked Problem" : "Track New Problem"}
      </h3>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <input
            type="text"
            placeholder="Problem Title (e.g., Two Sum)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
            required
            disabled={isSubmitting}
          />
          <input
            type="text"
            placeholder="Topic (e.g., Array, DP)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={styles.input}
            required
            disabled={isSubmitting}
          />
        </div>

        <div style={styles.row}>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={styles.select}
            disabled={isSubmitting}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={styles.select}
            disabled={isSubmitting}
          >
            <option value="To Do">To Do</option>
            <option value="Attempting">Attempting</option>
            <option value="Solved">Solved</option>
          </select>
        </div>

        <input
          type="url"
          placeholder="LeetCode Link (https://...)"
          value={leetcodeLink}
          onChange={(e) => setLeetcodeLink(e.target.value)}
          style={styles.inputFull}
          disabled={isSubmitting}
        />

        <textarea
          placeholder="Notes, thoughts, or approach..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={styles.textarea}
          disabled={isSubmitting}
        />

        <div style={styles.buttonGroup}>
          <button type="submit" disabled={isSubmitting} style={{ ...styles.button, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}>
            {isSubmitting ? "Saving..." : (editingProblem ? "Update Problem" : "Add Problem")}
          </button>
          {editingProblem && (
            <button
              type="button"
              onClick={() => setEditingProblem(null)}
              style={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    background: "var(--code-bg)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "600px",
    margin: "0 auto 32px auto",
    textAlign: "left",
    boxShadow: "var(--shadow)",
  },
  title: {
    margin: "0 0 16px 0",
    color: "var(--text-h)",
    fontWeight: "600",
    fontSize: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  row: {
    display: "flex",
    gap: "12px",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text-h)",
    fontFamily: "var(--sans)",
    fontSize: "14px",
    outline: "none",
  },
  inputFull: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text-h)",
    fontFamily: "var(--sans)",
    fontSize: "14px",
    outline: "none",
  },
  select: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text-h)",
    fontFamily: "var(--sans)",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
  },
  textarea: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text-h)",
    fontFamily: "var(--sans)",
    fontSize: "14px",
    minHeight: "80px",
    outline: "none",
    resize: "vertical",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    fontFamily: "var(--sans)",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    textAlign: "center",
    transition: "opacity 0.2s",
    flex: 1,
  },
  cancelButton: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text-h)",
    fontFamily: "var(--sans)",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    textAlign: "center",
    transition: "opacity 0.2s, background 0.2s",
    flex: 1,
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  error: {
    color: "#ef4444",
    fontSize: "14px",
    marginBottom: "12px",
    fontWeight: "500",
  },
};

export default AddProblem;
