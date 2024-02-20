function tProductRepository(type) {
    this.type = type;
    this.initProduct = function(productId, currentPrice, title, itemStockQty) {
        var product = tProductLocal.get(this.type + '-' + productId);
        var requireToSave;

        if (product) {
            product.appendCurrentPriceAndQty(currentPrice, itemStockQty);

            if (product.getLastPrice() > currentPrice) {
                product.appendNewMinPrice(currentPrice);
                requireToSave = true;
            }

            /**
             * Недоступен был, но появилось кол-во со стока.
             * Кол-во со стока стало больше ранее записанного кол-ва.
             */
            if (
                (!product.isAvailable() && itemStockQty > 0)
                || itemStockQty > (product.getLastQty() + 10) // Погрешность, если старое вернулось в сток
            ) {
                product.appendNewStock(itemStockQty)
                requireToSave = true;
            }
        } else {
            product = tProductLocal.create({
                id: productId,
                type: this.type,
                title: title
            }, currentPrice, itemStockQty);

            requireToSave = true;
        }

        if (requireToSave) {
            product.save();
        }

        return product;
    };
    this.getProductById = function(productId) {
        return tProductLocal.get(this.type + '-' + productId);
    };
    this.getProductsBySameTitle = function(searchProduct) {
        var foundProducts = [];
        if(!searchProduct.getTitle()) {return foundProducts;}

        GM_listValues().forEach(function(gmId) {
            var productModel = tProductLocal.get(gmId);

            if (!productModel || !productModel.getType() || !productModel.getTitle()) {
                return;
            }

            if(productModel.getType() === searchProduct.getType()) {return;}

            if(productModel.getTitle().split('|')[0].trim() === searchProduct.getTitle().split('|')[0].trim()) {
                foundProducts.push(productModel);
            }
        });

        foundProducts.sort((a,b) => (a.price > b.price) ? 1 : ((b.price > a.price) ? -1 : 0));

        return foundProducts;
    };
}