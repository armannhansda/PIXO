"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  Upload,
  X,
  Bold,
  Italic,
  Code,
  Heading2,
  Heading3,
  List,
  Quote,
  Link2,
  ImageIcon,
  Eye,
  Globe,
  Lock,
  Sigma,
  SquareSigma,
  SplitSquareHorizontal,
  Loader2,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ContentRenderer } from "@/app/components/content-renderer";
import { api } from "@/lib/trpc";
import { useRouter, useParams } from "next/navigation";

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
  {
    label: "Bold",
    icon: Bold,
    prefix: "**",
    suffix: "**",
    placeholder: "bold text",
  },
  {
    label: "Italic",
    icon: Italic,
    prefix: "*",
    suffix: "*",
    placeholder: "italic text",
  },
  {
    label: "Inline Code",
    icon: Code,
    prefix: "`",
    suffix: "`",
    placeholder: "code",
  },
  {
    label: "Heading 2",
    icon: Heading2,
    prefix: "## ",
    suffix: "",
    placeholder: "Heading",
    block: true,
  },
  {
    label: "Heading 3",
    icon: Heading3,
    prefix: "### ",
    suffix: "",
    placeholder: "Subheading",
    block: true,
  },
  {
    label: "Bullet List",
    icon: List,
    prefix: "- ",
    suffix: "",
    placeholder: "List item",
    block: true,
  },
  {
    label: "Blockquote",
    icon: Quote,
    prefix: "> ",
    suffix: "",
    placeholder: "Quote",
    block: true,
  },
  {
    label: "Link",
    icon: Link2,
    prefix: "[",
    suffix: "](url)",
    placeholder: "link text",
  },
];

const latexActions: InsertAction[] = [
  {
    label: "Inline Math",
    icon: Sigma,
    prefix: "$",
    suffix: "$",
    placeholder: "E = mc^2",
  },
  {
    label: "Block Math",
    icon: SquareSigma,
    prefix: "$$\n",
    suffix: "\n$$",
    placeholder: "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}",
    block: true,
  },
];

