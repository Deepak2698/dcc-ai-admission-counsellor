/* CounselAI website widget by DeCODE Crafters.
   <script src="https://YOUR-DEPLOYMENT/widget.js" defer></script>
   Adds a chat bubble that opens the counsellor (served from /embed). */
(function () {
  if (window.__counselAiLoaded) return
  window.__counselAiLoaded = true
  var origin = new URL(document.currentScript.src).origin
  var open = false

  var button = document.createElement('button')
  button.type = 'button'
  button.setAttribute('aria-label', 'Chat with our admission counsellor')
  button.textContent = 'Ask us'
  button.style.cssText =
    'position:fixed;right:20px;bottom:20px;z-index:2147483646;padding:14px 20px;border:none;border-radius:999px;' +
    'background:#ffc83d;color:#06122e;font:700 15px system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35);cursor:pointer'

  var frame = document.createElement('iframe')
  frame.src = origin + '/embed'
  frame.title = 'Admission counsellor chat'
  frame.style.cssText =
    'position:fixed;right:20px;bottom:84px;z-index:2147483647;width:min(380px,calc(100vw - 40px));' +
    'height:min(560px,calc(100vh - 120px));border:0;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.45);display:none'

  button.addEventListener('click', function () {
    open = !open
    frame.style.display = open ? 'block' : 'none'
    button.textContent = open ? 'Close' : 'Ask us'
  })

  document.body.appendChild(frame)
  document.body.appendChild(button)
})()
