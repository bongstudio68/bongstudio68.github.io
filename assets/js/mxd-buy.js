;(() => {
  // Base AccessTrade cho Bongstudio
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
    if (!base) return originUrl; // không có base thì bắn thẳng link gốc

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

  // Tìm data-* trên nút hoặc thẻ cha
  function findData(el, key) {
    if (!el) return "";
    if (el.dataset && el.dataset[key]) return el.dataset[key];
    const parent = el.closest("[data-" + key + "]");
    return parent && parent.dataset ? parent.dataset[key] || "" : "";
  }

  function getOrigin(btn) {
    // Ưu tiên data-origin / data-origin-url
    const fromData = findData(btn, "origin") || findData(btn, "originUrl");
    if (fromData) return fromData;

    // Fallback: lấy luôn href nếu là link tuyệt đối http/https
    const href = btn.getAttribute("href") || "";
    if (/^https?:\/\//i.test(href)) return href;

    return "";
  }

  function getMerchant(btn) {
    const m =
      (findData(btn, "merchant") || "").toLowerCase().trim();
    if (m) return m;
    return "shopee";
  }

  function getSku(btn) {
    return (
      findData(btn, "sku") ||
      findData(btn, "id") ||
      btn.getAttribute("data-sku") ||
      ""
    );
  }

  function handleClick(e) {
    // Bắt TẤT CẢ các nút trong khối sản phẩm
    const btn = e.target.closest(
      "#productGrid a, .js-mxd-buy, .js-buy-btn, .btn-buy, [data-role='buy-button']"
    );
    if (!btn) return;

    const origin = getOrigin(btn);
    if (!origin) {
      // Không có link gốc thì thôi, cho nó đi theo href mặc định
      return;
    }

    e.preventDefault();

    const merchant = getMerchant(btn);
    const sku = getSku(btn);

    const finalUrl = makeIsclixUrl(origin, merchant, sku);
    if (!finalUrl) return;

    window.open(finalUrl, "_blank", "noopener,noreferrer");
  }

  document.addEventListener("click", handleClick, false);
})();
