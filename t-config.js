const TYPE_OZON = 'ozon';//www.ozon.ru
const TYPE_WILDBERRIES = 'wildberries';//www.wildberries.ru
const TYPE_CHITAI_GOROD = 'chitai-gorod';//www.chitai-gorod.ru
const TYPE_FFAN = 'ffan';//ffan.ru

const SORT_UP = 'up';
const SORT_DOWN = 'down';

function tPriceConfig(initType) {
    this.type = initType;
    this.initConfig = function(tPriceChecker) {
        switch(this.type) {
            case TYPE_OZON:
                tPriceChecker.setConfig({timeout: 800});
                break;
        }
    };
    this.initSelectors = function(tPriceChecker) {
        switch(this.type) {
            case TYPE_FFAN:
                tPriceChecker.setSelectors({
                    basketHead: '.content > h1',
                    listItems: '#basket_items tbody tr',
                    listItem: 'tr',
                    itemQuantity: '.quantity',
                    itemPrice: '.price',
                    itemPriceHtml: '.current_price',
                });
                break;
            case TYPE_OZON:
                tPriceChecker.setSelectors({
                    basketHead: '.e0 .c7',
                    listItems: '.c7 .h4b .bh',
                    listItem: '.h4b .bh',
                    itemPrice: '.a2a-a',
                    itemQuantity: '.hb1.h1b',
                });
                break;
            case TYPE_WILDBERRIES:
                tPriceChecker.setSelectors({
                    basketHead: '.basket-section__header-tabs',
                    itemProperty: function(productId) {
                        return '[data-nm="'+productId+'"]';
                    },
                    listItems: '.basket-section .list-item',
                    listItem: '.list-item',
                    itemPrice: '.list-item__price',
                    itemPriceHtml: '.list-item__price-new',
                    itemQuantity: '.list-item__count',
                });
                break;
            case TYPE_CHITAI_GOROD:
                tPriceChecker.setSelectors({
                    basketHead: '.cart-page .wrapper',
                    itemProperty: function(productId) {
                        return 'a[href="/product/'+productId+'"]';
                    },
                    listItems: '.products__items .cart-item',
                    listItem: '.cart-item',
                    itemPrice: '.product-price',
                    itemPriceHtml: '.product-price__value',
                    itemQuantity: '.cart-item__counter',
                    title: '.product-title__head'
                });
                break;
        }
    };
};
