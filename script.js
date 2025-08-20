/* JavaScript for Finsrud Frukt store */

// EmailJS configuration placeholders. Real values are loaded at runtime from
// environment variables or an external config.js file (see README for details).
const EMAILJS_CONFIRM_TEMPLATE_ID = "template_2hxbfa7";
const EMAILJS_SERVICE_ID = "service_3lqit3v";
const EMAILJS_TEMPLATE_ID = "template_26zdx42";
const EMAILJS_PUBLIC_KEY = "yT9peAZgkN5cJr4lr";


const emailJsConfig = Object.assign(
  {
    serviceId: EMAILJS_SERVICE_ID,
    templateId: EMAILJS_TEMPLATE_ID,
    publicKey: EMAILJS_PUBLIC_KEY,
    confirmTemplateId: EMAILJS_CONFIRM_TEMPLATE_ID
  },
  window.emailJsConfig || {}
);

// Initialise EmailJS immediately if credentials are provided.
// This ensures the SDK is ready before any order is submitted.
if (emailJsConfig.publicKey && !emailJsConfig.publicKey.startsWith('YOUR_')) {
  emailjs.init(emailJsConfig.publicKey);
}

// Language translations.  Each string in the UI has an entry here for English (en) and Norwegian (no).
const translations = {
  en: {
    title: 'Finsrud Frukt',
    tagline: 'Fresh plums and apples from our garden',
    productsHeading: 'Our Products',
    pricePerKg: 'Price per kg',
    kg: 'Kg',
    placeOrder: 'Place Order',
    yourOrder: 'Your Order',
    totalLabel: 'Total',
    payPrompt: 'Scan the VIPPS QR code to pay',
    success: 'Order submitted! Thank you.',
    error: 'There was an error sending your order. Please try again later.',
    noProducts: 'No products found. Please check your products.json file.',
    selectProductError: 'Please select at least one product by entering quantity.',
    languageLabel: 'Language',
    norskOption: 'Norsk',
    englishOption: 'English'
    ,viewCart: 'View Cart'
    ,addToCart: 'Add to Cart'
    ,cartHeading: 'Your Cart'
    ,checkout: 'Submit Order'
    ,back: 'Back'
    ,nameLabel: 'Name'
    ,phoneLabel: 'Phone (optional)'
    ,commentLabel: 'Message (optional)'
    ,cartEmpty: 'Your cart is empty.'
    ,addedToCart: 'Added to cart!'
    ,comingSoon: 'Coming soon'
    ,nameRequired: 'Please enter your name.'
    ,emailLabel: 'Email (optional)'
  },
  no: {
    title: 'Finsrud Frukt',
    tagline: 'Ferske plommer og epler fra hagen vår',
    productsHeading: 'Våre produkter',
    pricePerKg: 'Pris per kg',
    kg: 'Kg',
    placeOrder: 'Bestill',
    yourOrder: 'Din bestilling',
    totalLabel: 'Totalt',
    payPrompt: 'Skann Vipps‑koden for å betale',
    success: 'Bestillingen ble sendt! Tusen takk.',
    error: 'Det oppsto en feil ved sending av bestilling. Prøv igjen senere.',
    noProducts: 'Ingen produkter funnet. Sjekk products.json.',
    selectProductError: 'Vennligst velg minst ett produkt ved å oppgi mengde.',
    languageLabel: 'Språk',
    norskOption: 'Norsk',
    englishOption: 'Engelsk'
    ,viewCart: 'Vis handlekurv'
    ,addToCart: 'Legg i handlekurv'
    ,cartHeading: 'Din handlekurv'
    ,checkout: 'Send bestilling'
    ,back: 'Tilbake'
    ,nameLabel: 'Navn'
    ,phoneLabel: 'Telefon (valgfritt)'
    ,commentLabel: 'Melding (valgfritt)'
    ,cartEmpty: 'Handlekurven er tom.'
    ,addedToCart: 'Lagt i handlekurv!'
    ,comingSoon: 'Kommer snart'
    ,nameRequired: 'Vennligst oppgi navnet ditt.'
    ,emailLabel: 'E‑post (valgfritt)'
  }
};

