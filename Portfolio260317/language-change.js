const LANGUAGE_STORAGE_KEY = "portfolio-language";
let currentLanguage = "en";
let rebuildTickerTrack = () => {};

const getTranslation = (language, key) => {
  const languageTable = TRANSLATIONS[language] || TRANSLATIONS.en;
  return languageTable[key] ?? TRANSLATIONS.en[key] ?? "";
};

const setElementText = (selector, key) => {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = getTranslation(currentLanguage, key);
  }
};

const setElementHtml = (selector, key) => {
  const element = document.querySelector(selector);

  if (element) {
    element.innerHTML = getTranslation(currentLanguage, key);
  }
};

const setElementAttribute = (selector, attribute, key) => {
  const element = document.querySelector(selector);

  if (element) {
    element.setAttribute(attribute, getTranslation(currentLanguage, key));
  }
};

const setElementPlaceholder = (selector, key) => {
  const element = document.querySelector(selector);

  if (element instanceof HTMLInputElement) {
    element.setAttribute("placeholder", getTranslation(currentLanguage, key));
  }
};

const applyTickerTranslation = () => {
  const templateRow = document.querySelector(
    ".ticker__row[data-ticker-template='true']",
  );

  if (!(templateRow instanceof HTMLElement)) {
    return;
  }

  const tickerKeys = [
    "ticker_available",
    "ticker_dot",
    "ticker_developer",
    "ticker_dot",
    "ticker_based",
    "ticker_dot",
    "ticker_open",
    "ticker_dot",
  ];

  const tickerParts = templateRow.querySelectorAll("span");

  tickerKeys.forEach((key, index) => {
    if (tickerParts[index]) {
      tickerParts[index].textContent = getTranslation(currentLanguage, key);
    }
  });

  rebuildTickerTrack();
};

