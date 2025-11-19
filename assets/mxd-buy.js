;(() => {
  // Gốc deeplink của AccessTrade cho Bongstudio
  const AFF_BASE = {
    shopee: "https://go.isclix.com/deep_link/6837508078414670452/4751584435713464237",
    lazada: "https://go.isclix.com/deep_link/6837508078414670452/5127144557053758578",
    tiktok: "https://go.isclix.com/deep_link/6837508078414670452/6648523843406889655"
    // nếu sau này có thêm tiki thì ta bổ sung vào đây
  };

  const UTM_BASE =
    "utm_source=" +
    encodeURIComponent(location.hostname) +
    "&utm_medium=affiliate";

  function normalizeMerchant(raw) {
    if (!raw) return "";
    const v = String(raw).toLowerCase();
    if (v.includes("shopee")) return "shopee";
    if (v.includes("lazada")) return "lazada";
    if (v.includes("tiktok") || v.includes("tiktokshop")) return "tiktok";
    if (v.includes("tiki")) return "tiki";
    return v;
  }

  function makeIsclixUrl(base, originUrl, sku, merchant) {
    if (!originUrl) return "#";
    if (!base) return originUrl; // phòng trường hợp thiếu cấu hình

    const sep = base.includes("?") ? "&" : "?";
    const head = base + sep + "url=" + encodeURIComponent(originUrl);

    const params = [
      UTM_BASE,
      "utm_campaign=" + encodeURIComponent(merchant || ""),
      sku ? "sub1=" + encodeURIComponent(sku) : "",
      merchant ? "sub2=" + encodeURIComponent(merchant) : ""
    ].filter(Boolean);

    return head + "&" + params.join("&");
  }

  function rewriteBuyLinks() {
    // CHÚ Ý: chỉ đụng vào những phần tử có data-mxd-buy
    const els = document.querySelectorAll("[data-mxd-buy]");

    els.forEach((el) => {
      const origin =
        el.getAttribute("data-origin") || el.dataset.origin || "";
      const merchant = normalizeMerchant(
        el.getAttribute("data-merchant") || el.dataset.merchant || ""
      );
      const sku =
        el.getAttribute("data-sku") ||
        el.dataset.sku ||
        el.getAttribute("data-id") ||
        "";

      if (!origin || !merchant) return;

      const base = AFF_BASE[merchant];
      const finalUrl = makeIsclixUrl(base, origin, sku, merchant);

      if (el.tagName === "A") {
        el.setAttribute("href", finalUrl);
        if (!el.hasAttribute("target")) {
          el.setAttribute("target", "_blank");
        }

        const relParts = (el.getAttribute("rel") || "")
          .split(/\s+/)
          .filter(Boolean);
        if (!relParts.includes("nofollow")) relParts.push("nofollow");
        if (!relParts.includes("noopener")) relParts.push("noopener");
        el.setAttribute("rel", relParts.join(" "));
      } else {
        el.addEventListener(
          "click",
          (e) => {
            window.open(finalUrl, "_blank");
          },
          { passive: true }
        );
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", rewriteBuyLinks);
  } else {
    rewriteBuyLinks();
  }
})();
