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

const contactForm = document.querySelector("#contact-form");

if (contactForm instanceof HTMLFormElement) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const statusElement = document.querySelector("#form-status");

  const setFormStatus = (state, message) => {
    if (!statusElement) {
      return;
    }

    statusElement.textContent = message;
    statusElement.classList.remove("is-success", "is-error");

    if (state === "success") {
      statusElement.classList.add("is-success");
    }

    if (state === "error") {
      statusElement.classList.add("is-error");
    }
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormStatus("", "");

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const formData = new FormData(contactForm);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      privacyAccepted: formData.get("privacy") === "on",
    };

    const defaultLabel = "Say Hello ;)";

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const response = await fetch("./email.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let result = null;

      try {
        result = await response.json();
      } catch (_error) {
        result = null;
      }

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Mail delivery failed");
      }

      contactForm.reset();
      setFormStatus("success", "Message sent successfully.");
    } catch (error) {
      console.error("Contact form request failed:", error);
      setFormStatus("error", "Sending failed. Please try again.");
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
        submitButton.textContent = defaultLabel;
      }
    }
  });
}
