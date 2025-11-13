
# nthuong09.github.io (MXD-conform scaffold)

- GA4: **G-2FQ0YDHWDE** (loaded via `/assets/js/analytics.js`, placed **before** affiliate script)
- Affiliate rewrite: `/assets/js/mxd-affiliate.js` chuyển các nút `.buy` thành **AccessTrade isclix** theo *deep_link base* bạn cung cấp (đã có `sub4=oneatweb`), sau đó thêm `url=<origin>` + `utm_*` + `sub1=<sku>` + `sub2=<merchant>`.
- Canonical: tuyệt đối (`https://nthuong09.github.io`), JSON-LD Product trên `g.html?sku=`.
- Ảnh: `/assets/img/products/<sku>.webp`; danh mục ở `/assets/img/categories`.
- Service Worker: HTML **network-first**, assets **stale-while-revalidate**.

## Deploy
1. Tạo repo **nthuong09.github.io** (Public).
2. Upload toàn bộ file trong ZIP vào root, commit.
3. Truy cập **https://nthuong09.github.io**.

## Notes
- Thêm sản phẩm ở `affiliates.json` + ảnh `/assets/img/products/<sku>.webp` và gắn vào trang danh mục.
- Có thể để trống `.buy` (script sẽ rewrite chính `product-meta` nếu không có `.buy` kề sau).
- Thay đổi deep_link base: sửa trong `assets/js/mxd-affiliate.js` (giữ nguyên `sub4=oneatweb` nếu muốn).
