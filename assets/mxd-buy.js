// mxd-buy.js — Bongstudio68 canon
// Nhiệm vụ: đọc affiliates.json, map theo tên sản phẩm,
// build deeplink AccessTrade (AFF_BASE Bong) và gắn vào nút "Mua ngay".

(() => {
  // Gốc deeplink của AccessTrade cho Bongstudio
  const AFF_BASE = {
    shopee:
      "https://go.isclix.com/deep_link/6837508078414670452/4751584435713464237",
    lazada:
      "https://go.isclix.com/deep_link/6837508078414670452/5127144557053758578",
    tiktok:
      "https://go.isclix.com/deep_link/6837508078414670452/6648523843406889655",
    // nếu sau này có thêm tiki thì ta bổ sung vào đây
    tiki:
      "https://go.isclix.com/deep_link/6837508078414670452/4348614231480407268",
  };

  // UTM chung cho Bongstudio
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
      merchant ? "sub2=" + encodeURIComponent(merchant) : "",
    ].filter(Boolean);

    return head + "&" + params.join("&");
  }

  // --- phần generic: load JSON, map theo tên, gắn nút mua ---

  function normalizeText(str) {
    if (!str) return "";
    return String(str)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^\p{Letter}\p{Number}\s]/gu, "")
      .trim();
  }

  async function loadProducts() {
    // Nếu sau này mình có mxdAffiliate.load() thì ưu tiên dùng
    if (window.mxdAffiliate && typeof window.mxdAffiliate.load === "function") {
      try {
        return await window.mxdAffiliate.load();
      } catch (err) {
        console.warn(
          "mxd-buy(Bong): mxdAffiliate.load() lỗi, fallback fetch JSON",
          err
        );
      }
    }

    // Fallback: đọc trực tiếp affiliates.json
    try {
      const res = await fetch(
        "/assets/data/affiliates.json?ts=" + Date.now(),
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(res.status + " " + res.statusText);
      const raw = await res.json();

      if (Array.isArray(raw)) return raw;
      if (raw && Array.isArray(raw.items)) return raw.items;
      if (raw && Array.isArray(raw.products)) return raw.products;
      return [];
    } catch (err) {
      console.error("mxd-buy(Bong): không load được affiliates.json", err);
      return [];
    }
  }

  function buildNameMap(list) {
    const map = new Map();
    list.forEach((item, index) => {
      const key = normalizeText(item.name || item.title || "");
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, { item, index });
      }
    });
    return map;
  }

  function pickTitleEl(card) {
    const selectors = [
      ".product-title",
      ".product-name",
      "h3",
      "h2",
      "h4",
      ".title",
      ".card-title",
    ];
    for (const sel of selectors) {
      const el = card.querySelector(sel);
      if (el && normalizeText(el.textContent).length > 0) return el;
    }
    return null;
  }

  function pickBuyButton(card) {
    const selectors = [
      ".product-buy",
      ".btn-buy",
      ".buy-btn",
      "[data-mxd-buy]",
      "a.btn",
      "button",
    ];
    for (const sel of selectors) {
      const el = card.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function extractOrigin(item) {
    return (
      item.origin_url ||
      item.origin ||
      item.url ||
      item.originUrl ||
      item.product_url ||
      ""
    );
  }

  function extractSku(item) {
    return item.sku || item.id || item.code || item.product_id || "";
  }

  async function setupBuyButtons() {
    const products = await loadProducts();
    if (!products || !products.length) {
      console.warn("mxd-buy(Bong): không có dữ liệu sản phẩm");
      return;
    }

    const nameMap = buildNameMap(products);

    // 1) Danh sách trên store.html
    const cards = document.querySelectorAll(".product-card");
    cards.forEach((card, i) => {
      const titleEl = pickTitleEl(card);
      const buyBtn = pickBuyButton(card);
      if (!titleEl || !buyBtn) return;

      const key = normalizeText(titleEl.textContent);
      const match = nameMap.get(key);
      if (!match) {
        console.warn("mxd-buy(Bong): không khớp sản phẩm cho card", i, key);
        return;
      }

      const item = match.item;
      const originUrl = extractOrigin(item);
      let merchant =
        item.merchant || item.san || item.platform || item.source || "shopee";
      merchant = normalizeMerchant(merchant);
      const sku = extractSku(item);

      const base = AFF_BASE[merchant];
      const finalUrl = makeIsclixUrl(base, originUrl, sku, merchant);

      if (!finalUrl || finalUrl === "#") return;

      if (buyBtn.tagName === "A") {
        buyBtn.setAttribute("href", finalUrl);
        if (!buyBtn.hasAttribute("target")) {
          buyBtn.setAttribute("target", "_blank");
        }

        const relParts = (buyBtn.getAttribute("rel") || "")
          .split(/\s+/)
          .filter(Boolean);
        if (!relParts.includes("nofollow")) relParts.push("nofollow");
        if (!relParts.includes("noopener")) relParts.push("noopener");
        buyBtn.setAttribute("rel", relParts.join(" "));
      } else {
        buyBtn.addEventListener(
          "click",
          () => {
            window.open(finalUrl, "_blank", "noopener");
          },
          { passive: true }
        );
      }
    });

    // 2) Nếu có trang chi tiết g.html, dùng [data-mxd-detail-name] + [data-mxd-detail-buy]
    const detailNameEl = document.querySelector("[data-mxd-detail-name]");
    const detailBuyBtn = document.querySelector("[data-mxd-detail-buy]");
    if (detailNameEl && detailBuyBtn) {
      const key = normalizeText(detailNameEl.textContent);
      const match = nameMap.get(key);
      if (!match) {
        console.warn("mxd-buy(Bong): không khớp chi tiết sản phẩm", key);
        return;
      }

      const item = match.item;
      const originUrl = extractOrigin(item);
      let merchant =
        item.merchant || item.san || item.platform || item.source || "shopee";
      merchant = normalizeMerchant(merchant);
      const sku = extractSku(item);

      const base = AFF_BASE[merchant];
      const finalUrl = makeIsclixUrl(base, originUrl, sku, merchant);

      if (!finalUrl || finalUrl === "#") return;

      if (detailBuyBtn.tagName === "A") {
        detailBuyBtn.setAttribute("href", finalUrl);
        if (!detailBuyBtn.hasAttribute("target")) {
          detailBuyBtn.setAttribute("target", "_blank");
        }
        const relParts = (detailBuyBtn.getAttribute("rel") || "")
          .split(/\s+/)
          .filter(Boolean);
        if (!relParts.includes("nofollow")) relParts.push("nofollow");
        if (!relParts.includes("noopener")) relParts.push("noopener");
        detailBuyBtn.setAttribute("rel", relParts.join(" "));
      } else {
        detailBuyBtn.addEventListener(
          "click",
          () => {
            window.open(finalUrl, "_blank", "noopener");
          },
          { passive: true }
        );
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupBuyButtons);
  } else {
    setupBuyButtons();
  }
})();
