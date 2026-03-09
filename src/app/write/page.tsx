"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Bold,
  Italic,
  Underline,
  List,
  Quote,
  ImageIcon,
  Link2,
  Eye,
  Globe,
  Lock,
  Check,
  Code,
  Heading2,
  Heading3,
  Sigma,
  SquareSigma,
  SplitSquareHorizontal,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ContentRenderer } from "../components/content-renderer";
import { api } from "@/lib/trpc";
import { useRouter } from "next/navigation";

const steps = ["Post Basics", "Write Content", "Publish Settings"];

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

/* ── LaTeX snippet templates ── */
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

export default function WritePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [showPreview, setShowPreview] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
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
  const { data: categoriesData } = api.categories.list.useQuery();

  const createPost = api.posts.create.useMutation();
  const getOrCreateTags = api.tags.getOrCreateMany.useMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Map typed tags to category IDs (match by name) — only used if a tag happens to match a category
  const selectedCategoryIds = (categoriesData ?? [])
    .filter((c: any) =>
      tags.some((t) => t.toLowerCase() === c.name.toLowerCase()),
    )
    .map((c: any) => c.id as number);

  const handlePublish = async () => {
    if (!me || isSubmitting) return;
    setIsSubmitting(true);
    setPublishError("");

    try {
      // Get or create tags as actual tags
      let tagIds: number[] = [];
      if (tags.length > 0) {
        const result = await getOrCreateTags.mutateAsync({ names: tags });
        tagIds = result.map((t: any) => t.id);
      }

      // Only assign categories if tags actually match category names
      const categoryIds =
        selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined;

      const excerpt = content
        .slice(0, 200)
        .replace(/[#*_`>\[\]]/g, "")
        .trim();

      await createPost.mutateAsync({
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
        tagIds: tagIds.length > 0 ? tagIds : undefined,
      });

      router.push("/profile");
    } catch (err: any) {
      setPublishError(
        err?.message || "Failed to publish post. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to Cloudinary via our API route
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
        setPublishError(data.error || "Image upload failed");
      }
    } catch {
      setPublishError("Image upload failed. Please try again.");
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

  /* ── Insert formatting / LaTeX at cursor ── */
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

      // Restore focus & select the placeholder
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

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 font-['Inter',sans-serif]">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    i <= currentStep
                      ? "bg-accent text-white"
                      : "bg-surface text-muted-foreground"
                  }`}
                  style={{ fontSize: 13, fontWeight: 600 }}
                >
                  {i < currentStep ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className={`hidden sm:block ${i <= currentStep ? "text-foreground" : "text-muted-foreground"}`}
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Post Basics */}
          {currentStep === 0 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 style={{ fontSize: 28, fontWeight: 700 }} className="mb-2">
                Post Basics
              </h1>
              <p
                className="text-muted-foreground mb-8"
                style={{ fontSize: 15 }}
              >
                Set up the foundation for your new post.
              </p>

              <div className="space-y-6">
                <div>
                  <label
                    className="block mb-2"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your post a title..."
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                    style={{ fontSize: 15 }}
                  />
                </div>

                <div>
                  <label
                    className="block mb-2"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="A brief subtitle (optional)..."
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                    style={{ fontSize: 15 }}
                  />
                </div>

                <div>
                  <label
                    className="block mb-2"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
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
                          <Loader2
                            size={32}
                            className="animate-spin text-white"
                          />
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
                      <span style={{ fontSize: 14 }}>
                        Click to upload a cover image
                      </span>
                    </button>
                  )}
                </div>

                <div>
                  <label
                    className="block mb-2"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    Category Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full"
                        style={{ fontSize: 13, fontWeight: 500 }}
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
                      onKeyDown={(e) => e.key === "Enter" && addTag()}
                      placeholder="Add a tag..."
                      className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                      style={{ fontSize: 14 }}
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors"
                      style={{ fontSize: 14, fontWeight: 500 }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Write Content */}
          {currentStep === 1 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h1 style={{ fontSize: 28, fontWeight: 700 }}>Write Content</h1>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                    showPreview
                      ? "bg-accent/10 text-accent"
                      : "bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  {showPreview ? (
                    <SplitSquareHorizontal size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                  {showPreview ? "Split View" : "Preview"}
                </button>
              </div>
              <p
                className="text-muted-foreground mb-6"
                style={{ fontSize: 15 }}
              >
                Craft your story. Use{" "}
                <code
                  className="px-1.5 py-0.5 bg-surface border border-border rounded"
                  style={{ fontSize: 13 }}
                >
                  $...$
                </code>{" "}
                for inline math and{" "}
                <code
                  className="px-1.5 py-0.5 bg-surface border border-border rounded"
                  style={{ fontSize: 13 }}
                >
                  $$...$$
                </code>{" "}
                for block equations.
              </p>

              {/* Toolbar */}
              <div className="flex items-center gap-0.5 p-2 bg-surface border border-border rounded-t-xl flex-wrap">
                {/* Formatting buttons */}
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

                {/* LaTeX buttons */}
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
                    style={{ fontSize: 12, fontWeight: 500 }}
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
                        <p
                          className="px-2 py-1 text-muted-foreground"
                          style={{ fontSize: 11, fontWeight: 600 }}
                        >
                          MATH SNIPPETS
                        </p>
                        {latexSnippets.map((snippet) => (
                          <button
                            key={snippet.label}
                            onClick={() => insertSnippet(snippet.tex)}
                            className="w-full text-left px-2 py-2 rounded-lg hover:bg-surface transition-colors flex items-center justify-between gap-2"
                          >
                            <span style={{ fontSize: 13, fontWeight: 500 }}>
                              {snippet.label}
                            </span>
                            <code
                              className="text-accent/60 shrink-0 max-w-[130px] truncate"
                              style={{ fontSize: 11 }}
                            >
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
                className={`border border-t-0 border-border rounded-b-xl overflow-hidden ${showPreview ? "grid md:grid-cols-2" : ""}`}
              >
                {/* Textarea */}
                <div className={showPreview ? "border-r border-border" : ""}>
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`Start writing your story...\n\nTry some LaTeX:\n  Inline: $E = mc^2$\n  Block:\n  $$\n  \\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}\n  $$\n\nFormatting:\n  ## Heading\n  **bold** *italic* \`code\`\n  - bullet point\n  > blockquote`}
                    className="w-full min-h-[400px] px-6 py-5 bg-background focus:outline-none resize-none font-mono"
                    style={{ fontSize: 14, lineHeight: 1.8 }}
                    onKeyDown={(e) => {
                      // Tab key inserts spaces
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

                {/* Live Preview */}
                {showPreview && (
                  <div className="p-6 bg-background overflow-y-auto max-h-[500px]">
                    <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-border">
                      <Eye size={14} className="text-muted-foreground" />
                      <span
                        className="text-muted-foreground"
                        style={{ fontSize: 12, fontWeight: 600 }}
                      >
                        LIVE PREVIEW
                      </span>
                    </div>
                    <ContentRenderer content={content} />
                  </div>
                )}
              </div>

              {/* Status bar */}
              <div
                className="flex items-center justify-between mt-3 text-muted-foreground"
                style={{ fontSize: 13 }}
              >
                <div className="flex items-center gap-4">
                  <span>{wordCount} words</span>
                  <span>
                    ~{Math.max(1, Math.ceil(wordCount / 200))} min read
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Sigma size={13} />
                    LaTeX supported
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Publish Settings */}
          {currentStep === 2 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 style={{ fontSize: 28, fontWeight: 700 }} className="mb-2">
                Publish Settings
              </h1>
              <p
                className="text-muted-foreground mb-8"
                style={{ fontSize: 15 }}
              >
                Review and configure your post before publishing.
              </p>

              <div className="space-y-6">
                {/* Visibility */}
                <div>
                  <label
                    className="block mb-3"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
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
                        <p
                          className="mt-2"
                          style={{ fontSize: 14, fontWeight: 600 }}
                        >
                          {opt.label}
                        </p>
                        <p
                          className="text-muted-foreground"
                          style={{ fontSize: 12 }}
                        >
                          {opt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label
                    className="block mb-2"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-accent/10 text-accent rounded-full"
                        style={{ fontSize: 13, fontWeight: 500 }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preview Card with rendered content */}
                <div>
                  <label
                    className="block mb-2"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    Preview
                  </label>
                  <div className="p-6 bg-surface rounded-xl border border-border">
                    {coverImage && (
                      <img
                        src={coverImage}
                        alt="Preview"
                        className="w-full aspect-[16/8] object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 style={{ fontSize: 20, fontWeight: 700 }}>
                      {title || "Untitled Post"}
                    </h3>
                    {subtitle && (
                      <p
                        className="text-muted-foreground mt-1"
                        style={{ fontSize: 14 }}
                      >
                        {subtitle}
                      </p>
                    )}
                    <div className="mt-3 border-t border-border pt-3">
                      <ContentRenderer
                        content={content || "No content yet..."}
                        className="line-clamp-6"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10 pt-6 border-t border-border">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
              currentStep === 0
                ? "text-muted-foreground/40 cursor-not-allowed"
                : "text-foreground hover:bg-surface"
            }`}
            style={{ fontSize: 14, fontWeight: 500 }}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors"
              style={{ fontSize: 14, fontWeight: 500 }}
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={
                createPost.isPending ||
                isSubmitting ||
                isUploading ||
                !title ||
                !content
              }
              className="flex items-center gap-2 px-8 py-2.5 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
              style={{ fontSize: 14, fontWeight: 600 }}
            >
              {createPost.isPending || isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Eye size={16} />
              )}
              {createPost.isPending || isSubmitting
                ? "Publishing..."
                : "Publish Post"}
            </button>
          )}
        </div>
        {publishError && (
          <p className="text-red-500 text-center mt-2" style={{ fontSize: 13 }}>
            {publishError}
          </p>
        )}
      </div>
    </div>
  );
}
