/**
 * Vanilla port of Framer TypeformInline.tsx
 * Uses tf.createWidget (same API as the Framer code component).
 */
(function (global) {
  const SCRIPT_SRC = "https://embed.typeform.com/next/embed.js";
  const CSS_HREF = "https://embed.typeform.com/next/css/widget.css";

  let loader = null;

  function loadTypeform() {
    if (typeof document === "undefined") return Promise.resolve();
    if (loader) return loader;

    if (!document.querySelector('link[href="' + CSS_HREF + '"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_HREF;
      document.head.appendChild(link);
    }

    loader = new Promise(function (resolve, reject) {
      if (window.tf && window.tf.createWidget) {
        resolve();
        return;
      }

      const existing = document.querySelector('script[src="' + SCRIPT_SRC + '"]');

      function done() {
        if (window.tf && window.tf.createWidget) resolve();
        else reject(new Error("Typeform embed script loaded without tf.createWidget"));
      }

      if (existing) {
        // Script tag already present — either loaded or still loading.
        if (window.tf && window.tf.createWidget) {
          resolve();
        } else {
          existing.addEventListener("load", done);
          existing.addEventListener("error", function () {
            reject(new Error("Typeform embed script failed to load"));
          });
          // Poll briefly in case load already fired before we attached.
          var tries = 0;
          var t = setInterval(function () {
            tries += 1;
            if (window.tf && window.tf.createWidget) {
              clearInterval(t);
              resolve();
            } else if (tries > 50) {
              clearInterval(t);
            }
          }, 100);
        }
        return;
      }

      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.addEventListener("load", done);
      script.addEventListener("error", function () {
        reject(new Error("Typeform embed script failed to load"));
      });
      document.head.appendChild(script);
    });

    return loader;
  }

  function parsePairs(input) {
    if (!input || !String(input).trim()) return undefined;
    const out = {};
    String(input)
      .split(",")
      .forEach(function (pair) {
        const i = pair.indexOf("=");
        if (i === -1) return;
        const key = pair.slice(0, i).trim();
        const value = pair.slice(i + 1).trim();
        if (key) out[key] = value;
      });
    return Object.keys(out).length ? out : undefined;
  }

  function parseList(input) {
    if (!input || !String(input).trim()) return undefined;
    const out = String(input)
      .split(",")
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
    return out.length ? out : undefined;
  }

  /**
   * Mount Typeform into a container element (mirrors TypeformInline.tsx).
   * @returns {function} unmount
   */
  function mountTypeformInline(container, props) {
    props = props || {};
    const formId = props.formId || "";
    const autoResize = !!props.autoResize;
    const minHeight = props.minHeight != null ? props.minHeight : 400;
    const maxHeight = props.maxHeight != null ? props.maxHeight : 800;
    const opacity = props.opacity != null ? props.opacity : 100;
    const hideHeaders = !!props.hideHeaders;
    const hideFooter = !!props.hideFooter;
    const keepSession = !!props.keepSession;
    const forwardParams = props.forwardParams !== false;
    const onlyTheseParams = props.onlyTheseParams || "";
    const hiddenFields = props.hiddenFields || "";
    const redirectTarget = props.redirectTarget || "_parent";
    const emitEvents = props.emitEvents !== false;

    if (!container || !formId) {
      return function () {};
    }

    let cancelled = false;
    let unmountWidget;

    const only = parseList(onlyTheseParams);

    container.style.width = "100%";
    container.style.height = autoResize ? "auto" : "100%";
    if (autoResize) {
      container.style.minHeight = minHeight + "px";
    }

    loadTypeform()
      .then(function () {
        if (cancelled || !container) return;
        const tf = window.tf;
        if (!tf || !tf.createWidget) return;

        const widget = tf.createWidget(formId, {
          container: container,
          inlineOnMobile: true,
          autoResize: autoResize ? minHeight + "," + maxHeight : false,
          noScrollbars: autoResize,
          opacity: opacity,
          hideHeaders: hideHeaders,
          hideFooter: hideFooter,
          keepSession: keepSession,
          transitiveSearchParams: forwardParams ? only || true : undefined,
          hidden: parsePairs(hiddenFields),
          redirectTarget: redirectTarget,
          onSubmit: emitEvents
            ? function (payload) {
                const responseId = payload && payload.responseId;
                const detail = { formId: formId, responseId: responseId };
                window.dispatchEvent(
                  new CustomEvent("typeform-submit", { detail: detail })
                );
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push(
                  Object.assign({ event: "typeform_submit" }, detail)
                );
              }
            : undefined,
        });

        unmountWidget = widget && widget.unmount;
      })
      .catch(function () {});

    return function unmount() {
      cancelled = true;
      try {
        if (unmountWidget) unmountWidget();
      } catch (e) {}
      if (container) container.innerHTML = "";
    };
  }

  global.VentiveTypeform = {
    loadTypeform: loadTypeform,
    mount: mountTypeformInline,
    defaults: {
      formId: "MXEtbebV",
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
    },
  };
})(window);
