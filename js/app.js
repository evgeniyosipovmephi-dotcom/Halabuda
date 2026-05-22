const App = (() => {
  let currentScreen = 'cabinets';

  async function init() {
    await seedDatabase();
    setupNav();
    await Cabinet.render(0);
  }

  function setupNav() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const screen = btn.dataset.screen;
        switchScreen(screen);
      });
    });
  }

  async function switchScreen(name) {
    currentScreen = name;

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

    document.getElementById('screen-' + name).classList.add('active');
    document.querySelector(`.nav-item[data-screen="${name}"]`).classList.add('active');

    if (name === 'report')  await Report.render();
    if (name === 'history') await History.render();
    if (name === 'search')  Search.focus();
  }

  function showInventory() {
    Inventory.open();
  }

  function showSettings() {
    Settings.open();
  }

  return { init, switchScreen, showInventory, showSettings };
})();

document.addEventListener('DOMContentLoaded', App.init);
