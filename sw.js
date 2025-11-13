
const VERSION = 'v2025-10-30';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{clients.claim()});
const isHTML = url => url.endsWith('.html') || url.endsWith('/');
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (isHTML(url.pathname)) {
    e.respondWith((async()=>{
      try { return await fetch(req); }
      catch(e){ return caches.match(req, {ignoreSearch:true}) || new Response('Offline',{status:503}); }
    })());
  } else {
    e.respondWith((async()=>{
      const c = await caches.open('assets-'+VERSION);
      const cached = await c.match(req, {ignoreSearch:true});
      const fetchPromise = fetch(req).then(res => { c.put(req, res.clone()); return res; });
      return cached || fetchPromise;
    })());
  }
});
