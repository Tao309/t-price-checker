function tEventListener() {
    this.tHtml;
    this.tProductRepository;
    this.tProduct;

    this.init = function () {
        this.tProductRepository = new tProductRepository();
        this.tHtml = new tHtml();
    }

    // После успешной обработки позиции для списка
    this.afterSuccessInitProduct = function (productModel, item, tPriceChecker) {
        if (productModel.isAvailable() && productModel.getAvailableDateFrom()) {
            if (tProduct.getDiffDateDays(productModel.getAvailableDateFrom(), tConfig.getCurrentDate()) <= 1) {
                item.setAttribute('data-product-returns', 1);
                tPriceChecker.checkReturnsCount++;
            }
        }

        // Добавляем кол-во дней до релиза
        this.tHtml.appendReleaseDate(item, productModel);

        if (productModel.isAvailableForReleaseDate()) {
            item.setAttribute('data-product-is-available-for-release-date', 1);
            tPriceChecker.isAvailableForReleaseDate++;
        } else if(productModel.isWaitingForReleaseDate()) {
            item.setAttribute('data-product-is-waiting-for-release-date', 1);
            tPriceChecker.isWaitingForReleaseDate++;
        }
    }

    // Добавляем json объект в html позиции после его нахождения
    this.afterFoundJsonItemByCode = function(item, jsonItem) {
        item.setAttribute('data-product-title', jsonItem.title.replace(/"/g, '').trim());
        item.setAttribute('data-product-qty', jsonItem.itemStockQty);
        item.setAttribute('data-product-price', jsonItem.price);
        item.setAttribute('data-product-id', jsonItem.product_id);
    }

    // Проверка изменения цены.
    this.whenCheckPriceIsChanged = function (productModel, item, tPriceChecker) {
        if (!productModel.isAvailable()) {return;}

        if (tConfig.getShopType() === tConfig.TYPE_WILDBERRIES) {
            item.querySelector('.list-item__price-old').innerHTML = productModel.getCurrentPrice();
        }

        var lastPrice = productModel.getLastPrice();
        var prevLastPrice = productModel.getPrevLastPrice();
        var currentPrice = productModel.getCurrentPrice();

        if (lastPrice && currentPrice > lastPrice) {
            tPriceChecker.priceUpChanged++;
            productModel.setFlag(tProduct.FLAG_IS_PRICE_UP, true);
            return;
        }

        if (!prevLastPrice || !lastPrice) {
            return;
        }

        if (tProduct.getDiffDateDays(productModel.getLastDate(), tConfig.getCurrentDate()) > 1) {
            return;
        }

        if (prevLastPrice > lastPrice) {
            tPriceChecker.priceDownChanged++;
            item.setAttribute('data-product-price-decrease', 1);
            productModel.setFlag(tProduct.FLAG_IS_PRICE_DOWN, true);
        }
    };

    // Найден товар с ценой, ниже отслеживаемой
    this.whenFoundPriceCheck = function (product, item) {
        item.setAttribute('data-product-check-price', 1);
    }

    // Удаление из хранилища
    this.whenRemoveFromStorage = function (parentEl, productModel) {
        var productId = parentEl.getAttribute('data-product-id');
        if (!isExists(productId)) {
            console.log('Can not remove cause product-id {'+productId+'} is empty');
            return;
        }

        if (!productModel.delete()) {return;}

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