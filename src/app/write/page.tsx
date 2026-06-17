"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  Bold,
  Italic,
  Code,
  Heading2,
  Heading3,
  List,
  Quote,
  Link2,
  Sigma,
  SquareSigma,
  X,
  Globe,
  Lock,
  Loader2,
  Check,
  Eye,
  Edit3
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ContentRenderer } from "../components/content-renderer";
import CircularLoading from "../components/circular-loading";
import { api } from "@/lib/trpc";
import { useRouter } from "next/navigation";

/* ── Toolbar formatting helpers ── */
type InsertAction = {
  label: string;
  icon: React.ElementType;
  prefix: string;
  suffix: string;
  placeholder: string;
  block?: boolean;
};

const formattingActions: InsertAction[] = [
  { label: "Bold", icon: Bold, prefix: "**", suffix: "**", placeholder: "bold text" },
  { label: "Italic", icon: Italic, prefix: "*", suffix: "*", placeholder: "italic text" },
  { label: "Inline Code", icon: Code, prefix: "`", suffix: "`", placeholder: "code" },
  { label: "Heading 2", icon: Heading2, prefix: "## ", suffix: "", placeholder: "Heading", block: true },
  { label: "Heading 3", icon: Heading3, prefix: "### ", suffix: "", placeholder: "Subheading", block: true },
  { label: "Bullet List", icon: List, prefix: "- ", suffix: "", placeholder: "List item", block: true },
  { label: "Blockquote", icon: Quote, prefix: "> ", suffix: "", placeholder: "Quote", block: true },
  { label: "Link", icon: Link2, prefix: "[", suffix: "](url)", placeholder: "link text" },
  { label: "Inline Math", icon: Sigma, prefix: "$", suffix: "$", placeholder: "E=mc^2" },
  { label: "Block Math", icon: SquareSigma, prefix: "$$\n", suffix: "\n$$", placeholder: "\\int e^x dx", block: true },
];

