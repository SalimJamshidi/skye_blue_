// JavaScript business data: update these arrays to change the items shown on the page.
// Product details are informational examples; availability and specifications vary by shop.
const shopCatalog = {
  products: [
    {
      name: "Vape devices",
      description: "Ask our team about device types and their features.",
    },
    {
      name: "Accessories",
      description: "Visit in store to learn about compatible accessories.",
    },
    {
      name: "E-liquids",
      description: "Ask about current options and product information.",
    },
  ],
  drinks: [
    {
      name: "Cold drinks",
      description: "Ask our team which chilled refreshments are available today.",
    },
    {
      name: "Bottled drinks",
      description: "The in-store selection may vary by location and season.",
    },
  ],
};

// jQuery interactivity: render catalog data as text-safe cards and animate them in.
$(function () {
  const $navigation = $("#site-navigation");
  const $menuToggle = $(".menu-toggle");
  const $menuClose = $(".menu-close");
  const $menuBackdrop = $(".menu-backdrop");
  const mobileMenuQuery = window.matchMedia("(max-width: 767px)");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // jQuery interactivity: keep the current page visibly identified in every navigation.
  function getCurrentNavigationPage() {
    if (window.location.hash === "#about") {
      return "about";
    }

    const pageName = window.location.pathname.split("/").pop();
    if (pageName === "vapes.html") {
      return "vapes";
    }
    if (pageName === "drinks.html") {
      return "drinks";
    }
    return "home";
  }

  const activeNavigationPage = getCurrentNavigationPage();
  $navigation.find("a[data-page]").each(function () {
    const isCurrentPage = $(this).data("page") === activeNavigationPage;
    $(this)
      .toggleClass("nav-is-active", isCurrentPage)
      .attr("aria-current", isCurrentPage ? "page" : null);
  });

  // jQuery interactivity: give navigation links a subtle pointer and keyboard hover tint.
  $navigation
    .on("mouseenter focusin", "a", function () {
      $(this).addClass("nav-is-hovered");
    })
    .on("mouseleave focusout", "a", function () {
      $(this).removeClass("nav-is-hovered");
    });

  // Mobile home-page greeting fades away after three seconds or the first scroll.
  const currentPage = window.location.pathname.split("/").pop();
  if (mobileMenuQuery.matches && (!currentPage || currentPage === "index.html")) {
    const $welcomeToast = $("<div>", {
      class: "welcome-toast",
      role: "status",
      "aria-live": "polite",
      text: "Welcome to Skye Blue — tap to explore!",
    }).appendTo("body");
    let welcomeToastTimer;

    function dismissWelcomeToast() {
      window.clearTimeout(welcomeToastTimer);
      $(window).off("scroll.welcomeToast");

      if (prefersReducedMotion) {
        $welcomeToast.hide();
      } else {
        $welcomeToast.stop(true, true).fadeOut(220);
      }
    }

    if (prefersReducedMotion) {
      $welcomeToast.show();
    } else {
      $welcomeToast.hide().fadeIn(350);
    }

    welcomeToastTimer = window.setTimeout(dismissWelcomeToast, 3000);
    $(window).one("scroll.welcomeToast", dismissWelcomeToast);
  }

  function setMenuState(isOpen, returnFocus = false) {
    const menuWidth = $navigation.outerWidth();

    $navigation.stop(true, true);
    $menuBackdrop.stop(true, true);
    $menuToggle.attr("aria-expanded", String(isOpen));
    $menuToggle.attr(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu",
    );

    if (isOpen) {
      $("body").addClass("menu-open");
      $navigation.removeAttr("inert").attr("aria-hidden", "false");
      $menuBackdrop.prop("hidden", false).css("opacity", 0);

      if (prefersReducedMotion) {
        $navigation.css("right", 0);
        $menuBackdrop.css("opacity", 1);
      } else {
        $navigation.animate({ right: 0 }, 280);
        $menuBackdrop.animate({ opacity: 1 }, 220);
      }

      $menuClose.trigger("focus");
      return;
    }

    $navigation.attr("aria-hidden", "true");
    $navigation.attr("inert", "");
    $("body").removeClass("menu-open");

    if (prefersReducedMotion || !mobileMenuQuery.matches) {
      $navigation.css("right", -menuWidth);
      $menuBackdrop.css("opacity", 0).prop("hidden", true);
    } else {
      $navigation.animate({ right: -menuWidth }, 240);
      $menuBackdrop.animate({ opacity: 0 }, 220, function () {
        $(this).prop("hidden", true);
      });
    }

    if (returnFocus) {
      $menuToggle.trigger("focus");
    }
  }

  function syncMenuForViewport() {
    if (!mobileMenuQuery.matches) {
      $navigation.stop(true, true).css("right", "").removeAttr("inert").attr("aria-hidden", "false");
      $menuToggle.attr("aria-expanded", "false").attr("aria-label", "Open navigation menu");
      $menuBackdrop.stop(true, true).prop("hidden", true);
      $("body").removeClass("menu-open");
    } else if ($menuToggle.attr("aria-expanded") !== "true") {
      $navigation.attr("aria-hidden", "true").attr("inert", "").css("right", -$navigation.outerWidth());
    }
  }

  syncMenuForViewport();
  if (typeof mobileMenuQuery.addEventListener === "function") {
    mobileMenuQuery.addEventListener("change", syncMenuForViewport);
  } else {
    mobileMenuQuery.addListener(syncMenuForViewport);
  }

  // Mobile swipe navigation follows the same Home, Vapes, Drinks, About order as the site.
  const swipePages = [
    { name: "Home", href: "index.html" },
    { name: "Vapes", href: "vapes.html" },
    { name: "Drinks", href: "drinks.html" },
    { name: "About", href: "index.html#about" },
  ];
  const $main = $("main");
  let swipeStart = null;
  let swipeNavigationPending = false;

  function getCurrentSwipePageIndex() {
    const pageName = window.location.pathname.split("/").pop();

    if (pageName === "vapes.html") {
      return 1;
    }
    if (pageName === "drinks.html") {
      return 2;
    }
    if (window.location.hash === "#about") {
      return 3;
    }
    return 0;
  }

  function navigateBySwipe(direction) {
    if (
      !mobileMenuQuery.matches ||
      $menuToggle.attr("aria-expanded") === "true" ||
      swipeNavigationPending
    ) {
      return;
    }

    const targetIndex = getCurrentSwipePageIndex() + direction;
    const targetPage = swipePages[targetIndex];

    if (!targetPage) {
      return;
    }

    swipeNavigationPending = true;
    if (prefersReducedMotion) {
      window.location.assign(targetPage.href);
      return;
    }

    const transitionClass = direction > 0
      ? "swipe-transition--next"
      : "swipe-transition--previous";
    $main.attr("aria-busy", "true");
    window.requestAnimationFrame(() => {
      $main.addClass(transitionClass);
    });
    window.setTimeout(() => {
      window.location.assign(targetPage.href);
    }, 190);
  }

  // Let vertical movement scroll naturally; horizontal swipes change pages after a clear threshold.
  if ($main.length) {
    $main[0].addEventListener(
      "touchstart",
      (event) => {
        if (
          !mobileMenuQuery.matches ||
          event.touches.length !== 1 ||
          $(event.target).closest(
            "a, button, input, select, textarea, [contenteditable='true'], [role='button']:not(.product-card)",
          ).length
        ) {
          swipeStart = null;
          return;
        }

        swipeStart = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      },
      { passive: true },
    );

    $main[0].addEventListener(
      "touchend",
      (event) => {
        if (!swipeStart || event.changedTouches.length !== 1) {
          swipeStart = null;
          return;
        }

        const deltaX = event.changedTouches[0].clientX - swipeStart.x;
        const deltaY = event.changedTouches[0].clientY - swipeStart.y;
        swipeStart = null;

        if (Math.abs(deltaX) < 70 || Math.abs(deltaX) < Math.abs(deltaY) * 1.35) {
          return;
        }

        navigateBySwipe(deltaX < 0 ? 1 : -1);
      },
      { passive: true },
    );

    $main[0].addEventListener("touchcancel", () => {
      swipeStart = null;
    }, { passive: true });
  }

  function renderCards(items, containerSelector) {
    const $container = $(containerSelector);

    if (!$container.length || $container.children().length > 0) {
      return;
    }

    items.forEach((item, index) => {
      const $card = $("<article>", {
        class: "product-card",
        "aria-label": item.name,
        role: "button",
        tabindex: 0,
        "aria-pressed": "false",
      });

      $("<h3>").text(item.name).appendTo($card);
      $("<p>").text(item.description).appendTo($card);
      $card.css("opacity", 0).appendTo($container);

      if (prefersReducedMotion) {
        $card.css("opacity", 1);
      } else {
        $card.delay(index * 100).animate({ opacity: 1 }, 350);
      }
    });
  }

  renderCards(shopCatalog.products, "#vape-products");
  renderCards(shopCatalog.drinks, "#drink-options");
  $("#current-year").text(new Date().getFullYear());

  // jQuery interactivity: smoothly scroll to anchors within the current page.
  $("a[href]").on("click", function (event) {
    const destination = new URL(this.href, window.location.href);
    const isCurrentDocument = destination.pathname === window.location.pathname;
    const target = isCurrentDocument && destination.hash
      ? document.querySelector(destination.hash)
      : null;

    if (!target) {
      return;
    }

    event.preventDefault();
    if (mobileMenuQuery.matches && $menuToggle.attr("aria-expanded") === "true") {
      setMenuState(false);
    }

    if (prefersReducedMotion) {
      target.scrollIntoView();
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (window.location.hash !== destination.hash) {
      window.history.replaceState(null, "", destination.hash);
    }
  });

  // jQuery interactivity: accessible mobile navigation toggle.
  $menuToggle.on("click", function () {
    setMenuState($menuToggle.attr("aria-expanded") !== "true");
  });

  $menuClose.add($menuBackdrop).on("click", function () {
    setMenuState(false, true);
  });

  $(document).on("keydown", function (event) {
    if (event.key === "Escape" && $menuToggle.attr("aria-expanded") === "true") {
      setMenuState(false, true);
    }
  });

  $(document).on("click", function (event) {
    const clickedInsideMenu = $(event.target).closest(
      "#site-navigation, .menu-toggle, .menu-backdrop",
    ).length;

    if (
      mobileMenuQuery.matches &&
      $menuToggle.attr("aria-expanded") === "true" &&
      !clickedInsideMenu
    ) {
      setMenuState(false);
    }
  });

  $navigation.find("a").on("click", function () {
    if (mobileMenuQuery.matches && $menuToggle.attr("aria-expanded") === "true") {
      setMenuState(false);
    }
  });

  // jQuery interactivity: let product cards toggle a visible, accessible selection.
  function toggleProductSelection(card) {
    const $card = $(card);
    const isSelected = $card.attr("aria-pressed") !== "true";

    $card
      .attr("aria-pressed", String(isSelected))
      .toggleClass("is-selected", isSelected);
  }

  $(document).on("click", ".product-card", function () {
    toggleProductSelection(this);
  });

  $(document).on("keydown", ".product-card", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleProductSelection(this);
    }
  });

  // jQuery interactivity: add a visible highlight while cards receive pointer or keyboard focus.
  $(document)
    .on("mouseenter focusin", ".product-card", function () {
      $(this).addClass("is-highlighted");
    })
    .on("mouseleave focusout", ".product-card", function () {
      $(this).removeClass("is-highlighted");
    });
});
