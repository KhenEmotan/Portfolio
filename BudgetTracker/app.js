/* Same storage key and data format as the original app. No sample data is seeded. */
const selectors = Object.fromEntries([
  'budgetInput', 'budgetForm', 'setBudgetBtn', 'budgetAmount', 'spentAmount',
  'remainingAmount', 'remainingCard', 'remainingHint', 'purchaseCount',
  'spendingLabel', 'spendingHint', 'spendingProgress', 'progressFill',
  'itemName', 'itemQty', 'itemUnitPrice', 'itemForm', 'itemFormTitle',
  'itemFormHint', 'addItemBtn', 'cancelEditBtn', 'addToBudgetBtn',
  'clearBudgetBtn', 'themeToggleBtn', 'clearBtn', 'currencySelect',
  'itemCount', 'listSpentAmount', 'feedback'
].map(id => [id, document.getElementById(id)]));
selectors.itemsList = document.getElementById('items');

const STORAGE_KEY = 'budgetTrackerData_v1';
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'PHP'];
let state = { budget: 0, items: [], nextId: 1, currency: 'USD', editingId: null, theme: 'dark' };
let feedbackTimer;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) state = saved;
    }
  } catch {
    showMessage('Saved data could not be read. You can still start a new budget.', 'error');
  }
}

function ensureDefaults() {
  state = Object.assign({ budget: 0, items: [], nextId: 1, currency: 'USD', theme: 'dark' }, state);
  if (!CURRENCIES.includes(state.currency)) state.currency = 'USD';
  if (!['light', 'dark'].includes(state.theme)) state.theme = 'dark';
  if (!Array.isArray(state.items)) state.items = [];
  // Support older records that only saved an item name and amount.
  state.items = state.items.filter(item => item && typeof item === 'object').map(item => {
    if (item.qty === undefined || item.unitPrice === undefined) {
      const amount = Number(item.amount || 0);
      return Object.assign({ qty: 1, unitPrice: amount, amount }, item);
    }
    return item;
  });
  state.nextId = Math.max(Number(state.nextId) || 1, ...state.items.map(item => (Number(item.id) || 0) + 1));
  // An unfinished edit is not a saved purchase change.
  state.editingId = null;
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark-theme', theme === 'dark');
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#101513' : '#f3f6f3';
}

function updateThemeUI() {
  selectors.themeToggleBtn.textContent = state.theme === 'dark' ? 'Switch to Light' : 'Switch to Dark';
  selectors.themeToggleBtn.setAttribute('aria-label', `Switch to ${state.theme === 'dark' ? 'light' : 'dark'} theme`);
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  save();
  applyTheme(state.theme);
  updateThemeUI();
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    showMessage('Browser storage is unavailable. Changes will last until you close or reload this page.', 'error');
    return false;
  }
}

function showMessage(message, type = 'success', field = null) {
  clearTimeout(feedbackTimer);
  selectors.feedback.className = `feedback ${type === 'error' ? 'error' : ''}`;
  selectors.feedback.textContent = message;
  if (field) {
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-errormessage', 'feedback');
    field.focus();
  }
  if (type !== 'error') feedbackTimer = setTimeout(() => {
    selectors.feedback.classList.add('hidden');
    selectors.feedback.textContent = '';
  }, 4500);
}

function persistAndNotify(message) {
  if (save()) showMessage(message);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency', currency: state.currency, maximumFractionDigits: 2
  }).format(amount);
}

function calcSpent() {
  return state.items.reduce((sum, item) => sum + Number(item.amount ?? (Number(item.qty || 0) * Number(item.unitPrice || 0))), 0);
}

