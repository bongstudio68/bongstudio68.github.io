// REPLACE WHOLE FILE: /assets/js/mxd-affiliate.js
(() => {
  // Base deeplink AccessTrade cho từng sàn
  const AFF_BASE = {
    shopee: "https://go.isclix.com/deep_link/6837508078414670452/4751584435713464237",
    lazada: "https://go.isclix.com/deep_link/6837508078414670452/5127144557053758578",
    tiktok: "https://go.isclix.com/deep_link/6837508078414670452/6648523843406889655"
  };

  // UTM theo hostname hiện tại
  const host = location.hostname || "bongstudio68.github.io";
  const UTM_BASE =
    "utm_source=" + encodeURIComponent(host) +
    "&utm_medium=affiliate";

  function makeIsclixUrl(base, originUrl, sku, merchant) {
    // Nếu không có base hoặc không có link gốc thì trả về link gốc
    if (!base || !originUrl) return originUrl || "";

    const sep  = base.includes("?") ? "&" : "?";
    const head = base + sep + "url=" + encodeURIComponent(originUrl);

    const params = [
      UTM_BASE,
      "utm_campaign=" + encodeURIComponent(merchant || ""),
      "sub1=" + encodeURIComponent(sku || ""),
      "sub2=" + encodeURIComponent(merchant || "")
    ];

    return head + "&" + params.join("&");
  }

  function rewrite() {
    const metas = document.querySelectorAll("a.product-meta[data-sku]");
    metas.forEach(meta => {
      const sku = meta.getAttribute("data-sku") || "";
      let merchant = (meta.getAttribute("data-merchant") || "")
        .toLowerCase()
        .trim();

      // Nếu không có merchant (hoặc không map trong AFF_BASE) thì bỏ qua
      if (!merchant || !AFF_BASE[merchant]) return;

      const originMetaUrl = meta.getAttribute("href") || "";
      const base = AFF_BASE[merchant];

      let sib = meta.nextElementSibling;
      let hadBuy = false;

      // Ưu tiên rewrite nút .buy bên cạnh thẻ meta
      while (sib && sib.tagName) {
        if (sib.classList && sib.classList.contains("buy")) {
          hadBuy = true;
          const origin = sib.getAttribute("href") || originMetaUrl;
          const aff = makeIsclixUrl(base, origin, sku, merchant);
          sib.setAttribute("href", aff);
          sib.setAttribute("rel", "nofollow noopener");
        }
        sib = sib.nextElementSibling;
      }

      // Nếu không có nút .buy thì rewrite luôn link trong meta
      if (!hadBuy && originMetaUrl) {
        const aff = makeIsclixUrl(base, originMetaUrl, sku, merchant);
        meta.setAttribute("href", aff);
        meta.setAttribute("rel", "nofollow noopener");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", rewrite);
  } else {
    rewrite();
  }
})();
