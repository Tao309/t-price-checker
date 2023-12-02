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
                });
                break;
            case TYPE_OZON:
                tPriceChecker.setSelectors({
                    listItems: '[data-widget="split"]>div',
                });
                break;
            case TYPE_WILDBERRIES:
                tPriceChecker.setSelectors({
                    listItems: '.basket-section .list-item:not(.not-available)',
                    itemPriceHtml: '.list-item__price-new',
                });
                break;
            case TYPE_CHITAI_GOROD:
                tPriceChecker.setSelectors({
                    listItems: '.products__items .cart-item',
                    itemPriceHtml: '.product-price__value',
                    title: '.product-title__head'
                });
                break;
        }
    };
}

function tPriceChecker() {
    this.type = null;
    this.getInitType = function() {
        switch(window.location.host) {
            case 'ffan.ru':
                return TYPE_FFAN;
            case 'www.ozon.ru':
            case 'ozon.ru':
                return TYPE_OZON;
            case 'www.wildberries.ru':
            case 'wildberries.ru':
                return TYPE_WILDBERRIES;
            case 'www.chitai-gorod.ru':
            case 'chitai-gorod.ru':
                return TYPE_CHITAI_GOROD;
            default: return null;
        }
    };
    this.addBasketHead = true;

    this.priceUpChanged = 0;// кол-во товаров с увеличенной ценой
    this.priceDownChanged = 0;// кол-во товаров с уменьшенной ценой
    this.newMinPrices = 0;// кол-во товаров с новой минимальной ценой
    this.checkPriceCount = 0;// кол-во товаров с ценой ниже выставленной checkPrice

    this.config = {
        timeout: 200,
    };
    this.setConfig = function(config) {
        this.config = Object.assign(this.config, config);
    };
    this.selectors = {
        basketHead: '.t-basket-head',
        listItem: '.t-list-item',
        itemPrice: '.t-item-price-column',
        itemQuantity: '.t-item-qty-column',
    };
    this.setSelectors = function(selectors) {
        this.selectors = Object.assign(this.selectors, selectors);
    };

    this.tPriceConfig;// класс с конфигами
    this.tPriceStyle;// класс со стилями
    this.tProductRepository// работа с продуктами
    this.tHtml;// создание html элементов

    this.getBasketUrl = function() {
        switch(this.type) {
            case TYPE_WILDBERRIES:
                return '/lk/basket';
            case TYPE_CHITAI_GOROD:
                return '/cart';
            default: return null;
        }
    };
    this.initUrlChangedListener = function() {
        var basketUrl = this.getBasketUrl();
        if(!basketUrl) {return;}
        var self = this;

        (function() {
            var pushState = history.pushState;
            history.pushState = function () {
                pushState.apply(history, arguments);

                if(typeof arguments[2] === 'undefined') {return;}
                if(arguments[2].match(basketUrl)) {
                    self.launch();
                }
            };
        })();
    };
    this.initConfig = function() {
        this.tPriceConfig = new tPriceConfig(this.type);
        this.tPriceConfig.initConfig(this);
        this.tPriceConfig.initSelectors(this);

        this.tPriceStyle = new tPriceStyle(this.type);
        this.tPriceStyle.addCssStyles(this);

        this.tProductRepository = new tProductRepository(this.type);
        this.tHtml = new tHtml(this.type);
    };
    this.init = function() {
        this.type = this.getInitType();
        if(!this.type) {
            alert('Domain is not correct');
            return;
        }

        this.initUrlChangedListener();
        this.initConfig();
        this.removePrevTimeFields();
        this.launch();
    };
    // удаление элементов, добавленных с прошлого захода
    this.removePrevTimeFields = function() {
        var headresult = document.querySelector('.t-head-result');
        if(headresult) {headresult.remove();}

        document.querySelectorAll('.t-item-qty').forEach(el => el.remove());
        document.querySelectorAll('.t-old-price').forEach(el => el.remove());
    };
    // запуск
    this.launch = function() {
        var self = this;

        //Корзина не новая страница, а открывается в текущей
        var path = window.location.pathname;
        switch(this.type) {
            case TYPE_WILDBERRIES:
            case TYPE_CHITAI_GOROD:
                var basketUrl = this.getBasketUrl();
                if(!basketUrl) {return;}
                if(!path.match(basketUrl)) {
                    return;
                }
                break;
        }

        if(this.type === TYPE_OZON) {
            (function(open) {
                XMLHttpRequest.prototype.open = function(type, url) {
                    this.addEventListener("readystatechange", function() {
                        if (url === 'https://xapi.ozon.ru/dlte/multi') {
                            setTimeout(function() {
                                console.log('Looking for new items...');
                                var availableItems = self.getAvailableItems();
                                if (availableItems.length > 0) {
                                    console.log(availableItems.length+' items are found!');
                                    self.initPriceChecking();
                                }
                            }, 50)
                        }
                    }, false);
                    open.apply(this, arguments);
                };
            })(XMLHttpRequest.prototype.open);
        }

        (function() {
            'use strict';

            if(self.type === TYPE_OZON) {
                window.scrollTo(0, document.body.scrollHeight);
                window.scrollTo(0, 0);
            }

            var limitCount = 0;

            var startChecking = setInterval(function() {
                limitCount++;
                var availableItems = self.getAvailableItems();
                console.log('Looking for items...');

                if (availableItems.length === 1) {
                    self.addBasketHead = false;
                }

                if (availableItems.length > 0) {
                    console.log(availableItems.length+' items are found!');
                    clearInterval(startChecking);
                    setTimeout(function() {self.initPriceChecking();}, 800);
                }

                if(limitCount >= 50) {
                    console.log('Attempt limit reached in '+limitCount);
                    clearInterval(startChecking);
                }
            }, self.config.timeout);
        })();
    };
    this.formatPrice = function(priceHtml) {
        return priceHtml.replace(/\D+/g, '')*1;
    };
    this.getAvailableItems = function() {
        var items = document.querySelectorAll(this.selectors.listItems);
        if(!items.length) {return items;}

        var basketHeader, priceColumn, qtyColumn, self = this;

        switch(this.type) {
            case TYPE_FFAN:
                items.forEach(function (item) {
                    priceColumn = item.querySelector('td.price');
                    qtyColumn = item.querySelector('td.quantity');

                    self.addCustomClassNamesToItems(item, priceColumn, qtyColumn);
                });

                basketHeader = document.querySelector('.content > h1');
                break;
            case TYPE_OZON:
                var pattern = '[data-widget="split"]:not(.t-checked)';

                var tempWidget = document.querySelector(pattern);
                var tempItems = document.querySelectorAll(pattern + ' > div');

                tempItems.forEach(function (item) {
                    priceColumn = item.querySelector(':nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3)');
                    if(!priceColumn || typeof priceColumn === 'undefined') {return;}
                    qtyColumn = item.children[1];

                    if (typeof qtyColumn === 'undefined') {
                        return;
                    }

                    self.addCustomClassNamesToItems(item, priceColumn, qtyColumn);
                });

                tempWidget.classList.add('t-checked');

                basketHeader = document.querySelector('div[data-widget="header"]').parentNode;
                break;
            case TYPE_WILDBERRIES:
                items.forEach(function (item) {
                    priceColumn = item.querySelector('.list-item__price');
                    qtyColumn = item.querySelector('.list-item__count');

                    self.addCustomClassNamesToItems(item, priceColumn, qtyColumn);
                });

                basketHeader = document.querySelector('.basket-section__header-tabs');
                break;
            case TYPE_CHITAI_GOROD:
                items.forEach(function (item) {
                    priceColumn = item.querySelector('.product-price');
                    qtyColumn = item.querySelector('.cart-item__counter');

                    self.addCustomClassNamesToItems(item, priceColumn, qtyColumn);
                });

                basketHeader = document.querySelector('.cart-page .wrapper');
                break;
        }

        if (basketHeader) {
            basketHeader.classList.add('t-basket-head');
        }

        return items;
    };
    this.addCustomClassNamesToItems = function(item, priceColumn = null, qtyColumn = null) {
        if (!priceColumn) {return;}

        item.classList.add('t-list-item');
        priceColumn.classList.add('t-item-price-column');
        qtyColumn.classList.add('t-item-qty-column');
    };
    this.getFindingProperty = function() {
        switch(this.type) {
            case TYPE_WILDBERRIES:
                return '.good-info__seller';
            case TYPE_CHITAI_GOROD:
                return '.cart-item__content-title';
            case TYPE_FFAN:
                return '.item a';
            case TYPE_OZON:
                return null;
            default:
                alert('Not found getFindingProperty for type: '+this.type);
        }
    };
    this.jsonItems = [];
    this.getJsonItemByCode = function(code) {
        var self = this;
        var items = this.jsonItems.filter(item => {
            if(self.type === TYPE_WILDBERRIES) {
                return item.cod1S == code;
            }

            return null;
        });

        if(!items) {return null;}

        return items[0];
    };
    this.initPriceChecking = function() {
        if(this.type === TYPE_OZON) {
            // this.jsonItems = __NUXT__.state.shared.itemsTrackingInfo;
            this.jsonItems = JSON.parse($('div[id^=state-split-]').data('state')).items;
        } else if(this.type === TYPE_WILDBERRIES) {
            var name,basketStorage;
            var u = JSON.parse(window.localStorage._user_deliveries).u;
            eval("name = 'wb_basket_"+u+"';");
            eval("basketStorage = window.localStorage."+name+"");
            this.jsonItems = JSON.parse(basketStorage).basketItems;
        }

        var self = this;

        document.querySelectorAll(self.selectors.listItem).forEach(function(item, i) {
            if(item.classList.contains('t-item-checked')) {return;}
            item.classList.add('t-item-checked');
            var jsonItem, productId, itemElement, currentPrice = null, title = null, qty = 1, maxQty = 0, product;

            if (self.type === TYPE_OZON) {
                itemElement = item;
                var itemTitle = item.querySelector('span.tsBody400Small').textContent;

                var qtyElement = item.querySelector(self.selectors.itemQuantity).querySelector('input[inputmode="numeric"]');

                if (qtyElement) {
                    maxQty = qtyElement.max;
                    qty = qtyElement.value;
                }

                if (!item.querySelector(self.selectors.itemPrice).children[0]) {
                    return;
                }
                var priceElement = item.querySelector(self.selectors.itemPrice).children[0].children[0].children[0];
                if (typeof priceElement === 'undefined') {
                    priceElement = item.querySelector(self.selectors.itemPrice).children[0].children[0];
                }

                if (typeof priceElement === 'undefined') {
                    return;
                }

                // Цена с картой
                currentPrice = self.formatPrice(priceElement.textContent);
                if (qty > 1) {
                    currentPrice = currentPrice / qty;
                }
                title = itemTitle.split('|')[0].trim();
                productId = title.replace(/\s/g, '_').slice(0, 50).trim();

                if (maxQty === 0) {
                    console.log('remove', item);
                    item.closest('.t-list-item').classList.remove('t-list-item')
                    item.classList.add('t-no-stock');
                    return;
                }

            } else {
                var itemProperty = item.querySelector(self.getFindingProperty());

                switch(self.type) {
                    case TYPE_WILDBERRIES:
                        if(item.classList.contains('not-available')) {return;}
                        productId = itemProperty.getAttribute('data-nm');

                        //stocks
                        jsonItem = self.getJsonItemByCode(productId);
                        if(!jsonItem) {return;}
                        jsonItem.stocks.forEach(function(stock) {
                            maxQty += stock.qty;
                        });

                        title = jsonItem.goodsName;
                        qty = jsonItem.quantity;
                        break;
                    case TYPE_CHITAI_GOROD:
                        productId = itemProperty.getAttribute('href').replace("/product/", "");
                        title = item.querySelector(self.selectors.title).innerHTML.trim();

                        if (item.querySelector('.product-quantity__counter')) {
                            maxQty = item.querySelector('.product-quantity__counter').getAttribute('max');
                        }
                        if(item.querySelector('.product-quantity__counter')) {
                            qty = item.querySelector('.product-quantity__counter').value;
                        }
                        break;
                    case TYPE_FFAN:
                        productId = itemProperty.getAttribute('href').replace("/catalog/fiction/", "");
                        productId = productId.replace("/", '');
                        maxQty = item.querySelector('.inp_style').getAttribute('max');
                        title = item.querySelector('.item .bx_ordercart_itemtitle a').innerHTML.trim()
                        qty = item.querySelector('input.inp_style').value;
                        break;
                }

                itemElement = itemProperty.closest(self.selectors.listItem);
                var itemPriceNew = itemElement.querySelector(self.selectors.itemPriceHtml);
                if (itemPriceNew) {
                    currentPrice = self.formatPrice(itemPriceNew.innerHTML) / qty;
                }
            }

            if(currentPrice) {
                product = self.tProductRepository.initProduct(productId, currentPrice, title);
                self.appendOldMinPrice(product, itemElement);
                self.appendMaxQty(itemElement, maxQty);
            }
        });

        this.appendHeadElement();
        this.appendPriceChangedInfo();
        //this.appendNewMinPricesInfo();
        this.appendSortControls();
        this.appendCheckPriceInfo();
    };
    // сейчас только на озон работает
    this.getJsonPrice = function(priceColumn) {
        var price = null;
        priceColumn.forEach(function(data) {
            if (data.type === 'price') {
                price = data.price.price;
            }
        });

        return price;
    };
    // сейчас только на озон работает
    this.getJsonTitle = function(titleColumn) {
        var title = null;

        var titles = titleColumn.filter(data => {
            return data.type === 'text';
        });

        if(titles.length) {
            title = titles[0].text.text;
            title = title.split('|')[0];
        }

        return title;
    };
    // append elements
    this.appendOldMinPrice = function(product, itemElement) {
        var priceEl = itemElement.querySelector(this.selectors.itemPrice);
        if(!priceEl) {return;}
        priceEl.classList.add('t-position-relative');
        priceEl.appendChild(this.getPriceElement(product));
    };
    this.appendMaxQty = function(itemElement, maxQty = null) {
        if(!maxQty) {
            return;
        }

        var qtyEl = itemElement.querySelector(this.selectors.itemQuantity);
        qtyEl.appendChild(this.tHtml.getQtyElement(maxQty));
    };
    this.appendHeadElement = function() {
        if (!this.addBasketHead) {return;}

        var toRemove = document.querySelector('.t-head-result');
        if(toRemove) {
            this.priceUpChanged += toRemove.getAttribute('data-price-up');
            this.priceDownChanged += toRemove.getAttribute('data-price-down');

            toRemove.remove();
        }

        var div = document.createElement('div');
        div.className = 't-head-result';

        var divInfo = document.createElement('div');
        divInfo.className = 't-head-info';
        div.appendChild(divInfo);

        var divSort = document.createElement('div');
        divSort.className = 't-head-sort';
        div.appendChild(divSort);

        document.querySelector(this.selectors.basketHead).position = 'relative';
        document.querySelector(this.selectors.basketHead).appendChild(div);
    };
    this.appendPriceChangedInfo = function() {
        if(this.priceUpChanged > 0) {
            document.querySelector('.t-head-info').appendChild(this.tHtml.getPriceChangedInfo(this.priceUpChanged, 'up'));
            document.querySelector('.t-head-info').setAttribute('data-price-up', this.priceUpChanged);
        }

        if(this.priceDownChanged > 0) {
            document.querySelector('.t-head-info').appendChild(this.tHtml.getPriceChangedInfo(this.priceDownChanged, 'down'));
            document.querySelector('.t-head-info').setAttribute('data-price-down', this.priceDownChanged);
        }
    };
    // блок когда цена стала ниже выставленной
    this.appendCheckPriceInfo = function () {
        if(this.checkPriceCount <= 0) {
            return;
        }

        document.querySelector('.t-head-info').appendChild(this.tHtml.getCheckPriceInfo(this.checkPriceCount));
    };
    // сортировка
    this.appendSortControls = function() {
        var self = this;
        var items = document.querySelectorAll(self.selectors.listItem);
        if(items.length < 2) {return;}

        var buttonSortQty = this.tHtml.getButtonSortQty();
        buttonSortQty.addEventListener("click", function (event) {
            event.preventDefault();
            self.sort(event.target, 'qty');
        });

        var buttonSortPrce = this.tHtml.getButtonSortPrice();
        buttonSortPrce.addEventListener("click", function (event) {
            event.preventDefault();
            self.sort(event.target, 'price');
        });

        document.querySelector('.t-head-sort').appendChild(buttonSortQty);
        document.querySelector('.t-head-sort').appendChild(buttonSortPrce);

        //self.sort(buttonSortQty, 'qty');
    };
    this.sort = function(button, sortType) {
        // сброc другим кнопкам up, down
        document.querySelectorAll('.t-sort-button').forEach(function(button) {
            button.classList.remove(SORT_UP);
            button.classList.remove(SORT_DOWN);
        });

        var items = $(this.selectors.listItem);
        //var items = document.querySelectorAll(this.selectors.listItem);

        var direction = (button.getAttribute('data-sort') === SORT_UP) ? SORT_UP : SORT_DOWN;
        if (direction === SORT_UP) {
            button.setAttribute('data-sort', SORT_DOWN);
            button.classList.remove('up');
            button.classList.add(SORT_DOWN);
        } else {
            button.setAttribute('data-sort', SORT_UP);
            button.classList.remove(SORT_DOWN);
            button.classList.add(SORT_UP);
        }

        items.sort(function(a,b){
            var an,bn;
            switch(sortType) {
                case 'qty':
                    an = a.querySelector('.t-item-qty').getAttribute('data-qty')*1;
                    bn = b.querySelector('.t-item-qty').getAttribute('data-qty')*1;
                    break;
                case 'price':
                    an = a.querySelector('.t-price-arrow').getAttribute('data-price')*1;
                    bn = b.querySelector('.t-price-arrow').getAttribute('data-price')*1;
                    break;
            }

            if(direction === SORT_UP) {
                return bn - an;
            } else {
                return an - bn;
            }
        }).each(function(i) {
            this.parentNode.appendChild(this);
        });

        //.appendTo(items.parent())

        //items.parent().appendChild(newItems);
    };
    //get html elements
    this.getPriceElement = function(product) {
        var self = this;
        var oldMinPrice = product.oldCurrentPrice;
        var currentPrice = product.price;
        var checkPrice = product.checkPrice ?? null;

        var colorClassName = 'not-changed', newMinPrice = '';
        if (currentPrice > oldMinPrice) {
            colorClassName = 'up';
            this.priceUpChanged++;
        } else if(currentPrice < oldMinPrice) {
            colorClassName = 'down';
            this.priceDownChanged++;
            this.newMinPrices++;
        } else {
            oldMinPrice = '';
        }

        // сравнение с пред ценой из истории
        var oldPriceForElement = oldMinPrice;

        var div = document.createElement("div");
        div.className = 't-old-price';

        var oldPricePercentDiv = document.createElement("div");
        oldPricePercentDiv.className = 't-old-price-percent';

        var span = document.createElement("span");
        span.className = 't-price-arrow '+colorClassName;
        span.textContent = oldPriceForElement;
        span.setAttribute('data-price', currentPrice);
        oldPricePercentDiv.append(span);

        var percentText;
        if(oldPriceForElement > 0 && oldPriceForElement != currentPrice) {
            var abs = Math.abs(oldPriceForElement - currentPrice);
            var sign = (oldPriceForElement > currentPrice) ? '-' : '+';
            percentText = sign + (Math.round((abs/currentPrice)*100)) + '%';
        }

        if(percentText) {
            var spanPercent = document.createElement("span");
            spanPercent.className = 't-price-percent';
            spanPercent.textContent = percentText;
            oldPricePercentDiv.append(spanPercent);
        }

        var minPriceDate = this.tProductRepository.getOldMinPriceDate(product.id);
        if(minPriceDate) {
            var spanDate = document.createElement("span");
            spanDate.className = 't-price-old-date';
            spanDate.textContent = minPriceDate;
            div.append(spanDate);
        }

        var spanEdit = document.createElement("button");
        spanEdit.className = 't-title-edit t-button';
        spanEdit.setAttribute('title', 'Edit title');
        spanEdit.addEventListener("click", function (event) {
            event.preventDefault();
            self.openEditTitleWindow(event.target, product.id);
        });
        oldPricePercentDiv.append(spanEdit);

        var tCheckPriceClassNames = 't-check-price t-button';
        if (checkPrice && checkPrice >= currentPrice) {
            tCheckPriceClassNames += ' t-check-price-available';
            this.checkPriceCount++;
        }
        var spanCheckPrice = document.createElement("button");
        spanCheckPrice.className = tCheckPriceClassNames;
        spanCheckPrice.setAttribute('title', 'Set Check Price');
        spanCheckPrice.addEventListener("click", function (event) {
            event.preventDefault();
            self.openEditCheckPriceWindow(event.target, product.id);
        });
        oldPricePercentDiv.append(spanCheckPrice);

        div.append(oldPricePercentDiv);

        this.appendHoverElements(div, product.id);

        return div;
    };
    this.appendHoverElements = function(parentEl, productId) {
        var hoverField = document.createElement("div");
        hoverField.className = 't-hover-field';

        this.appendPriceDates(hoverField, productId, parentEl);
        this.appendSameProducts(hoverField, productId, parentEl);

        parentEl.append(hoverField);
    };
    this.appendSameProducts = function(hoverField, productId, parentEl) {
        var product = this.tProductRepository.getProductById(productId);
        var foundProducts = this.tProductRepository.getProductsBySameTitle(product);
        if(!foundProducts.length) {return;}
        var el = this.tHtml.getSameProducts(foundProducts, product);

        var dateIconSpan = document.createElement("span");
        dateIconSpan.className = 't-price-same-products-icon';
        parentEl.append(dateIconSpan);

        hoverField.append(el);
    };
    this.appendPriceDates = function(hoverField, productId, parentEl) {
        var priceDates = this.tProductRepository.getPriceDates(productId);
        if(!priceDates.length) {return;}

        var divDates = document.createElement("div");
        divDates.className = 't-price-dates';

        priceDates.forEach(function(priceDate) {
            var priceDateDiv = document.createElement("div");
            priceDateDiv.className = 't-price-date';
            priceDateDiv.textContent = priceDate.date+': '+priceDate.price;

            divDates.appendChild(priceDateDiv);
        });

        var dateIconSpan = document.createElement("span");
        dateIconSpan.className = 't-price-dates-icon';
        parentEl.append(dateIconSpan);

        hoverField.append(divDates);
    };
    this.openEditTitleWindow = function(el, productId) {
        this.tHtml.closeEditWindow();
        document.querySelector('body').append(this.tHtml.getWindowShadow());
        document.querySelector('body').append(this.tHtml.getEditWindow(productId, this));
    };
    this.openEditCheckPriceWindow = function(el, productId) {
        this.tHtml.closeEditWindow();
        document.querySelector('body').append(this.tHtml.getWindowShadow());
        document.querySelector('body').append(this.tHtml.getCheckPriceWindow(productId, this));
    };
}