// Product name translations.  Keys correspond to the English name in products.json.
const productNameTranslations = {
  'Plum': { en: 'Plum', no: 'Plomme' },
  'Apple': { en: 'Apple', no: 'Eple' }
  , 'Apple Cider': { en: 'Apple Cider', no: 'Eplemost' }
};

// Current language (defaults to English but is updated on load)
let currentLanguage = 'en';

// Shopping cart.  Each entry has { id, name, variety, price, quantity, total }.
let cart = [];

// Variables for product modal
let modalProductImages = [];
let modalProductId = null;
let modalImageIndex = 0;

// Update the text on the cart button to show number of items
function updateCartCount() {
  const btn = document.getElementById('view-cart-btn');
  const countEl = document.getElementById('cart-count');
  if (!btn || !countEl) return;
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  countEl.textContent = count;
  countEl.style.display = count > 0 ? 'flex' : 'none';
  // Set tooltip/aria label
  btn.title = translations[currentLanguage].viewCart;
  btn.setAttribute('aria-label', translations[currentLanguage].viewCart);
}

// Add a product to the cart.  If the product is already present, increment the quantity.
function addToCart(productId, quantity) {
  if (!quantity || quantity <= 0) return;
  const product = productData.find(p => p.id === productId);
  if (!product || product.comingSoon) return;
  // check if already in cart
  const existing = cart.find(item => item.id === productId);
  const addedTotal = quantity * product.price;
  if (existing) {
    existing.quantity += quantity;
    existing.total += addedTotal;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      variety: product.variety,
      price: product.price,
      quantity: quantity,
      total: addedTotal
    });
  }
  updateCartCount();
  showMessage(translations[currentLanguage].addedToCart);
}

// Open modal with detailed product info and image slider
function openProductModal(product) {
  const modal = document.getElementById('product-modal');
  if (!modal) return;
  modalProductId = product.id;
  modalProductImages = (product.images && product.images.length) ? product.images : [product.image];
  modalImageIndex = 0;
  const qtyInput = document.getElementById('modal-quantity');
  if (qtyInput) qtyInput.value = 0;
  updateModalContent(product);
  modal.style.display = 'flex';
}

function updateModalContent(product) {
  const modalImg = document.getElementById('modal-image');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-description');
  const modalAdd = document.getElementById('modal-add-btn');
  const qtyLabel = document.getElementById('modal-kg-label');
  if (modalImg) modalImg.src = `images/${modalProductImages[modalImageIndex]}`;
  if (modalTitle) modalTitle.textContent = `${translateProductName(product.name)} (${product.variety})`;
  if (modalDesc) modalDesc.textContent = product.description ? product.description[currentLanguage] : '';
  if (modalAdd) modalAdd.textContent = translations[currentLanguage].addToCart;
  if (qtyLabel) qtyLabel.textContent = `${translations[currentLanguage].kg}:`;
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.style.display = 'none';
}

function changeModalImage(delta) {
  if (!modalProductImages.length) return;
  modalImageIndex = (modalImageIndex + delta + modalProductImages.length) % modalProductImages.length;
  const modalImg = document.getElementById('modal-image');
  if (modalImg) modalImg.src = `images/${modalProductImages[modalImageIndex]}`;
}

