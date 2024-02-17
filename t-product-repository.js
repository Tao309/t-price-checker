function tProductRepository(type) {
    this.type = type;
    this.isFormatPrice = function(price) {
        return price.match(/^\d+$/) && price > 0;
    };
    this.getSavingProductId = function(productId) {
        return this.type+'-'+productId;
    };
    this.saveTitle = function(productId, title) {
        if(typeof title === 'undefined' || !title) {return;}
        var product = this.getProductById(productId);
        if(!product) {return;}
        product.title = title.trim();

        GM_setValue(this.getSavingProductId(productId), JSON.stringify(product));
    };
    this.saveCheckPrice = function(productId, checkPrice) {
        if(typeof checkPrice === 'undefined' || !checkPrice) {return;}
        var product = this.getProductById(productId);
        if(!product) {return;}
        if (!this.isFormatPrice(checkPrice)) {
            alert(checkPrice + ' is not number.');
            return;
        }

        product.checkPrice = checkPrice * 1;

        GM_setValue(this.getSavingProductId(productId), JSON.stringify(product));
    };
    this.resetCheckPrice = function(productId) {
        var product = this.getProductById(productId);
        if(!product) {return;}
        product.checkPrice = null;

        GM_setValue(this.getSavingProductId(productId), JSON.stringify(product));
    };
    this.getCurrentDateString = function() {
        return new Date().toJSON().slice(0,10).split('-').reverse().join('.');
    };
    this.initProduct = function(productId, currentPrice, title, itemStockQty) {
        var product = this.getProductById(productId);
        var oldCurrentPrice;
        if(product) {
            oldCurrentPrice = product.price*1;
        } else {
            oldCurrentPrice = currentPrice;
        }

        var requireToSave = !product || product.price*1 > currentPrice;

        if (requireToSave) {
            product = this.saveProduct(productId, currentPrice, title, itemStockQty);
        }

        /**
         * Недоступен был, но появилось кол-во со стока.
         * Кол-во со стока стало больше ранее записанного кол-ва.
         * Нет кол-ва ранее.
         */
        if ((product.available === false && itemStockQty > 0) || itemStockQty > product.maxQty || !isExists(product.maxQty)) {
            product.maxQty = itemStockQty;
            product.maxQtyDate = new Date();

            this.saveProductModel(productId, product);
        }

        // Выше не подставляй ничего в модель продукта
        product.oldCurrentPrice = oldCurrentPrice;
        product.price = currentPrice;

        return product;
    };
    this.saveAvailableStatus = function(productId, available) {
        var product = this.getProductById(productId);
        if (!product) {
            console.log('Not found product for save available status');
            return;
        }

        product.available = available;
        if (available) {
            product.available_date_from = new Date();
        } else {
            product.not_available_date_from = new Date();
        }

        GM_setValue(this.getSavingProductId(productId), JSON.stringify(product));

        return product;
    }
    this.saveProductModel = function(productId, product) {
        GM_setValue(this.getSavingProductId(productId), JSON.stringify(product));

        return product;
    }
    this.saveProduct = function(productId, price, title, maxQty) {
        var product = this.getProductById(productId);
        if (!product) {
            product = {dates:[]};
        }

        if(typeof product.dates === 'undefined') {
            product.dates = [];
        }

        let newDate = this.getCurrentDateString();
        product.price = formatNumber(price);
        product.dates.push({date: newDate, price: price});
        product.lastDate = newDate;
        product.type = this.type;
        product.id = productId;
        product.maxQty = maxQty;
        product.maxQtyDate = new Date();

        if(!product.title || typeof product.title === 'undefined') {product.title = title;}

        return this.saveProductModel(productId, product);
    };
    this.getProductById = function(productId) {
        return this.getProductBySavingId(this.getSavingProductId(productId));
    };
    this.getProductBySavingId = function(savingProductId) {
        if (typeof GM_getValue(savingProductId) !== 'undefined') {
            return JSON.parse(GM_getValue(savingProductId));
        }

        return null;
    };
    this.removeById = function (productId) {
        var product = this.getProductById(productId);
        if (!product) {
            console.log('Can not remove cause product #{'+productId+'} is not found');
        }

        GM_deleteValue(this.getSavingProductId(productId));

        console.log('Product {'+this.getSavingProductId(productId)+'} is removed');

        return true;
    }
    this.getProductsBySameTitle = function(searchProduct) {
        var foundProducts = [];
        if(!searchProduct.title || typeof searchProduct.title === 'undefined') {return foundProducts;}
        var self = this;

        searchProduct.title = searchProduct.title.split('|')[0].trim();

        GM_listValues().forEach(function(value) {
            var product = self.getProductBySavingId(value);
            if(!product || !product.type || !isExists(product.title)) {return;}
            if(product.type == searchProduct.type) {return;}

            product.title = product.title.split('|')[0].trim();
            if(product.title == searchProduct.title) {
                foundProducts.push(product);
            }
        });

        foundProducts.sort((a,b) => (a.price > b.price) ? 1 : ((b.price > a.price) ? -1 : 0));

        return foundProducts;
    };
    this.getPriceDates = function(productId) {
        var product = this.getProductById(productId);

        return (product && typeof product.dates !== 'undefined') ? product.dates : [];
    };
    this.getOldMinPriceDate = function(productId) {
        var product = this.getProductById(productId);

        return (product) ? product.lastDate : null;
    };
}