(function () {
  const FORM_ID = "MXEtbebV";

  /* Defaults from Framer TypeformInline instances */
  const formProps = {
    formId: FORM_ID,
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
  };

  /* Inline application form (bottom of page) */
  const inline = document.querySelector("[data-typeform-inline]");
  if (inline && window.VentiveTypeform) {
    window.VentiveTypeform.mount(inline, formProps);
  }

  /* Typeform modal for Schedule a Call CTAs */
  const modal = document.querySelector("[data-modal]");
  const modalBody = document.querySelector("[data-modal-body]");
  let modalUnmount = null;
  let modalMounted = false;

  function openModal() {
    if (!modal || !modalBody || !window.VentiveTypeform) return;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";

    if (!modalMounted) {
      modalBody.innerHTML = "";
      const host = document.createElement("div");
      host.className = "typeform-embed";
      host.style.minHeight = "100%";
      host.style.height = "100%";
      modalBody.appendChild(host);
      modalUnmount = window.VentiveTypeform.mount(host, formProps);
      modalMounted = true;
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-open-typeform]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openModal();
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  /* Redirect after submit if Typeform ending screen is not configured */
  window.addEventListener("typeform-submit", function () {
    /* Prefer Typeform's own ending-screen redirect; fallback: */
    // window.location.href = "confirmation.html";
  });

  /* Lazy-load YouTube iframes when near viewport */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const src = el.getAttribute("data-src");
          if (src) {
            el.setAttribute("src", src);
            el.removeAttribute("data-src");
          }
          io.unobserve(el);
        });
      },
      { rootMargin: "200px" }
    );
    document.querySelectorAll("iframe[data-src]").forEach(function (iframe) {
      io.observe(iframe);
    });
  } else {
    document.querySelectorAll("iframe[data-src]").forEach(function (iframe) {
      iframe.setAttribute("src", iframe.getAttribute("data-src"));
    });
  }
})();