// Render the cart contents in the cart section
function renderCart() {
  const cartSection = document.getElementById('cart-section');
  if (!cartSection) return;
  const list = document.getElementById('cart-list');
  const totalSpan = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const nameLabel = document.getElementById('name-label');
  const phoneLabel = document.getElementById('phone-label');
  const commentLabel = document.getElementById('comment-label');
  const emailLabelEl = document.getElementById('email-label');
  const cartHeading = document.getElementById('cart-heading');
  const cartTotalLabel = document.getElementById('cart-total-label');
  const backBtn = document.getElementById('close-cart-btn');
  // apply translations for labels and buttons
  if (cartHeading) cartHeading.textContent = translations[currentLanguage].cartHeading;
  if (cartTotalLabel) cartTotalLabel.textContent = `${translations[currentLanguage].totalLabel}:`;
  if (checkoutBtn) checkoutBtn.textContent = translations[currentLanguage].checkout;
  if (backBtn) backBtn.textContent = translations[currentLanguage].back;
  if (nameLabel) nameLabel.textContent = `${translations[currentLanguage].nameLabel}:`;
  if (phoneLabel) phoneLabel.textContent = `${translations[currentLanguage].phoneLabel}:`;
  if (commentLabel) commentLabel.textContent = `${translations[currentLanguage].commentLabel}:`;
  if (emailLabelEl) emailLabelEl.textContent = `${translations[currentLanguage].emailLabel}:`;
  // Clear list
  list.innerHTML = '';
  if (cart.length === 0) {
    const li = document.createElement('li');
    li.textContent = translations[currentLanguage].cartEmpty;
    list.appendChild(li);
    if (checkoutBtn) checkoutBtn.disabled = true;
    totalSpan.textContent = '0';
    return;
  }
  let total = 0;
  cart.forEach(item => {
    const li = document.createElement('li');
    const translatedName = translateProductName(item.name);
    const kgLabel = translations[currentLanguage].kg;
    li.textContent = `${item.quantity} ${kgLabel.toLowerCase()} ${translatedName} (${item.variety}) – ${(item.total).toFixed(2)} NOK`;
    list.appendChild(li);
    total += item.total;
  });
  totalSpan.textContent = total.toFixed(2);
  if (checkoutBtn) checkoutBtn.disabled = false;
}

// Show the cart section and hide other sections
function showCart() {
  const productSection = document.querySelector('.product-section');
  const cartSection = document.getElementById('cart-section');
  const orderSummary = document.getElementById('order-summary');
  if (productSection) productSection.style.display = 'none';
  if (orderSummary) orderSummary.style.display = 'none';
  if (cartSection) {
    cartSection.style.display = 'block';
    renderCart();
  }
}

// Hide the cart section and show products
function hideCart() {
  const productSection = document.querySelector('.product-section');
  const cartSection = document.getElementById('cart-section');
  if (productSection) productSection.style.display = 'block';
  if (cartSection) cartSection.style.display = 'none';
  // Reapply translations and update view cart button when returning
  applyTranslations();
  loadProducts();
}

// Submit the order: validate inputs, copy to hidden fields, send via EmailJS, show summary
function submitOrder() {
  // Validate name
  const nameInput = document.getElementById('customer-name');
  const phoneInput = document.getElementById('customer-phone');
  const noteInput = document.getElementById('customer-note');
  const name = nameInput ? nameInput.value.trim() : '';
  if (!name) {
    alert(translations[currentLanguage].nameRequired);
    return;
  }
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const note = noteInput ? noteInput.value.trim() : '';
  // Read email (optional)
  const emailInput = document.getElementById('customer-email');
  const email = emailInput ? emailInput.value.trim() : '';
  // Populate hidden fields
  document.getElementById('nameField').value = name;
  document.getElementById('phoneField').value = phone;
  document.getElementById('noteField').value = note;
  document.getElementById('emailField').value = email;
  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.total, 0);
  // Send order to store owner via EmailJS
  sendOrder(cart, total);
  // Send confirmation email to the customer if an email address was provided
  sendConfirmationEmail(cart, total, name, phone, note, email);
  // Show summary after sending
  displaySummary(cart, total);
  // Clear cart and inputs
  cart = [];
  nameInput.value = '';
  phoneInput.value = '';
  noteInput.value = '';
  if (emailInput) emailInput.value = '';
  updateCartCount();
  hideCart();
}

// Helper to translate product names
function translateProductName(name) {
  const entry = productNameTranslations[name];
  if (!entry) return name;
  return entry[currentLanguage] || name;
}

