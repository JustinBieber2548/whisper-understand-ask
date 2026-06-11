import { createFileRoute } from "@tanstack/react-router";

// Serves the embed script. Hosts include this once:
//   <script src="https://your-app.lovable.app/widget.js" async></script>
// It injects an iframe pointing at /embed on the same origin.
export const Route = createFileRoute("/widget/js")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const js = `(function () {
  if (window.__pkChatLoaded) return;
  window.__pkChatLoaded = true;
  var origin = ${JSON.stringify(origin)};
  var iframe = document.createElement('iframe');
  iframe.src = origin + '/embed';
  iframe.title = 'PK Supply Chain chat';
  iframe.allow = 'clipboard-write';
  iframe.style.cssText = [
    'position:fixed',
    'bottom:0',
    'right:0',
    'width:420px',
    'height:660px',
    'max-width:100vw',
    'max-height:100vh',
    'border:0',
    'background:transparent',
    'z-index:2147483647',
    'color-scheme:normal',
    'pointer-events:auto'
  ].join(';');
  function place() {
    if (window.innerWidth < 480) {
      iframe.style.width = '100vw';
      iframe.style.height = '100vh';
    } else {
      iframe.style.width = '420px';
      iframe.style.height = '660px';
    }
  }
  window.addEventListener('resize', place);
  place();
  function mount() { document.body.appendChild(iframe); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();`;
        return new Response(js, {
          headers: {
            "Content-Type": "application/javascript; charset=utf-8",
            "Cache-Control": "public, max-age=300",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
