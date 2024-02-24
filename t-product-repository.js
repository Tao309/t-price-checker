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
            // Прошло ли больше дней с последнего стока.
            let isStockDaysLimitPassed = diffDays && diffDays >= 6;
            // Текущие кол-во больше последнего стока.
            let isCurrentQtyMoreThanLastStock = product.getLastStockQty() && product.getCurrentQty() > product.getLastStockQty();
            // На сколько изменились текущее кол-во по сравнению с последним стоком.
            let stockChangePercent = 0;
            // Лимит допустимым для изменения кол-ва по стоку в %.
            let limitStockPercent = 20;
            // Изменение стока превысило допустимое значение по %.
            let isStockMoreThanLimitChanged = false;

            if (isCurrentQtyMoreThanLastStock) {
                let diffQty = product.getCurrentQty() - product.getLastStockQty();
                stockChangePercent = ((diffQty / product.getLastStockQty()) * 100).toFixed(1);
                isStockMoreThanLimitChanged = stockChangePercent > limitStockPercent;
            }

            if (
                // Кол-во стало больше, но не прошло много дней, чтобы это был новый сток
                isCurrentQtyMoreThanLastStock && !isStockMoreThanLimitChanged  && !isStockDaysLimitPassed
            ) {
                product.changeLastStockQty(product.getCurrentQty());
                requireToSave = true;
            } else if (
                // Был недоступен и стал доступен, с большим кол-вом чем в последнем стоке
                (isCurrentQtyMoreThanLastStock && product.isBecomeAvailable())
                // Разницу между стоком и сегодня 7 дней прошло
                || (isCurrentQtyMoreThanLastStock && diffDays && isStockDaysLimitPassed)
                // Погрешность, если старое вернулось в сток более чем на 5 позиций
                || isStockMoreThanLimitChanged
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