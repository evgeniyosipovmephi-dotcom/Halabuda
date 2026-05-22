const Report = (() => {
  async function render() {
    const content = document.getElementById('report-content');
    content.innerHTML = '';

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

    const problems = [];

    for (const s of allStock) {
      const item = itemMap[s.item_id];
      if (!item || item.min_stock === 0) continue;

      const status = getItemStatus(s.quantity, item.min_stock, item.warn_coef);
      if (status === 'green') continue;

      problems.push({ s, item, status });
    }

    if (problems.length === 0) {
      content.innerHTML = '<p style="color:var(--green);text-align:center;padding:30px;font-size:16px">✓ Все позиции в норме</p>';
      return;
    }

    // Sort: red first, then yellow
    problems.sort((a, b) => {
      const order = { red: 0, yellow: 1 };
      return (order[a.status] ?? 2) - (order[b.status] ?? 2);
    });

    for (const { s, item, status } of problems) {
      const drawer = drawerMap[s.drawer_id];
      const loc    = labelMap[s.drawer_id];
      const dotClass = status === 'red' ? 'dot-red' : 'dot-yellow';
      const needed = status === 'red'
        ? `нужно ещё ${item.min_stock - s.quantity}`
        : `порог предупреждения: ${Math.ceil(item.min_stock * item.warn_coef)}`;

      const el = document.createElement('div');
      el.className = 'report-item';
      el.innerHTML = `
        <span class="report-status ${dotClass}"></span>
        <div style="flex:1;min-width:0">
          <div class="item-name">${escHtml(item.name)}</div>
          <div class="result-where">
            ${loc ? loc.cabinet + ' · ' + loc.label : ''} — ${escHtml(drawer?.name || '?')}
          </div>
          <div class="result-where">есть: <b>${s.quantity}</b> · мин: ${item.min_stock} · ${needed}</div>
        </div>
      `;
      el.addEventListener('click', () => {
        if (loc) {
          App.switchScreen('cabinets');
          setTimeout(() => Drawer.open(s.drawer_id, loc.label), 100);
        }
      });
      content.appendChild(el);
    }
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { render };
})();
