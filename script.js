// Global variables
let cart = [];
let currentQuantity = 1;
// Default color set to 'black' since only black and white options exist
let currentColor = 'black';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeBubbles();
    initializeProductFeatures();
    preloadProductImages();
    
    // Test Supabase connection (for debugging)
    setTimeout(() => {
        testSupabaseConnection().then(success => {
            if (success) {
                console.log('✅ Supabase connection verified');
            } else {
                console.warn('⚠️ Supabase connection failed - check your configuration');
            }
        });
    }, 1000);
});

function initializeApp() {
    setupColorSelection();
    setupThumbnailSelection();
    updateCartDisplay();
}

// Color selection functionality
function setupColorSelection() {
    const colorOptions = document.querySelectorAll('.color-option');
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            colorOptions.forEach(opt => opt.classList.remove('active'));

            // Add active class to clicked option
            this.classList.add('active');

            // Get the color chosen and set it as current
            const color = this.dataset.color;
            currentColor = color;

            // Determine if this color option specifies a particular view via data-image
            const imageView = this.dataset.image;

            if (imageView) {
                // Synchronize thumbnail selection to match the specified view
                const thumbnails = document.querySelectorAll('.thumbnail');
                thumbnails.forEach(thumb => thumb.classList.remove('active'));
                const selectedThumb = document.querySelector(`.thumbnail[data-image="${imageView}"]`);
                if (selectedThumb) selectedThumb.classList.add('active');

                // Update the main image using the current color and the specified view
                updateMainImage(imageView);
            } else {
                // Otherwise update the main product image based solely on color
                updateProductColor(color);
            }
        });
    });
}

function updateProductColor(color) {
    const activeThumbnail = document.querySelector('.thumbnail.active');
    const currentView = activeThumbnail ? parseInt(activeThumbnail.dataset.image) : 1;
    
    // Get the appropriate image based on color and current view
    const imageUrl = getProductImage(color, currentView);
    setMainImage(imageUrl);
}

// Thumbnail selection functionality
function setupThumbnailSelection() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // Remove active class from all thumbnails
            thumbnails.forEach(thumb => thumb.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            this.classList.add('active');
            
            // Get the image number
            const imageNumber = this.dataset.image;
            
            // Update the main product image
            updateMainImage(imageNumber);
        });
    });
}

function updateMainImage(imageNumber) {
    // Get the appropriate image based on current color and selected view
    const imageUrl = getProductImage(currentColor, parseInt(imageNumber));
    const imageName = getGalleryItemName(parseInt(imageNumber));
    
    setMainImage(imageUrl, `ذكرة أورب™ - ${imageName}`);
}

// Helper to set main image with safe fade-in (handles cache too)
function setMainImage(src, altText) {
    const mainImage = document.getElementById('mainProductImage');
    if (!mainImage) return;
    
    mainImage.style.transition = 'opacity 0.3s ease';
    mainImage.style.opacity = '0';
    if (altText) mainImage.alt = altText;
    
    const onLoad = () => {
        mainImage.style.opacity = '1';
        mainImage.removeEventListener('load', onLoad);
        mainImage.removeEventListener('error', onError);
    };
    const onError = () => {
        // If an error occurs, still show the element to avoid it appearing hidden
        mainImage.style.opacity = '1';
        mainImage.removeEventListener('load', onLoad);
        mainImage.removeEventListener('error', onError);
    };
    mainImage.addEventListener('load', onLoad);
    mainImage.addEventListener('error', onError);
    mainImage.src = src;
}

// Quantity controls
function changeQuantity(delta) {
    currentQuantity = Math.max(1, currentQuantity + delta);
    document.getElementById('quantity').textContent = currentQuantity;
}

// Add to cart functionality
function addToCart() {
    const product = {
        id: 'dikraorb-classic',
        name: 'ذكرة أورب™ الكلاسيكي',
        price: 349,
        color: currentColor,
        quantity: currentQuantity,
        image: getCurrentOrbStyle()
    };
    
    // Check if product with same color already exists
    const existingIndex = cart.findIndex(item => 
        item.id === product.id && item.color === product.color
    );
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity += currentQuantity;
    } else {
        cart.push(product);
    }
    
    updateCartDisplay();
    showAddToCartFeedback();
    // Immediately open the cart modal so the user can review and proceed to payment
    openCart();
}

function getCurrentOrbStyle() {
    const activeThumbnail = document.querySelector('.thumbnail.active');
    return activeThumbnail ? activeThumbnail.dataset.image : '1';
}

