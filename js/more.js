// ─── Inventory ────────────────────────────────────────────────────────────────

const Inventory = (() => {
  let items = [];  // { stockId, itemId, drawerId, drawerName, label, itemName, oldQty, newQty }
  let idx = 0;

  function open() {
    const modeModal = document.createElement('div');
    modeModal.className = 'dialog';
    modeModal.innerHTML = `
      <div class="dialog-content">
        <h3>Инвентаризация</h3>
        <p style="color:var(--text-dim);font-size:14px;margin-bottom:16px">Выберите какие позиции проверять:</p>
        <div style="display:flex;flex-direction:column;gap:10px">
          <button class="inv-mode-btn btn-secondary" data-mode="all"
            style="padding:14px 16px;text-align:left;border-radius:var(--radius)">
            <div style="font-weight:600">Все позиции</div>
            <div style="font-size:12px;color:var(--text-dim);margin-top:3px">Пройти по всем товарам во всех ящиках</div>
          </button>
          <button class="inv-mode-btn btn-secondary" data-mode="warn"
            style="padding:14px 16px;text-align:left;border-radius:var(--radius)">
            <div style="font-weight:600;color:var(--yellow)">🟡 Близко к минимуму и ниже</div>
            <div style="font-size:12px;color:var(--text-dim);margin-top:3px">Только жёлтые и красные позиции</div>
          </button>
          <button class="inv-mode-btn btn-secondary" data-mode="critical"
            style="padding:14px 16px;text-align:left;border-radius:var(--radius)">
            <div style="font-weight:600;color:var(--red)">🔴 Только ниже минимума</div>
            <div style="font-size:12px;color:var(--text-dim);margin-top:3px">Только критические позиции</div>
          </button>
        </div>
        <button id="inv-mode-cancel" style="margin-top:14px;width:100%;background:none;border:none;color:var(--text-dim);cursor:pointer;padding:8px">Отмена</button>
      </div>
    `;
    document.body.appendChild(modeModal);

    modeModal.querySelectorAll('.inv-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modeModal.remove();
        startInventory(btn.dataset.mode);
      });
    });
    document.getElementById('inv-mode-cancel').addEventListener('click', () => modeModal.remove());
  }

  async function startInventory(mode) {
    const allStock  = await db.stock.toArray();
    const allItems  = await db.items.toArray();
    const allDrawers= await db.drawers.toArray();
    const itemMap   = {};
    const drawerMap = {};
    allItems.forEach(it  => itemMap[it.id]  = it);
    allDrawers.forEach(d => drawerMap[d.id] = d);

    const labelMap = {};
    LAYOUT.cabinets.forEach(cab => {
      cab.rows.forEach(row => {
        row.forEach(cell => {
          if (cell.id) labelMap[cell.id] = { label: cell.label, cabinet: cab.name };
        });
      });
    });

    let filteredStock = allStock;
    if (mode === 'warn' || mode === 'critical') {
      filteredStock = allStock.filter(s => {
        const item = itemMap[s.item_id];
        if (!item || item.min_stock === 0) return false;
        const status = getItemStatus(s.quantity, item.min_stock, item.warn_coef);
        if (mode === 'critical') return status === 'red';
        return status === 'red' || status === 'yellow';
      });
      if (filteredStock.length === 0) {
        alert(mode === 'critical' ? 'Нет позиций ниже минимума.' : 'Нет позиций ниже порога предупреждения.');
        return;
      }
    }

    items = filteredStock.map(s => ({
      stockId:    s.id,
      itemId:     s.item_id,
      drawerId:   s.drawer_id,
      drawerName: drawerMap[s.drawer_id]?.name || '?',
      label:      labelMap[s.drawer_id]?.label || '?',
      itemName:   itemMap[s.item_id]?.name || '?',
      oldQty:     s.quantity,
      newQty:     s.quantity
    }));

    idx = 0;
    showModal();
  }

  function showModal() {
    const existing = document.getElementById('inventory-modal');
    if (existing) existing.remove();

    if (idx >= items.length) {
      finish();
      return;
    }

    const it = items[idx];
    const modal = document.createElement('div');
    modal.id = 'inventory-modal';
    modal.className = 'dialog';
    modal.innerHTML = `
      <div class="dialog-content">
        <div style="color:var(--text-dim);font-size:13px;margin-bottom:6px">
          Инвентаризация · ${idx + 1} / ${items.length}
        </div>
        <div style="background:var(--surface2);border-radius:8px;padding:10px 14px;margin-bottom:14px">
          <div style="font-size:12px;color:var(--text-dim)">${it.label} — ${escHtml(it.drawerName)}</div>
          <div style="font-size:17px;font-weight:600;margin-top:4px">${escHtml(it.itemName)}</div>
        </div>
        <div class="form-group">
          <label>Фактическое количество (было: ${it.oldQty})</label>
          <input type="number" id="inv-qty" min="0" value="${it.newQty}" style="font-size:22px;font-weight:700;text-align:center">
        </div>
        <div style="display:flex;gap:8px;margin-top:4px">
          <button id="inv-skip"  class="btn-secondary" style="flex:1">Пропустить</button>
          <button id="inv-prev"  class="btn-secondary" ${idx === 0 ? 'disabled' : ''}>◀</button>
          <button id="inv-next"  class="btn-primary"   style="flex:2">${idx < items.length - 1 ? 'Далее ▶' : 'Завершить'}</button>
        </div>
        <button id="inv-cancel" style="margin-top:10px;width:100%;background:none;border:none;color:var(--text-dim);cursor:pointer;padding:8px">Отменить инвентаризацию</button>
      </div>
    `;
    document.body.appendChild(modal);

    const qtyInput = document.getElementById('inv-qty');
    qtyInput.focus();
    qtyInput.select();

    document.getElementById('inv-next').addEventListener('click', () => {
      items[idx].newQty = Math.max(0, +qtyInput.value || 0);
      idx++;
      showModal();
    });
    document.getElementById('inv-prev').addEventListener('click', () => {
      items[idx].newQty = Math.max(0, +qtyInput.value || 0);
      idx--;
      showModal();
    });
    document.getElementById('inv-skip').addEventListener('click', () => {
      idx++;
      showModal();
    });
    document.getElementById('inv-cancel').addEventListener('click', () => {
      modal.remove();
    });
  }

  async function finish() {
    const changed = items.filter(it => it.newQty !== it.oldQty);

    if (changed.length === 0) {
      alert('Изменений нет.');
      return;
    }

    const ok = confirm(`Применить инвентаризацию?\nИзменено позиций: ${changed.length}`);
    if (!ok) {
      document.getElementById('inventory-modal')?.remove();
      return;
    }

    await db.transaction('rw', db.stock, db.history, async () => {
      for (const it of changed) {
        await db.stock.update(it.stockId, { quantity: it.newQty });
        await db.history.add({
          timestamp:  Date.now(),
          drawer_id:  it.drawerId,
          item_id:    it.itemId,
          action:     'inventory',
          qty_before: it.oldQty,
          qty_after:  it.newQty
        });
      }
    });

    document.getElementById('inventory-modal')?.remove();
    await Cabinet.refresh();
    alert(`Инвентаризация завершена. Обновлено: ${changed.length} позиций.`);
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { open };
})();

