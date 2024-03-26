// https://transform.tools/typescript-to-javascript

class tApiRequest {
    static readonly REQUEST_URL = 'https://tao309.ru/api/index.php?v=11';
    static readonly X_REQUESTED_WITH = 'tRequest';

    static readonly REQUEST_IMPORT_BY_SHOP_TYPE = 'importByShopType';
    static readonly REQUEST_GET_PRODUCTS_BY_SHOP_TYPE = 'getProductsByShopType';
    static readonly REQUEST_SAVE_PRODUCT = 'saveProduct';
    static readonly REQUEST_SAVE_PRODUCTS = 'saveProducts';
    static readonly REQUEST_SAVE_PRODUCT_VALUE = 'saveProductValue';
    static readonly REQUEST_DELETE_PRODUCT = 'deleteProduct';

    constructor() {
        if (this.constructor !== tApiRequest) {
            throw new Error('Subclassing is not allowed');
        }
    };

    static importAllProducts(shopType, callback?) {
        var data = {
            'shop_type': shopType,
            'action': tApiRequest.REQUEST_IMPORT_BY_SHOP_TYPE
        };

        data.products = [];
        var keyValues = GM_listValues();
        keyValues.forEach(function(key) {
            let product = tProductLocal.get(key);
            product.setFlag(tProduct.FLAG_TO_SAVE_PRODUCT, true);
            product.setFlag(tProduct.FLAG_TO_SAVE_PRICE_DATES, true);
            product.setFlag(tProduct.FLAG_TO_SAVE_STOCKS, true);
            data.products.push(product.toJson());
        });
        data.products = '[' + data.products + ']';

        tApiRequest.sendRequest(data, callback);
    };

    static getProductsByShopType(shopType: string, ids: number[], callback?) {
        var data = {
            'shop_type': shopType,
            'action': tApiRequest.REQUEST_GET_PRODUCTS_BY_SHOP_TYPE
        };

        data.ids = JSON.stringify(ids);

        tApiRequest.sendRequest(data, callback);
    };

    static saveProduct(product: tProductLocal, callback?) {
        var data = {
            'shop_type': tConfig.getShopType(),
            'action': tApiRequest.REQUEST_SAVE_PRODUCT,
            'data': product.toJson()
        };

        product.unsetFlag(tProduct.FLAG_TO_SAVE_PRODUCT);
        product.unsetFlag(tProduct.FLAG_TO_SAVE_PRICE_DATES);
        product.unsetFlag(tProduct.FLAG_TO_SAVE_STOCKS);

        tApiRequest.sendRequest(data, callback);
    };

    static saveProducts(products: tProductLocal[], callback?) {
        var data = {
            'shop_type': tConfig.getShopType(),
            'action': tApiRequest.REQUEST_SAVE_PRODUCTS
        };

        data.products = [];
        products.forEach(function(product) {
            data.products.push(product.toJson());
        });

        data.products = '[' + data.products + ']';

        tApiRequest.sendRequest(data, callback);
    };

    // Вероятно, не понадобится.
    static saveProductValue(product: tProductLocal, fieldName, callback?) {
        var data = {
            'shop_type': tConfig.getShopType(),
            'action': tApiRequest.REQUEST_SAVE_PRODUCT_VALUE,
            'product_id': product.getProductId(),
            'field_name': fieldName,
            'field_value': product.getData(fieldName),
        };

        tApiRequest.sendRequest(data, callback);
    };

    static deleteProduct(product: tProductLocal, callback?) {
        var data = {
            'shop_type': tConfig.getShopType(),
            'action': tApiRequest.REQUEST_DELETE_PRODUCT,
            'product_id': product.getProductId()
        };

        tApiRequest.sendRequest(data, callback);
    };

    static sendRequest(data, onLoad?, onError?) {
        let payLoad = new URLSearchParams(data);

        GM_xmlhttpRequest({
            method: "POST",
            url: tApiRequest.REQUEST_URL,
            headers: {
                'Accept': 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Content-Length': payLoad.toString().length,
                'X-Requested-With': tApiRequest.X_REQUESTED_WITH,
                't-price-checker-id': tConfig.getApiToken()
            },
            data: payLoad.toString(),
            contentType: 'application/json',
            responseType: 'application/json',
            onload: function(r) {
                if (typeof onLoad === 'function') {
                    onLoad(r.responseText);
                }

                try {
                    //console.log(JSON.parse(r.responseText));
                } catch (e) {
                    //console.log(r.responseText);
                }
            },
            onerror: function(e) {
                // console.log('error', e);
                if (typeof onError === 'function') {
                    onError(e);
                }
            },
        });
    };
}