const applyLanguage = (language) => {
  currentLanguage = language === "de" ? "de" : "en";
  document.documentElement.setAttribute("lang", currentLanguage);

  const languageButtons = Array.from(
    document.querySelectorAll(".lang-toggle__btn[data-lang]"),
  );

  languageButtons.forEach((button) => {
    const buttonLanguage = button.dataset.lang === "de" ? "de" : "en";
    const isActive = buttonLanguage === currentLanguage;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  setElementAttribute(".lang-toggle", "aria-label", "aria_language_toggle");
  setElementAttribute(".menu-toggle", "aria-label", "aria_toggle_navigation");
  setElementAttribute("#primary-nav", "aria-label", "aria_primary_navigation");
  setElementAttribute(".brand", "aria-label", "aria_back_to_top");
  setElementAttribute(".side--left", "aria-label", "aria_scroll_hint");
  setElementAttribute(".scroll-dot", "aria-label", "aria_scroll_to_about");
  setElementAttribute(".side--right", "aria-label", "aria_contact_rail");
  setElementAttribute(".side-icons", "aria-label", "aria_social_links");
  setElementAttribute(
    ".icon-btn[href='https://github.com/JeremyNanasi']",
    "aria-label",
    "aria_github_profile",
  );
  setElementAttribute(".skills__right", "aria-label", "aria_skill_icons");
  setElementAttribute(".carousel", "aria-label", "aria_testimonials");
  setElementAttribute(".carousel__dots", "aria-label", "aria_pagination");
  setElementAttribute(".arrow--1-left", "aria-label", "aria_previous");
  setElementAttribute(".arrow--2-left", "aria-label", "aria_previous");
  setElementAttribute(".arrow--3-left", "aria-label", "aria_previous");
  setElementAttribute(".arrow--1-right", "aria-label", "aria_next");
  setElementAttribute(".arrow--2-right", "aria-label", "aria_next");
  setElementAttribute(".arrow--3-right", "aria-label", "aria_next");
  setElementAttribute(".dot[for='ts-1']", "aria-label", "aria_slide_1");
  setElementAttribute(".dot[for='ts-2']", "aria-label", "aria_slide_2");
  setElementAttribute(".dot[for='ts-3']", "aria-label", "aria_slide_3");
  setElementAttribute(".about__img", "alt", "image_alt_profile");

  setElementText(".nav__link[href='#about']", "nav_about");
  setElementText(".nav__link[href='#skills']", "nav_skills");
  setElementText(".nav__link[href='#projects']", "nav_projects");
  setElementText(".hero__role", "hero_role");
  setElementText(".hero__focus", "hero_focus");
  setElementText(".hero__actions .btn[href='#projects']", "hero_action_work");
  setElementText(".hero__actions .btn[href='#contact']", "hero_action_contact");

  applyTickerTranslation();

  setElementText("#about .eyebrow", "about_eyebrow");
  setElementText("#about .panel__title", "about_title");
  setElementText("#about .panel__text", "about_text");

  const aboutFeatureTexts = document.querySelectorAll("#about .feature__text");
  if (aboutFeatureTexts[0]) {
    aboutFeatureTexts[0].textContent = getTranslation(
      currentLanguage,
      "about_feature_1",
    );
  }
  if (aboutFeatureTexts[1]) {
    aboutFeatureTexts[1].textContent = getTranslation(
      currentLanguage,
      "about_feature_2",
    );
  }
  if (aboutFeatureTexts[2]) {
    aboutFeatureTexts[2].textContent = getTranslation(
      currentLanguage,
      "about_feature_3",
    );
  }

  setElementText("#skills .eyebrow", "skills_eyebrow");
  setElementText("#skills .panel__title", "skills_title");

  const skillTexts = document.querySelectorAll("#skills .panel__text");
  if (skillTexts[0]) {
    skillTexts[0].textContent = getTranslation(currentLanguage, "skills_text_1");
  }
  if (skillTexts[1]) {
    skillTexts[1].textContent = getTranslation(currentLanguage, "skills_text_2");
  }

  setElementText("#skills .panel__sub strong", "skills_need_strong");
  setElementText("#skills .panel__sub .accent", "skills_need_accent");
  setElementText("#skills .panel__muted", "skills_muted");
  setElementText("#skills .btn--small", "skills_cta");

  setElementText("#projects .eyebrow", "portfolio_eyebrow");
  setElementText("#projects .section-title", "projects_title");
  setElementText("#projects .section-desc", "projects_desc");

  setElementText("#testimonials .section-title", "testimonials_title");
  setElementText("#testimonials .slide--1 .quote__text", "quote_1_text");
  setElementText("#testimonials .slide--1 .quote__meta", "quote_1_meta");
  setElementText("#testimonials .slide--2 .quote__text", "quote_2_text");
  setElementText("#testimonials .slide--2 .quote__meta", "quote_2_meta");
  setElementText("#testimonials .slide--3 .quote__text", "quote_3_text");
  setElementText("#testimonials .slide--3 .quote__meta", "quote_3_meta");

  setElementText("#contact .eyebrow", "contact_eyebrow");
  setElementHtml("#contact .contact__title", "contact_title_html");
  setElementText("#contact .contact__subtitle", "contact_subtitle");

  const contactTexts = document.querySelectorAll("#contact .contact__text");
  if (contactTexts[0]) {
    contactTexts[0].textContent = getTranslation(currentLanguage, "contact_text_1");
  }
  if (contactTexts[1]) {
    contactTexts[1].innerHTML = getTranslation(currentLanguage, "contact_text_2_html");
  }

  setElementText(".field__label[for='name']", "form_label_name");
  setElementPlaceholder("#name", "form_placeholder_name");
  setElementText(".field__label[for='email']", "form_label_email");
  setElementPlaceholder("#email", "form_placeholder_email");
  setElementText(".field__label[for='message']", "form_label_message");
  setElementPlaceholder("#message", "form_placeholder_message");
  setElementHtml(".check__text", "form_privacy_html");

  const submitButton = document.querySelector("#contact-form button[type='submit']");
  if (submitButton instanceof HTMLButtonElement) {
    const labelKey =
      submitButton.dataset.submitting === "true"
        ? "form_submit_sending"
        : "form_submit_default";
    submitButton.textContent = getTranslation(currentLanguage, labelKey);
  }

  const statusElement = document.querySelector("#form-status");
  if (statusElement instanceof HTMLElement) {
    const statusKey = statusElement.dataset.i18nStatusKey;

    if (statusKey) {
      statusElement.textContent = getTranslation(currentLanguage, statusKey);
    }
  }

  const footerMeta = document.querySelectorAll(".footer__meta");
  if (footerMeta[0]) {
    footerMeta[0].textContent = getTranslation(currentLanguage, "footer_meta_role");
  }
  if (footerMeta[1]) {
    footerMeta[1].textContent = getTranslation(
      currentLanguage,
      "footer_meta_location",
    );
  }

  setElementText(
    ".footer__link[href='https://github.com/JeremyNanasi']",
    "footer_link_github",
  );
  setElementText(".footer__link[href='jeremynanasi@gmx.de']", "footer_link_email");
  setElementText(".footer__link[href='./impressum.html']", "footer_link_legal_notice");
};

const getStoredLanguage = () => {
  try {
    const storedValue = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (storedValue === "en" || storedValue === "de") {
      return storedValue;
    }
  } catch (_error) {
    return "en";
  }

  return "en";
};

const persistLanguage = (language) => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (_error) {}
};
