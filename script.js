const productNameInput = document.getElementById('new-product-name'); 
const addButton = document.getElementById('add-product-btn'); 
const productListDiv = document.querySelector('.product-list-area'); 
const remainingDisplay = document.getElementById('remaining-items'); 
const boughtDisplay = document.getElementById('bought-items'); 

let shoppingList = [];
let currentProductId = 1;

//Функція для створення елемента товару в HTML
function createProductHtmlElement(product) {
    const productEntry = document.createElement('div'); 
    productEntry.classList.add('product-entry'); 
    productEntry.dataset.id = product.id; 

    if (product.bought) {
        productEntry.classList.add('bought-item');
    }

    let nameElement; //(буде або input, або span)

    if (product.editing) {
        nameElement = document.createElement('input');
        nameElement.type = 'text';
        nameElement.classList.add('product-name-input');
        nameElement.value = product.name; // Встановлюємо поточну назву

        nameElement.addEventListener('blur', (event) => {
            const newName = event.target.value.trim(); 
            if (newName && newName !== product.name) {
                product.name = newName; 
            }
            product.editing = false; 
            renderShoppingList(); 
        });

        nameElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.target.blur(); //(це спрацює blur і збереже зміни)
            }
        });
        setTimeout(() => nameElement.focus(), 0);
    } else {
        //звичайний текст (span)
        nameElement = document.createElement('span');
        nameElement.classList.add('product-name');
        nameElement.textContent = product.name; 
        nameElement.addEventListener('click', () => {
            if (!product.bought) {
                product.editing = true;
                renderShoppingList(); 
            }
        });
    }
    productEntry.appendChild(nameElement); 

    //Контролери кількості (плюс/мінус)
    const quantityControls = document.createElement('div');
    quantityControls.classList.add('quantity-controls');

    const minusButton = document.createElement('button');
    minusButton.classList.add('quantity-btn', 'minus');
    minusButton.dataset.tooltip = "Зменшити кількість";
    minusButton.textContent = '-';
    minusButton.disabled = product.quantity <= 1;
    minusButton.addEventListener('click', () => {
        if (product.quantity > 1) {
            product.quantity--; 
            renderShoppingList(); 
        }
    });

    const quantityInput = document.createElement('input');
    quantityInput.type = 'text';
    quantityInput.classList.add('quantity-input', 'readonly');
    quantityInput.value = product.quantity; 
    quantityInput.readOnly = true; 

    const plusButton = document.createElement('button');
    plusButton.classList.add('quantity-btn', 'plus');
    plusButton.dataset.tooltip = "Збільшити кількість";
    plusButton.textContent = '+';
    plusButton.addEventListener('click', () => {
        product.quantity++; 
        renderShoppingList(); 
    });

    //Додаємо кнопки та поле кількості до контейнера
    quantityControls.appendChild(minusButton);
    quantityControls.appendChild(quantityInput);
    quantityControls.appendChild(plusButton);

    // --- Кнопка статусу (Куплено/Не куплено) ---
    const statusButton = document.createElement('button');
    statusButton.classList.add('status-button');
    if (product.bought) {
        statusButton.classList.add('bought');
        statusButton.textContent = 'Куплено';
        statusButton.dataset.tooltip = 'Позначити товар як не куплений';
    } else {
        statusButton.classList.add('not-bought');
        statusButton.textContent = 'Не куплено';
        statusButton.dataset.tooltip = 'Позначити товар як куплений';
    }
    statusButton.addEventListener('click', () => {
        product.bought = !product.bought; 
        product.editing = false; 
        renderShoppingList(); 
    });

    //Кнопка видалення
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.dataset.tooltip = 'Видалити товар';
    deleteButton.textContent = '×'; 
    deleteButton.addEventListener('click', () => {
        shoppingList = shoppingList.filter(item => item.id !== product.id);
        renderShoppingList(); 
    });

    if (!product.bought) {
        productEntry.appendChild(quantityControls);
        productEntry.appendChild(statusButton);
        productEntry.appendChild(deleteButton);
    } else {
        productEntry.appendChild(statusButton);
    }
    return productEntry; 
}

//Оновлює секції "Не куплено" та "Куплено"
function updateSummaryDisplays() {
    remainingDisplay.innerHTML = ''; 
    boughtDisplay.innerHTML = '';

    const remainingProducts = shoppingList.filter(p => !p.bought);
    const boughtProducts = shoppingList.filter(p => p.bought);

    remainingProducts.forEach(product => {
        const span = document.createElement('span');
        span.classList.add('status-badge');
        span.innerHTML = `${product.name} <span class="status-amount">${product.quantity}</span>`;
        remainingDisplay.appendChild(span);
    });

    boughtProducts.forEach(product => {
        const span = document.createElement('span');
        span.classList.add('status-badge', 'bought-badge');
        span.innerHTML = `${product.name} <span class="status-amount">${product.quantity}</span>`;
        boughtDisplay.appendChild(span);
    });
}

//Основна функція для оновлення всього списку на сторінці
function renderShoppingList() {
    const addProductSection = document.querySelector('.add-product-section');
    if (addProductSection && productListDiv.contains(addProductSection)) {
        productListDiv.removeChild(addProductSection);
    }
    productListDiv.innerHTML = ''; 

    if (addProductSection) {
        productListDiv.prepend(addProductSection);
    }

    shoppingList.forEach(product => {
        const productElement = createProductHtmlElement(product); 
        productListDiv.appendChild(productElement); 
    });

    updateSummaryDisplays(); 
    shoppingListSave(); 
}

//Функція для додавання нового товару
function addNewProduct() {
    const productName = productNameInput.value.trim(); 
    if (productName) { 
        const newProduct = {
            id: currentProductId++, 
            name: productName,
            quantity: 1, 
            bought: false, 
            editing: false 
        };
        shoppingList.push(newProduct); 
        productNameInput.value = ''; 

        setTimeout(() => {
            productNameInput.focus();
        }, 0);
        renderShoppingList();
    }
}

//Функції для збереження та завантаження даних
function shoppingListSave() {
    try {
        localStorage.setItem('shoppingListProducts', JSON.stringify(shoppingList));
    } catch (e) {
        console.error("Помилка при збереженні списку:", e);
    }
}

function shoppingListLoad() {
    try {
        const storedList = localStorage.getItem('shoppingListProducts');
        if (storedList) {
            return JSON.parse(storedList);
        }
    } catch (e) {
        console.error("Помилка при завантаженні списку:", e);
    }
    return null; 
}

//Обробники подій (коли користувач щось робить)
//натискаємо кнопку "Додати товар"
addButton.addEventListener('click', addNewProduct);

productNameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addNewProduct();
    }
});

//Ініціалізація (що робиться при завантаженні сторінки)
document.addEventListener('DOMContentLoaded', () => {
    const loadedList = shoppingListLoad(); 

    if (loadedList && loadedList.legth>1) {
        shoppingList = loadedList; 
        if (shoppingList.length > 0) {
            currentProductId = Math.max(...shoppingList.map(p => p.id)) + 1;
        } else {
            currentProductId = 1;
        }
    } else {
        shoppingList = [
            { id: currentProductId++, name: 'Помідори', quantity: 3, bought: false, editing: false },
            { id: currentProductId++, name: 'Печиво', quantity: 2, bought: true, editing: false },
            { id: currentProductId++, name: 'Молоко', quantity: 1, bought: false, editing: false }
        ];
    }
    renderShoppingList(); 
});