function showAddToCartFeedback() {
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const originalText = addToCartBtn.innerHTML;
    
    addToCartBtn.innerHTML = '<i class="fas fa-check"></i> تم الإضافة!';
    addToCartBtn.style.background = '#27ae60';
    addToCartBtn.style.borderColor = '#27ae60';
    
    setTimeout(() => {
        addToCartBtn.innerHTML = originalText;
        addToCartBtn.style.background = '';
        addToCartBtn.style.borderColor = '';
    }, 2000);
}

// Buy now functionality
function buyNow() {
    // Add to cart first
    addToCart();
    
    // Then proceed to checkout
    setTimeout(() => {
        checkout();
    }, 1000);
}

// Cart functionality
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart modal if it's open
    if (document.getElementById('cartModal').style.display === 'block') {
        updateCartModal();
    }
}

function openCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.style.display = 'block';
    updateCartModal();
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function updateCartModal() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>سلتك فارغة</p>
            </div>
        `;
        cartTotal.textContent = '0 ريال';
    } else {
        let total = 0;
        cartItems.innerHTML = cart.map(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const colorNames = {
                'red': 'أحمر كلاسيكي',
                'blue': 'أزرق محيطي',
                'purple': 'بنفسجي ملكي',
                'gold': 'ذهبي فاخر',
                // New color names for simplified options
                'black': 'أسود',
                'white': 'أبيض'
            };

            // Determine image source for the cart item based on selected color and view
            const viewId = parseInt(item.image);
            const productImgSrc = getProductImage(item.color, viewId);
            
            return `
                <div class="cart-item">
                    <div class="cart-item-thumbnail">
                        <img src="${productImgSrc}" alt="صورة المنتج" />
                    </div>
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>اللون: ${colorNames[item.color] || item.color}</p>
                        <p>الكمية: ${item.quantity}</p>
                    </div>
                    <div class="item-price">
                        <span>${itemTotal} ريال</span>
                        <button onclick="removeFromCart('${item.id}', '${item.color}')" class="remove-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        cartTotal.textContent = `${total} ريال`;
    }
}

function removeFromCart(id, color) {
    cart = cart.filter(item => !(item.id === id && item.color === color));
    updateCartDisplay();
}

// Checkout functionality
function checkout() {
    if (cart.length === 0) {
        alert('سلتك فارغة!');
        return;
    }
    
    // Close cart modal and open checkout modal
    closeCart();
    openCheckout();
}

function openCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.style.display = 'block';
    updateOrderSummary();
    document.body.style.overflow = 'hidden';
}

function closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function backToCart() {
    closeCheckout();
    openCart();
}

function updateOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');
    
    if (cart.length === 0) {
        orderItems.innerHTML = '<p>لا توجد عناصر في الطلب</p>';
        orderTotal.textContent = '0 ريال';
        return;
    }
    
    let total = 0;
    orderItems.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const colorNames = {
            'red': 'أحمر كلاسيكي',
            'blue': 'أزرق محيطي',
            'purple': 'بنفسجي ملكي',
            'gold': 'ذهبي فاخر',
            // New color names for simplified options
            'black': 'أسود',
            'white': 'أبيض'
        };
        
        return `
            <div class="order-item">
                <div class="order-item-info">
                    <h5>${item.name}</h5>
                    <p>اللون: ${colorNames[item.color] || item.color}</p>
                    <p>الكمية: ${item.quantity}</p>
                </div>
                <div class="order-item-price">
                    ${itemTotal} ريال
                </div>
            </div>
        `;
    }).join('');
    
    orderTotal.textContent = `${total} ريال`;
}

