;(() => {
  // Base AccessTrade mới cho Bongstudio
  const AFF_BASE = {
    shopee: "https://go.isclix.com/deep_link/6837508078414670452/4751584435713464237",
    lazada: "https://go.isclix.com/deep_link/6837508078414670452/5127144557053758578",
    tiktok: "https://go.isclix.com/deep_link/6837508078414670452/6648523843406889655"
  };

  const UTM_BASE =
    "utm_source=" +
    encodeURIComponent(location.hostname) +
    "&utm_medium=affiliate";

  function makeIsclixUrl(originUrl, merchant, sku) {
    if (!originUrl) return "";
    const base = AFF_BASE[merchant] || "";
    if (!base) return originUrl; // không có base thì bắn thẳng về link gốc

    const sep = base.includes("?") ? "&" : "?";
    const head = base + sep + "url=" + encodeURIComponent(originUrl);
    const params = [
      UTM_BASE,
      "utm_campaign=" + encodeURIComponent(merchant || ""),
      "sub1=" + encodeURIComponent(sku || ""),
      "sub2=" + encodeURIComponent(merchant || "")
    ];
    return head + "&" + params.join("&");
  }

  // Lấy data-* từ nút hoặc thẻ cha gần nhất
  function findData(el, key) {
    if (!el) return "";
    if (el.dataset && el.dataset[key]) return el.dataset[key];
    const parent = el.closest("[data-" + key + "]");
    return parent && parent.dataset ? parent.dataset[key] || "" : "";
  }

  function handleClick(e) {
    const btn = e.target.closest(
      ".js-mxd-buy, .js-buy-btn, [data-role='buy-button']"
    );
    if (!btn) return;

    e.preventDefault();

    const origin =
      findData(btn, "origin") || findData(btn, "originUrl");
    const merchant = (findData(btn, "merchant") || "shopee").toLowerCase();
    const sku = findData(btn, "sku") || findData(btn, "id") || "";

    if (!origin) {
      console.warn("[mxd-buy] Không tìm thấy data-origin trên nút mua", btn);
      return;
    }

    const finalUrl = makeIsclixUrl(origin, merchant, sku);
    if (!finalUrl) {
      console.warn("[mxd-buy] Không tạo được URL mua", {
        origin,
        merchant,
        sku
      });
      return;
    }

    window.open(finalUrl, "_blank", "noopener,noreferrer");
  }

  document.addEventListener("click", handleClick, false);
})();
