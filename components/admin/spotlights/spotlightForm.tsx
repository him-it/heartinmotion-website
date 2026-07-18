"use client"

import {
    createSpotlight,
    getSpotlightByIdAdmin,
    updateSpotlight
} from "@/actions/leadership/spotlight"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormError } from "@/components/ui/formError"
import { FormSuccess } from "@/components/ui/formSuccess"
import { Prisma } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

const CATEGORIES = ["Officer", "Intern", "Volunteer"] as const

const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB

// A Date coming back from the server action → the yyyy-mm-dd a date input wants.
const toDateInput = (date?: Date) => {
    const d = date ? new Date(date) : new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

type SpotlightData = NonNullable<Prisma.PromiseReturnType<typeof getSpotlightByIdAdmin>>

export const SpotlightForm = ({ spotlight }: { spotlight?: SpotlightData }) => {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [name, setName] = useState(spotlight?.name ?? "")
    const [category, setCategory] = useState<string>(spotlight?.category ?? "Officer")
    const [postDate, setPostDate] = useState(toDateInput(spotlight?.post_date))
    const [hidden, setHidden] = useState(spotlight?.hidden ?? false)

    // Structured content: free-text detail lines + { question, answer } pairs.
    const [details, setDetails] = useState<string[]>(spotlight?.content.details ?? [])
    const [questions, setQuestions] = useState<{ question: string, answer: string }[]>(
        spotlight?.content.questions ?? []
    )

    // Image state: `preview` is what we show; `upload` holds the pending base64
    // for a newly chosen file; `removeImage` clears an existing photo on save.
    const [preview, setPreview] = useState<string | null>(spotlight?.image ?? null)
    const [upload, setUpload] = useState<{ data: string, mime: string } | null>(null)
    const [removeImage, setRemoveImage] = useState(false)

    const [error, setError] = useState<string | undefined>()
    const [success, setSuccess] = useState<string | undefined>()

    // ── Detail line helpers ────────────────────────────────────────────────
    const addDetail = () => setDetails(d => [...d, ""])
    const updateDetail = (i: number, value: string) =>
        setDetails(d => d.map((v, idx) => idx === i ? value : v))
    const removeDetail = (i: number) =>
        setDetails(d => d.filter((_, idx) => idx !== i))

    // ── Q&A helpers ────────────────────────────────────────────────────────
    const addQuestion = () => setQuestions(q => [...q, { question: "", answer: "" }])
    const updateQuestion = (i: number, field: "question" | "answer", value: string) =>
        setQuestions(q => q.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
    const removeQuestion = (i: number) =>
        setQuestions(q => q.filter((_, idx) => idx !== i))
    const moveQuestion = (i: number, dir: -1 | 1) =>
        setQuestions(q => {
            const j = i + dir
            if (j < 0 || j >= q.length)
                return q
            const next = [...q]
            ;[next[i], next[j]] = [next[j], next[i]]
            return next
        })

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(undefined)
        const file = e.target.files?.[0]
        if (!file)
            return
        if (!file.type.startsWith("image/")) {
            setError("Please choose an image file.")
            return
        }
        if (file.size > MAX_IMAGE_BYTES) {
            setError("Image must be 5 MB or smaller.")
            return
        }
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            setPreview(result)
            setUpload({ data: result.split(",")[1], mime: file.type })
            setRemoveImage(false)
        }
        reader.readAsDataURL(file)
    }

    const clearImage = () => {
        setPreview(null)
        setUpload(null)
        setRemoveImage(true)
    }

    const onSubmit = () => {
        setError(undefined)
        setSuccess(undefined)

        if (!name.trim()) {
            setError("Name is required.")
            return
        }

        const data = {
            name: name.trim(),
            category: category as (typeof CATEGORIES)[number],
            post_date: new Date(postDate),
            hidden
        }
        // Empty lines / blank pairs are dropped server-side, but trim here too so
        // what we send matches what the admin sees.
        const content = {
            details: details.map(d => d.trim()).filter(Boolean),
            questions: questions
                .map(q => ({ question: q.question.trim(), answer: q.answer.trim() }))
                .filter(q => q.question || q.answer)
        }
        const imageArg = upload ?? undefined

        startTransition(() => {
            if (spotlight) {
                updateSpotlight(spotlight.id, data, content, imageArg, removeImage).then(res => {
                    setError(res.error)
                    setSuccess(res.success)
                })
            } else {
                createSpotlight(data, content, imageArg).then(res => {
                    if (res.error) {
                        setError(res.error)
                    } else if ("id" in res && res.id) {
                        router.push(`/admin/spotlights/spotlight/${res.id}`)
                        router.refresh()
                    }
                })
            }
        })
    }

    return (
        <div className="space-y-8">
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={isPending}
                        maxLength={100}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        disabled={isPending}
                        className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                    >
                        {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                        type="date"
                        value={postDate}
                        onChange={e => setPostDate(e.target.value)}
                        disabled={isPending}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Visibility</Label>
                    <label className="flex items-center gap-2 h-9 text-sm text-foreground">
                        <input
                            type="checkbox"
                            checked={hidden}
                            onChange={e => setHidden(e.target.checked)}
                            disabled={isPending}
                            className="size-4 rounded border-border"
                        />
                        Hidden (do not show on the public site)
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Photo</Label>
                <div className="flex items-start gap-4">
                    <div className="w-32 shrink-0 aspect-[4/5] rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center">
                        {preview
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={preview} alt={name} className="h-full w-full object-cover" />
                            : <span className="text-xs text-muted-foreground text-center px-2">No photo</span>}
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={onFileChange}
                            disabled={isPending}
                        />
                        {preview && (
                            <button
                                type="button"
                                onClick={clearImage}
                                disabled={isPending}
                                className="text-sm text-destructive hover:text-destructive/80 font-medium disabled:opacity-50"
                            >
                                Remove photo
                            </button>
                        )}
                        <p className="text-xs text-muted-foreground">JPG or PNG, up to 5 MB.</p>
                    </div>
                </div>
            </div>

            {/* ── Details ──────────────────────────────────────────────────── */}
            <div className="space-y-3">
                <div>
                    <Label>Details</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                        Short description lines — e.g. role, school, class year.
                    </p>
                </div>
                <div className="space-y-2">
                    {details.map((value, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Input
                                type="text"
                                value={value}
                                onChange={e => updateDetail(i, e.target.value)}
                                disabled={isPending}
                                placeholder="e.g. Events Acting Program Manager"
                            />
                            <button
                                type="button"
                                onClick={() => removeDetail(i)}
                                disabled={isPending}
                                className="shrink-0 text-sm text-destructive hover:text-destructive/80 font-medium disabled:opacity-50 px-2"
                                aria-label="Remove detail"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    {details.length === 0 && (
                        <p className="text-sm text-muted-foreground">No details yet.</p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={addDetail}
                    disabled={isPending}
                    className="text-sm text-primary hover:text-primary/90 font-semibold disabled:opacity-50"
                >
                    + Add detail
                </button>
            </div>

            {/* ── Questions & Answers ──────────────────────────────────────── */}
            <div className="space-y-3">
                <Label>Questions &amp; Answers</Label>
                <div className="space-y-4">
                    {questions.map((qa, i) => (
                        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Question {i + 1}
                                </span>
                                <div className="flex items-center gap-1 text-sm">
                                    <button
                                        type="button"
                                        onClick={() => moveQuestion(i, -1)}
                                        disabled={isPending || i === 0}
                                        className="px-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                        aria-label="Move up"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveQuestion(i, 1)}
                                        disabled={isPending || i === questions.length - 1}
                                        className="px-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                        aria-label="Move down"
                                    >
                                        ↓
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(i)}
                                        disabled={isPending}
                                        className="ml-1 px-2 text-destructive hover:text-destructive/80 font-medium disabled:opacity-50"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                            <Input
                                type="text"
                                value={qa.question}
                                onChange={e => updateQuestion(i, "question", e.target.value)}
                                disabled={isPending}
                                placeholder="Question"
                            />
                            <textarea
                                value={qa.answer}
                                onChange={e => updateQuestion(i, "answer", e.target.value)}
                                disabled={isPending}
                                placeholder="Answer"
                                rows={4}
                                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                            />
                        </div>
                    ))}
                    {questions.length === 0 && (
                        <p className="text-sm text-muted-foreground">No questions yet.</p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={addQuestion}
                    disabled={isPending}
                    className="text-sm text-primary hover:text-primary/90 font-semibold disabled:opacity-50"
                >
                    + Add question
                </button>
            </div>

            {success ? <FormSuccess message={success} /> : <FormError message={error} />}

            <div className="flex justify-end">
                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={isPending}
                    className="text-white rounded-full bg-primary hover:bg-primary/90 transition duration-300 px-8"
                >
                    {spotlight ? "Save" : "Create"}
                </Button>
            </div>
        </div>
    )
}
