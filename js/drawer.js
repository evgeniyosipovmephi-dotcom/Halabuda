const Drawer = (() => {
  let currentDrawerId = null;
  let editingItemStockId = null;  // for add/edit dialog

  async function open(drawerId, label) {
    currentDrawerId = drawerId;

    const drawer = await db.drawers.get(drawerId);
    document.getElementById('drawer-label').textContent = label;
    document.getElementById('drawer-name').textContent = drawer ? drawer.name : '';

    await renderItems();

    document.getElementById('drawer-overlay').classList.remove('hidden');
    document.getElementById('drawer-modal').classList.remove('hidden');
  }

  function close() {
    currentDrawerId = null;
    document.getElementById('drawer-overlay').classList.add('hidden');
    document.getElementById('drawer-modal').classList.add('hidden');
    Cabinet.refresh();
  }

  async function renderItems() {
    const stockRows = await db.stock.where('drawer_id').equals(currentDrawerId).toArray();
    const list = document.getElementById('drawer-items');
    list.innerHTML = '';

    if (stockRows.length === 0) {
      list.innerHTML = '<p style="color:var(--text-dim);padding:20px;text-align:center">Ящик пустой. Добавьте позицию.</p>';
      return;
    }

    for (const s of stockRows) {
      const item = await db.items.get(s.item_id);
      if (!item) continue;

      const status = getItemStatus(s.quantity, item.min_stock, item.warn_coef);
      const dotClass = status === 'green' ? 'dot-green' : status === 'yellow' ? 'dot-yellow' : 'dot-red';
      const minText = item.min_stock > 0
        ? `мин: ${item.min_stock} · коэф: ${item.warn_coef}`
        : 'мин. остаток не задан';

      const row = document.createElement('div');
      row.className = 'item-row';
      row.dataset.stockId = s.id;
      row.innerHTML = `
        <span class="item-status-dot ${dotClass}"></span>
        <div class="item-info">
          <div class="item-name">${escHtml(item.name)}</div>
          <div class="item-min">${minText}</div>
        </div>
        <div class="item-controls">
          <button class="qty-btn btn-minus" data-stock="${s.id}">−</button>
          <input class="qty-input" type="number" min="0" value="${s.quantity}" data-stock="${s.id}">
          <button class="qty-btn btn-plus" data-stock="${s.id}">+</button>
        </div>
        <button class="btn-icon btn-edit-item" data-stock="${s.id}" title="Изменить">⋮</button>
      `;
      list.appendChild(row);
    }

    // Bind controls
    list.querySelectorAll('.btn-minus').forEach(btn => {
      btn.addEventListener('click', () => changeQty(+btn.dataset.stock, -1));
    });
    list.querySelectorAll('.btn-plus').forEach(btn => {
      btn.addEventListener('click', () => changeQty(+btn.dataset.stock, +1));
    });
    list.querySelectorAll('.qty-input').forEach(input => {
      input.addEventListener('change', () => setQty(+input.dataset.stock, +input.value));
    });
    list.querySelectorAll('.btn-edit-item').forEach(btn => {
      btn.addEventListener('click', () => openEditDialog(+btn.dataset.stock));
    });
  }

  async function changeQty(stockId, delta) {
    const s = await db.stock.get(stockId);
    if (!s) return;
    const newQty = Math.max(0, s.quantity + delta);
    await db.stock.update(stockId, { quantity: newQty });
    await addHistoryEntry({
      drawer_id: s.drawer_id,
      item_id: s.item_id,
      action: delta > 0 ? 'plus' : 'minus',
      qty_before: s.quantity,
      qty_after: newQty
    });
    await renderItems();
  }

  async function setQty(stockId, newQty) {
    newQty = Math.max(0, Math.floor(newQty) || 0);
    const s = await db.stock.get(stockId);
    if (!s || s.quantity === newQty) return;
    await db.stock.update(stockId, { quantity: newQty });
    await addHistoryEntry({
      drawer_id: s.drawer_id,
      item_id: s.item_id,
      action: 'set',
      qty_before: s.quantity,
      qty_after: newQty
    });
    await renderItems();
  }

  // ─── Add from catalog ────────────────────────────────────────────────────────

  async function openAddDialog() {
    // Get items NOT already in this drawer
    const inDrawer  = await db.stock.where('drawer_id').equals(currentDrawerId).toArray();
    const usedIds   = new Set(inDrawer.map(s => s.item_id));
    const allItems  = await db.items.orderBy('name').toArray();
    const available = allItems.filter(it => !usedIds.has(it.id));

    let selectedItem = null;

    const modal = document.createElement('div');
    modal.className = 'dialog';
    modal.id = 'catalog-picker';
    modal.innerHTML = `
      <div class="dialog-content" style="max-height:85vh;display:flex;flex-direction:column;padding:16px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-shrink:0">
          <h3 style="margin:0;flex:1">Добавить позицию</h3>
          <button id="cp-close" class="btn-icon">✕</button>
        </div>
        <input id="cp-search" type="search" class="search-input" placeholder="Поиск в каталоге..." style="margin-bottom:10px;flex-shrink:0">
        <div id="cp-list" style="flex:1;overflow-y:auto;min-height:0"></div>
        <div id="cp-qty-row" class="hidden" style="border-top:1px solid var(--border);padding-top:12px;margin-top:8px;flex-shrink:0">
          <div id="cp-selected-name" style="font-weight:600;margin-bottom:8px"></div>
          <div class="form-group" style="margin-bottom:10px">
            <label>Количество</label>
            <input id="cp-qty" type="number" min="0" value="1">
          </div>
          <button id="cp-confirm" class="btn-primary">Добавить в ящик</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const searchInput = document.getElementById('cp-search');
    const list        = document.getElementById('cp-list');
    const qtyRow      = document.getElementById('cp-qty-row');

    function renderList(query) {
      const q = query.toLowerCase();
      const filtered = q ? available.filter(it => it.name.toLowerCase().includes(q)) : available;
      list.innerHTML = '';

      if (filtered.length === 0) {
        list.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:16px">Ничего не найдено.<br>Создайте новую позицию в разделе Поиск.</p>';
        return;
      }

      for (const item of filtered) {
        const row = document.createElement('div');
        row.style.cssText = 'padding:12px;border-radius:var(--radius-sm);cursor:pointer;margin-bottom:4px;transition:background 0.1s';
        row.innerHTML = `
          <div style="font-size:15px;font-weight:500">${escHtml(item.name)}</div>
          <div style="font-size:12px;color:var(--text-dim);margin-top:2px">
            ${item.min_stock > 0 ? 'мин: ' + item.min_stock + ' · коэф: ' + item.warn_coef : 'без контроля остатка'}
          </div>
        `;
        row.addEventListener('click', () => {
          selectedItem = item;
          document.getElementById('cp-selected-name').textContent = item.name;
          document.getElementById('cp-qty').value = '1';
          qtyRow.classList.remove('hidden');
          document.getElementById('cp-qty').focus();
          // Highlight selected
          list.querySelectorAll('[data-selected]').forEach(el => el.removeAttribute('data-selected'));
          row.dataset.selected = '1';
          row.style.background = 'var(--accent-dk)';
        });
        list.appendChild(row);
      }
    }

    renderList('');
    searchInput.addEventListener('input', e => renderList(e.target.value));

    document.getElementById('cp-close').addEventListener('click', () => modal.remove());

    document.getElementById('cp-confirm').addEventListener('click', async () => {
      if (!selectedItem) return;
      const qty = Math.max(0, +document.getElementById('cp-qty').value || 0);

      await db.stock.add({ item_id: selectedItem.id, drawer_id: currentDrawerId, quantity: qty });
      await addHistoryEntry({
        drawer_id: currentDrawerId,
        item_id:   selectedItem.id,
        action:    'plus',
        qty_before: 0,
        qty_after:  qty
      });

      modal.remove();
      await renderItems();
    });
  }

  async function openEditDialog(stockId) {
    editingItemStockId = stockId;
    const s    = await db.stock.get(stockId);
    const item = await db.items.get(s.item_id);

    document.getElementById('item-modal-title').textContent = 'Изменить позицию';
    document.getElementById('item-modal-name').textContent  = item.name;
    document.getElementById('item-qty-input').value  = s.quantity;
    document.getElementById('item-min-input').value  = item.min_stock;
    document.getElementById('item-coef-input').value = item.warn_coef;
    document.getElementById('item-delete-btn').classList.remove('hidden');
    document.getElementById('item-modal').classList.remove('hidden');
    document.getElementById('item-qty-input').focus();
    document.getElementById('item-qty-input').select();
  }

  function closeItemDialog() {
    document.getElementById('item-modal').classList.add('hidden');
    document.getElementById('item-delete-btn').classList.add('hidden');
    editingItemStockId = null;
  }

  async function deleteItem() {
    if (!editingItemStockId) return;
    const s    = await db.stock.get(editingItemStockId);
    const item = await db.items.get(s.item_id);
    const ok   = confirm(`Удалить "${item.name}" из ящика?`);
    if (!ok) return;

    await db.stock.delete(editingItemStockId);
    closeItemDialog();
    await renderItems();
  }

  async function saveItem() {
    if (!editingItemStockId) return;
    const qty      = Math.max(0, +document.getElementById('item-qty-input').value  || 0);
    const minStock = Math.max(0, +document.getElementById('item-min-input').value  || 0);
    const warnCoef = Math.max(1, +document.getElementById('item-coef-input').value || 1.5);
    const s = await db.stock.get(editingItemStockId);

    await db.items.update(s.item_id, { min_stock: minStock, warn_coef: warnCoef });

    if (s.quantity !== qty) {
      await db.stock.update(editingItemStockId, { quantity: qty });
      await addHistoryEntry({
        drawer_id:  s.drawer_id,
        item_id:    s.item_id,
        action:     'set',
        qty_before: s.quantity,
        qty_after:  qty
      });
    }

    closeItemDialog();
    await renderItems();
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ─── Setup ──────────────────────────────────────────────────────────────────

  function setup() {
    document.getElementById('drawer-close').addEventListener('click', close);
    document.getElementById('drawer-overlay').addEventListener('click', close);
    document.getElementById('add-item-btn').addEventListener('click', openAddDialog);
    document.getElementById('item-cancel-btn').addEventListener('click', closeItemDialog);
    document.getElementById('item-save-btn').addEventListener('click', saveItem);
    document.getElementById('item-delete-btn').addEventListener('click', deleteItem);
  }

  return { open, close, setup, renderItems };
})();

document.addEventListener('DOMContentLoaded', () => Drawer.setup());
