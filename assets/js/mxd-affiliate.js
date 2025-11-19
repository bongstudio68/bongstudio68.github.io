<!-- REPLACE WHOLE FILE: /assets/mxd-affiliate.js -->
<script>
// MXD-AFF-BONGSTUDIO: base AccessTrade cho toàn repo Bongstudio
;(function (global) {
  // Publisher ID riêng của Bongstudio
  const PUB_ID = "6837508078414670452";

  // ADV ID cố định của từng sàn (AccessTrade)
  const CAMPAIGN = {
    shopee: "4751584435713464237",
    lazada: "5127144557053758578",
    tiktok: "6648523843406889655",
    tiki:   "4348614231480407268"
  };

  // Base cho từng sàn – phần sau sẽ ghép thêm url= & sub1–4
  const AFF_BASE = {
    shopee: `https://go.isclix.com/deep_link/${PUB_ID}/${CAMPAIGN.shopee}`,
    lazada: `https://go.isclix.com/deep_link/${PUB_ID}/${CAMPAIGN.lazada}`,
    tiktok: `https://go.isclix.com/deep_link/${PUB_ID}/${CAMPAIGN.tiktok}`,
    tiki:   `https://go.isclix.com/deep_link/${PUB_ID}/${CAMPAIGN.tiki}`
  };

  function make(merchant, originUrl, opts) {
    const m = (merchant || "shopee").toLowerCase();
    const base = AFF_BASE[m];
    if (!base || !originUrl) return originUrl;

    const sku  = (opts && opts.sku)  || "";
    const sub1 = sku || (opts && opts.sub1) || "";
    const sub2 = (opts && opts.sub2) || m;
    const sub3 = (opts && opts.sub3) || "bongstudio";
    const sub4 = (opts && opts.sub4) || (location.hostname || "");

    const head = `${base}?url=${encodeURIComponent(originUrl)}`;
    const qs = [
      `sub1=${encodeURIComponent(sub1)}`,
      `sub2=${encodeURIComponent(sub2)}`,
      `sub3=${encodeURIComponent(sub3)}`,
      `sub4=${encodeURIComponent(sub4)}`
    ];

    return head + "&" + qs.join("&");
  }

  // Xuất 1 object dùng chung cho mxd-buy hoặc chỗ khác nếu cần
  global.mxdAffiliate = {
    PUB_ID,
    CAMPAIGN,
    AFF_BASE,
    make
  };
})(window);
</script>
