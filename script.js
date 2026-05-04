const itemForm = document.getElementById('itemForm');
const itemList = document.getElementById('itemList');

const STORAGE_KEY = 'theSpotItems';

function loadItems() {
  const rawData = localStorage.getItem(STORAGE_KEY);
  return rawData ? JSON.parse(rawData) : [];
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderItems() {
  if (!itemList) {
    return;
  }

  const items = loadItems();
  itemList.innerHTML = '';

  if (items.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'empty-state';
    emptyMessage.textContent = 'No items listed yet. Add the first one!';
    itemList.appendChild(emptyMessage);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'item-card';

    card.innerHTML = `
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <div class="item-meta">
        <span class="tag">Condition: ${escapeHtml(item.condition)}</span>
        <span class="tag">Price: $${escapeHtml(item.price)}</span>
        <span class="tag">Contact: ${escapeHtml(item.contact)}</span>
      </div>
    `;

    itemList.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

if (itemForm) {
  itemForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(itemForm);
    const newItem = {
      title: formData.get('title').trim(),
      description: formData.get('description').trim(),
      price: Number(formData.get('price')).toFixed(2),
      condition: formData.get('condition'),
      contact: formData.get('contact').trim(),
      createdAt: new Date().toISOString(),
    };

    if (!newItem.title || !newItem.description || !newItem.contact) {
      return;
    }

    const items = loadItems();
    items.unshift(newItem);
    saveItems(items);
    renderItems();

    itemForm.reset();
    itemForm.querySelector('input, textarea').focus();
  });
}

renderItems();
