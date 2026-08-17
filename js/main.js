(function () {
  const TYPEFORM_ID = "MXEtbebV";

  /* Typeform modal */
  const modal = document.querySelector("[data-modal]");
  const modalBody = document.querySelector("[data-modal-body]");
  let widgetMounted = false;

  function openModal() {
    if (!modal) return;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    mountTypeform(modalBody);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-open-typeform]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  function mountTypeform(container) {
    if (!container || widgetMounted) return;
    const div = document.createElement("div");
    div.className = "typeform-embed";
    div.dataset.tfLive = TYPEFORM_ID;
    div.dataset.tfOpacity = "100";
    div.dataset.tfIframeProps = "title=Schedule a Call";
    div.dataset.tfTransitiveSearchParams = "true";
    div.dataset.tfMedium = "snippet";
    div.style.minHeight = "520px";
    container.appendChild(div);
    widgetMounted = true;

    if (window.tf && typeof window.tf.load === "function") {
      window.tf.load();
    }
  }

  const inline = document.querySelector("[data-typeform-inline]");
  if (inline) {
    inline.dataset.tfLive = TYPEFORM_ID;
    inline.dataset.tfOpacity = "100";
    inline.dataset.tfTransitiveSearchParams = "true";
    inline.dataset.tfMedium = "snippet";
  }

  /* Lazy-load YouTube iframes when near viewport */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
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
    document.querySelectorAll("iframe[data-src]").forEach((iframe) => io.observe(iframe));
  } else {
    document.querySelectorAll("iframe[data-src]").forEach((iframe) => {
      iframe.setAttribute("src", iframe.getAttribute("data-src"));
    });
  }
})();
