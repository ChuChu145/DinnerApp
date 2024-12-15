import { menuArray } from "./data.js";
const paymentMenu = document.getElementById('payment');
const paymentForm = document.getElementById('payment-form');

// Array to store the user's order
let userOrder = [];

// Event listener to handle Add, Remove, and Complete Order actions
document.addEventListener('click', e => {
    if (e.target.dataset.add) {
        const menuId = parseInt(e.target.dataset.add);
        const selectedItem = menuArray.find(item => item.id === menuId);
        const existingOrderItem = userOrder.find(order => order.id === menuId);

        if (existingOrderItem) {
            existingOrderItem.quantity += 1;
        } else {
            userOrder.push({ ...selectedItem, quantity: 1 });
        }
        render();
    } else if (e.target.dataset.remove) {
        const menuId = parseInt(e.target.dataset.remove);
        const existingOrderItem = userOrder.find(order => order.id === menuId);

        if (existingOrderItem) {
            if (existingOrderItem.quantity > 1) {
                existingOrderItem.quantity -= 1;
            } else {
                userOrder = userOrder.filter(order => order.id !== menuId);
            }
        }
        render();
    } else if (e.target.id === 'orderBtn') {
        paymentMenu.style.display = 'block';
    }
});

// Restrict inputs to numeric values for card details and CVV
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, ''); // Remove non-digit characters
    });
});



// Handle payment form submission
paymentForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const paymentFormData = new FormData(paymentForm);
    const fullName = paymentFormData.get('fullname');

    // Display order completion message
    document.getElementById('order').innerHTML = `
        <div class="order-msg">
            <p class= "payment-msg">Thanks, ${fullName}! Your order is on its way!</p>
        </div>
    `;

    // Hide the payment menu
    paymentMenu.style.display = 'none';

    // Clear the user's order
    userOrder = [];

    // Use setTimeout to display the rating section after 3 seconds
    setTimeout(() => {
        displayRatingSection();
    }, 3000);
});

// Function to display the rating section
function displayRatingSection() {
    document.getElementById('order').innerHTML = `
        <div class="rating-section">
            <h3>Rate Your Experience</h3>
            <div class="stars">
                <i class="fa-solid fa-star" data-rating="1"></i>
                <i class="fa-solid fa-star" data-rating="2"></i>
                <i class="fa-solid fa-star" data-rating="3"></i>
                <i class="fa-solid fa-star" data-rating="4"></i>
                <i class="fa-solid fa-star" data-rating="5"></i>
            </div>
            <p id="rating-feedback"></p>
        </div>
    `;

    // Handle star rating interaction
    const stars = document.querySelectorAll('.stars i');
    let userRating = 0;

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            resetStars();
            highlightStars(star.dataset.rating);
        });

        star.addEventListener('mouseout', resetStars);

        star.addEventListener('click', () => {
            userRating = star.dataset.rating;
            setSelectedStars(userRating);
            document.getElementById('rating-feedback').innerText = `You rated us ${userRating} stars!`;
        });
    });

    function highlightStars(rating) {
        stars.forEach(star => {
            if (star.dataset.rating <= rating) {
                star.classList.add('hovered');
            }
        });
    }

    function resetStars() {
        stars.forEach(star => {
            star.classList.remove('hovered');
        });
    }

    function setSelectedStars(rating) {
        stars.forEach(star => {
            if (star.dataset.rating <= rating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }
}


// Function to generate the menu HTML
function getFeedHtml() {
    let feedHtml = '';

    menuArray.forEach(menu => {
        feedHtml += `
        <div class="menu">
            <div class="menu-inner">
                <img src="/public/images/${menu.emoji}" class="food-img" alt="food sample">
                <div class="inner-text">
                    <p class="food-name">${menu.name}</p>
                    <p class="ingredients">${menu.ingredients.join(', ')}</p>
                    <p class="price">$${menu.price}</p>
                </div>    
                <span class="btn-styling">
                    <i class="fa-solid fa-plus" data-add="${menu.id}"></i>
                </span>
            </div>
        </div>`;
    });

    return feedHtml;
}

// Function to generate the order summary HTML
function getOrderHtml() {
    if (userOrder.length === 0) {
        return '';
    }

    let orderHtml = '<h2 class="order-html">Your Order</h2>';
    let totalPrice = 0;

    // Check for the discount condition
    const hasBeer = userOrder.some(order => order.name.toLowerCase().includes('beer'));
    const hasPizzaOrHamburger = userOrder.some(order => 
        order.name.toLowerCase().includes('pizza') || order.name.toLowerCase().includes('hamburger')
    );

    let discount = 0;

    userOrder.forEach(order => {
        const itemTotalPrice = order.price * order.quantity;
        orderHtml += `
        <div class="order-item">
            <p class="order-name">
                ${order.name} (x${order.quantity}) 
                <span class="remove-text" data-remove="${order.id}">Remove</span>
            </p>
            <p class="order-price price">$${itemTotalPrice}</p>
        </div>`;
        totalPrice += itemTotalPrice;
    });

    // Apply 15% discount if the condition is met
    if (hasBeer && hasPizzaOrHamburger) {
        discount = totalPrice * 0.15;
        totalPrice -= discount;
    }

    orderHtml += `
    <div class="order-total">
        <p class="total-price price">Total Price:</p>
        ${discount > 0 ? `<p class="discount">15% Discount Applied: -$${discount.toFixed(2)}</p>` : ''}
        <p>$${totalPrice.toFixed(2)}</p>
    </div>
    <button id="orderBtn" class="orderBtn">Complete order</button>`;
    return orderHtml;
}


// Function to render the menu and order sections
function render() {
    const menuHtml = getFeedHtml();
    const orderHtml = getOrderHtml();

    document.getElementById('menu-html').innerHTML = menuHtml;
    document.getElementById('order').innerHTML = orderHtml;
}

// Initial render
render();
