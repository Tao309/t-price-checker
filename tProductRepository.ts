// https://transform.tools/typescript-to-javascript

class tProductRepository {
    static tempApiItems = [];
    static toSaveProducts = [];

    constructor() {
        if (this.constructor !== tProductRepository) {
            throw new Error('Subclassing is not allowed');
        }
    };

    static setTempApiItems(apiItems) {
        let items = [];

        apiItems.forEach(function (apiItem) {
            items[apiItem.shop_type + '-' + apiItem.product_id] = apiItem;
        });

        tProductRepository.tempApiItems = items;
    };

    static getTempApiItemByTypeProductId(typeProductId) {
        return tProductRepository.tempApiItems[typeProductId] ?? null;
    };

    static getProduct(typeProductId): tProductLocal {
        if (!tConfig.isApiEnabled()) {
            var gmValue = GM_getValue(typeProductId);
            if (typeof gmValue === 'undefined') {
                return null;
            }

            return new tProductLocal(JSON.parse(gmValue), typeProductId);
        }

        let tempApiItem = tProductRepository.getTempApiItemByTypeProductId(typeProductId);
        return tempApiItem ? new tProductLocal(tempApiItem, typeProductId) : null;
    };

    static removeProduct(productModel: tProductLocal) {
        if (!tConfig.isApiEnabled()) {
            let typeProductId = productModel.getId();

            var gmValue = GM_getValue(typeProductId);
            if (typeof gmValue === 'undefined') {
                console.log('Product {' + typeProductId + '} not found for remove');
                return false;
            }

            GM_deleteValue(typeProductId);

            console.log('Product {' + typeProductId + '} is removed');

            return true;
        }

        if (tConfig.isDebugEnabled()) {
            console.log('tProductRepository.removeProduct');
            console.log(productModel);
        }

        tApiRequest.deleteProduct(productModel);

        return true;
    };

    static saveProduct(productModel: tProductLocal) {
        if (!tConfig.isApiEnabled()) {
            var productObject = {
                id: productModel.getData(tProduct.PARAM_PRODUCT_ID),
                title: productModel.getData(tProduct.PARAM_TITLE),
                price: productModel.getLastPrice(),
                lastDate: productModel.getLastDate(),
                type: productModel.getData(tProduct.PARAM_TYPE),
                maxQty: productModel.getLastStockQty(),
                maxQtyDate: productModel.getLastStockDate(),
                stock: productModel.getData(tProduct.PARAM_STOCKS),
                available: productModel.getData(tProduct.PARAM_AVAILABLE) ?? false,
                not_available_date_from: productModel.getNotAvailableDateFrom(),
                available_date_from: productModel.getAvailableDateFrom(),
                checkPrice: productModel.getData(tProduct.PARAM_LISTEN_PRICE_VALUE),
                releaseDate: productModel.getReleaseDate(),
                dateCreated: productModel.getDateCreated(),
                dateUpdated: tConfig.getCurrentDate()
            };

            var dates = [];
            productModel.getData(tProduct.PARAM_PRICE_DATES).forEach(function (priceDate: PriceDate) {
                dates.push({
                    date: priceDate.date,
                    price: priceDate.price
                });
            });

            productObject.dates = dates;

            GM_setValue(productModel.getId(), JSON.stringify(productObject));
            return;
        }

        if (tConfig.isDebugEnabled()) {
            console.log('tProductRepository.saveProduct');
            console.log(productModel);
        }

        tApiRequest.saveProduct(productModel);
    };

    static addProductToMassSave(productModel: tProductLocal) {
        if (tConfig.isDebugEnabled()) {
            console.log('tProductRepository.addProductToMassSave');
            console.log(productModel);
        }

        tProductRepository.toSaveProducts.push(productModel);
    };

    static processMassSave() {
        if (!tConfig.isApiEnabled() || !tProductRepository.toSaveProducts.length) {
            return;
        }

        console.log('processMassSave', tProductRepository.toSaveProducts.length);

        if (tConfig.isDebugEnabled()) {
            console.log('tProductRepository.processMassSave');
            console.log(tProductRepository.toSaveProducts);
        }

        tApiRequest.saveProducts(tProductRepository.toSaveProducts, function (r) {
            try {
                console.log(JSON.parse(r));
            } catch(e) {
                console.log(r);
            }
        });
    };

    // Вероятно, не понадобится.
    static saveProductValue(productModel: tProductLocal, fieldName) {
        tApiRequest.saveProductValue(productModel, fieldName);
    };

    // перенести
    initProduct(productId: number, currentPrice: number, title: string, itemStockQty: number): tProductLocal {
        var product = tProductLocal.get(tConfig.getShopType() + '-' + productId);
        var requireToSave;

        if (product) {
            requireToSave = product.isBecomeAvailable();
            product.appendCurrentPriceAndQty(currentPrice, itemStockQty);

            if (product.getLastPrice() > currentPrice) {
                product.setFlag(tProduct.FLAG_TO_SAVE_PRICE_DATES, true);
                product.appendNewMinPrice(currentPrice);
                requireToSave = true;
            }

            var diffDays = product.getLastStockDate() ? tProduct.getDiffDateDays(product.getLastStockDate(), tConfig.getCurrentDate()) : null;
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
                product.setFlag(tProduct.FLAG_TO_SAVE_STOCKS, true);
                product.changeLastStockQty(product.getCurrentQty());
                requireToSave = true;
            } else if (
                // Был недоступен и стал доступен, с большим кол-вом чем в последнем стоке
                (isCurrentQtyMoreThanLastStock && product.isBecomeAvailable())
                // Разницу между стоком и сегодня 7 дней прошло
                || (isCurrentQtyMoreThanLastStock && diffDays && isStockDaysLimitPassed)
                // Погрешность, если старое вернулось в сток более чем на 5 позиций
                || isStockMoreThanLimitChanged
                || !product.getLastStock()
            ) {
                product.setFlag(tProduct.FLAG_TO_SAVE_STOCKS, true);
                product.appendNewStock(itemStockQty);
                requireToSave = true;
            }
        } else {
            product = tProductLocal.create({
                id: productId,
                type: tConfig.getShopType(),
                title: title
            }, currentPrice, itemStockQty);

            product.setFlag(tProduct.FLAG_TO_SAVE_PRODUCT, true);
            product.setFlag(tProduct.FLAG_TO_SAVE_PRICE_DATES, true);
            product.setFlag(tProduct.FLAG_TO_SAVE_STOCKS, true);

            requireToSave = true;
        }

        if (requireToSave) {
            product.save(true);
        }

        return product;
    };

    // перенести
    getProductsBySameTitle(searchProduct: tProductLocal): tProductLocal[] {
        var foundProducts = [];
        if(!searchProduct.getTitle()) {return foundProducts;}

        GM_listValues().forEach(function(gmId) {
            var productModel = tProductLocal.get(gmId);

            if (!productModel || !productModel.getType() || !productModel.getTitle() || !productModel.isAvailable()) {
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