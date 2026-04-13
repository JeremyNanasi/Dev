const topbar = document.querySelector(".topbar");
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#primary-nav");

const closeMenu = () => {
  topbar.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
};

if (topbar && toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = topbar.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      closeMenu();
    }
  });
}

const setupTickerLoop = () => {
  const bar = document.querySelector(".ticker__bar");
  const track = document.querySelector(".ticker__track");
  const template = track?.querySelector(".ticker__row[data-ticker-template='true']");

  if (
    !(bar instanceof HTMLElement) ||
    !(track instanceof HTMLElement) ||
    !(template instanceof HTMLElement)
  ) {
    return () => {};
  }

  let resizeRaf = 0;

  const queueRebuild = () => {
    window.cancelAnimationFrame(resizeRaf);
    resizeRaf = window.requestAnimationFrame(rebuild);
  };

  const rebuild = () => {
    track.querySelectorAll(".ticker__row[data-clone='true']").forEach((clone) => {
      clone.remove();
    });

    const rowWidth = Math.ceil(
      Math.max(template.getBoundingClientRect().width, template.scrollWidth),
    );
    const barWidth = Math.ceil(bar.getBoundingClientRect().width);

    if (!rowWidth || !barWidth) {
      track.style.setProperty("--ticker-shift", "0px");
      return;
    }

    let filledWidth = rowWidth;
    const minTrackWidth = barWidth * 2 + rowWidth;

    while (filledWidth < minTrackWidth) {
      const clone = template.cloneNode(true);

      if (clone instanceof HTMLElement) {
        clone.dataset.clone = "true";
        clone.removeAttribute("data-ticker-template");
        clone.setAttribute("aria-hidden", "true");
        track.append(clone);
        filledWidth += rowWidth;
      }
    }

    track.style.setProperty("--ticker-shift", `${rowWidth}px`);
  };

  const handleResize = () => {
    queueRebuild();
  };

  rebuild();

  if ("fonts" in document && document.fonts?.ready) {
    document.fonts.ready.then(queueRebuild).catch(() => {});
  }

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => {
      queueRebuild();
    });

    resizeObserver.observe(bar);
    resizeObserver.observe(template);
  }

  window.addEventListener("resize", handleResize);
  window.visualViewport?.addEventListener("resize", handleResize);

  return queueRebuild;
};

rebuildTickerTrack = setupTickerLoop();

const initializeLanguageToggle = () => {
  applyLanguage(getStoredLanguage());

  const languageButtons = Array.from(
    document.querySelectorAll(".lang-toggle__btn[data-lang]"),
  );

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const requestedLanguage = button.dataset.lang === "de" ? "de" : "en";

      if (requestedLanguage === currentLanguage) {
        return;
      }

      applyLanguage(requestedLanguage);
      persistLanguage(requestedLanguage);
    });
  });
};

initializeLanguageToggle();

const contactForm = document.querySelector("#contact-form");