// ─── Settings ─────────────────────────────────────────────────────────────────

const Settings = (() => {
  function open() {
    const existing = document.getElementById('settings-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'dialog';
    modal.innerHTML = `
      <div class="dialog-content" style="max-height:85vh;overflow-y:auto">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <h3 style="margin:0">Настройки</h3>
          <button id="settings-close" class="btn-icon">✕</button>
        </div>
        <div id="settings-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('settings-close').addEventListener('click', () => modal.remove());

    renderDrawerList();
  }

  async function renderDrawerList() {
    const body = document.getElementById('settings-body');
    const drawers = await db.drawers.orderBy('id').toArray();

    body.innerHTML = '<div style="font-size:13px;color:var(--text-dim);margin-bottom:12px;font-weight:600">ЯЩИКИ — названия</div>';

    for (const d of drawers) {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px';
      row.innerHTML = `
        <span style="color:var(--text-dim);min-width:30px;font-size:13px">${d.id}</span>
        <input data-id="${d.id}" value="${escHtml(d.name)}"
          style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:8px;
                 color:var(--text);font-size:14px;padding:8px 10px;outline:none">
      `;
      body.appendChild(row);
    }

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-primary';
    saveBtn.style.marginTop = '12px';
    saveBtn.textContent = 'Сохранить названия';
    saveBtn.addEventListener('click', saveDrawerNames);
    body.appendChild(saveBtn);
  }

  async function saveDrawerNames() {
    const inputs = document.querySelectorAll('#settings-body input[data-id]');
    await db.transaction('rw', db.drawers, async () => {
      for (const input of inputs) {
        const id   = +input.dataset.id;
        const name = input.value.trim();
        if (name) await db.drawers.update(id, { name });
      }
    });
    await Cabinet.refresh();
    document.getElementById('settings-modal')?.remove();
    alert('Названия сохранены.');
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { open };
})();
