const History = (() => {
  const MAX_UNDO = 10;

  async function render() {
    const entries = await db.history.orderBy('id').reverse().limit(50).toArray();
    const list = document.getElementById('history-list');
    list.innerHTML = '';

    if (entries.length === 0) {
      list.innerHTML = '<p style="color:var(--text-dim);padding:20px;text-align:center">История пуста</p>';
      return;
    }

    const drawerCache = {};
    const itemCache   = {};

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];

      if (!drawerCache[e.drawer_id]) {
        const d = await db.drawers.get(e.drawer_id);
        drawerCache[e.drawer_id] = d ? d.name : '?';
      }
      if (!itemCache[e.item_id]) {
        const it = await db.items.get(e.item_id);
        itemCache[e.item_id] = it ? it.name : '?';
      }

      const canUndo = i < MAX_UNDO;
      const actionLabel = { plus: '+ Пополнение', minus: '− Списание', set: '✎ Корректировка', inventory: '📋 Инвентаризация' }[e.action] || e.action;
      const actionClass = { plus: 'action-plus', minus: 'action-minus', set: 'action-set', inventory: 'action-inventory' }[e.action] || 'action-set';
      const diff = e.qty_after - e.qty_before;
      const diffStr = diff > 0 ? `+${diff}` : `${diff}`;

      const el = document.createElement('div');
      el.className = 'history-item';
      el.innerHTML = `
        <div class="history-item-header">
          <span class="history-action ${actionClass}">${actionLabel}</span>
          <span class="history-time">${formatTime(e.timestamp)}</span>
        </div>
        <div class="history-desc">${escHtml(itemCache[e.item_id])}</div>
        <div class="history-detail">
          ${escHtml(drawerCache[e.drawer_id])} · было: ${e.qty_before} → стало: ${e.qty_after} (${diffStr})
          ${canUndo ? `<button class="btn-undo-entry" data-id="${e.id}" style="float:right;background:none;border:none;color:var(--accent);cursor:pointer;font-size:13px">↩ откат</button>` : ''}
        </div>
      `;
      list.appendChild(el);
    }

    list.querySelectorAll('.btn-undo-entry').forEach(btn => {
      btn.addEventListener('click', () => undoEntry(+btn.dataset.id));
    });
  }

  async function undoEntry(historyId) {
    const entry = await db.history.get(historyId);
    if (!entry) return;

    const stockRow = await db.stock
      .where('[item_id+drawer_id]')
      .equals([entry.item_id, entry.drawer_id])
      .first();

    if (!stockRow) {
      alert('Запись о товаре не найдена — откат невозможен.');
      return;
    }

    const ok = confirm(`Откатить: "${(await db.items.get(entry.item_id))?.name}"?\n${entry.qty_after} → ${entry.qty_before}`);
    if (!ok) return;

    await db.stock.update(stockRow.id, { quantity: entry.qty_before });
    await db.history.delete(historyId);

    await render();
    await Cabinet.refresh();
  }

  function formatTime(ts) {
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth()+1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { render };
})();
