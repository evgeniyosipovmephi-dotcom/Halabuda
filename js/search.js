const Search = (() => {
  let debounceTimer = null;

  function focus() {
    const input = document.getElementById('search-input');
    setTimeout(() => input.focus(), 100);
  }

  async function doSearch(query) {
    const results = document.getElementById('search-results');
    query = query.trim().toLowerCase();

    const allItems  = await db.items.toArray();
    const allStock  = await db.stock.toArray();
    const allDrawers= await db.drawers.toArray();
    const drawerMap = {};
    allDrawers.forEach(d => drawerMap[d.id] = d);

    const labelMap = {};
    LAYOUT.cabinets.forEach(cab => {
      cab.rows.forEach(row => {
        row.forEach(cell => {
          if (cell.id) labelMap[cell.id] = { label: cell.label, cabinet: cab.name };
        });
      });
    });

    // Filter items by query (empty query → show all)
    const matchingItems = query.length < 1
      ? allItems
      : allItems.filter(it => it.name.toLowerCase().includes(query));

    results.innerHTML = '';

    if (matchingItems.length === 0) {
      results.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:20px">Ничего не найдено</p>';
      return;
    }

    // Build stock index: item_id → [stock records]
    const stockByItem = {};
    allStock.forEach(s => {
      if (!stockByItem[s.item_id]) stockByItem[s.item_id] = [];
      stockByItem[s.item_id].push(s);
    });

    for (const item of matchingItems) {
      const stockRows = stockByItem[item.id] || [];

      // Item card
      const card = document.createElement('div');
      card.style.cssText = 'background:var(--surface);border-radius:var(--radius-sm);margin-bottom:10px;overflow:hidden';

      // Header row: item name + edit button
      const header = document.createElement('div');
      header.style.cssText = 'display:flex;align-items:center;gap:10px;padding:12px 14px 8px';
      header.innerHTML = `
        <div style="flex:1;min-width:0">
          <div class="item-name">${escHtml(item.name)}</div>
          <div class="item-min" style="margin-top:3px">
            ${item.min_stock > 0 ? `мин: ${item.min_stock} · коэф: ${item.warn_coef}` : 'мин. остаток не задан'}
          </div>
        </div>
        <button class="btn-secondary btn-edit-catalog" data-id="${item.id}" style="padding:6px 12px;font-size:13px;flex-shrink:0">✎ Изменить</button>
      `;
      card.appendChild(header);

      // Where it's stored
      if (stockRows.length === 0) {
        const nowhere = document.createElement('div');
        nowhere.style.cssText = 'padding:0 14px 10px;font-size:12px;color:var(--text-dim)';
        nowhere.textContent = 'Не добавлен ни в один ящик';
        card.appendChild(nowhere);
      } else {
        for (const s of stockRows) {
          const drawer = drawerMap[s.drawer_id];
          const loc    = labelMap[s.drawer_id];
          const status = getItemStatus(s.quantity, item.min_stock, item.warn_coef);
          const dotClass = { green: 'dot-green', yellow: 'dot-yellow', red: 'dot-red' }[status];

          const row = document.createElement('div');
          row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:6px 14px;border-top:1px solid var(--border);cursor:pointer';
          row.innerHTML = `
            <span class="item-status-dot ${dotClass}"></span>
            <span class="result-where" style="flex:1;margin:0">
              ${loc ? loc.cabinet + ' · <b>' + loc.label + '</b>' : ''} — ${escHtml(drawer?.name || '?')}
            </span>
            <span style="font-size:15px;font-weight:700;color:var(--text)">${s.quantity}</span>
          `;
          row.addEventListener('click', () => {
            if (loc) Drawer.open(s.drawer_id, loc.label);
          });
          card.appendChild(row);
        }
      }

      card.querySelector('.btn-edit-catalog').addEventListener('click', () => openEditItemDialog(item.id));
      results.appendChild(card);
    }
  }

  // ─── Create new catalog item ───────────────────────────────────────────────

  function openNewItemDialog() {
    showCatalogDialog(null);
  }

  async function openEditItemDialog(itemId) {
    showCatalogDialog(itemId);
  }

  async function showCatalogDialog(itemId) {
    const isEdit = itemId !== null;
    let item = null;
    if (isEdit) item = await db.items.get(itemId);

    const modal = document.createElement('div');
    modal.className = 'dialog';
    modal.id = 'catalog-dialog';
    modal.innerHTML = `
      <div class="dialog-content">
        <h3>${isEdit ? 'Изменить позицию' : 'Новая позиция'}</h3>
        <div class="form-group">
          <label>Название</label>
          <input id="cd-name" type="text" placeholder="Название товара" value="${isEdit ? escHtml(item.name) : ''}">
        </div>
        <div class="form-group">
          <label>Мин. остаток (0 = без контроля)</label>
          <input id="cd-min" type="number" min="0" value="${isEdit ? item.min_stock : 0}">
        </div>
        <div class="form-group">
          <label>Коэффициент предупреждения</label>
          <input id="cd-coef" type="number" min="1" step="0.1" value="${isEdit ? item.warn_coef : 1.5}">
        </div>
        <div class="dialog-buttons">
          <button id="cd-cancel" class="btn-secondary">Отмена</button>
          <button id="cd-save"   class="btn-primary">Сохранить</button>
        </div>
        ${isEdit ? `<button id="cd-delete" style="margin-top:12px;width:100%;background:none;border:1px solid var(--red);border-radius:var(--radius-sm);color:var(--red);font-size:14px;padding:10px;cursor:pointer">🗑 Удалить позицию из каталога</button>` : ''}
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cd-name').focus();
    document.getElementById('cd-cancel').addEventListener('click', () => modal.remove());

    document.getElementById('cd-save').addEventListener('click', async () => {
      const name     = document.getElementById('cd-name').value.trim();
      const minStock = Math.max(0, +document.getElementById('cd-min').value  || 0);
      const warnCoef = Math.max(1, +document.getElementById('cd-coef').value || 1.5);
      if (!name) { alert('Введите название'); return; }

      if (isEdit) {
        await db.items.update(itemId, { name, min_stock: minStock, warn_coef: warnCoef });
      } else {
        const exists = await db.items.where('name').equalsIgnoreCase(name).first();
        if (exists) { alert(`Позиция "${name}" уже есть в каталоге.`); return; }
        await db.items.add({ name, min_stock: minStock, warn_coef: warnCoef });
      }

      modal.remove();
      await Cabinet.refresh();
      doSearch(document.getElementById('search-input').value);
    });

    if (isEdit) {
      document.getElementById('cd-delete').addEventListener('click', async () => {
        const inDrawers = await db.stock.where('item_id').equals(itemId).count();
        if (inDrawers > 0) {
          alert(`Нельзя удалить: позиция находится в ${inDrawers} ящ. Сначала удалите её из всех ящиков.`);
          return;
        }
        const ok = confirm(`Удалить "${item.name}" из каталога?`);
        if (!ok) return;
        await db.items.delete(itemId);
        modal.remove();
        doSearch(document.getElementById('search-input').value);
      });
    }
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function setup() {
    document.getElementById('search-input').addEventListener('input', e => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => doSearch(e.target.value), 300);
    });
    document.getElementById('new-item-btn').addEventListener('click', openNewItemDialog);
  }

  return { focus, setup };
})();

document.addEventListener('DOMContentLoaded', () => Search.setup());
