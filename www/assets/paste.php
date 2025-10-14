<?php
/******************************************************
 * TransferNest Pastebin - Single File PHP (no DB)
 * Save as: paste.php
 * Storage: ./pastes/{id}.json
 ******************************************************/

// ---------- CONFIG ----------
$STORAGE_DIR   = __DIR__ . '/pastes';
$MAX_BYTES     = 1024 * 1024; // 1 MB limit per paste
$RECENT_LIMIT  = 20;
// ----------------------------

if (!is_dir($STORAGE_DIR)) {
    @mkdir($STORAGE_DIR, 0775, true);
}

// Utility: generate short ID (8 chars base62)
function gen_id($len = 8) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $out = '';
    for ($i=0; $i<$len; $i++) $out .= $chars[random_int(0, strlen($chars)-1)];
    return $out;
}
// Utility: safe filename for an id
function paste_path($id) {
    global $STORAGE_DIR;
    if (!preg_match('/^[a-zA-Z0-9]{6,32}$/', $id)) return null;
    return $STORAGE_DIR . '/' . $id . '.json';
}
// Utility: load paste
function load_paste($id) {
    $path = paste_path($id);
    if (!$path || !is_file($path)) return null;
    $raw = @file_get_contents($path);
    if ($raw === false) return null;
    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
}
// Utility: list recent by mtime
function list_recent($limit) {
    global $STORAGE_DIR;
    $files = glob($STORAGE_DIR.'/*.json');
    if (!$files) return [];
    usort($files, fn($a,$b) => filemtime($b) <=> filemtime($a));
    $files = array_slice($files, 0, $limit);
    $out = [];
    foreach ($files as $f) {
        $j = json_decode(@file_get_contents($f), true);
        if (is_array($j)) $out[] = $j;
    }
    return $out;
}

// Handle RAW view quickly
if (isset($_GET['id']) && isset($_GET['raw'])) {
    $paste = load_paste($_GET['id']);
    if (!$paste) {
        header('HTTP/1.1 404 Not Found');
        header('Content-Type: text/plain; charset=utf-8');
        echo "Not found.";
        exit;
    }
    header('Content-Type: text/plain; charset=utf-8');
    // Prevent XSS in raw by outputting plain text exactly
    echo $paste['content'] ?? '';
    exit;
}

// Handle POST (create paste)
$created_id = null;
$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title   = trim($_POST['title'] ?? '');
    $content = $_POST['content'] ?? '';
    $contentBytes = strlen($content);

    if ($contentBytes === 0) {
        $error = "Paste content is required.";
    } elseif ($contentBytes > $MAX_BYTES) {
        $error = "Paste too large (max " . number_format($MAX_BYTES/1024) . " KB).";
    } else {
        // Basic sanitization: normalize line endings
        $content = str_replace(["\r\n", "\r"], "\n", $content);
        // Create unique ID
        do { $id = gen_id(8); $path = paste_path($id); } while (!$path || file_exists($path));
        $data = [
            'id'        => $id,
            'title'     => mb_substr($title, 0, 120),
            'content'   => $content,
            'created'   => date('c'),
            'ip'        => $_SERVER['REMOTE_ADDR'] ?? '',
            'ua'        => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 200),
            'bytes'     => $contentBytes,
        ];
        if (@file_put_contents($path, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) === false) {
            $error = "Failed to save paste (permissions?).";
        } else {
            $created_id = $id;
        }
    }
}

// If viewing a paste page
$view_paste = null;
if (isset($_GET['id']) && !$created_id) {
    $view_paste = load_paste($_GET['id']);
    if (!$view_paste) {
        $error = "Paste not found.";
    }
}

// Recent list (shown on home and below a viewed paste)
$recent = list_recent($RECENT_LIMIT);

// Build base URL helper
function base_url() {
    $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host  = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $self  = strtok($_SERVER['REQUEST_URI'], '?');
    return $proto . '://' . $host . $self;
}
$SELF_URL = base_url();

// When a paste is created, redirect to its page (nice UX)
if ($created_id) {
    header("Location: " . $SELF_URL . "?id=" . urlencode($created_id));
    exit;
}

// Small helper to safely show text in HTML
function h($s){ return htmlspecialchars($s ?? '', ENT_QUOTES, 'UTF-8'); }

