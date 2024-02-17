function tEventListener(type) {
    this.type = type;
    this.tProductRepository;
    this.tProduct;

    this.init = function () {
        this.tProductRepository = new tProductRepository(this.type);
        this.tProduct = new tProduct();
    }

    // После успешной обработки позиции для списка
    this.afterSuccessInitProduct = function (product, item, tPriceChecker) {
        var self = this;

        if (product.available === false) {
            self.tProductRepository.saveAvailableStatus(product.id, true);
            item.setAttribute('data-product-returns', 1);
            tPriceChecker.checkReturnsCount++;
        } else if (product.available === true) {
            if (typeof product.available_date_from === 'string') {
                var dateFrom = new Date(product.available_date_from);

                var nowDate = new Date();
                nowDate.setDate(nowDate.getDate() - 1);

                if (nowDate.getTime() < dateFrom.getTime()) {
                    item.setAttribute('data-product-returns', 1);
                    tPriceChecker.checkReturnsCount++;
                }
            }
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
    this.whenFoundPriceUp = function (product, item, tPriceChecker) {
        tPriceChecker.priceUpChanged++;
        product.isPriceUp = true;
    }

    // Когда найдено, что цена понизилась
    this.whenFoundPriceDown = function (product, item, tPriceChecker) {
        if (product.available === false) {return;}
        tPriceChecker.priceDownChanged++;
        item.setAttribute('data-product-price-decrease', 1);
        product.isPriceDown = true;
    }

    // Когда цена не изменилась сейчас
    this.whenPriceIsNotChanged = function (product, item, tPriceChecker) {
        var splitLastDate = product.lastDate.split('.');
        var lastDate = new Date(splitLastDate[2]+'-'+splitLastDate[1]+'-'+splitLastDate[0]+' 00:00:00+0000');
        var currentDate = new Date();
        currentDate.setHours(-21);
        currentDate.setMinutes(0);
        currentDate.setSeconds(0);

        if (currentDate.getTime() < lastDate.getTime() && product.dates.length > 1 && (this.tProduct.isAvailable(product))) {
            tPriceChecker.priceDownChanged++;
            item.setAttribute('data-product-price-decrease', 1);
            product.isPriceDown = true;

            product.oldCurrentPrice = product.dates[product.dates.length - 2].price;
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

        if (!this.tProductRepository.removeById(productId)) {return;}

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