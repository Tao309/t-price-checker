function tEventListener(type) {
    this.type = type;
    this.tProductRepository;
    this.tProduct;

    this.init = function () {
        this.tProductRepository = new tProductRepository(this.type);
    }

    // После успешной обработки позиции для списка
    this.afterSuccessInitProduct = function (productModel, item, tPriceChecker) {
        if (productModel.isAvailable()) {
            if (!productModel.getAvailableDateFrom()) {
                return;
            }

            var nowDate = new Date();
            nowDate.setDate(nowDate.getDate() - 1);

            if (nowDate.getTime() < productModel.getAvailableDateFrom().getTime()) {
                item.setAttribute('data-product-returns', 1);
                tPriceChecker.checkReturnsCount++;
            }
        } else {
            productModel.enableAvailable();
            item.setAttribute('data-product-returns', 1);
            tPriceChecker.checkReturnsCount++;
        }
    }

    // Добавляем json объект в html позиции после его нахождения
    this.afterFoundJsonItemByCode = function(item, jsonItem) {
        item.setAttribute('data-product-title', jsonItem.title.replace(/"/g, '').trim());
        item.setAttribute('data-product-qty', jsonItem.itemStockQty);
        item.setAttribute('data-product-price', jsonItem.price);
        item.setAttribute('data-product-id', jsonItem.product_id);
    }

    // Когда найдено, что цена повысилась
    this.whenFoundPriceUp = function (productModel, item, tPriceChecker) {
        tPriceChecker.priceUpChanged++;
        productModel.setFlag(tProduct.FLAG_IS_PRICE_UP, true);
    }

    // Когда найдено, что цена понизилась
    this.whenFoundPriceDown = function (productModel, item, tPriceChecker) {
        if (!productModel.isAvailable()) {return;}
        tPriceChecker.priceDownChanged++;
        item.setAttribute('data-product-price-decrease', 1);
        productModel.setFlag(tProduct.FLAG_IS_PRICE_DOWN, true);
    }

    // Когда цена не изменилась сейчас
    this.whenPriceIsNotChanged = function (productModel, item, tPriceChecker) {
        var lastDate = productModel.getLastDate();
        var currentDate = new Date();

        if (currentDate.getTime() < lastDate.getTime() && productModel.isAvailable()) {
            tPriceChecker.priceDownChanged++;
            item.setAttribute('data-product-price-decrease', 1);
            productModel.setFlag(tProduct.FLAG_IS_PRICE_DOWN, true);

            // productModel.oldCurrentPrice = product.dates[product.dates.length - 2].price;
        }
    }

    // Найден товар с ценой, ниже отслеживаемой
    this.whenFoundPriceCheck = function (product, item) {
        item.setAttribute('data-product-check-price', 1);
    }

    // Удаление из хранилища
    this.whenRemoveFromStorage = function (parentEl) {
        var productId = parentEl.getAttribute('data-product-id');
        if (!isExists(productId)) {
            console.log('Can not remove cause product-id {'+productId+'} is empty');
            return;
        }

        if (!tProductLocal.removeById(this.type + '-' +productId)) {return;}

        if (!parentEl) {
            console.log('Parent element for product {'+productId+'} is not found');
            return;
        }

        if (parentEl.querySelector('.t-item-qty-column')) {
            parentEl.querySelector('.t-item-qty-column').remove();
        }

        if (parentEl.querySelector('.t-old-price')) {
            parentEl.querySelector('.t-old-price').remove();
        }

        parentEl.removeAttribute('data-product-title');
        parentEl.removeAttribute('data-product-price');
        parentEl.removeAttribute('data-product-id');
        parentEl.removeAttribute('data-product-qty');
        parentEl.removeAttribute('data-product-returns');
        parentEl.removeAttribute('data-product-decrease');
    }
}