?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= $view_paste ? ('Paste · ' . h($view_paste['id'])) : 'TransferNest · Pastebin' ?></title>
<meta name="robots" content="noindex,nofollow">
<style>
  :root{
    --bg:#0f1115;
    --card:#161a22;
    --accent:#4ecdc4;
    --muted:#9aa4b2;
    --text:#e8eef6;
    --danger:#ff6b6b;
  }
  *{box-sizing:border-box}
  body{
    margin:0;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, "Helvetica Neue", Arial, Noto Sans, sans-serif;
    color:var(--text);
    background:
      radial-gradient(1000px 400px at 10% -10%, #1a2030 0%, transparent 60%),
      radial-gradient(1000px 400px at 110% 10%, #1a2030 0%, transparent 60%),
      var(--bg);
    min-height:100vh;
    display:flex;
    align-items:flex-start;
    justify-content:center;
    padding:32px 16px 80px;
  }
  .wrap{
    width:100%;
    max-width:1100px;
    display:grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap:24px;
  }
  @media (max-width:900px){ .wrap{grid-template-columns:1fr} }
  .card{
    background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.0));
    border:1px solid rgba(255,255,255,0.08);
    border-radius:16px;
    padding:18px;
    backdrop-filter: blur(6px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  }
  .header{
    display:flex; align-items:center; gap:12px; margin-bottom:12px;
  }
  .logo{
    width:38px; height:38px; border-radius:10px;
    background:#1f2430; display:grid; place-items:center;
    font-weight:800; letter-spacing:0.5px; color:var(--accent);
    border:1px solid rgba(255,255,255,0.08);
  }
  h1,h2{margin:0; font-size:18px}
  .muted{color:var(--muted); font-size:14px}
  .footer-note{margin-top:8px; font-size:12px; color:var(--muted)}
  input[type="text"], textarea{
    width:100%; background:#0f1420; color:var(--text);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:12px; padding:12px; outline:none;
  }
  input[type="text"]:focus, textarea:focus{border-color:var(--accent)}
  textarea{min-height:320px; line-height:1.45; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size:14px; white-space:pre; overflow:auto;}
  .row{display:flex; gap:12px; align-items:center}
  .row > * {flex:1}
  .btn{
    border:1px solid rgba(255,255,255,0.1);
    background: linear-gradient(180deg, rgba(78,205,196,0.22), rgba(78,205,196,0.1));
    color:var(--text); padding:10px 14px; border-radius:12px;
    cursor:pointer; font-weight:600; transition:transform .08s ease, background .2s ease;
  }
  .btn:hover{ transform: translateY(-1px) }
  .btn.secondary{ background: #141925; }
  .btn.danger{ background: linear-gradient(180deg, rgba(255,107,107,0.25), rgba(255,107,107,0.12)); border-color: rgba(255,107,107,0.3)}
  .toolbar{display:flex; gap:8px; flex-wrap:wrap}
  .error{ background: rgba(255,107,107,0.1); border:1px solid rgba(255,107,107,0.35); color:#ffdede; padding:10px 12px; border-radius:10px; margin-bottom:12px; }
  pre.code{
    background:#0b0f18; border:1px solid rgba(255,255,255,0.08); border-radius:12px;
    padding:14px; overflow:auto; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size:14px;
  }
  .meta{display:flex; gap:12px; flex-wrap:wrap; color:var(--muted); font-size:13px; margin:10px 0 16px}
  .list .item{padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); margin-bottom:8px; background:#111624}
  .item a{color:var(--text); text-decoration:none}
  .item a:hover{color:var(--accent)}
  .side-hero{
    display:none;
    position:relative; border-radius:16px; overflow:hidden;
    background: radial-gradient(600px 200px at -20% 0%, rgba(78,205,196,0.25), transparent 70%),
                radial-gradient(700px 200px at 120% 20%, rgba(78,205,196,0.2), transparent 70%),
                #121622;
    border:1px solid rgba(255,255,255,0.08);
    min-height:180px;
  }
  @media (min-width:901px){ .side-hero{display:block} }
  .side-hero .char{
    position:absolute; right:-6px; bottom:-6px; width:150px; opacity:0.9; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));
  }
  .hint{font-size:12px; color:var(--muted); margin-top:6px}
  .copy-ok{color:#b6fcd5}
</style>
</head>
<body>
  <div class="wrap">
    <main class="card">
      <div class="header">
        <div class="logo">TN</div>
        <div>
          <h1>TransferNest · Pastebin</h1>
          <div class="muted">Share text/code with a simple link · No database</div>
        </div>
      </div>

      <?php if ($error): ?>
        <div class="error"><?= h($error) ?></div>
      <?php endif; ?>

      <?php if ($view_paste): ?>
        <h2><?= h($view_paste['title'] ?: 'Untitled Paste') ?></h2>
        <div class="meta">
          <div><strong>ID:</strong> <?= h($view_paste['id']) ?></div>
          <div><strong>Created:</strong> <?= h(date('Y-m-d H:i', strtotime($view_paste['created'] ?? 'now'))) ?></div>
          <div><strong>Size:</strong> <?= number_format(($view_paste['bytes'] ?? strlen($view_paste['content'] ?? ''))/1024, 2) ?> KB</div>
        </div>

        <pre class="code" id="pasteContent"><?= h($view_paste['content']) ?></pre>

        <div class="toolbar" style="margin-top:10px">
          <button class="btn" id="copyLinkBtn" data-url="<?= h($SELF_URL . '?id=' . $view_paste['id']) ?>">Copy Link</button>
          <a class="btn secondary" href="<?= h($SELF_URL . '?id=' . $view_paste['id'] . '&raw=1') ?>" target="_blank" rel="noopener">Raw</a>
          <a class="btn" href="<?= h($SELF_URL) ?>">New Paste</a>
        </div>
        <div class="hint" id="copyMsg"></div>

      <?php else: ?>
        <form method="post" action="<?= h($SELF_URL) ?>" spellcheck="false" autocomplete="off" novalidate>
          <div class="row" style="margin-bottom:10px">
            <input type="text" name="title" placeholder="Title (optional)">
          </div>
          <textarea name="content" placeholder="Write your text or code here..." required></textarea>
          <div class="row" style="margin-top:10px">
            <button type="submit" class="btn">Create Paste</button>
            <button type="reset" class="btn secondary">Clear</button>
          </div>
          <div class="footer-note">Max size: <?= number_format($MAX_BYTES/1024) ?> KB. No login, no DB. Keep secrets out.</div>
        </form>
      <?php endif; ?>

      <h2 style="margin-top:22px">Recent Pastes</h2>
      <div class="list">
        <?php if (empty($recent)): ?>
          <div class="muted">No pastes yet. Create the first one!</div>
        <?php else: foreach ($recent as $p): ?>
          <div class="item">
            <a href="<?= h($SELF_URL . '?id=' . $p['id']) ?>">
              <?= h($p['title'] ?: 'Untitled Paste') ?>
            </a>
            <div class="muted" style="font-size:12px; margin-top:4px">
              ID: <?= h($p['id']) ?> · <?= h(date('Y-m-d H:i', strtotime($p['created'] ?? 'now'))) ?> ·
              <?= number_format(($p['bytes'] ?? 0)/1024, 2) ?> KB
              · <a href="<?= h($SELF_URL . '?id=' . $p['id'] . '&raw=1') ?>" style="color:var(--accent)">raw</a>
            </div>
          </div>
        <?php endforeach; endif; ?>
      </div>
    </main>

    <aside>
      <div class="card side-hero">
        <!-- non-girly, subtle neon sci-fi vibe + little mascot -->
        <img class="char" alt="mascot" src="data:image/svg+xml;utf8,<?php
          // tiny inline SVG mascot (no external assets)
          $svg = '<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'180\' height=\'180\' viewBox=\'0 0 180 180\'>
          <g fill=\'none\' stroke=\'#4ecdc4\' stroke-width=\'3\'>
            <circle cx=\'90\' cy=\'90\' r=\'60\' opacity=\'.25\'/>
            <path d=\'M70 120 Q90 135 110 120\'/>
            <circle cx=\'70\' cy=\'80\' r=\'6\'/><circle cx=\'110\' cy=\'80\' r=\'6\'/>
            <path d=\'M60 55 L75 70\'/><path d=\'M120 55 L105 70\'/>
            <path d=\'M80 95 Q90 100 100 95\'/>
          </g>
          </svg>';
          echo rawurlencode($svg);
        ?>">
        <div style="padding:16px">
          <h2>Tips</h2>
          <div class="muted" style="font-size:14px; line-height:1.5">
            • Share the link above.<br>
            • Use <code>&amp;raw=1</code> for plain text.<br>
            • Keep private data out—files are public if you share the URL.<br>
            • You can bump a paste to “Recent” by resubmitting with changes.
          </div>
        </div>
      </div>
    </aside>
  </div>

<script>
  // Copy link
  (function(){
    var btn = document.getElementById('copyLinkBtn');
    if(!btn) return;
    var msg = document.getElementById('copyMsg');
    btn.addEventListener('click', async function(){
      const url = btn.getAttribute('data-url');
      try{
        await navigator.clipboard.writeText(url);
        msg.textContent = 'Link copied! ' + url;
        msg.className = 'hint copy-ok';
      }catch(e){
        msg.textContent = 'Could not copy automatically. Manually copy: ' + url;
      }
    });
  })();
</script>
</body>
</html>
