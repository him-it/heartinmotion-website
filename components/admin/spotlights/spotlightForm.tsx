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
import SunEditor from "suneditor-react"
import SunEditorCore from "suneditor/src/lib/core"
import "suneditor/dist/css/suneditor.min.css"
import { useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"

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
    const editor = useRef<SunEditorCore>()

    const [name, setName] = useState(spotlight?.name ?? "")
    const [category, setCategory] = useState<string>(spotlight?.category ?? "Officer")
    const [postDate, setPostDate] = useState(toDateInput(spotlight?.post_date))
    const [hidden, setHidden] = useState(spotlight?.hidden ?? false)

    // Image state: `preview` is what we show; `upload` holds the pending base64
    // for a newly chosen file; `removeImage` clears an existing photo on save.
    const [preview, setPreview] = useState<string | null>(spotlight?.image ?? null)
    const [upload, setUpload] = useState<{ data: string, mime: string } | null>(null)
    const [removeImage, setRemoveImage] = useState(false)

    const [error, setError] = useState<string | undefined>()
    const [success, setSuccess] = useState<string | undefined>()

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
        const content = editor.current?.getContents(true) ?? spotlight?.content ?? ""
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
        <div className="space-y-6">
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

            <div className="space-y-2">
                <Label>Content</Label>
                <SunEditor
                    getSunEditorInstance={(instance: SunEditorCore) => { editor.current = instance }}
                    height="500px"
                    disable={isPending}
                    lang="en"
                    defaultValue={spotlight?.content ?? ""}
                    setOptions={{
                        mode: "classic",
                        rtl: false,
                        imageSizeOnlyPercentage: true,
                        buttonList: [
                            [
                                "undo", "redo", "font", "fontSize", "formatBlock",
                                "paragraphStyle", "blockquote", "bold", "underline",
                                "italic", "strike", "subscript", "superscript",
                                "fontColor", "hiliteColor", "textStyle", "removeFormat",
                                "outdent", "indent", "align", "horizontalRule", "list",
                                "lineHeight", "table", "link", "image", "video",
                                "fullScreen", "showBlocks", "codeView", "preview"
                            ]
                        ]
                    }}
                />
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