// Apply translations to static UI elements
function applyTranslations() {
  // Header
  document.getElementById('title').textContent = translations[currentLanguage].title;
  document.getElementById('tagline').textContent = translations[currentLanguage].tagline;
  // Language label and options
  const languageLabel = document.getElementById('language-label');
  if (languageLabel) {
    languageLabel.textContent = `${translations[currentLanguage].languageLabel}:`;
  }
  const languageSelect = document.getElementById('language-select');
  if (languageSelect) {
    // update option text.  We need to iterate options because we can't set innerHTML due to selected value.
    Array.from(languageSelect.options).forEach(opt => {
      if (opt.value === 'no') {
        opt.textContent = translations[currentLanguage].norskOption;
      } else if (opt.value === 'en') {
        opt.textContent = translations[currentLanguage].englishOption;
      }
    });
  }
  // Products section heading
  const productsHeading = document.getElementById('products-heading');
  if (productsHeading) productsHeading.textContent = translations[currentLanguage].productsHeading;
  // Button text
  const calcBtn = document.getElementById('calculate-btn');
  if (calcBtn) calcBtn.textContent = translations[currentLanguage].placeOrder;
  // Order summary heading and labels
  const orderHeading = document.getElementById('order-heading');
  if (orderHeading) orderHeading.textContent = translations[currentLanguage].yourOrder;
  const totalLabel = document.getElementById('total-label');
  if (totalLabel) totalLabel.textContent = `${translations[currentLanguage].totalLabel}:`;
  const qrPrompt = document.getElementById('qr-prompt');
  if (qrPrompt) qrPrompt.textContent = translations[currentLanguage].payPrompt;
  // Update cart button label with correct translation and count
  updateCartCount();
}

// Load product data from JSON file and render on page
/**
 * Render product cards into the page.
 * Uses the global productData array that is loaded on page initialization.
 * Avoids fetching JSON at runtime to support static hosting and file:// access.
 */
