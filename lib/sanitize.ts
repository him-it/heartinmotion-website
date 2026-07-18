import DOMPurify from "dompurify"

/**
 * Sanitizes admin-authored rich text (CMS pages, event bodies) before it is
 * ever assigned to innerHTML. Content is stored as raw HTML from the
 * suneditor rich-text editor, so it must be treated as untrusted on render —
 * an admin account (or a future bug that lets any writer reach `content`)
 * should not be able to plant a stored XSS payload that runs for every
 * visitor of a public page.
 *
 * This runs client-side only: every caller injects the result into innerHTML
 * inside a browser-only effect, so we use the plain (browser) build of
 * DOMPurify rather than the isomorphic build, which would pull jsdom into the
 * server bundle. On the server (no DOM) we return an empty string.
 */

// Video embeds (YouTube / Vimeo) live in CMS content as <iframe>. DOMPurify
// strips iframes by default, so we allow them but pin the src to a small set
// of trusted embed hosts — an admin can embed a video, but not an arbitrary
// framed page (clickjacking / phishing).
const ALLOWED_IFRAME_HOSTS = [
    "www.youtube.com",
    "youtube.com",
    "www.youtube-nocookie.com",
    "player.vimeo.com",
]

let hookInstalled = false

const installIframeHook = () => {
    if (hookInstalled)
        return
    hookInstalled = true

    DOMPurify.addHook("uponSanitizeElement", (node, data) => {
        if (data.tagName !== "iframe")
            return

        const el = node as Element
        const src = el.getAttribute("src") || ""
        let host = ""
        try {
            host = new URL(src, window.location.origin).hostname
        } catch {
            host = ""
        }

        if (!ALLOWED_IFRAME_HOSTS.includes(host))
            el.parentNode?.removeChild(el)
    })
}

export const sanitizeHtml = (html: string | null | undefined): string => {
    if (!html)
        return ""

    if (typeof window === "undefined")
        return ""

    installIframeHook()

    // Keep DOMPurify's defaults (which strip <script>, on* handlers, and
    // javascript: URIs) but otherwise preserve content as-is — images, tables,
    // <style> blocks, and figures all survive so CMS pages render fully. Only
    // trusted-host iframes are added on top.
    const clean = DOMPurify.sanitize(html, {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["target", "allow", "allowfullscreen", "frameborder", "scrolling"],
    })

    // Drop empty suneditor media placeholders — a video/image block the author
    // inserted but never filled. Their aspect-ratio padding still reserves a
    // large blank gap otherwise.
    const holder = document.createElement("div")
    holder.innerHTML = clean
    holder.querySelectorAll(".se-video-container, .se-image-container").forEach(el => {
        if (!el.querySelector("iframe, img"))
            el.remove()
    })

    return holder.innerHTML
}
