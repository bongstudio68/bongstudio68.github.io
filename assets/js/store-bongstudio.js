// REPLACE WHOLE FILE: /assets/js/store-bongstudio.js
// Load sản phẩm từ assets/json/bongstudio/*.json và render vào #productGrid

(function(){
  const API_LIST = "https://api.github.com/repos/bongstudio68/bongstudio68.github.io/contents/assets/json/bongstudio";
  const grid = document.getElementById("productGrid");
  const statusEl = document.getElementById("productStatus");
  const searchInput = document.getElementById("searchInput");
  const catFilter = document.getElementById("catFilter");

  const CAT_LABELS = {
    "gia-dung-decor": "Gia dụng, decor nhà cửa",
    "thoi-trang-nu": "Thời trang nữ",
    "thoi-trang-nam": "Thời trang nam",
    "quan-ao-em-be": "Quần áo em bé",
    "suc-khoe-tpcn": "Sức khoẻ, TPCN",
    "sach": "Sách",
    "do-an": "Đồ ăn",
    "khac": "Khác"
  };

  let allProducts = [];

  function escapeHtml(str){
    return String(str || "").replace(/[&<>"']/g, function(ch){
      return ({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        "\"":"&quot;",
        "'":"&#39;"
      })[ch];
    });
  }

  function formatPrice(p){
    const n = Number(p || 0);
    if(!n) return "Liên hệ";
    return n.toLocaleString("vi-VN") + "₫";
  }

  function normalizeProduct(raw){
    if(!raw || typeof raw !== "object") return null;
    return {
      name: raw.name || "",
      sku: raw.sku || "",
      price_vnd: raw.price_vnd || raw.price || 0,
      origin_url: raw.origin_url || raw.origin || "",
      deeplink: raw.deeplink || "",
      merchant: (raw.merchant || "").toLowerCase() || "shopee",
      image: raw.image || "",
      category: raw.category || "khac",
      brand: raw.brand || "",
      featured: !!raw.featured,
      status: (typeof raw.status === "boolean") ? raw.status : true,
      updated_at: raw.updated_at || raw.updatedAt || ""
    };
  }

  function render(list){
    if(!grid) return;
    if(!list.length){
      grid.innerHTML = "<p class='small'>Chưa có sản phẩm phù hợp. Thử đổi từ khoá hoặc danh mục khác nhé.</p>";
      return;
    }
    const html = list.map(function(p){
      const name = escapeHtml(p.name || "");
      const brand = escapeHtml(p.brand || "");
      const catLabel = CAT_LABELS[p.category] || p.category || "";
      const priceText = formatPrice(p.price_vnd);
      const img = p.image || "/assets/img/categories/thoi-trang.webp";
      const origin = p.origin_url || "#";
      // QUAN TRỌNG: luôn dùng link gốc làm href, tránh các đường dẫn nội bộ 404
      const href = origin;
      const sku = escapeHtml(p.sku || "");
      const merchant = escapeHtml(p.merchant || "");

      return (
        "<article class=\"product-card\"" +
        " data-sku=\"" + sku + "\"" +
        " data-merchant=\"" + merchant + "\"" +
        " data-origin=\"" + escapeHtml(origin) + "\"" +
        ">" +
          "<a class=\"thumb\" href=\"" + href + "\" target=\"_blank\" rel=\"nofollow noopener\">" +
            "<img loading=\"lazy\" src=\"" + escapeHtml(img) + "\" alt=\"" + name + "\"/>" +
          "</a>" +
          "<div class=\"product-card-body\">" +
            "<h3 class=\"product-card-title\">" + name + "</h3>" +
            "<div class=\"product-card-meta\">" +
              "<span class=\"product-price\">" + priceText + "</span>" +
              "<span class=\"product-brand\">" +
                (brand ? brand : (catLabel ? catLabel : "")) +
              "</span>" +
            "</div>" +
            "<div class=\"product-actions\">" +
              "<a class=\"btn-buy\" href=\"" + href + "\"" +
                " data-origin=\"" + escapeHtml(origin) + "\"" +
                " data-merchant=\"" + merchant + "\"" +
                " data-sku=\"" + sku + "\"" +
                " target=\"_blank\" rel=\"nofollow noopener\">" +
                "Xem / Mua" +
              "</a>" +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");
    grid.innerHTML = html;

    // Nếu mxd-affiliate.js có hook riêng thì vẫn gọi nhẹ cho nó
    try{
      if(window.MXD_AFF && typeof window.MXD_AFF.scan === "function"){
        window.MXD_AFF.scan();
      }
    }catch(_){}
  }

  function applyFilters(){
    let list = allProducts.slice();
    const q = (searchInput && searchInput.value || "").trim().toLowerCase();
    const cat = (catFilter && catFilter.value) || "";

    if(cat){
      list = list.filter(function(p){ return (p.category || "") === cat; });
    }
    if(q){
      list = list.filter(function(p){
        const name = (p.name || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        return name.indexOf(q) !== -1 || brand.indexOf(q) !== -1;
      });
    }
    render(list);
  }

  async function loadProducts(){
    if(!grid || !statusEl) return;
    statusEl.textContent = "Đang tải sản phẩm từ Bongstudio…";
    try{
      const res = await fetch(API_LIST + "?_=" + Date.now());
      if(!res.ok) throw new Error("HTTP " + res.status);
      const files = await res.json();
      const jsonFiles = (files || []).filter(function(f){
        return f && f.type === "file" && /\.json$/i.test(f.name || "");
      });
      if(!jsonFiles.length){
        statusEl.textContent = "Chưa có sản phẩm nào được đăng bằng tool Bongstudio.";
        grid.innerHTML = "";
        return;
      }

      const products = [];
      for(const f of jsonFiles){
        try{
          const r = await fetch((f.download_url || "") + "?_=" + Date.now());
          if(!r.ok) continue;
          const data = await r.json();
          const p = normalizeProduct(data);
          if(p && p.status !== false && p.origin_url){
            products.push(p);
          }
        }catch(e){
          console.error("Lỗi đọc file JSON:", f && f.name, e);
        }
      }
      allProducts = products;
      statusEl.textContent = "";
      applyFilters();
    }catch(e){
      console.error(e);
      statusEl.textContent = "Không tải được danh sách sản phẩm. Thử tải lại trang giúp mình.";
    }
  }

  function initFiltersFromQuery(){
    const usp = new URLSearchParams(window.location.search || "");
    const cat = usp.get("cat");
    if(cat && catFilter){
      catFilter.value = cat;
    }
  }

  function init(){
    initFiltersFromQuery();
    if(searchInput){
      searchInput.addEventListener("input", applyFilters);
    }
    if(catFilter){
      catFilter.addEventListener("change", applyFilters);
    }
    loadProducts();
  }

  init();
})();
