const Cabinet = (() => {
  let activeCabinetIdx = 0;

  async function render(idx) {
    if (idx !== undefined) activeCabinetIdx = idx;

    // Update tabs
    document.querySelectorAll('.cab-tab').forEach((tab, i) => {
      tab.classList.toggle('active', i === activeCabinetIdx);
    });

    const cabinet = LAYOUT.cabinets[activeCabinetIdx];
    const statusMap = await getDrawerStatusMap();
    const drawers = await db.drawers.toArray();
    const drawerNameMap = {};
    drawers.forEach(d => { drawerNameMap[d.id] = d.name; });

    const view = document.getElementById('cabinet-view');
    view.innerHTML = '';

    for (const row of cabinet.rows) {
      const rowEl = document.createElement('div');
      rowEl.className = 'drawer-row';

      for (const cell of row) {
        const cellEl = document.createElement('div');
        cellEl.style.flex = cell.flex;

        if (cell.empty) {
          cellEl.className = 'drawer-cell status-spacer';
          cellEl.innerHTML = `<span class="drawer-label">${cell.label}</span>`;
        } else {
          const status = statusMap[cell.id] || 'empty';
          cellEl.className = `drawer-cell status-${status}`;
          cellEl.innerHTML = `
            <span class="drawer-label">${cell.label}</span>
            <span class="drawer-name">${drawerNameMap[cell.id] || ''}</span>
            <span class="drawer-badge"></span>
          `;
          cellEl.addEventListener('click', () => Drawer.open(cell.id, cell.label));
        }

        rowEl.appendChild(cellEl);
      }

      view.appendChild(rowEl);
    }
  }

  async function refresh() {
    await render();
  }

  function setupTabs() {
    document.querySelectorAll('.cab-tab').forEach((tab, i) => {
      tab.addEventListener('click', () => render(i));
    });
  }

  return { render, refresh, setupTabs };
})();

document.addEventListener('DOMContentLoaded', () => {
  Cabinet.setupTabs();
});