export default function WritePage() {
  const router = useRouter();

  // Unified Editor State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // Split pane state
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setLeftWidth(newWidth);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Publish Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [publishError, setPublishError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const subtitleRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textareas
  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };

  const { data: me, isLoading: meLoading, error: meError } = api.auth.me.useQuery(undefined, { retry: false });
  const { data: categoriesData } = api.categories.list.useQuery();
  const createPost = api.posts.create.useMutation();
  const getOrCreateTags = api.tags.getOrCreateMany.useMutation();

  useEffect(() => {
    if (!meLoading && (meError || !me)) {
      router.replace("/login?callbackUrl=%2Fwrite");
    }
  }, [me, meError, meLoading, router]);

  // Match tags to category IDs automatically
  const selectedCategoryIds = (categoriesData ?? [])
    .filter((c: any) => tags.some((t) => t.toLowerCase() === c.name.toLowerCase()))
    .map((c: any) => c.id as number);

  const handlePublish = async () => {
    if (!me || isSubmitting) return;
    if (!title.trim() || !content.trim()) {
      setPublishError("Title and content are required.");
      return;
    }

    setIsSubmitting(true);
    setPublishError("");

    try {
      let tagIds: number[] = [];
      if (tags.length > 0) {
        const result = await getOrCreateTags.mutateAsync({ names: tags });
        tagIds = result.map((t: any) => t.id);
      }

      const categoryIds = selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined;
      const excerpt = content.slice(0, 200).replace(/[#*_`>\[\]]/g, "").trim();

      await createPost.mutateAsync({
        title,
        subtitle: subtitle || undefined,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        content,
        excerpt,
        coverImage: coverImage && coverImage.startsWith("http") ? coverImage : undefined,
        published: visibility === "public",
        authorId: me.id,
        categoryIds,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
      });

      router.push("/dashboard");
    } catch (err: any) {
      setPublishError(err?.message || "Failed to publish post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setCoverImage(data.url);
      else setPublishError(data.error || "Image upload failed");
    } catch {
      setPublishError("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const insertAtCursor = useCallback((action: InsertAction) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end);
    const text = selected || action.placeholder;

    let insert: string;
    if (action.block && start > 0 && content[start - 1] !== "\n") {
      insert = "\n" + action.prefix + text + action.suffix;
    } else {
      insert = action.prefix + text + action.suffix;
    }

    const newContent = content.slice(0, start) + insert + content.slice(end);
    setContent(newContent);

    requestAnimationFrame(() => {
      ta.focus();
      const cursorStart = start + (action.block && start > 0 && content[start - 1] !== "\n" ? 1 : 0) + action.prefix.length;
      ta.setSelectionRange(cursorStart, cursorStart + text.length);
      adjustHeight(ta);
    });
  }, [content]);

  if (meLoading) {
    return <div className="min-h-screen bg-bg flex items-center justify-center"><CircularLoading /></div>;
  }
  if (!me) return null;

  return (
    <div className="min-h-screen bg-bg text-fg font-body">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-bg/80 backdrop-blur-xl border-b border-[var(--border)] z-50 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="font-heading font-medium text-sm text-[var(--muted)]">Draft in {me.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPublishModal(true)}
            disabled={!title.trim() || !content.trim()}
            className="px-6 py-2 rounded-full font-heading font-bold text-xs bg-[var(--accent)] text-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-all shadow-sm"
          >
            Publish
          </button>
        </div>
      </header>

      {/* Main Split Canvas */}
      <main className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full overflow-hidden mt-16 border-t border-[var(--border)] relative">
        
        {/* Editor Pane (Left) */}
        <div 
          className="h-full overflow-y-auto px-6 lg:px-12 py-10 hide-scrollbar"
          style={{ width: `calc(${leftWidth}%)`, minWidth: '20%' }}
        >
          <div className="max-w-3xl mx-auto">
            {/* Cover Image Area */}
            <div className="mb-8">
              {coverImage ? (
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-[var(--border)] group">
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setCoverImage(null)}
                    className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--fg)] transition-colors font-heading text-sm font-medium"
                >
                  <ImageIcon size={16} />
                  Add a cover image
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Title & Subtitle Inputs */}
            <textarea
              ref={titleRef}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                adjustHeight(e.target);
              }}
              placeholder="Article Title"
              className="w-full bg-transparent border-none outline-none resize-none font-heading font-black text-4xl md:text-5xl lg:text-6xl text-[var(--fg)] placeholder:text-[var(--muted)]/50 tracking-tight leading-tight mb-4"
              rows={1}
            />
            
            <textarea
              ref={subtitleRef}
              value={subtitle}
              onChange={(e) => {
                setSubtitle(e.target.value);
                adjustHeight(e.target);
              }}
              placeholder="Write a brief subtitle (optional)..."
              className="w-full bg-transparent border-none outline-none resize-none font-body text-lg md:text-xl text-[var(--muted)] placeholder:text-[var(--muted)]/40 leading-relaxed mb-8"
              rows={1}
            />

            {/* Floating Toolbar */}
            <div className="sticky top-0 z-40 mb-6 py-2 px-3 bg-[var(--surface)]/80 backdrop-blur-xl border border-[var(--border)] rounded-2xl flex flex-wrap items-center gap-1 shadow-sm">
              {formattingActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={() => insertAtCursor(action)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--fg)] transition-colors"
                    title={action.label}
                  >
                    <Icon size={15} />
                  </button>
                );
              })}
            </div>

            {/* Content Editor */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                adjustHeight(e.target);
              }}
              placeholder="Tell your story..."
              className="w-full bg-transparent border-none outline-none resize-none font-body text-lg text-[var(--fg)] placeholder:text-[var(--muted)]/30 leading-[1.8] min-h-[60vh] pb-32"
            />
          </div>
        </div>

        {/* Draggable Splitter */}
        <div
          className={`hidden lg:block w-1 cursor-col-resize hover:bg-[var(--accent)] transition-colors z-50 ${isDragging ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
          onMouseDown={() => setIsDragging(true)}
        />

        {/* Live Preview Pane (Right) */}
        <div 
          className="hidden lg:block h-full overflow-y-auto px-6 lg:px-12 py-10 bg-[var(--surface)]/20"
          style={{ width: `calc(${100 - leftWidth}%)`, minWidth: '20%' }}
        >
          <div className="max-w-3xl mx-auto prose prose-invert max-w-none prose-amber prose-headings:font-heading pb-32">
            {coverImage && (
              <img src={coverImage} alt="Cover Preview" className="w-full aspect-video object-cover rounded-3xl mb-8" />
            )}
            <h1 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight tracking-tight text-[var(--fg)]">{title || "Untitled"}</h1>
            {subtitle && <p className="text-xl text-[var(--muted)] leading-relaxed mb-8">{subtitle}</p>}
            <div className="h-px w-full bg-[var(--border)] mb-10" />
            <ContentRenderer content={content} />
          </div>
        </div>
      </main>

      {/* Publish Settings Modal */}
      <AnimatePresence>
        {showPublishModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPublishModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[var(--bg)] border border-[var(--border)] rounded-3xl shadow-2xl p-6 lg:p-8 overflow-hidden"
            >
              <button
                onClick={() => setShowPublishModal(false)}
                className="absolute top-6 right-6 text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="font-heading text-2xl font-bold mb-6 text-[var(--fg)]">Ready to publish?</h2>

              <div className="space-y-6">
                <div>
                  <label className="block mb-2 font-heading font-semibold text-[var(--fg)] text-sm">Add Tags</label>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                            setTags([...tags, tagInput.trim()]);
                            setTagInput("");
                          }
                        }
                      }}
                      placeholder="e.g. Design, React..."
                      className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm font-body text-[var(--fg)] focus:border-[var(--accent)] outline-none"
                    />
                    <button
                      onClick={() => {
                        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                          setTags([...tags, tagInput.trim()]);
                          setTagInput("");
                        }
                      }}
                      className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:bg-[var(--border)] transition-colors text-sm font-heading font-semibold text-[var(--fg)]"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs font-body text-[var(--muted)]">
                        {tag}
                        <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-[var(--fg)]"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-3 font-heading font-semibold text-[var(--fg)] text-sm">Visibility</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setVisibility("public")}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${visibility === "public" ? "border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--fg)] hover:text-[var(--fg)]"}`}
                    >
                      <Globe size={24} className="mb-2" />
                      <span className="font-heading font-semibold text-sm">Public</span>
                    </button>
                    <button
                      onClick={() => setVisibility("private")}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${visibility === "private" ? "border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--fg)] hover:text-[var(--fg)]"}`}
                    >
                      <Lock size={24} className="mb-2" />
                      <span className="font-heading font-semibold text-sm">Draft / Private</span>
                    </button>
                  </div>
                </div>

                {publishError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs font-medium font-body text-center">
                    {publishError}
                  </div>
                )}

                <button
                  onClick={handlePublish}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[var(--accent)] text-[#0a0a0a] font-heading font-bold text-sm hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 mt-4 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {isSubmitting ? "Publishing..." : visibility === "public" ? "Publish Now" : "Save as Draft"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
