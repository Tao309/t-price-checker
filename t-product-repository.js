function tProductRepository(type) {
    this.type = type;
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
    this.getCurrentDateString = function() {
        return new Date().toJSON().slice(0,10).split('-').reverse().join('.');
    };
	this.initProduct = function(productId, currentPrice, title) {
        var product = this.getProductById(productId);
        var oldCurrentPrice;
        if(product) {
            oldCurrentPrice = product.price*1;
        } else {
            oldCurrentPrice = currentPrice;
        }

        if (!product || product.price*1 > currentPrice) {
            product = this.saveProduct(productId, currentPrice, title);
        }

        product.oldCurrentPrice = oldCurrentPrice;
        product.price = currentPrice;

        return product;
    };
    this.saveProduct = function(productId, price, title) {
        var product = this.getProductById(productId);
        if (!product) {
            product = {dates:[]};
        }

        if(typeof product.dates === 'undefined') {
            product.dates = [];
        }

        let newDate = this.getCurrentDateString();
        product.price = price*1;
        product.dates.push({date: newDate, price: price});
        product.lastDate = newDate;
        product.type = this.type;
        product.id = productId;

        if(!product.title || typeof product.title === 'undefined') {product.title = title;}

        GM_setValue(this.getSavingProductId(productId), JSON.stringify(product));

        return product;
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
        this.getProductsBySameTitle = function(searchProduct) {
        var foundProducts = [];
        if(!searchProduct.title || typeof searchProduct.title === 'undefined') {return foundProducts;}
        var self = this;

        GM_listValues().forEach(function(value) {
            var product = self.getProductBySavingId(value);
            if(!product || !product.type) {return;}
            if(product.type == searchProduct.type) {return;}

            if(product.title == searchProduct.title) {
                foundProducts.push(product);
            }
        });

        foundProducts.sort((a,b) => (a.price > b.price) ? 1 : ((b.price > a.price) ? -1 : 0));

        return foundProducts;
    };
    this.getPrevPrice = function(productId) {
        var product = this.getProductById(productId);
        if (!product) {return null;}

        if(!product.dates || product.dates.length < 2) {return null;}
        return product.dates[product.dates.length-2].price;
    };
    this.getPriceDates = function(productId) {
        var product = this.getProductById(productId);

        return (product && typeof product.dates !== 'undefined') ? product.dates : [];
    };
    this.getOldMinPriceDate = function(productId) {
        var product = this.getProductById(productId);

        return (product) ? product.lastDate : null;
    };
};
