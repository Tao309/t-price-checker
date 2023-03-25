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

    this.priceUpChanged = 0;// кол-во товаров с увеличенной ценой
    this.priceDownChanged = 0;// кол-во товаров с уменьшенной ценой
    this.newMinPrices = 0;// кол-во товаров с новой минимальной ценой

    this.config = {
        timeout: 200,// Может удалить?
    };
    this.setConfig = function(config) {
        let c = Object.assign(this.config, config);

        this.config = c;
    };
    this.selectors = {};
    this.setSelectors = function(selectors) {
        let sel = Object.assign(this.selectors, selectors);

        this.selectors = sel;
    };

    this.tPriceConfig;// класс с конфигами
    this.tPriceStyle;// класс со стилями
    this.tProductRepository// работа с продуктами
    this.tHtml;// создание html элементов

    this.getBasketUrl = function() {
        switch(this.type) {
            case TYPE_WILDBERRIES:
                return '/lk/basket';
                break;
            case TYPE_CHITAI_GOROD:
                return '/cart';
                break;
            default: return null;
        };
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

        (function() {
            'use strict';
            var limitCount = 0;

            var startChecking = setInterval(function() {
                limitCount++;
                var availableItems = self.getAvailabelItems();
                console.log('Looking for items...');
                if (availableItems.length > 0) {
                    console.log(availableItems.length+' items are found!');
                    clearInterval(startChecking);
                    setTimeout(function() {self.initPriceChecking();}, 800);
                }

                if(limitCount >= 50) {
                    console.log('Attempt limit reached in '+limitCount);
                    clearInterval(startChecking);
                }
            }, 200);
        })();
    };
    this.formatPrice = function(priceHtml) {
        return priceHtml.replace(/\D+/g, '')*1;
    };
    this.getAvailabelItems = function() {
        switch(this.type) {
            case TYPE_WILDBERRIES:
                return document.querySelectorAll(this.selectors.listItems+':not(.not-available)');
            default:
                return document.querySelectorAll(this.selectors.listItems);
        };
    };
    this.getFindingProperty = function() {
        switch(this.type) {
            case TYPE_WILDBERRIES:
                return '.good-info__seller';
                break;
            case TYPE_CHITAI_GOROD:
                return '.cart-item__content-title'
                break;
            case TYPE_FFAN:
                return '.item a'
                break;
            case TYPE_OZON:
                return null;
                break;
            default:
                alert('Not found getFindingProperty for type: '+this.type);
        };
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
        var self = this;

        if(this.type === TYPE_OZON) {
            var dataELement = document.querySelector('[id^="state-split-"]');
            var jsonData = JSON.parse(dataELement.getAttribute('data-state'));
            this.jsonItems = jsonData.items;
        } else if(this.type === TYPE_WILDBERRIES) {
            var name,basketStorage;
            var u = JSON.parse(window.localStorage._user_deliveries).u;
            eval("name = 'wb_basket_"+u+"';");
            eval("basketStorage = window.localStorage."+name+"");
            this.jsonItems = JSON.parse(basketStorage).basketItems;
        }

        document.querySelectorAll(self.selectors.listItems).forEach(function(item, i) {
            var jsonItem, productId, itemElement, currentPrice = null, title = null, qty = 1, maxQty = 0, product;

            if(self.type === TYPE_OZON) {
                itemElement = item;
                jsonItem = self.jsonItems[i];
                productId = jsonItem.products[0].id;
                maxQty = jsonItem.quantity.maxQuantity;
                currentPrice = self.formatPrice(self.getJsonPrice(jsonItem.products[0].priceColumn));
                title = self.getJsonTitle(jsonItem.products[0].titleColumn);
                qty = jsonItem.quantity.quantity;
            } else {
                var itemProperty = item.querySelector(self.getFindingProperty());

                switch(self.type) {
                    case TYPE_WILDBERRIES:
                        if(item.classList.contains('not-available')) {return;}
                        productId = itemProperty.getAttribute('data-nm');
                        // catalog/2975034/detail.aspx?size=11828903
                        //productId = productId.match(/size=(.*?)$/)[1];

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
    };
    // сейчас только на озон работает
    this.getJsonPrice = function(priceColumn) {
        var price = null;
        priceColumn.forEach(function(data) {
            if (data.type === 'price') {
                price = data.price.price;
                return;
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
        }

        if(this.priceDownChanged > 0) {
            document.querySelector('.t-head-info').appendChild(this.tHtml.getPriceChangedInfo(this.priceDownChanged, 'down'));
        }
    };
    /*
    this.appendNewMinPricesInfo = function() {
        if(this.newMinPrices <= 0) {
            return;
        }

        document.querySelector('.t-head-info').appendChild(this.tHtml.getNewMinPricesInfo(this.newMinPrices));
    };
    */
    // сортировка
    this.appendSortControls = function() {
        var self = this;
        var items = document.querySelectorAll(self.selectors.listItems);
        if(items.length < 2) {return;}

        var buttonSortQty = this.tHtml.getButtonSortQty();
        buttonSortQty.addEventListener("click", function (event) {
            self.sort(event.target, 'qty');
        });

        var buttonSortPrce = this.tHtml.getButtonSortPrice();
        buttonSortPrce.addEventListener("click", function (event) {
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

        var items;
        switch(this.type) {
            case TYPE_WILDBERRIES:
                items = $(this.selectors.listItems+':not(.not-available)');
                break;
            case TYPE_CHITAI_GOROD:
                items = $('.products__items').first().find('.cart-item');
                break;
            default:
                items = $(this.selectors.listItems);
        }

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
                    an = a.querySelector('.t-item-qty').getAttribute('data-qty');
                    bn = b.querySelector('.t-item-qty').getAttribute('data-qty');
                    break;
                case 'price':
                    an = a.querySelector('.t-price-arrow').getAttribute('data-price');
                    bn = b.querySelector('.t-price-arrow').getAttribute('data-price');
                    break;
            }

            if(direction === SORT_UP) {
                return bn - an;
            } else {
                return an - bn;
            }
        }).appendTo(items.parent());
    };
    //get html elements
    this.getPriceElement = function(product) {
        var self = this;
        var oldMinPrice = product.oldCurrentPrice;
		var currentPrice = product.price;

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
            self.openEditTitleWindow(event.target, product.id);
        });
        oldPricePercentDiv.append(spanEdit);
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
        var self = this;

        this.tHtml.closeEditWindow();
        document.querySelector('body').append(this.tHtml.getWindowShadow());
        document.querySelector('body').append(this.tHtml.getEditWindow(productId, this));
    };
};