async function processOrder(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const orderData = {
        customer: {
            name: formData.get('customerName'),
            email: formData.get('customerEmail'),
            phone: formData.get('customerPhone'),
            address: formData.get('customerAddress'),
            city: formData.get('customerCity'),
            deliveryNotes: formData.get('deliveryNotes')
        },
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        orderDate: new Date().toISOString()
    };
    
    // Validate form
    if (!validateOrderForm(orderData)) {
        return;
    }
    
    // Show processing state
    const submitBtn = document.querySelector('.place-order-btn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري المعالجة...';
    submitBtn.disabled = true;
    
    try {
        // Generate unique order number
        const orderNumber = generateOrderNumber();
        
        // Get main product details (assuming single product for now)
        const mainProduct = orderData.items[0] || orderData.items;
        const productColor = mainProduct.color || 'red';
        const productQuantity = mainProduct.quantity || 1;
        
        // Prepare data for Supabase
        const supabaseOrderData = {
            order_number: orderNumber,
            customer_name: orderData.customer.name,
            customer_email: orderData.customer.email,
            customer_phone: orderData.customer.phone,
            customer_address: orderData.customer.address,
            customer_city: orderData.customer.city,
            delivery_notes: orderData.customer.deliveryNotes || null,
            items: JSON.stringify(orderData.items), // Convert to JSON string
            product_color: productColor, // Main product color
            product_quantity: productQuantity, // Main product quantity
            total_amount: orderData.total,
            currency: 'SAR',
            status: 'pending',
            payment_status: 'pending',
            notes: `Order placed via website on ${new Date().toLocaleDateString('ar-SA')}`
        };
        
        // Check if Supabase is configured
        if (typeof supabase === 'undefined') {
            throw new Error('Supabase not configured. Please check your configuration.');
        }
        
        // Insert order into Supabase
        const { data, error } = await supabase
            .from(ORDERS_TABLE)
            .insert([supabaseOrderData])
            .select();
        
        if (error) {
            throw error;
        }
        
        // Show success message with actual order number
        alert(`تم تأكيد طلبك بنجاح!\n\nرقم الطلب: #${orderNumber}\nالمجموع: ${orderData.total} ريال\n\nسيتم التواصل معك قريباً لتأكيد التفاصيل.`);
        
        // Log successful order for debugging
        console.log('Order saved successfully:', data);
        
        // Reset form and cart
        event.target.reset();
        cart = [];
        updateCartDisplay();
        closeCheckout();
        
    } catch (error) {
        console.error('Error saving order:', error);
        
        // Show error message
        alert(`حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.\n\nError: ${error.message}`);
        
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function generateOrderNumber() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `DK${timestamp}${random}`.toUpperCase();
}

// Function to test Supabase connection (for debugging)
async function testSupabaseConnection() {
    try {
        if (typeof supabase === 'undefined') {
            console.error('Supabase not configured');
            return false;
        }
        
        const { data, error } = await supabase
            .from(ORDERS_TABLE)
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('Supabase connection error:', error);
            return false;
        }
        
        console.log('Supabase connection successful');
        return true;
    } catch (error) {
        console.error('Supabase test failed:', error);
        return false;
    }
}

// Function to get orders by email (for customer lookup)
async function getOrdersByEmail(email) {
    try {
        if (typeof supabase === 'undefined') {
            throw new Error('Supabase not configured');
        }
        
        const { data, error } = await supabase
            .from(ORDERS_TABLE)
            .select('*')
            .eq('customer_email', email)
            .order('created_at', { ascending: false });
        
        if (error) {
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
}

function validateOrderForm(orderData) {
    const { customer } = orderData;
    
    if (!customer.name || customer.name.trim().length < 2) {
        alert('يرجى إدخال اسم صحيح');
        return false;
    }
    
    if (!customer.email || !isValidEmail(customer.email)) {
        alert('يرجى إدخال بريد إلكتروني صحيح');
        return false;
    }
    
    if (!customer.phone || customer.phone.trim().length < 10) {
        alert('يرجى إدخال رقم هاتف صحيح');
        return false;
    }
    
    if (!customer.address || customer.address.trim().length < 10) {
        alert('يرجى إدخال عنوان كامل');
        return false;
    }
    
    if (!customer.city) {
        alert('يرجى اختيار المدينة');
        return false;
    }
    
    if (!document.getElementById('agreeTerms').checked) {
        alert('يرجى الموافقة على الشروط والأحكام');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showTerms() {
    alert('الشروط والأحكام:\n\n1. جميع المنتجات مضمونة الجودة\n2. التوصيل خلال 3-5 أيام عمل\n3. إمكانية الإرجاع خلال 14 يوم\n4. الأسعار شاملة ضريبة القيمة المضافة');
}

function showPrivacy() {
    alert('سياسة الخصوصية:\n\n1. نحن نحترم خصوصيتك\n2. بياناتك محمية ومشفرة\n3. لا نشارك معلوماتك مع أطراف ثالثة\n4. يمكنك طلب حذف بياناتك في أي وقت');
}

// Product Features Section Animations
function initializeProductFeatures() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe section title and subtitle
    const sectionTitle = document.querySelector('.product-features-section .section-title');
    const sectionSubtitle = document.querySelector('.product-features-section .section-subtitle');
    const featureCards = document.querySelectorAll('.product-features-section .feature-card');

    if (sectionTitle) observer.observe(sectionTitle);
    if (sectionSubtitle) observer.observe(sectionSubtitle);
    
    // Observe feature cards with staggered animation
    featureCards.forEach((card, index) => {
        observer.observe(card);
    });
}

// Performance optimization: Preload critical images
function preloadProductImages() {
    const imageUrls = ['arabic_panel_1.png', 'arabic_panel_2.png', 'arabic_panel_3.png', 'arabic_panel_4.png'];
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}


// Smooth scrolling
function scrollToProduct() {
    document.getElementById('product').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Cart button click handler
document.getElementById('cartBtn').addEventListener('click', openCart);

// Close cart when clicking outside
document.addEventListener('click', function(e) {
    const cartModal = document.getElementById('cartModal');
    if (e.target === cartModal) {
        closeCart();
    }
});

// Close checkout when clicking outside
document.addEventListener('click', function(e) {
    const checkoutModal = document.getElementById('checkoutModal');
    if (e.target === checkoutModal) {
        closeCheckout();
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCart();
        closeCheckout();
    }
});

// Add some interactive animations
function addInteractiveEffects() {
    // Add hover effects to main product image
    const mainImage = document.getElementById('mainProductImage');
    
    if (mainImage) {
        mainImage.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        mainImage.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // Add click effect to thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// Initialize interactive effects
document.addEventListener('DOMContentLoaded', addInteractiveEffects);

// Add loading animation
function addLoadingAnimation() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Always have a transition ready
        img.style.transition = 'opacity 0.3s ease';
        const show = () => (img.style.opacity = '1');
        const hide = () => (img.style.opacity = '0');
        
        if (img.complete && img.naturalWidth > 0) {
            // Already loaded from cache; ensure visible
            show();
        } else {
            hide();
            img.addEventListener('load', show, { once: true });
            img.addEventListener('error', show, { once: true });
        }
    });
}

// Initialize loading animations
document.addEventListener('DOMContentLoaded', addLoadingAnimation);

// Add scroll effect to navbar - hide on scroll down, show on scroll up
let lastScrollY = window.scrollY;
let ticking = false;

function updateNavbar() {
    const navbar = document.querySelector('.navbar');
    const currentScrollY = window.scrollY;
    
    if (currentScrollY < 50) {
        // Always show at top
        navbar.classList.remove('hidden');
    } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide navbar
        navbar.classList.add('hidden');
    } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show navbar
        navbar.classList.remove('hidden');
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
    }
}

window.addEventListener('scroll', requestTick);

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .review-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add click tracking for analytics (placeholder)
function trackClick(element, action) {
    console.log(`Tracked: ${action} on ${element}`);
    // Here you would integrate with your analytics service
}

// Track CTA button clicks
document.querySelectorAll('.cta-button, .add-to-cart-btn, .buy-now-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        trackClick(e.target, 'CTA Click');
    });
});

