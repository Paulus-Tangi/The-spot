const itemForm = document.getElementById('itemForm');
const itemList = document.getElementById('itemList');
const loginForm = document.getElementById('loginForm');
const userStatus = document.getElementById('userStatus');
const logoutButton = document.getElementById('logoutButton');
const loginRequired = document.getElementById('loginRequired');
const pageContent = document.getElementById('pageContent');

const STORAGE_KEY = 'theSpotItems';
const USER_KEY = 'theSpotUser';

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

function loadUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem(USER_KEY);
}

function formatUser(user) {
  if (!user) return 'Not signed in';
  return `${user.name ? `${user.name} ` : ''}(#${user.studentNumber})`;
}

function renderUserStatus() {
  if (!userStatus) return;
  const user = loadUser();

  if (user) {
    userStatus.textContent = `Signed in as ${formatUser(user)}`;
    userStatus.classList.remove('hidden');
  } else {
    userStatus.classList.add('hidden');
  }

  if (logoutButton) {
    logoutButton.classList.toggle('hidden', !user);
  }
}

function requireLogin() {
  const user = loadUser();
  if (!user && loginRequired) {
    loginRequired.classList.remove('hidden');
  }
  if (!user && pageContent) {
    pageContent.classList.add('hidden');
  }
}

function fillSellerContact() {
  const user = loadUser();
  if (!user) return;

  const contactInput = document.getElementById('contact');
  if (contactInput) {
    contactInput.value = `Student #${user.studentNumber}`;
    contactInput.readOnly = true;
  }
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const studentNumber = formData.get('studentNumber').trim();
    const name = formData.get('studentName').trim();

    if (!studentNumber || !/^[0-9]+$/.test(studentNumber)) {
      alert('Please enter a valid student number using only digits.');
      return;
    }

    saveUser({
      studentNumber,
      name,
      createdAt: new Date().toISOString(),
    });

    renderUserStatus();
    alert('Account created. Now you can visit the seller or buyer page.');
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    clearUser();
    renderUserStatus();
    if (pageContent) {
      pageContent.classList.add('hidden');
    }
    if (loginRequired) {
      loginRequired.classList.remove('hidden');
    }
  });
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

renderUserStatus();
requireLogin();
fillSellerContact();
renderItems();
