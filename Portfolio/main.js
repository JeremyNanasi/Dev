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
          if (window.innerWidth >= 768) closeMenu();
        });
      }