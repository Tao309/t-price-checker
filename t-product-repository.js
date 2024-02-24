function tProductRepository(type) {
    this.type = type;
    this.initProduct = function(productId, currentPrice, title, itemStockQty) {
        var product = tProductLocal.get(this.type + '-' + productId);
        var requireToSave;

        if (product) {
            requireToSave = product.isBecomeAvailable();
            product.appendCurrentPriceAndQty(currentPrice, itemStockQty);

            if (product.getLastPrice() > currentPrice) {
                product.appendNewMinPrice(currentPrice);
                requireToSave = true;
            }

            var diffDays = product.getLastStockDate() ? tProduct.getDiffDateDays(product.getLastStockDate(), (new Date())) : null;

            if (
                // Кол-во стало больше, но не прошло много дней, чтобы это был новый сток
                product.getCurrentQty() > product.getLastStockQty() && ((product.getCurrentQty() - product.getLastStockQty()) <= 5)  && diffDays && diffDays < 6
            ) {
                product.changeLastStockQty(product.getCurrentQty());
                requireToSave = true;
            } else if (
                // Был недоступен и стал доступен, с большим кол-вом чем в последнем стоке
                (product.getCurrentQty() > product.getLastStockQty() && product.isBecomeAvailable())
                // Разницу между стоком и сегодня 7 дней прошло
                || (product.getCurrentQty() > product.getLastStockQty() && diffDays && diffDays >= 6)
                // Погрешность, если старое вернулось в сток более чем на 5 позиций
                || product.getCurrentQty() > (product.getLastStockQty() + 5)
            ) {
                product.appendNewStock(itemStockQty);
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