function tHtml(type) {
    this.type = type;
    this.getShopLinkForProduct = function(product) {
        var productId = product.id;

        switch(product.type) {
            case TYPE_WILDBERRIES:
                return 'https://www.wildberries.ru/catalog/'+productId+'/detail.aspx';
            case TYPE_OZON:
                return 'https://www.ozon.ru/product/'+productId+'/';
            case TYPE_FFAN:
                return 'https://ffan.ru/catalog/product/'+productId+'/';
            case TYPE_CHITAI_GOROD:
                return 'https://www.chitai-gorod.ru/product/'+productId;
        }

    };
    this.getQtyElement = function(qty) {
        var div = document.createElement("div");
        div.className = 't-item-qty';
        div.setAttribute('data-qty', qty);

        var span = document.createElement("span");
        span.textContent = 'Всего: '+qty;

        div.append(span);

        return div;
    };
    /*
    this.getNewMinPricesInfo = function(count) {
        if(count <= 0) {
            return;
        }

        var div = document.createElement('div');
        div.className = 't-changed-result min-price';
        div.textContent = 'Новые мин цен: '+count;

        return div;
    };
    */
    this.getPriceChangedInfo = function(count, type='up') {
        var div = document.createElement('div');
        var className = 't-changed-result ';
        className += (type == 'up') ? 'price-up' : 'price-down';
        div.className = className;
        div.textContent = 'цена: '+count;

        return div;
    };
    this.getCheckPriceInfo = function(count) {
        var div = document.createElement('div');
        div.className = 't-changed-result check-price';
        div.textContent = 'CheckPrice: '+count;

        return div;
    };
    this.getButtonSortQty = function() {
        var buttonSortQty = document.createElement('button');
        buttonSortQty.textContent = 'sort by qty';
        buttonSortQty.className = 't-sort-button t-sort-qty';

        return buttonSortQty;
    };
    this.getButtonSortPrice = function() {
        var buttonSortPrce = document.createElement('button');
        buttonSortPrce.textContent = 'sort by price';
        buttonSortPrce.className = 't-sort-button t-sort-price';

        return buttonSortPrce;
    };
    this.getSameProduct = function(foundProduct, product) {
        var productDiv = document.createElement("div");
        productDiv.className = 't-same-product';

        var link = document.createElement("a");
        link.textContent = foundProduct.type+': '+foundProduct.price;
        link.href = this.getShopLinkForProduct(foundProduct);
        link.setAttribute('target','_blank');
        if(product.price > foundProduct.price) {
            link.className = 'down';
        } else if(product.price < foundProduct.price) {
            link.className = 'up';
        }

        productDiv.appendChild(link);

        return productDiv;
    };
    this.getSameProducts = function(foundProducts, product) {
        var self = this;
        var div = document.createElement("div");
        div.className = 't-same-products';

        var productDiv,link;
        foundProducts.forEach(function(foundProduct) {
            productDiv = self.getSameProduct(foundProduct, product);
            div.appendChild(productDiv);
        });

        return div;
    };
    this.closeEditWindow = function() {
        if (document.getElementById('t-window-edit')) {document.getElementById('t-window-edit').remove();}
        if (document.getElementById('t-window-shadow')) {document.getElementById('t-window-shadow').remove();}
    };
    this.getWindowShadow = function() {
        var self = this;
        var editWindowShadow = document.createElement("div");
        editWindowShadow.className = 't-window-shadow';
        editWindowShadow.id = 't-window-shadow';
        editWindowShadow.addEventListener("click", function (event) {
            event.preventDefault();
            self.closeEditWindow();
        });

        return editWindowShadow;
    };
    this.getEditWindow = function(productId, tPriceChecker) {
        var self = this;
        var editWindow = document.createElement("div");
        editWindow.className = 't-window-edit';
        editWindow.id = 't-window-edit';

        var editBody = document.createElement("div");
        editBody.className = 't-window-body';

        var productInfo = document.createElement("div");
        productInfo.className = 't-window-info';

        var editForm = document.createElement("form");
        var editInput = document.createElement("input");
        editInput.type = 'text';
        editInput.setAttribute('maxlength', '100');
        var editSumbitButton = document.createElement("button");
        editSumbitButton.className = 't-button t-button-submit';
        editSumbitButton.type = 'submit';
        editSumbitButton.textContent = 'Save';

        editForm.addEventListener('submit', function(event) {
            event.preventDefault();

            var title = event.target.querySelector('input[type=text]').value;
            tPriceChecker.tProductRepository.saveTitle(productId, title);
            self.closeEditWindow();
        })

        var product = tPriceChecker.tProductRepository.getProductById(productId);
        if (product) {
            editInput.value = product.title;
            productInfo.textContent = tPriceChecker.tProductRepository.getSavingProductId(productId);
        }

        editForm.append(editInput);
        editForm.append(editSumbitButton);
        editBody.append(productInfo);
        editBody.append(editForm);
        editWindow.append(editBody);

        return editWindow;
    };
    this.openCheckPriceWindow = function(productId, tPriceChecker) {
        var self = this;
        var editWindow = document.createElement("div");
        editWindow.className = 't-window-edit';
        editWindow.id = 't-window-edit';

        var editBody = document.createElement("div");
        editBody.className = 't-window-body';

        var productInfo = document.createElement("div");
        productInfo.className = 't-window-info';

        var editForm = document.createElement("form");
        var editInput = document.createElement("input");
        editInput.type = 'text';
        editInput.setAttribute('maxlength', '5');
        var editSumbitButton = document.createElement("button");
        editSumbitButton.className = 't-button t-button-submit';
        editSumbitButton.type = 'submit';
        editSumbitButton.textContent = 'Save';

        editForm.addEventListener('submit', function(event) {
            event.preventDefault();

            var title = event.target.querySelector('input[type=text]').value;
            tPriceChecker.tProductRepository.saveCheckPrice(productId, title);
            self.closeEditWindow();
        });

        editInput.addEventListener('keyup', function(event) {
            this.value = this.value.replace(/[^0-9\.]/g, '');
        });

        var product = tPriceChecker.tProductRepository.getProductById(productId);
        var checkPrice = product.checkPrice;

        if (checkPrice > 0) {
            var resetButton = document.createElement("button");
            resetButton.className = 't-button t-button-reset';
            resetButton.textContent = 'Reset CheckPrice';

            resetButton.addEventListener('click', function(event) {
                event.preventDefault();
                tPriceChecker.tProductRepository.resetCheckPrice(productId);
                self.closeEditWindow();
            });
        }

        if (product) {
            editInput.value = product.checkPrice ?? '';
            productInfo.textContent = 'Set CheckPrice for: ' + tPriceChecker.tProductRepository.getSavingProductId(productId);
        }

        editForm.append(editInput);
        editForm.append(editSumbitButton);
        editBody.append(productInfo);
        editBody.append(editForm);
        if (checkPrice > 0) {
            editBody.append(resetButton);
        }
        editWindow.append(editBody);

        return editWindow;
    };
}

