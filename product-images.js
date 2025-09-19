// Product Images Configuration
const productImages = {
    // Main product images
    main: {
        'red': '51JkiHBv2GL._AC_SL1001_.jpg',
        'blue': '61pT41KcGlL._AC_SL1001_.png',
        'purple': '71P2vxByl8L._AC_SL1500_.jpg',
        'gold': '810WyZXNoFL._AC_SX679_.png',
        // New colors added for the simplified selector. Black always shows the first image,
        // and white always shows the third image by default.
        'black': '51JkiHBv2GL._AC_SL1001_.jpg',
        'white': '71P2vxByl8L._AC_SL1500_.jpg'
    },
    
    // Gallery images (different views)
    gallery: [
        {
            id: 1,
            name: 'العرض الرئيسي',
            image: '51JkiHBv2GL._AC_SL1001_.jpg',
            thumbnail: '51JkiHBv2GL._AC_SL1001_.jpg'
        },
        {
            id: 2,
            name: 'مع الأفلام',
            image: '61pT41KcGlL._AC_SL1001_.png',
            thumbnail: '61pT41KcGlL._AC_SL1001_.png'
        },
        {
            id: 3,
            name: 'الكرات الملونة',
            image: '71P2vxByl8L._AC_SL1500_.jpg',
            thumbnail: '71P2vxByl8L._AC_SL1500_.jpg'
        },
        {
            id: 4,
            name: 'في الاستخدام',
            image: '810WyZXNoFL._AC_SX679_.png',
            thumbnail: '810WyZXNoFL._AC_SX679_.png'
        }
    ]
};

// Function to get product image based on color and view
function getProductImage(color = 'red', view = 1) {
    if (view === 1) {
        return productImages.main[color] || productImages.main['red'];
    } else {
        const galleryItem = productImages.gallery.find(item => item.id === view);
        return galleryItem ? galleryItem.image : productImages.gallery[0].image;
    }
}

// Function to get thumbnail image
function getThumbnailImage(view = 1) {
    const galleryItem = productImages.gallery.find(item => item.id === view);
    return galleryItem ? galleryItem.thumbnail : productImages.gallery[0].thumbnail;
}

// Function to get gallery item name
function getGalleryItemName(view = 1) {
    const galleryItem = productImages.gallery.find(item => item.id === view);
    return galleryItem ? galleryItem.name : productImages.gallery[0].name;
}