function render() {
  const budget = Number(state.budget) || 0;
  const spent = calcSpent();
  const remaining = budget - spent;
  const count = state.items.length;
  const percent = budget > 0 ? spent / budget * 100 : (spent > 0 ? 100 : 0);
  const progress = Math.min(100, Math.max(0, percent));
  selectors.currencySelect.value = state.currency;
  selectors.budgetAmount.textContent = formatCurrency(budget);
  selectors.spentAmount.textContent = formatCurrency(spent);
  selectors.listSpentAmount.textContent = formatCurrency(spent);
  selectors.remainingAmount.textContent = formatCurrency(remaining);
  selectors.remainingAmount.style.color = remaining < 0 ? 'var(--danger)' : '';
  selectors.remainingCard.classList.toggle('is-over-budget', remaining < 0);
  selectors.purchaseCount.textContent = count ? `${count} purchase${count === 1 ? '' : 's'} recorded.` : 'No purchases recorded yet.';
  selectors.itemCount.textContent = count;
  selectors.clearBtn.disabled = !count && !budget;
  selectors.remainingHint.textContent = remaining < 0
    ? `Over budget by ${formatCurrency(Math.abs(remaining))}.`
    : (budget ? 'Available for your next purchase.' : 'Set a budget to get started.');
  selectors.spendingLabel.textContent = budget > 0 ? `${Math.round(percent)}% of budget used` : (spent ? 'No budget set' : 'Ready when you are');
  selectors.progressFill.style.width = `${progress}%`;
  selectors.progressFill.style.background = remaining < 0 ? 'var(--danger)' : '';
  selectors.spendingProgress.setAttribute('aria-valuenow', String(Math.round(progress)));
  selectors.spendingProgress.setAttribute('aria-valuetext', budget > 0
    ? `${Math.round(percent)}% of budget spent${remaining < 0 ? ', over budget' : ''}` : 'No budget set');
  selectors.spendingHint.textContent = budget === 0
    ? (spent ? 'Set a budget to put these purchases in perspective.' : 'Your spending will appear here as you add purchases.')
    : (remaining < 0 ? 'Your purchases exceed the current budget.' : `${formatCurrency(spent)} spent of ${formatCurrency(budget)}.`);

  selectors.itemsList.replaceChildren();
  if (!count) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    const icon = document.createElement('span');
    icon.className = 'empty-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '+';
    const title = document.createElement('h3');
    title.textContent = 'A fresh start.';
    const hint = document.createElement('p');
    hint.textContent = 'Add your first purchase to see your spending take shape.';
    empty.append(icon, title, hint);
    selectors.itemsList.append(empty);
    return;
  }

  for (const item of state.items) {
    const row = document.createElement('li');
    const left = document.createElement('div');
    left.className = 'item-left';
    const name = document.createElement('div');
    name.className = 'item-name';
    const symbol = document.createElement('span');
    symbol.className = 'item-symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = String(item.name || '').slice(0, 1).toUpperCase() || '·';
    const nameText = document.createElement('span');
    nameText.textContent = item.name;
    name.append(symbol, nameText);
    const quantity = Number(item.qty || 1);
    const unit = Number(item.unitPrice ?? item.amount ?? 0);
    const total = Number(item.amount ?? quantity * unit);
    const detail = document.createElement('div');
    detail.className = 'item-detail';
    detail.textContent = `${quantity} × ${formatCurrency(unit)}`;
    const amount = document.createElement('div');
    amount.className = 'item-amount';
    amount.textContent = formatCurrency(total);
    left.append(name, detail, amount);
    const actions = document.createElement('div');
    actions.className = 'item-actions';
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.textContent = 'Edit';
    edit.className = 'edit';
    edit.setAttribute('aria-label', `Edit ${item.name}`);
    edit.addEventListener('click', () => startEdit(item.id));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.className = 'remove';
    remove.setAttribute('aria-label', `Remove ${item.name}`);
    remove.addEventListener('click', () => removeItem(item.id));
    actions.append(edit, remove);
    row.append(left, actions);
    selectors.itemsList.append(row);
  }
}

function readBudget() {
  const value = Number(selectors.budgetInput.value);
  if (!selectors.budgetInput.value.trim() || !Number.isFinite(value) || value < 0) {
    showMessage('Enter a budget amount of zero or more.', 'error', selectors.budgetInput);
    return null;
  }
  return value;
}

function setBudget() {
  const value = readBudget();
  if (value === null) return;
  state.budget = value;
  selectors.budgetInput.value = '';
  render();
  persistAndNotify(`Budget set to ${formatCurrency(value)}.`);
}

function addToBudget() {
  const value = readBudget();
  if (value === null) return;
  state.budget = Number(state.budget || 0) + value;
  selectors.budgetInput.value = '';
  render();
  persistAndNotify(`${formatCurrency(value)} added to your budget.`);
}

function clearBudget() {
  if (!confirm('Reset your budget to zero? Your purchases will stay in the list.')) return;
  state.budget = 0;
  render();
  persistAndNotify('Budget reset. Your purchases are still here.');
}