function tPriceStyle(initType) {
    this.type = initType;
    this.addCssStyles = function() {
        var head = document.querySelector("head");
        head.innerHTML += `<style>
     .t-button {border: 0;background: none;}
     .t-button:hover {cursor:pointer;}
      
     .t-basket-head {position:relative;}

     .t-window-shadow {z-index: 100; background:rgba(0,0,0,0.8); position:fixed; left:0; top:0%; width:100%; height:100%;}
     .t-window-edit {z-index: 110; position:fixed; left:50%; top:50%; width:420px; margin-left: -210px;}
     .t-window-edit .t-window-body {padding: 20px; border-radius: 10px; background: #fff;}
     .t-window-edit .t-window-body input[type=text] {border: 1px solid #d1d1d1; width:300px; padding: 2px 6px;}
     .t-window-edit .t-window-body button[type=submit] {margin-left: 20px;}
     .t-window-edit .t-window-body .t-window-info {color: #626262; padding: 0 0 10px 4px;}

    .t-old-price .t-title-edit {transform: rotate(90deg); display: inline-block; margin-left: 10px;}
    .t-old-price .t-title-edit:before {content:'✎'; color: orange;}
    
    .t-old-price .t-check-price {display: inline-block; margin-left: 10px;}
    .t-old-price .t-check-price:before {content:'⚠'; color: #dadada; font-size: 1.4em;}
    .t-old-price .t-check-price.t-check-price-available:before {color: #08d106;}

    .t-price-arrow {font-size: 18px; font-weight:bold;}
    .t-price-arrow.not-changed {color: #0395c1;}
    .t-price-arrow.not-changed:before {content: '✓';}
    .t-price-arrow.up {color: red;}
    .t-price-arrow.up:before {content: '↑';}
    .t-price-arrow.down {color: green;}
    .t-price-arrow.down:before {content: '↓';}
    .t-price-arrow.up:before, .t-price-arrow.down:before {padding-right: 4px;}
    .t-old-price-percent {text-align:left;width:100px;}
    .t-price-percent {font-size:14px;padding-left: 5px;color:#707070;}

    .t-old-price {position: absolute; top:0; cursor:default; width: 140px; padding-left: 35px;}
    .t-old-price > span {display:block;text-align:left;}
    .t-old-price > .t-price-old-date {font-size: 10px; margin-bottom: 4px;}
    .t-new-min-price {position: absolute; left:30px; top:30px; color: #4fc78a;}
    .t-old-price .t-hover-field {z-index:5; position:absolute; left: -130px; top:0; width: 160px; display:none;}
    .t-old-price:hover .t-hover-field {display:block;}
    .t-old-price .t-hover-field > div {border: 1px solid #d9cfcf;border-top:0;}
    .t-old-price .t-hover-field > div:first-child {border-top: 1px solid #d9cfcf;}
    .t-same-products,
    .t-price-dates {cursor:default; z-index: 10; font-size: 14px; background: #fff; text-align: left; padding: 8px 12px; }
    .t-price-dates {}
    .t-price-dates .t-price-date {margin:2px 0;}
    .t-old-price .t-price-dates-icon:before {content:'◎';color:#e78d1e;}
    .t-old-price .t-price-same-products-icon:before {content:'◎';color:#b204b5;}

    .t-same-products {}
    .t-same-products .t-same-product {margin:2px 0;}
    .t-same-products .t-same-product a {color: #242424;}
    .t-same-products .t-same-product a:after {padding-left: 4px;}
    .t-same-products .t-same-product a.up {color:red;}
    .t-same-products .t-same-product a.down {color:green;}
    .t-same-products .t-same-product a.up:after {content: '↑';}
    .t-same-products .t-same-product a.down:after {content: '↓';}
    .t-same-products .t-same-product a:hover {color: #0395c1;}

    .t-head-result {font-size: 16px; margin: 4px 8px; border: 1px solid #edf3f7; padding: 10px 12px; z-index: 5; background: #fff; position: absolute; left: 24%; width: 340px;}
    .t-head-info {cursor:default;}
    .t-head-result > div {margin:4px 0;}
    .t-changed-result {padding-left: 4px;color:#bf10b9; font-weight:bold; display: inline-block; margin-right: 4px;}
    .t-changed-result.min-price {color: #4fc78a; margin-left:8px;}
    .t-changed-result.price-up {color: red;}
    .t-changed-result.price-up:before {content:'↑';}
    .t-changed-result.price-down {color: green;}
    .t-changed-result.price-down:before {content:'↓';}
    .t-changed-result.price-up:before,
    .t-changed-result.price-down:before {padding-right: 6px;}
    .t-changed-result.check-price {color: #08d106;}

    .t-product-not-found {font-size: 24px; color:#f97d12;}

    .t-position-relative {position: relative;}
    .t-item-qty {color: #af07af; margin:8px 0 0 4px;}

    .t-sort-button {font-size: 16px; color: #707783; margin: 0 4px; border: 1px solid #edf3f7; border-radius: 4px; background: white; padding: 4px 8px;}
    .t-sort-button:hover {cursor: pointer; background: #828997; color: #edf3f7;}
    .t-sort-button.up,.t-sort-button.down {background: #707783; color: #edf3f7;}
    .t-sort-button:before {padding-right: 6px;}
    .t-sort-button.up {}
    .t-sort-button.up:before {content: '↑';}
    .t-sort-button.down {}
    .t-sort-button.down:before {content: '↓'; }
    .t-sort-button.t-sort-qty {}
    .t-sort-button.t-sort-price {}
    </style>`;
        this.addTypeStyles();
    };
    this.addTypeStyles = function() {
        switch(this.type) {
            case TYPE_OZON:
                this.appendCssStyles(`<style>
                    .t-old-price {position: relative; left: -40px; top: 10px;}
                    .t-head-result {left:150px; top:-20px;}
                </style>`);
                break;
            case TYPE_WILDBERRIES:
                this.appendCssStyles(`<style>
                   .t-head-result {left: 190px; width: 260px; top: -20px;}
                </style>`);
                break;
            case TYPE_CHITAI_GOROD:
                this.appendCssStyles(`<style>
                   .t-head-result {left:300px;}
                   .t-old-price {position: relative; left: 40px; top:4px;}

                   .cart-item__content-right .cart-item__actions {right: -50px!important; top:125px!important;}
                   .product-price__value--discount {color: #424242!important;}
                   .t-item-qty {margin: 20px 0 0 4px;}
                </style>`);
                break;
            case TYPE_FFAN:
                this.appendCssStyles(`<style>
                    .t-head-result {left: 180px;top: -25px;}
                    #basket_items td.quantity {position:relative;}
                    .t-item-qty {left: 4px; top: 22px; position: absolute;}
                    .t-item-qty span {display:block!important;}
                    .t-old-price {position:relative; left:-36px; width: 70px;}
                </style>`);
                break;
        }
    };
    this.appendCssStyles = function(styles) {
        var head = document.querySelector("head");
        head.innerHTML += styles;
    };
}

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
}

var m = new tPriceChecker();
m.init();

function tJson(type) {
    this.type = type;
}