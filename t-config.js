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
                tPriceChecker.setConfig({timeout: 1000});
                break;
        }
    };
    this.initSelectors = function(tPriceChecker) {
        switch(this.type) {
            case TYPE_FFAN:
                tPriceChecker.setSelectors({
                    listItems: '#basket_items tbody tr',
                    itemPriceHtml: '.current_price',
                    basketHeader: '.content > h1'
                });
                break;
            case TYPE_OZON:
                tPriceChecker.setSelectors({
                    listItems: '[data-widget="split"]:not(.t-checked) > div',
                    basketHeader: 'div[data-widget="header"]'
                });
                break;
            case TYPE_WILDBERRIES:
                tPriceChecker.setSelectors({
                    listItems: '.basket-section .list-item',
                    itemPriceHtml: '.list-item__price-new',
                    basketHeader: '.basket-section__header-tabs'
                });
                break;
            case TYPE_CHITAI_GOROD:
                tPriceChecker.setSelectors({
                    listItems: '.products__items .cart-item',
                    itemPriceHtml: '.product-price__value',
                    title: '.product-title__head',
                    basketHeader: '.cart-page .wrapper'
                });
                break;
        }
    };
}