function loadProducts() {
  const listContainer = document.querySelector('.product-list');
  if (!Array.isArray(productData) || productData.length === 0) {
    listContainer.innerHTML = `<p>${translations[currentLanguage].noProducts}</p>`;
    return;
  }
  listContainer.innerHTML = '';
  productData.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'card';
    const translatedName = translateProductName(product.name);
    const priceText = translations[currentLanguage].pricePerKg;
    const kgLabel = translations[currentLanguage].kg;
    let cardInner = '';
    const firstImage = (product.images && product.images.length)
      ? product.images[0]
      : product.image;
    if (product.comingSoon) {
      // Show coming soon label without inputs
      cardInner = `
        <img src="images/${firstImage}" alt="${translatedName} ${product.variety}" class="product-thumb">
        <div class="card-content">
          <h3>${translatedName} (${product.variety})</h3>
          <p><em>${translations[currentLanguage].comingSoon}</em></p>
          ${product.description ? `<p class=\"product-description\">${product.description[currentLanguage]}</p>` : ''}
        </div>
      `;
    } else {
      cardInner = `
        <img src="images/${firstImage}" alt="${translatedName} ${product.variety}" class="product-thumb">
        <div class="card-content">
          <h3>${translatedName} (${product.variety})</h3>
          <p>${priceText}: <strong>${product.price} NOK</strong></p>
          ${product.description ? `<p class=\"product-description\">${product.description[currentLanguage]}</p>` : ''}
          <div class="quantity">
            <label for="${product.id}">${kgLabel}:</label>
            <input type="number" id="${product.id}" min="0" step="0.5" value="0">
          </div>
          <button class="add-to-cart-btn" data-id="${product.id}">${translations[currentLanguage].addToCart}</button>
        </div>
      `;
    }
    card.innerHTML = cardInner;
    const imgEl = card.querySelector('img');
    if (imgEl) {
      imgEl.addEventListener('click', () => openProductModal(product));
    }
    listContainer.appendChild(card);
  });
}

// Calculate total price and show order summary
function calculateOrder() {
  const inputs = document.querySelectorAll('.product-list input[type="number"]');
  const orderItems = [];
  let total = 0;
  inputs.forEach((input) => {
    const quantity = parseFloat(input.value);
    if (quantity > 0) {
      const productId = input.id;
      const product = productData.find((p) => p.id === productId);
      if (product) {
        const itemTotal = quantity * product.price;
        orderItems.push({
          id: product.id,
          name: product.name,
          variety: product.variety,
          price: product.price,
          quantity: quantity,
          total: itemTotal
        });
        total += itemTotal;
      }
    }
  });
  if (orderItems.length === 0) {
    alert(translations[currentLanguage].selectProductError);
    return;
  }
  // Show summary section
  displaySummary(orderItems, total);
  // Send order via EmailJS
  sendOrder(orderItems, total);
}

// Display summary and QR code
function displaySummary(items, total) {
  const summarySection = document.getElementById('order-summary');
  const itemList = summarySection.querySelector('ul');
  const totalSpan = summarySection.querySelector('#total-amount');
  itemList.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    const translatedName = translateProductName(item.name);
    // Use translation for kg label
    const kgLabel = translations[currentLanguage].kg;
    li.textContent = `${item.quantity} ${kgLabel.toLowerCase()} ${translatedName} (${item.variety}) – ${(item.total).toFixed(2)} NOK`;
    itemList.appendChild(li);
  });
  totalSpan.textContent = total.toFixed(2);
  summarySection.style.display = 'block';
}

// Send order via EmailJS using a hidden form.  This function composes a human‑readable order summary,
// populates hidden form fields and submits the form through EmailJS.  On success or failure,
// a translated message is displayed to the user.
function sendOrder(items, total) {
  const form = document.getElementById('orderForm');
  if (!form) {
    console.warn('orderForm element not found; cannot send email');
    return;
  }
  // Ensure EmailJS is configured before attempting to send
  if (!emailJsConfig.serviceId || emailJsConfig.serviceId.startsWith('YOUR_') ||
      !emailJsConfig.templateId || emailJsConfig.templateId.startsWith('YOUR_')) {
    console.warn('EmailJS credentials are missing; skipping send');
    showMessage(translations[currentLanguage].error, true);
    return;
  }
  // Build human‑readable order text for the email
  const lines = items.map(item => {
    const translatedName = translateProductName(item.name);
    return `${item.quantity} ${translations[currentLanguage].kg.toLowerCase()} ${translatedName} (${item.variety}) – ${(item.total).toFixed(2)} NOK`;
  });
  const orderText = lines.join('\n');
  // Populate hidden fields used by EmailJS.  Name, phone and note fields should be populated externally.
  document.getElementById('orderField').value = orderText;
  document.getElementById('totalField').value = total.toFixed(2);
  // Send the form via EmailJS
  emailjs.sendForm(emailJsConfig.serviceId, emailJsConfig.templateId, form)
    .then(() => {
      showMessage(translations[currentLanguage].success);
    })
    .catch((error) => {
      console.warn('EmailJS sendForm failed:', error);
      showMessage(translations[currentLanguage].error, true);
    });
}

// Send a confirmation email to the customer if they provided their email address.
// This uses a separate EmailJS template (emailJsConfig.confirmTemplateId).
function sendConfirmationEmail(items, total, name, phone, note, email) {
  // Do nothing if no confirmation template is configured or if email is empty
  if (!emailJsConfig.confirmTemplateId || emailJsConfig.confirmTemplateId === 'YOUR_CONFIRM_TEMPLATE_ID') return;
  if (!email) return;
  // Compose the order summary
  const lines = items.map(item => {
    const translatedName = translateProductName(item.name);
    return `${item.quantity} ${translations[currentLanguage].kg.toLowerCase()} ${translatedName} (${item.variety}) – ${(item.total).toFixed(2)} NOK`;
  });
  const orderText = lines.join('\n');
  const variables = {
    name: name,
    phone: phone,
    note: note,
    order: orderText,
    total: total.toFixed(2),
    to_email: email,
    email: email
  };
  emailjs.send(emailJsConfig.serviceId, emailJsConfig.confirmTemplateId, variables)
    .catch(err => {
      console.warn('EmailJS confirmation failed:', err);
    });
}

// Show success or error message
function showMessage(msg, isError = false) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = msg;
  messageDiv.style.color = isError ? 'red' : 'green';
  messageDiv.style.display = 'block';
}

// Global productData variable for quick lookup
let productData = [];

// Fallback products used when products.json cannot be loaded (e.g. when opened via file://)
const fallbackProducts = [
  {
    id: "plum-opal",
    category: "plum",
    name: "Plum",
    variety: "Opal",
    price: 50,
    image: "plums.jpg",
    images: [
      "opal1.png",
      "opal2.png"
    ],
    description: {
      en: "Early ripening plum with sweet, juicy flesh.",
      no: "Tidlig modnende plomme med søtt, saftig fruktkjøtt."
    }
  },
  {
    id: "plum-victoria",
    category: "plum",
    name: "Plum",
    variety: "Victoria",
    price: 55,
    image: "victoria_plum.png",
    images: [
      "victoria_plum.png"
    ],
    description: {
      en: "Classic plum, sweet and great for desserts.",
      no: "Klassisk plomme, søt og fin til desserter."
    },
    comingSoon: true
  },
  {
    id: "apple-transparent-blanche",
    category: "apple",
    name: "Apple",
    variety: "Transparente Blanche",
    price: 40,
    image: "transparante_b_1.png",
    images: [
      "transparante_b_2.png"
    ],
    description: {
      en: "Early-season apple with pale yellow skin and tender flesh.",
      no: "Tidligmodnende eple med blekgult skall og saftig fruktkjøtt."
    }
  },
  {
    id: "eplemost",
    category: "juice",
    name: "Fresh apple juice",
    variety: "Eplemost",
    price: 0,
    image: "apple.jpg",
    images: [
      "apple.jpg"
    ],
    comingSoon: true,
    description: {
      en: "Freshly pressed apple cider from our orchard at beautiful Helgøya.",
      no: "Nypresset eplemost fra vår frukthage på Helgøya."
    }
  }
];


// Initial page load
window.addEventListener('DOMContentLoaded', async () => {
  // Determine and set default language
  const storedLang = localStorage.getItem('frukt_language');
  if (storedLang) {
    currentLanguage = storedLang;
  } else {
    // Use browser language: prefer Norwegian if starts with 'no' or 'nb'
    const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    currentLanguage = navLang.startsWith('no') || navLang.startsWith('nb') ? 'no' : 'en';
    localStorage.setItem('frukt_language', currentLanguage);
  }
  // Set language select value
  const langSelect = document.getElementById('language-select');
  if (langSelect) langSelect.value = currentLanguage;
  // Apply translations to UI
  applyTranslations();
  // load products and store them in productData
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) {
      throw new Error(`Unable to fetch products.json, status ${response.status}`);
    }
    const json = await response.json();
    // If JSON is not an array or is empty, fall back
    if (Array.isArray(json) && json.length > 0) {
      productData = json;
    } else {
      throw new Error('products.json is empty or not an array');
    }
  } catch (err) {
    console.warn('Failed to load products.json, using fallback product list.', err);
    productData = fallbackProducts;
  }
  // Render products
  loadProducts();
  // Attach click event to view cart button
  const viewCartBtn = document.getElementById('view-cart-btn');
  if (viewCartBtn) {
    viewCartBtn.addEventListener('click', () => {
      showCart();
    });
  }
  // Attach click event to checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', submitOrder);
  }
  // Attach click event to close cart button
  const closeCartBtn = document.getElementById('close-cart-btn');
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', hideCart);
  }
  // Attach change event to language selector
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      const newLang = e.target.value;
      currentLanguage = newLang;
      localStorage.setItem('frukt_language', newLang);
      applyTranslations();
      // re-render products with new language
      loadProducts();
      // update cart count and cart view if visible
      updateCartCount();
      if (document.getElementById('cart-section').style.display === 'block') {
        renderCart();
      }
    });
  }
  // Attach event delegation for add-to-cart buttons
  const listContainer = document.querySelector('.product-list');
  if (listContainer) {
    listContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.add-to-cart-btn');
      if (btn) {
        const productId = btn.getAttribute('data-id');
        const card = btn.closest('.card');
        const input = card ? card.querySelector('input[type="number"]') : null;
        const quantity = input ? parseFloat(input.value) : 0;
        addToCart(productId, quantity);
      }
    });
  }
  // Modal events
  const modal = document.getElementById('product-modal');
  const closeModalBtn = document.querySelector('#product-modal .close');
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeProductModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeProductModal();
    });
  }
  const prevBtn = document.getElementById('modal-prev');
  const nextBtn = document.getElementById('modal-next');
  if (prevBtn) prevBtn.addEventListener('click', () => changeModalImage(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeModalImage(1));
  const modalAddBtn = document.getElementById('modal-add-btn');
  if (modalAddBtn) {
    modalAddBtn.addEventListener('click', () => {
      const qty = parseFloat(document.getElementById('modal-quantity').value);
      addToCart(modalProductId, qty);
      closeProductModal();
    });
  }
});
