(function () {
  const FORM_ID = "MXEtbebV";

  /* Same props as Framer TypeformInline instances */
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

  /* Bottom full-viewport application form */
  const inline = document.querySelector("[data-typeform-inline]");
  if (inline && window.VentiveTypeform) {
    window.VentiveTypeform.mount(inline, formProps);
  }

  /* Full-screen overlay for Schedule a Call CTAs */
  const modal = document.querySelector("[data-modal]");
  const modalBody = document.querySelector("[data-modal-body]");
  let modalMounted = false;

  function openModal() {
    if (!modal || !modalBody || !window.VentiveTypeform) return;
    modal.classList.add("is-open");
    modal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";

    if (!modalMounted) {
      modalBody.innerHTML = "";
      const host = document.createElement("div");
      host.className = "typeform-embed";
      modalBody.appendChild(host);
      window.VentiveTypeform.mount(host, formProps);
      modalMounted = true;
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("hidden", "");
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

  /* Lazy-load YouTube iframes */
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