const latexSnippets = [
  { label: "Fraction", tex: "\\frac{a}{b}" },
  { label: "Square Root", tex: "\\sqrt{x}" },
  { label: "Summation", tex: "\\sum_{i=1}^{n} x_i" },
  { label: "Integral", tex: "\\int_{a}^{b} f(x)\\,dx" },
  { label: "Limit", tex: "\\lim_{x \\to \\infty} f(x)" },
  { label: "Matrix", tex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
  { label: "Greek (alpha)", tex: "\\alpha, \\beta, \\gamma" },
  { label: "Derivative", tex: "\\frac{d}{dx} f(x)" },
  { label: "Euler's Identity", tex: "e^{i\\pi} + 1 = 0" },
  { label: "Binomial", tex: "\\binom{n}{k}" },
];

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.id);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [showPreview, setShowPreview] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auth check
  const [hasToken, setHasToken] = useState(false);
  useEffect(() => {
    const token = !!localStorage.getItem("authToken");
    setHasToken(token);
    if (!token) router.push("/login");
  }, [router]);

  const { data: me } = api.auth.me.useQuery(undefined, {
    enabled: hasToken,
    retry: false,
  });

  const { data: post, isLoading: postLoading } = api.posts.getById.useQuery(
    postId,
    {
      enabled: hasToken && !!postId,
    },
  );

  const { data: categoriesData } = api.categories.list.useQuery();
  const updatePost = api.posts.update.useMutation();
  const getOrCreateTags = api.tags.getOrCreateMany.useMutation();

  // Pre-fill form when post data loads
  useEffect(() => {
    if (post && !loaded) {
      setTitle(post.title || "");
      setSubtitle((post as any).subtitle || "");
      setCoverImage(post.coverImage || null);
      setContent(post.content || "");
      setVisibility(post.published ? "public" : "private");
      setTags((post.tags || []).map((t: any) => t.name || t));
      setLoaded(true);
    }
  }, [post, loaded]);

  // Redirect if user doesn't own this post
  useEffect(() => {
    if (me && post && (post as any).authorId !== me.id) {
      router.push("/profile");
    }
  }, [me, post, router]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const selectedCategoryIds = (categoriesData ?? [])
    .filter((c: any) =>
      tags.some((t) => t.toLowerCase() === c.name.toLowerCase()),
    )
    .map((c: any) => c.id as number);

  const handleUpdate = async () => {
    if (!me || isSubmitting) return;
    setIsSubmitting(true);
    setUpdateError("");

    try {
      let tagIds: number[] = [];
      if (tags.length > 0) {
        const result = await getOrCreateTags.mutateAsync({ names: tags });
        tagIds = result.map((t: any) => t.id);
      }

      const categoryIds =
        selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined;

      const excerpt = content
        .slice(0, 200)
        .replace(/[#*_`>\[\]]/g, "")
        .trim();

      await updatePost.mutateAsync({
        id: postId,
        title,
        subtitle: subtitle || undefined,
        slug: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        content,
        excerpt,
        coverImage:
          coverImage && coverImage.startsWith("http") ? coverImage : undefined,
        published: visibility === "public",
        authorId: me.id,
        categoryIds,
        tagIds: tagIds.length > 0 ? tagIds : [],
      });

      router.push("/profile");
    } catch (err: any) {
      setUpdateError(
        err?.message || "Failed to update post. Please try again.",
      );
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
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setCoverImage(data.url);
      } else {
        setUpdateError(data.error || "Image upload failed");
      }
    } catch {
      setUpdateError("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const insertAtCursor = useCallback(
    (action: InsertAction) => {
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
        const cursorStart =
          start +
          (action.block && start > 0 && content[start - 1] !== "\n" ? 1 : 0) +
          action.prefix.length;
        ta.setSelectionRange(cursorStart, cursorStart + text.length);
      });
    },
    [content],
  );

  const insertSnippet = useCallback(
    (tex: string) => {
      const action: InsertAction = {
        label: "",
        icon: Sigma,
        prefix: "$",
        suffix: "$",
        placeholder: tex,
      };
      insertAtCursor(action);
      setShowSnippets(false);
    },
    [insertAtCursor],
  );

  if (postLoading || !loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 font-['Inter',sans-serif]">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <div className="w-16" />
        </div>

        <div className="space-y-8">
          {/* Title */}
          <div>
            <label className="block mb-2 text-sm font-semibold">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title..."
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all text-[15px]"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block mb-2 text-sm font-semibold">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="A brief subtitle (optional)..."
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all text-[15px]"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block mb-2 text-sm font-semibold">
              Cover Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {coverImage ? (
              <div className="relative rounded-xl overflow-hidden group">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full aspect-[16/9] object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-white" />
                  </div>
                )}
                <button
                  onClick={() => setCoverImage(null)}
                  className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[16/9] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer"
              >
                <Upload size={32} />
                <span className="text-sm">Click to upload a cover image</span>
              </button>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block mb-2 text-sm font-semibold">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-[13px] font-medium"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-accent/70"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all text-sm"
              />
              <button
                onClick={addTag}
                className="px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Content</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {wordCount} words &middot; ~
                  {Math.max(1, Math.ceil(wordCount / 200))} min read
                </span>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-[13px] font-medium ${
                    showPreview
                      ? "bg-accent/10 text-accent"
                      : "bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {showPreview ? (
                    <SplitSquareHorizontal size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                  {showPreview ? "Split" : "Preview"}
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-0.5 p-2 bg-surface border border-border rounded-t-xl flex-wrap">
              {formattingActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => insertAtCursor(action)}
                  title={action.label}
                  className="p-2 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                >
                  <action.icon size={16} />
                </button>
              ))}

              <div className="w-px h-5 bg-border mx-1" />

              {latexActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => insertAtCursor(action)}
                  title={action.label}
                  className="p-2 rounded-lg hover:bg-accent/10 text-accent/70 hover:text-accent transition-colors"
                >
                  <action.icon size={16} />
                </button>
              ))}

              {/* Snippets dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSnippets(!showSnippets)}
                  title="Math Snippets"
                  className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                    showSnippets
                      ? "bg-accent/10 text-accent"
                      : "hover:bg-accent/10 text-accent/70 hover:text-accent"
                  }`}
                >
                  <span style={{ fontFamily: "serif", fontSize: 15 }}>
                    f(x)
                  </span>
                </button>
                <AnimatePresence>
                  {showSnippets && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-xl z-50 p-2 max-h-72 overflow-y-auto"
                    >
                      <p className="px-2 py-1 text-muted-foreground text-[11px] font-semibold">
                        MATH SNIPPETS
                      </p>
                      {latexSnippets.map((snippet) => (
                        <button
                          key={snippet.label}
                          onClick={() => insertSnippet(snippet.tex)}
                          className="w-full text-left px-2 py-2 rounded-lg hover:bg-surface transition-colors flex items-center justify-between gap-2"
                        >
                          <span className="text-[13px] font-medium">
                            {snippet.label}
                          </span>
                          <code className="text-accent/60 shrink-0 max-w-[130px] truncate text-[11px]">
                            {snippet.tex}
                          </code>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-px h-5 bg-border mx-1" />
              <button
                className="p-2 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                title="Insert Image"
              >
                <ImageIcon size={16} />
              </button>
            </div>

            {/* Editor & Preview */}
            <div
              className={`border border-t-0 border-border rounded-b-xl overflow-hidden ${
                showPreview ? "grid md:grid-cols-2" : ""
              }`}
            >
              <div className={showPreview ? "border-r border-border" : ""}>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your story..."
                  className="w-full min-h-[400px] px-6 py-5 bg-background focus:outline-none resize-none font-mono text-sm"
                  style={{ lineHeight: 1.8 }}
                  onKeyDown={(e) => {
                    if (e.key === "Tab") {
                      e.preventDefault();
                      const ta = textareaRef.current!;
                      const start = ta.selectionStart;
                      const end = ta.selectionEnd;
                      setContent(
                        content.slice(0, start) + "  " + content.slice(end),
                      );
                      requestAnimationFrame(() => {
                        ta.selectionStart = ta.selectionEnd = start + 2;
                      });
                    }
                  }}
                />
              </div>

              {showPreview && (
                <div className="p-6 bg-background overflow-y-auto max-h-[500px]">
                  <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-border">
                    <Eye size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground text-xs font-semibold">
                      LIVE PREVIEW
                    </span>
                  </div>
                  <ContentRenderer content={content} />
                </div>
              )}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block mb-3 text-sm font-semibold">
              Visibility
            </label>
            <div className="flex gap-3">
              {[
                {
                  val: "public" as const,
                  icon: Globe,
                  label: "Public",
                  desc: "Anyone can see this post",
                },
                {
                  val: "private" as const,
                  icon: Lock,
                  label: "Private",
                  desc: "Only you can see this post",
                },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setVisibility(opt.val)}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
                    visibility === opt.val
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <opt.icon
                    size={20}
                    className={
                      visibility === opt.val
                        ? "text-accent"
                        : "text-muted-foreground"
                    }
                  />
                  <p className="mt-2 text-sm font-semibold">{opt.label}</p>
                  <p className="text-muted-foreground text-xs">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-10 pt-6 border-t border-border">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-foreground hover:bg-surface transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={
              updatePost.isPending ||
              isSubmitting ||
              isUploading ||
              !title ||
              !content
            }
            className="flex items-center gap-2 px-8 py-2.5 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 text-sm font-semibold"
          >
            {updatePost.isPending || isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {updatePost.isPending || isSubmitting
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
        {updateError && (
          <p className="text-red-500 text-center mt-2 text-[13px]">
            {updateError}
          </p>
        )}
      </div>
    </div>
  );
}
