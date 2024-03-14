const TYPE_OZON = 'ozon';//www.ozon.ru
const TYPE_WILDBERRIES = 'wildberries';//www.wildberries.ru
const TYPE_CHITAI_GOROD = 'chitai-gorod';//www.chitai-gorod.ru
const TYPE_FFAN = 'ffan';//ffan.ru
const TYPE_KNIGOFAN = 'knigofan';//knigofan.ru

const SORT_UP = 'up';
const SORT_DOWN = 'down';

function tPriceConfig() {
    this.initConfig = function(tPriceChecker) {
        switch(tConfig.getShopType()) {
            case TYPE_OZON:
                tPriceChecker.setConfig({timeout: 1000});
                break;
        }
    };
    this.initSelectors = function(tPriceChecker) {
        switch(tConfig.getShopType()) {
            case TYPE_KNIGOFAN:
                tPriceChecker.setSelectors({
                    listItems: '#basket-item-table .basket-items-list-item-container',
                    basketHeader: '.main-title'
                });
                break;
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

function formatNumber(value) {
    if (typeof value === 'number') {
        return value;
    }

    return value.replace(/\D+/g, '')*1;
}

function formatProductTitle(value) {
    return value.replace(/"/g, '').trim();
}

function formatDate(date, onlyDate = false) {
    if (onlyDate) {
        return date.getUTCDate() + '.' + (date.getUTCMonth() + 1) + '.' + date.getUTCFullYear();
    }

    return date.getUTCDate() + '.' + (date.getUTCMonth() + 1) + '.' + date.getUTCFullYear()
        + ' ' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds();
}

function startTimeout(fn, timeout = 1) {
    setTimeout(function() {
        fn();
    }, timeout);
}

function parseUrlParams(url) {
    return url.split('?').pop().split('&')
        .map(param => param.split('='))
        .reduce((values, [ key, value ]) => {
            values[ key ] = value
            return values
        }, {})
}

function isExists(field) {
    return typeof field !== 'undefined';
}

function isEmpty(field) {
    return !isExists(field) || field === null;
}
