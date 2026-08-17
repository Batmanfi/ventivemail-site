import { useEffect, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"

const SCRIPT_SRC = "https://embed.typeform.com/next/embed.js"
const CSS_HREF = "https://embed.typeform.com/next/css/widget.css"

let loader: Promise<void> | null = null

function loadTypeform(): Promise<void> {
    if (typeof document === "undefined") return Promise.resolve()
    if (loader) return loader

    if (!document.querySelector(`link[href="${CSS_HREF}"]`)) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = CSS_HREF
        document.head.appendChild(link)
    }

    loader = new Promise((resolve, reject) => {
        if ((window as any).tf?.createWidget) return resolve()

        const existing = document.querySelector(
            `script[src="${SCRIPT_SRC}"]`
        ) as HTMLScriptElement | null

        const script = existing ?? document.createElement("script")
        script.addEventListener("load", () => resolve())
        script.addEventListener("error", () =>
            reject(new Error("Typeform embed script failed to load"))
        )

        if (!existing) {
            script.src = SCRIPT_SRC
            script.async = true
            document.head.appendChild(script)
        }
    })

    return loader
}

// "utm_source=meta,plan=pro" -> { utm_source: "meta", plan: "pro" }
function parsePairs(input?: string): Record<string, string> | undefined {
    if (!input || !input.trim()) return undefined
    const out: Record<string, string> = {}
    for (const pair of input.split(",")) {
        const i = pair.indexOf("=")
        if (i === -1) continue
        const key = pair.slice(0, i).trim()
        const value = pair.slice(i + 1).trim()
        if (key) out[key] = value
    }
    return Object.keys(out).length ? out : undefined
}

function parseList(input?: string): string[] | undefined {
    if (!input || !input.trim()) return undefined
    const out = input
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    return out.length ? out : undefined
}

/**
 * Typeform inline embed that stays inline on mobile (no placeholder welcome
 * screen), fills its container on desktop, forwards UTM/query params, and
 * emits a submit event for pixels and analytics.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 800
 * @framerIntrinsicHeight 600
 */
export default function TypeformInline(props) {
    const {
        formId,
        autoResize,
        minHeight,
        maxHeight,
        opacity,
        hideHeaders,
        hideFooter,
        keepSession,
        forwardParams,
        onlyTheseParams,
        hiddenFields,
        redirectTarget,
        emitEvents,
        style,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container || !formId) return

        let cancelled = false
        let unmount: (() => void) | undefined

        const only = parseList(onlyTheseParams)

        loadTypeform()
            .then(() => {
                if (cancelled || !containerRef.current) return
                const tf = (window as any).tf
                if (!tf?.createWidget) return

                const widget = tf.createWidget(formId, {
                    container: containerRef.current,
                    // Inline on mobile — no placeholder welcome screen.
                    inlineOnMobile: true,
                    autoResize: autoResize
                        ? `${minHeight},${maxHeight}`
                        : false,
                    noScrollbars: autoResize,
                    opacity,
                    hideHeaders,
                    hideFooter,
                    keepSession,

                    // Attribution: forward ?utm_source=... from the page URL.
                    // `only` narrows it to a specific allow-list.
                    transitiveSearchParams: forwardParams
                        ? (only ?? true)
                        : undefined,
                    hidden: parsePairs(hiddenFields),

                    // _parent breaks the redirect out of the iframe so the
                    // booking page loads as a real page. Never use _self here.
                    redirectTarget,

                    onSubmit: emitEvents
                        ? ({ responseId }: { responseId?: string }) => {
                              const detail = { formId, responseId }
                              window.dispatchEvent(
                                  new CustomEvent("typeform-submit", { detail })
                              )
                              const w = window as any
                              w.dataLayer = w.dataLayer || []
                              w.dataLayer.push({
                                  event: "typeform_submit",
                                  ...detail,
                              })
                          }
                        : undefined,

                    // width/height omitted so the widget fills this container.
                })

                unmount = widget?.unmount
            })
            .catch(() => {})

        return () => {
            cancelled = true
            try {
                unmount?.()
            } catch {}
            if (container) container.innerHTML = ""
        }
    }, [
        formId,
        autoResize,
        minHeight,
        maxHeight,
        opacity,
        hideHeaders,
        hideFooter,
        keepSession,
        forwardParams,
        onlyTheseParams,
        hiddenFields,
        redirectTarget,
        emitEvents,
    ])

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: autoResize ? "auto" : "100%",
                minHeight: autoResize ? minHeight : undefined,
                ...style,
            }}
        />
    )
}

TypeformInline.defaultProps = {
    formId: "",
    autoResize: false,
    minHeight: 400,
    maxHeight: 800,
    opacity: 100,
    hideHeaders: false,
    hideFooter: false,
    keepSession: false,
    forwardParams: true,
    onlyTheseParams: "",
    hiddenFields: "",
    redirectTarget: "_parent",
    emitEvents: true,
}

addPropertyControls(TypeformInline, {
    formId: {
        type: ControlType.String,
        title: "Form ID",
        placeholder: "e.g. 01JABCDEF...",
        description: "From your form URL: form.typeform.com/to/**FORM_ID**",
    },
    autoResize: {
        type: ControlType.Boolean,
        title: "Auto Height",
        description: "Grows/shrinks to fit each question instead of scrolling.",
    },
    minHeight: {
        type: ControlType.Number,
        title: "Min H",
        min: 200,
        max: 2000,
        step: 10,
        unit: "px",
        hidden: (p) => !p.autoResize,
    },
    maxHeight: {
        type: ControlType.Number,
        title: "Max H",
        min: 200,
        max: 2000,
        step: 10,
        unit: "px",
        hidden: (p) => !p.autoResize,
    },
    forwardParams: {
        type: ControlType.Boolean,
        title: "Pass URL Params",
        description:
            "Forwards ?utm_source= etc. from the page into the form. The matching Hidden Field must exist in the Typeform.",
    },
    onlyTheseParams: {
        type: ControlType.String,
        title: "Only",
        placeholder: "utm_source,utm_campaign,gclid",
        description: "Leave empty to forward every param.",
        hidden: (p) => !p.forwardParams,
    },
    hiddenFields: {
        type: ControlType.String,
        title: "Hidden",
        placeholder: "source=website,page=apply",
        description: "Fixed hidden-field values. Format: key=value,key=value",
    },
    redirectTarget: {
        type: ControlType.Enum,
        title: "Redirect",
        options: ["_parent", "_top", "_self", "_blank"],
        optionTitles: [
            "Parent page (default)",
            "Whole tab",
            "Inside embed",
            "New tab",
        ],
        description:
            "Where the ending-screen redirect opens. Keep _parent so the booking page loads full-size.",
    },
    emitEvents: {
        type: ControlType.Boolean,
        title: "Fire Events",
        description:
            "On submit, pushes typeform_submit to dataLayer and dispatches a 'typeform-submit' window event.",
    },
    opacity: {
        type: ControlType.Number,
        title: "Opacity",
        min: 0,
        max: 100,
        step: 1,
    },
    hideHeaders: { type: ControlType.Boolean, title: "Hide Headers" },
    hideFooter: { type: ControlType.Boolean, title: "Hide Footer" },
    keepSession: {
        type: ControlType.Boolean,
        title: "Keep Session",
        description: "Resume a partially filled form on return.",
    },
})
