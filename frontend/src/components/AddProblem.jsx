import { useState, useEffect } from "react";
import api from "../api";
import toast from "react-hot-toast";

function AddProblem({ onProblemAdded, editingProblem, setEditingProblem, problemCount = 0, onShowLimitModal }) {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [leetcodeLink, setLeetcodeLink] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingProblem) {
      setTitle(editingProblem.title || "");
      setDifficulty(editingProblem.difficulty || "Easy");
      setTopic(editingProblem.topic || "");
      // Map legacy statuses to new ones
      const mappedStatus = editingProblem.status === "To Do" ? "Not Started" : 
                           (editingProblem.status === "Attempting" ? "Attempted" : 
                           (editingProblem.status || "Not Started"));
      setStatus(mappedStatus);
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
    setStatus("Not Started");
    setLeetcodeLink("");
    setNotes("");
    setError("");
  };

  const isLimitReached = !editingProblem && problemCount >= 15;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!editingProblem && problemCount >= 15) {
      if (onShowLimitModal) {
        onShowLimitModal();
      } else {
        setError("You have reached the maximum limit of 15 tracked problems. Delete an existing problem before adding a new one.");
      }
      setIsSubmitting(false);
      return;
    }

    if (!title || !difficulty || !topic) {
      setError("Title, difficulty, and topic are required.");
      setIsSubmitting(false);
      return;
    }

    // Sanitize Topic format (strip leading # symbol and normalize "Unknown" to "General")
    const cleanTopic = topic.trim().replace(/^#+/, "");
    const finalTopic = cleanTopic && cleanTopic.toLowerCase() !== "unknown" ? cleanTopic : "General";

    try {
      const payload = {
        title: title.trim(),
        difficulty,
        topic: finalTopic,
        status,
        leetcode_link: leetcodeLink ? leetcodeLink.trim() : null,
        notes: notes ? notes.trim() : null,
      };

      if (editingProblem) {
        await api.put(
          `/problems/${editingProblem.id}`,
          payload
        );
        toast.success("Problem updated successfully");
        setEditingProblem(null);
      } else {
        await api.post(
          "/problems",
          payload
        );
        toast.success("Problem added successfully");
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
    <div id="add-problem-form" className="w-full mb-8 text-left bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 shadow-md">
      <h3 className="text-lg font-bold text-[var(--text-h)] mb-4">
        {editingProblem ? "Edit Tracked Problem" : "Track New Problem"}
      </h3>
      {error && <div className="text-red-500 text-sm font-semibold mb-3">{error}</div>}
      
      {isLimitReached && (
        <div className="p-3 mb-4 text-xs font-semibold rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 leading-normal">
          You have reached the maximum limit of 15 tracked problems. Delete an existing problem before adding a new one.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Problem Title (e.g., Two Sum)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isSubmitting || isLimitReached}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-base placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <input
            type="text"
            placeholder="Topic (e.g., Array, DP)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            disabled={isSubmitting || isLimitReached}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-base placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={isSubmitting || isLimitReached}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-base focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[48px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isSubmitting || isLimitReached}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-base focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[48px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="Not Started">Not Started</option>
            <option value="Attempted">Attempted</option>
            <option value="Solved">Solved</option>
          </select>
        </div>

        <input
          type="url"
          placeholder="LeetCode Link (https://...)"
          value={leetcodeLink}
          onChange={(e) => setLeetcodeLink(e.target.value)}
          disabled={isSubmitting || isLimitReached}
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-base placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed"
        />

        <textarea
          placeholder="Notes, thoughts, or approach..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting || isLimitReached}
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-base placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[100px] resize-none disabled:opacity-60 disabled:cursor-not-allowed"
        />

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button
            type="submit"
            disabled={isSubmitting || isLimitReached}
            className="flex-1 py-3 px-5 rounded-xl bg-[var(--accent)] text-white text-base font-bold shadow-md hover:shadow-violet-500/20 active:scale-[0.98] transition-all duration-200 min-h-[48px] flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : (editingProblem ? "Update Problem" : (isLimitReached ? "Limit Reached" : "Add Problem"))}
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
