"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";

interface CommentsSectionProps {
  postId: number;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const [content, setContent] = useState("");
  
  // Use tRPC hooks
  const { data: commentsData, isLoading } = api.comments.listByPost.useQuery({
    postId,
    limit: 20,
  }, {
    enabled: !!postId,
  });
  
  const utils = api.useUtils();
  const createComment = api.comments.create.useMutation({
    onSuccess: () => {
      setContent("");
      utils.comments.listByPost.invalidate({ postId });
      utils.comments.count.invalidate({ postId });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createComment.mutate({ postId, content });
  };

  const comments = commentsData?.items || [];

  return (
    <div className="mt-12 pt-8 border-t border-[var(--border)]" id="comments">
      <h3 className="font-heading text-2xl font-bold mb-8 text-[var(--fg)]">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-10">
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm text-[var(--fg)] font-body focus:ring-2 focus:ring-[var(--accent)] resize-none"
            disabled={createComment.isPending}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!content.trim() || createComment.isPending}
            className="px-6 py-2 rounded-xl bg-[var(--accent)] text-[#0a0a0a] font-bold text-sm hover:bg-transparent hover:text-[var(--accent)] border border-[var(--accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createComment.isPending ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <p className="text-[var(--muted)]">Loading comments...</p>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <img
                src={comment.author.profileImage || "/avatar.png"}
                alt={comment.author.name}
                className="w-10 h-10 rounded-full object-cover bg-gray-800"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-heading font-bold text-[var(--fg)] text-sm">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {new Date(comment.createdAt!).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-[var(--fg)] leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[var(--muted)] italic text-sm">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  );
}