// Bubble Interactions
function initializeBubbles() {
    const bubbles = document.querySelectorAll('.bubble');
    console.log('Found bubbles:', bubbles.length);
    
    bubbles.forEach((bubble, index) => {
        console.log(`Initializing bubble ${index + 1}:`, bubble);
        
        // Check if image is loaded
        const img = bubble.querySelector('img');
        if (img) {
            console.log(`Bubble ${index + 1} image src:`, img.src);
            console.log(`Bubble ${index + 1} image complete:`, img.complete);
            console.log(`Bubble ${index + 1} image naturalWidth:`, img.naturalWidth);
            console.log(`Bubble ${index + 1} image naturalHeight:`, img.naturalHeight);
            
            // Force image to be visible with !important
            img.style.setProperty('opacity', '1', 'important');
            img.style.setProperty('visibility', 'visible', 'important');
            img.style.setProperty('display', 'block', 'important');
        }
        
        // Ensure bubble is visible
        bubble.style.opacity = '1';
        bubble.style.visibility = 'visible';
        bubble.style.display = 'flex';
        
        // Add click interaction
        bubble.addEventListener('click', function() {
            console.log(`Bubble ${index + 1} clicked`);
            // Create ripple effect
            createRippleEffect(this);
            
            // Add temporary scale animation
            this.style.transform = 'scale(1.3)';
            setTimeout(() => {
                this.style.transform = '';
            }, 300);
            
            // Track bubble interaction
            trackClick(this, `Bubble ${index + 1} Click`);
        });
        
        // Add mouse enter effect
        bubble.addEventListener('mouseenter', function() {
            this.style.pointerEvents = 'auto';
            this.style.zIndex = '100';
        });
        
        // Add mouse leave effect - but keep bubbles visible
        bubble.addEventListener('mouseleave', function() {
            this.style.pointerEvents = 'auto'; // Changed from 'none' to 'auto'
            this.style.zIndex = '1';
        });
    });
}

// Create ripple effect when bubble is clicked
function createRippleEffect(bubble) {
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(212, 175, 55, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.width = '100px';
    ripple.style.height = '100px';
    ripple.style.marginLeft = '-50px';
    ripple.style.marginTop = '-50px';
    ripple.style.pointerEvents = 'none';
    
    bubble.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple animation CSS
const rippleCSS = `
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
`;

// Inject ripple CSS
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);