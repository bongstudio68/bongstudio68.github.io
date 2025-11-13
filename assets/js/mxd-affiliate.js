;(()=>{
const AFF_BASE = {"shopee": "https://go.isclix.com/deep_link/4987479776286135214/4751584435713464237?sub4=oneatweb", "tiktok": "https://go.isclix.com/deep_link/4987479776286135214/6648523843406889655?sub4=oneatweb", "lazada": "https://go.isclix.com/deep_link/4987479776286135214/5127144557053758578?sub4=oneatweb"};
const UTM_BASE = 'utm_source=' + encodeURIComponent(location.hostname) + '&utm_medium=affiliate';
function makeIsclixUrl(base, originUrl, sku, merchant){
  if(!base) return originUrl;
  const sep = base.includes('?') ? '&' : '?';
  const head = base + sep + 'url=' + encodeURIComponent(originUrl);
  const params = [UTM_BASE, 'utm_campaign=' + encodeURIComponent(merchant||''), 'sub1=' + encodeURIComponent(sku||''), 'sub2=' + encodeURIComponent(merchant||'')];
  return head + '&' + params.join('&');
}
function rewrite(){
  const metas = document.querySelectorAll('a.product-meta[data-sku]');
  metas.forEach(meta => {
    const sku = meta.getAttribute('data-sku')||'';
    const merchant = (meta.getAttribute('data-merchant')||'').toLowerCase();
    const originMetaUrl = meta.getAttribute('href') || '';
    const base = AFF_BASE[merchant];
    let sib = meta.nextElementSibling;
    let hadBuy = false;
    while(sib && sib.tagName){
      if(sib.classList && sib.classList.contains('buy')){
        hadBuy = true;
        const origin = sib.getAttribute('href') || originMetaUrl;
        const aff = makeIsclixUrl(base, origin, sku, merchant);
        sib.setAttribute('href', aff);
        sib.setAttribute('rel','nofollow noopener');
      }
      sib = sib.nextElementSibling;
    }
    if(!hadBuy && originMetaUrl){
      // fallback: also rewrite the meta itself if no .buy siblings
      const aff = makeIsclixUrl(base, originMetaUrl, sku, merchant);
      meta.setAttribute('href', aff);
      meta.setAttribute('rel','nofollow noopener');
    }
  });
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', rewrite);
else rewrite();
})();