if (contactForm instanceof HTMLFormElement) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const statusElement = document.querySelector("#form-status");
  const primaryEndpoint =
    (
      contactForm.dataset.primaryEndpoint ||
      contactForm.getAttribute("action") ||
      "./email.php"
    ).trim();
  const fallbackEndpoint = (contactForm.dataset.fallbackEndpoint || "").trim();
  const skipPrimaryEndpoint = contactForm.dataset.skipPrimaryEndpoint === "true";

  const setFormStatus = (state, messageKey) => {
    if (!(statusElement instanceof HTMLElement)) {
      return;
    }

    statusElement.classList.remove("is-success", "is-error");
    statusElement.textContent = "";

    if (state === "success") {
      statusElement.classList.add("is-success");
    }

    if (state === "error") {
      statusElement.classList.add("is-error");
    }

    if (messageKey) {
      statusElement.dataset.i18nStatusKey = messageKey;
      statusElement.textContent = getTranslation(currentLanguage, messageKey);
    } else {
      delete statusElement.dataset.i18nStatusKey;
    }
  };

  const parseJsonResponse = async (response) => {
    try {
      return await response.json();
    } catch (_error) {
      return null;
    }
  };

  const containsActivationHint = (value) =>
    typeof value === "string" && /needs?\s+activation|activate\s+form/i.test(value);

  const sendToPhpEndpoint = async (endpoint, payload) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await parseJsonResponse(response);

    if (!response.ok || !result?.success) {
      const error = new Error(
        result?.error || result?.message || `Mail delivery failed (HTTP ${response.status})`,
      );
      error.status = response.status;
      throw error;
    }
  };

  const sendToFallbackEndpoint = async (endpoint, payload) => {
    const formPayload = new FormData();
    formPayload.append("name", payload.name);
    formPayload.append("email", payload.email);
    formPayload.append("message", payload.message);
    formPayload.append("privacyAccepted", payload.privacyAccepted ? "true" : "false");
    formPayload.append("_subject", getTranslation(currentLanguage, "form_subject"));
    formPayload.append("_captcha", "false");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formPayload,
    });

    const result = await parseJsonResponse(response);
    const activationRequired =
      containsActivationHint(result?.message) || containsActivationHint(result?.error);

    if (activationRequired) {
      const error = new Error("Form endpoint is not activated.");
      error.code = "FORM_ENDPOINT_NOT_ACTIVATED";
      throw error;
    }

    const reportedFailure = result?.success === false || result?.success === "false";

    if (!response.ok || reportedFailure) {
      const error = new Error(
        result?.error || result?.message || `Mail delivery failed (HTTP ${response.status})`,
      );
      error.status = response.status;
      throw error;
    }
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const getValidationKey = () => {
    const name = contactForm.querySelector("#name")?.value.trim();
    const email = contactForm.querySelector("#email")?.value.trim();
    const message = contactForm.querySelector("#message")?.value.trim();
    const privacy = contactForm.querySelector("#privacy")?.checked;
    if (!name || !email || !message) return "form_status_empty";
    if (!emailRegex.test(email)) return "form_status_invalid_email";
    if (!privacy) return "form_status_privacy";
    return null;
  };

  const isFormValid = () => getValidationKey() === null;

  const updateSubmitState = () => {
    if (submitButton instanceof HTMLButtonElement && !submitButton.dataset.submitting) {
      submitButton.disabled = false;
    }
  };

  const markFieldInvalid = (input) => {
    input?.closest(".field, .check")?.classList.add("is-invalid");
  };
  const clearFieldInvalid = (input) => {
    input?.closest(".field, .check")?.classList.remove("is-invalid");
  };

  const markInvalidFields = () => {
    const name = contactForm.querySelector("#name");
    const email = contactForm.querySelector("#email");
    const message = contactForm.querySelector("#message");
    const privacy = contactForm.querySelector("#privacy");
    [name, email, message, privacy].forEach(clearFieldInvalid);
    if (!name?.value.trim()) markFieldInvalid(name);
    if (!email?.value.trim() || !emailRegex.test(email.value.trim())) markFieldInvalid(email);
    if (!message?.value.trim()) markFieldInvalid(message);
    if (!privacy?.checked) markFieldInvalid(privacy);
  };

  contactForm.querySelectorAll(".field__input").forEach((input) => {
    input.addEventListener("input", updateSubmitState);
    input.addEventListener("focus", () => clearFieldInvalid(input));
  });
  const privacyInput = contactForm.querySelector("#privacy");
  privacyInput?.addEventListener("change", updateSubmitState);
  privacyInput?.addEventListener("focus", () => clearFieldInvalid(privacyInput));
  updateSubmitState();

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormStatus("", "");

    const validationKey = getValidationKey();
    if (validationKey) {
      setFormStatus("error", validationKey);
      markInvalidFields();
      return;
    }

    const formData = new FormData(contactForm);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      privacyAccepted: formData.get("privacy") === "on",
    };

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
      submitButton.dataset.submitting = "true";
      submitButton.textContent = getTranslation(currentLanguage, "form_submit_sending");
    }

    try {
      const canUsePrimaryEndpoint = Boolean(primaryEndpoint) && !skipPrimaryEndpoint;
      const canUseFallbackEndpoint = Boolean(fallbackEndpoint);

      if (canUsePrimaryEndpoint) {
        try {
          await sendToPhpEndpoint(primaryEndpoint, payload);
        } catch (primaryError) {
          const status = Number(primaryError?.status ?? 0);
          const shouldUseFallback =
            canUseFallbackEndpoint &&
            (status === 404 ||
              status === 405 ||
              status >= 500 ||
              primaryError instanceof TypeError);

          if (!shouldUseFallback) {
            throw primaryError;
          }

          await sendToFallbackEndpoint(fallbackEndpoint, payload);
        }
      } else if (canUseFallbackEndpoint) {
        await sendToFallbackEndpoint(fallbackEndpoint, payload);
      } else {
        throw new Error("No contact endpoint configured.");
      }

      contactForm.reset();
      setFormStatus("success", "form_status_success");
    } catch (error) {
      console.error("Contact form request failed:", error);
      const activationRequired = error?.code === "FORM_ENDPOINT_NOT_ACTIVATED";
      const messageKey = activationRequired
        ? "form_status_activation_required"
        : "form_status_error";
      setFormStatus("error", messageKey);
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
        delete submitButton.dataset.submitting;
        submitButton.textContent = getTranslation(
          currentLanguage,
          "form_submit_default",
        );
      }
    }
  });
}

const projectOverlay = document.getElementById("project-overlay");

