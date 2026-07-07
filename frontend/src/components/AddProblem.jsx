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
    <div className="w-full max-w-2xl mx-auto mb-8 text-left bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 shadow-md">
      <h3 className="text-lg font-bold text-[var(--text-h)] mb-4">
        {editingProblem ? "Edit Tracked Problem" : "Track New Problem"}
      </h3>
      {error && <div className="text-red-500 text-sm font-semibold mb-3">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Problem Title (e.g., Two Sum)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-base placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[48px]"
          />
          <input
            type="text"
            placeholder="Topic (e.g., Array, DP)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-base placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[48px]"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-base focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[48px] cursor-pointer"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-base focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[48px] cursor-pointer"
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
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-base placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[48px]"
        />

        <textarea
          placeholder="Notes, thoughts, or approach..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-base placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[100px] resize-none"
        />

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 px-5 rounded-xl bg-[var(--accent)] text-white text-base font-bold shadow-md hover:shadow-violet-500/20 active:scale-[0.98] transition-all duration-200 min-h-[48px] flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : (editingProblem ? "Update Problem" : "Add Problem")}
          </button>
          {editingProblem && (
            <button
              type="button"
              onClick={() => setEditingProblem(null)}
              disabled={isSubmitting}
              className="flex-1 py-3 px-5 rounded-xl border border-[var(--border)] text-[var(--text-h)] text-base font-bold hover:bg-[var(--bg)] transition-all duration-200 min-h-[48px] flex items-center justify-center cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AddProblem;