function resetItemForm() {
  state.editingId = null;
  selectors.itemForm.reset();
  selectors.itemForm.querySelectorAll('[aria-invalid]').forEach(field => {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-errormessage');
  });
  selectors.addItemBtn.replaceChildren(document.createTextNode('Add purchase '));
  const plus = document.createElement('span');
  plus.setAttribute('aria-hidden', 'true');
  plus.textContent = '+';
  selectors.addItemBtn.append(plus);
  selectors.itemFormTitle.textContent = 'Add a purchase';
  selectors.itemFormHint.textContent = 'Keep the little things accounted for.';
  selectors.itemForm.closest('.add-item').classList.remove('is-editing');
  selectors.cancelEditBtn.classList.add('hidden');
}

function addItem() {
  const name = selectors.itemName.value.trim();
  const quantity = Number(selectors.itemQty.value);
  const unitPrice = Number(selectors.itemUnitPrice.value);
  if (!name) return showMessage('Give your purchase a name.', 'error', selectors.itemName);
  if (!Number.isFinite(quantity) || quantity < 1) return showMessage('Enter a quantity of at least one.', 'error', selectors.itemQty);
  if (!selectors.itemUnitPrice.value.trim() || !Number.isFinite(unitPrice) || unitPrice < 0) {
    return showMessage('Enter a unit price of zero or more.', 'error', selectors.itemUnitPrice);
  }
  const amount = quantity * unitPrice;
  if (!Number.isFinite(amount)) return showMessage('This purchase total is too large. Check the quantity and price.', 'error', selectors.itemUnitPrice);
  const editing = state.editingId !== null;
  if (editing) {
    state.items = state.items.map(item => item.id === state.editingId
      ? Object.assign({}, item, { name, qty: quantity, unitPrice, amount }) : item);
  } else {
    state.items.push({ id: state.nextId++, name, qty: quantity, unitPrice, amount });
  }
  resetItemForm();
  render();
  persistAndNotify(`${name} ${editing ? 'updated' : 'added'}.`);
  selectors.itemName.focus();
}

function startEdit(id) {
  const item = state.items.find(purchase => purchase.id === id);
  if (!item) return;
  state.editingId = id;
  selectors.itemName.value = item.name || '';
  selectors.itemQty.value = item.qty || 1;
  selectors.itemUnitPrice.value = item.unitPrice ?? item.amount ?? '';
  selectors.addItemBtn.textContent = 'Save changes';
  selectors.itemFormTitle.textContent = 'Edit purchase';
  selectors.itemFormHint.textContent = 'Update the details, then save your changes.';
  selectors.itemForm.closest('.add-item').classList.add('is-editing');
  selectors.cancelEditBtn.classList.remove('hidden');
  selectors.itemName.focus();
}

function cancelEdit() {
  resetItemForm();
  selectors.itemName.focus();
}

function removeItem(id) {
  const index = state.items.findIndex(purchase => purchase.id === id);
  const item = state.items.find(purchase => purchase.id === id);
  if (state.editingId === id) resetItemForm();
  state.items = state.items.filter(purchase => purchase.id !== id);
  render();
  persistAndNotify(`${item?.name || 'Purchase'} removed.`);
  const nextAction = selectors.itemsList.querySelectorAll('.remove')[Math.min(index, state.items.length - 1)];
  (nextAction || selectors.itemName).focus();
}

function clearAll() {
  if (!confirm('Clear all purchases and reset your budget? This cannot be undone.')) return;
  state = { budget: 0, items: [], nextId: 1, currency: state.currency, theme: state.theme, editingId: null };
  resetItemForm();
  render();
  persistAndNotify('All purchases cleared. Your currency and theme are unchanged.');
}

selectors.budgetForm.addEventListener('submit', event => { event.preventDefault(); setBudget(); });
selectors.itemForm.addEventListener('submit', event => { event.preventDefault(); addItem(); });
selectors.addToBudgetBtn.addEventListener('click', addToBudget);
selectors.clearBudgetBtn.addEventListener('click', clearBudget);
selectors.cancelEditBtn.addEventListener('click', cancelEdit);
selectors.clearBtn.addEventListener('click', clearAll);
selectors.themeToggleBtn.addEventListener('click', toggleTheme);
selectors.currencySelect.addEventListener('change', event => {
  state.currency = event.target.value;
  render();
  persistAndNotify(`Currency display changed to ${state.currency}. Amounts are not converted.`);
});
document.querySelectorAll('input').forEach(field => field.addEventListener('input', () => {
  field.removeAttribute('aria-invalid');
  field.removeAttribute('aria-errormessage');
  if (selectors.feedback.classList.contains('error')) selectors.feedback.classList.add('hidden');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && state.editingId !== null) cancelEdit();
});

load();
ensureDefaults();
applyTheme(state.theme);
updateThemeUI();
render();