if (projectOverlay) {
  const projects = {
    join: {
      number: "01",
      name: "Join",
      subtitle: "JavaScript | HTML | CSS | Firebase",
      desc: "A Kanban-style project management tool built collaboratively. Features drag-and-drop task management, user authentication, and real-time database sync via Firebase.",
      techs: ["HTML", "CSS", "JavaScript", "Firebase"],
      img: "img/join.jpg",
      imgAlt: "Join project screenshot",
      liveDemo: "https://join.rucel-tsafack.com/index.html",
      github: "https://github.com/TinoWulf/Join",
    },
    el_pollo_loco: {
      number: "02",
      name: "El Pollo Loco",
      subtitle: "HTML | CSS | JavaScript",
      desc: "A classic jump-and-run browser game built with object-oriented JavaScript. Includes animations, enemy AI, collectibles, and a complete game loop.",
      techs: ["HTML", "CSS", "JavaScript"],
      img: "img/el_pollo_loco.jpg",
      imgAlt: "El Pollo Loco project screenshot",
      liveDemo: "./el_pollo_loco/index.html",
      github: "https://github.com/JeremyNanasi/Dev/tree/main/el_pollo_loco",
    },
pokedex: {
  number: "03",
  name: "Pokedex",
  subtitle: "JavaScript | HTML | CSS | REST API",
  desc: "A Pokédex web app that fetches live data from the PokéAPI. Browse Pokémon, view stats, types and sprites — all rendered dynamically with vanilla JavaScript.",
  techs: ["HTML", "CSS", "JavaScript", "REST API"],
  img: "./img/pokedex/pokedex.png",
  imgAlt: "Pokédex project screenshot",
  liveDemo: "./Pokedex/index.html",
  github: "https://github.com/JeremyNanasi/Dev/tree/main/developer-main-projects/Pokedex",
},
  };

  const techIconMap = {
    HTML: "./img/icons/HTML5.svg",
    CSS: "./img/icons/css3.svg",
    JavaScript: "./img/icons/JS.svg",
    Firebase: "./img/icons/firebase.svg",
    "REST API": "./img/icons/rest-api.svg",
  };

  const projectKeys = Object.keys(projects);

  const openOverlay = (key) => {
    const data = projects[key];
    if (!data) return;

    projectOverlay.querySelector(".project-overlay__number").textContent = data.number;
    projectOverlay.querySelector(".project-overlay__name").textContent = data.name;
    projectOverlay.querySelector(".project-overlay__subtitle").textContent = data.subtitle;
    projectOverlay.querySelector(".project-overlay__desc").textContent = data.desc;

    const techsEl = projectOverlay.querySelector(".project-overlay__techs");
    techsEl.innerHTML = data.techs.map((t) => {
      const icon = techIconMap[t] ? `<img class="project-overlay__tech-icon" src="${techIconMap[t]}" alt="">` : "";
      return `<span class="project-overlay__tech">${icon}${t}</span>`;
    }).join("");

    const buttonsEl = projectOverlay.querySelector(".project-overlay__buttons");
    buttonsEl.innerHTML = "";
    if (data.liveDemo) {
      buttonsEl.innerHTML += `<a class="project-overlay__btn" href="${data.liveDemo}" target="_blank" rel="noopener noreferrer">Live Demo</a>`;
    }
    if (data.github) {
      buttonsEl.innerHTML += `<a class="project-overlay__btn" href="${data.github}" target="_blank" rel="noopener noreferrer">GitHub</a>`;
    }

    const img = projectOverlay.querySelector(".project-overlay__img");
    img.src = data.img;
    img.alt = data.imgAlt;

    const nextIndex = (projectKeys.indexOf(key) + 1) % projectKeys.length;
    const nextKey = projectKeys[nextIndex];
    const nextEl = projectOverlay.querySelector(".project-overlay__next");
    nextEl.textContent = "Next: " + projects[nextKey].name + " →";
    nextEl.dataset.project = nextKey;

    projectOverlay.dataset.current = key;
    projectOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeOverlay = () => {
    projectOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  document.querySelectorAll(".project-row").forEach((row) => {
    row.addEventListener("click", () => {
      const key = row.dataset.project;
      if (key) openOverlay(key);
    });
  });

  projectOverlay.querySelector(".project-overlay__close").addEventListener("click", closeOverlay);

  projectOverlay.addEventListener("click", (e) => {
    if (e.target === projectOverlay) closeOverlay();
  });

  projectOverlay.querySelector(".project-overlay__next").addEventListener("click", (e) => {
    e.preventDefault();
    const key = e.currentTarget.dataset.project;
    if (key) openOverlay(key);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && projectOverlay.getAttribute("aria-hidden") === "false") {
      closeOverlay();
    }
  });
}
