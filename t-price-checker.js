function tPriceChecker() {
    this.type = null;
    this.isLoaded = false;
    this.getInitType = function() {
        switch(window.location.host) {
            case 'knigofan.ru':
                return TYPE_KNIGOFAN;
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
    this.responseInterceptEnabled = []

    this.priceUpChanged = 0;// кол-во товаров с увеличенной ценой
    this.priceDownChanged = 0;// кол-во товаров с уменьшенной ценой
    this.checkPriceCount = 0;// кол-во товаров с ценой, ниже отслеживаемой
    this.checkReturnsCount = 0;// кол-во товаров, которые снова появились в продаже

    this.resetCounts = function() {
        this.priceUpChanged = 0;
        this.priceDownChanged = 0;
        this.checkPriceCount = 0;
        this.checkReturnsCount = 0;
        this.productsCount = 0;
        this.qtyLimit = {
            '5': 0,
            '10': 0,
            '20': 0,
            '50': 0
        };
    };

    // Количество доступных к покупке товаров в корзине
    this.productsCount = 0;
    // Сколько товаров осталось меньше чем
    this.qtyLimit = {
        '5': 0,
        '10': 0,
        '20': 0,
        '50': 0
    };

    this.config = {
        timeout: 200,
    };
    this.setConfig = function(config) {
        this.config = Object.assign(this.config, config);
    };
    this.selectors = {
        basketHead: 't-basket-head',
        listItem: 't-list-item',
        listItemNotAvailable: 't-list-item-not-available',
        itemPrice: 't-item-price-column',
        itemQuantity: 't-item-qty-column',
        itemImage: 't-item-image-column',
        headInfo: 't-head-info',
        itemQty: 't-item-qty',
        oldPrice: 't-old-price',
        oldPricePercent: 't-old-price-percent',
        itemChecked: 't-item-checked'
    };
    this.setSelectors = function(selectors) {
        this.selectors = Object.assign(this.selectors, selectors);
    };

    this.tPriceConfig;// класс с конфигами
    this.tPriceStyle;// класс со стилями
    this.tProductRepository// работа с продуктами
    this.tHtml;// создание html элементов
    this.tResponseInterceptor;// перехватчик ответов по xhr, fetch
    this.tEventListener;// слушатель эвентов
    this.tProduct;// класс позиции

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
                    self.isLoaded = false;
                    self.reInit();
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

        this.tEventListener = new tEventListener(this.type);
        this.tEventListener.init();

        this.tProduct = new tProductModel();

        if (this.isResponseInterceptEnabled()) {
            console.log('!!!!!!! ResponseInterceptEnabled !!!!!!!');
            this.tResponseInterceptor = (new tResponseInterceptor(this.type, this)).init();
        }
    };
    this.preInitFirstTime = function() {
        var self = this;

        (function() {
            'use strict';

            /*
            if (self.type === TYPE_OZON) {
                GM_webRequest([
                    { selector: '*www.ozon.ru/api/entrypoint-api.bx/page/json/v2*', action: { redirect: { from: "(.*)", to: "$1" } } }
                ], function(info, message, details) {
                    if (self.isLoaded) {
                        self.isLoaded = false;
                        self.reInit();
                    }
                });

                setTimeout(function() {
                    window.scrollTo(0, document.body.scrollHeight);
                    window.scrollTo(0, 0);
                }, 100);
            }
            */
        })();
    };
    this.init = function(responseInterceptors) {
        this.type = this.getInitType();
        if(!this.type) {
            alert('Domain is not correct');
            return;
        }

        this.responseInterceptEnabled[this.type] = responseInterceptors.includes(this.type);

        //this.initUrlChangedListener();
        this.initConfig();
        this.removePrevTimeFields();
        this.preInitFirstTime();

        if (this.isResponseInterceptEnabled()) {
            return;
        }

        this.launch();
    };
    this.reInit = function() {
        this.type = this.getInitType();
        if(!this.type) {
            alert('Domain is not correct');
            return;
        }

        console.log('Reinit');

        this.initConfig();
        this.removePrevTimeFields();
        this.preInitFirstTime();
        this.launch();
    };
    // Включён ли обработки ответа сервера для типа магазина
    this.isResponseInterceptEnabled = function() {
        return this.responseInterceptEnabled[this.type] ?? false;
    };
    // Удаление элементов, добавленных с прошлого захода
    this.removePrevTimeFields = function() {
        var headresult = document.querySelector('.t-head-result');
        if(headresult) {headresult.remove();}

        document.querySelectorAll('.'+this.selectors.itemQty).forEach(el => el.remove());
        document.querySelectorAll('.'+this.selectors.oldPrice).forEach(el => el.remove());
        document.querySelectorAll('.t-item-checked').forEach(el => el.classList.remove('t-item-checked'));

        this.resetCounts();
    };
    // запуск
    this.launch = function() {
        var self = this;

        //Корзина не новая страница, а открывается в текущей
        /*
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
        */

        (function() {
            'use strict';

            var limitCount = 0;
            var startChecking = setInterval(function() {
                limitCount++;
                var availableItems = self.getAvailableItems();
                console.log('Looking for items...');

                if (availableItems.length === 1) {
                    self.addBasketHead = false;
                }

                if (availableItems.length > 0) {
                    if (self.isResponseInterceptEnabled()) {
                        console.log(availableItems.length + '|' + self.responseItems[self.type].length + ' dom|json items are found!');
                    } else {
                        console.log(availableItems.length + ' dom items are found!');
                    }

                    clearInterval(startChecking);
                    setTimeout(function() {
                        self.initPriceChecking();
                        self.isLoaded = true;
                    }, self.isResponseInterceptEnabled() ? 1 : 500);
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
    // Получаем список элементов для обработки
    this.getAvailableItems = function() {
        var items = document.querySelectorAll(this.selectors.listItems);
        //if(!items.length) {return items;}

        var self = this,
          basketHeader = document.querySelector(this.selectors.basketHeader);

        items.forEach(function (item, i) {
            self.handleAvailableItem(item, i);
        });

        if (this.type === TYPE_OZON) {
            basketHeader = document.querySelector(this.selectors.basketHeader).parentNode;
            //var pattern = '[data-widget="split"]:not(.t-checked)';

            //var tempWidget = document.querySelector(pattern);
            // foreach
            //tempWidget.classList.add('t-checked');
        }

        if (basketHeader) {
            basketHeader.classList.add(this.selectors.basketHead);
        }

        return items;
    };
    // Получаем один элемент для обработки
    this.handleAvailableItem = function(item, i) {
        var priceColumn = null, qtyColumn = null, imageColumn = null;

        switch(this.type) {
            case TYPE_KNIGOFAN:
                priceColumn = item.querySelector('td.basket-items-list-item-price');
                qtyColumn = item.querySelector('td.basket-items-list-item-amount');

                this.addCustomClassNamesToItems(item, priceColumn, qtyColumn);
                break;
            case TYPE_FFAN:
                priceColumn = item.querySelector('td.price');
                qtyColumn = item.querySelector('td.quantity');

                this.addCustomClassNamesToItems(item, priceColumn, qtyColumn);
                break;
            case TYPE_OZON:
                var imageEl = null, qtyEl = null;
                imageEl = item.querySelector('[alt="productImage"]');

                if (!imageEl) {
                    console.log('Not found imageElement for item #' + i);
                    return;
                }

                priceColumn = item.querySelector(':nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3)');

                if (!priceColumn || typeof priceColumn === 'undefined') {
                    console.log('Not found priceColumn for item #' + i);
                    return;
                }

                qtyEl = item.querySelector('[inputmode="numeric"]');

                if (!qtyEl) {
                    this.addCustomClassNamesToItems(item, priceColumn);
                    return;
                }

                qtyColumn = item.children[0].children[1];

                if (typeof qtyColumn === 'undefined') {
                    console.log('Not found qtyColumn for item #' + i);
                    return;
                }

                imageColumn = item.children[0].children[0].children[0].children[0].children[0].children[1];

                this.addCustomClassNamesToItems(item, priceColumn, qtyColumn, imageColumn);
                break;
            case TYPE_WILDBERRIES:
                if (item.classList.contains('not-available')) {
                    priceColumn = item.querySelector('.list-item__count');
                    this.addCustomClassNamesToItems(item, priceColumn);
                    return;
                }

                priceColumn = item.querySelector('.list-item__price');
                qtyColumn = item.querySelector('.list-item__count');

                this.addCustomClassNamesToItems(item, priceColumn, qtyColumn);
                break;
            case TYPE_CHITAI_GOROD:
                priceColumn = item.querySelector('.product-price');
                if (!priceColumn) {
                    priceColumn = item.querySelector('.cart-item__available');
                    this.addCustomClassNamesToItems(item, priceColumn);
                    return;
                }
                qtyColumn = item.querySelector('.cart-item__counter');

                this.addCustomClassNamesToItems(item, priceColumn, qtyColumn);
                break;
        }
    };
    this.addCustomClassNamesToItems = function(item, priceColumn = null, qtyColumn = null, imageColumn = null) {
        if (priceColumn) {
            priceColumn.classList.add('t-item-price-column');
        }

        if (qtyColumn) {
            item.classList.add(this.selectors.listItem);
            qtyColumn.classList.add('t-item-qty-column');
        } else {
            item.classList.add(this.selectors.listItemNotAvailable);
        }

        if (imageColumn) {
            imageColumn.classList.add('t-item-image-column');
        }
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
    this.responseItems = [];
    this.getJsonItemByCode = function(code) {
        var self = this;

        return this.responseItems[self.type].find(item => {
            if (self.type === TYPE_KNIGOFAN) {
                return item.id === code;
            }
            
            return item.product_id === code;

            // Заменяем позиции ozon с imageId на productId
            //return item.imageId === code;
        }) ?? null;
    };
    // Начинаем обработку элементов
    this.initPriceChecking = function() {
        var self = this;
        self.removePrevTimeFields();

        if (!self.isResponseInterceptEnabled()) {
            switch (this.type) {
                case TYPE_OZON:
                    //this.jsonItems = __NUXT__.state.shared.itemsTrackingInfo;
                    this.jsonItems = JSON.parse($('div[id^=state-split-]').data('state')).items;

                    break;
                case TYPE_WILDBERRIES:
                    var name, basketStorage;
                    var u = JSON.parse(window.localStorage._user_deliveries).u;
                    eval("name = 'wb_basket_"+u+"';");
                    eval("basketStorage = window.localStorage."+name+"");
                    this.jsonItems = JSON.parse(basketStorage).basketItems;
                    break;
            }
        }

        // Обработка позиций в наличии и недоступных
        document.querySelectorAll('.'+self.selectors.listItem + ',.'+self.selectors.listItemNotAvailable).forEach(function(item, i) {
            self.initOnePosition(item, i);
        });

        this.appendHeadElement();
        this.appendPriceChangedInfo();
        this.appendSortControls();

        this.appendCheckerElement('check-price', this.checkPriceCount);
        this.appendCheckerElement('price-decrease', this.priceDownChanged);
        this.appendCheckerElement('returns', this.checkReturnsCount);

        this.appendQtyLimitInfo();
    };
    // Начинаем обработку одного элемента
    this.initOnePosition = function(item, i) {
        var self = this;

        if(item.classList.contains('t-item-checked')) {return;}
        item.classList.add('t-item-checked');

        if (self.isResponseInterceptEnabled()) {
            self.initOnePositionByResponseIntercept(item);
            return;
        }

        var itemIdProperty = item.querySelector(self.getFindingProperty());

        var jsonItem, productId, currentPrice = null, title = null, qty = 1, maxQty = 0,
          product, isNotAvailable = false;

        switch(self.type) {
            case TYPE_FFAN:
                productId = itemIdProperty.getAttribute('href').replace("/catalog/fiction/", "");
                productId = productId.replace("/", '');
                maxQty = item.querySelector('.inp_style').getAttribute('max');
                title = item.querySelector('.item .bx_ordercart_itemtitle a').innerHTML.trim()
                qty = item.querySelector('input.inp_style').value;
                break;
        }

        if (self.type !== TYPE_OZON) {
            var itemPrice = item.querySelector(self.selectors.itemPriceHtml);
            if (itemPrice) {
                currentPrice = self.formatPrice(itemPrice.innerHTML) / qty;
            }
        }

        if (currentPrice) {
            self.afterSuccessInitOneProduct(productId, item, currentPrice, title, maxQty);
        } else if (isNotAvailable) {
            product = self.tProductRepository.getProductById(productId);
            self.appendOldMinPrice(product, item);
        }
    };
    // Начинаем обработку одного элемента через responseIntercept
    this.initOnePositionByResponseIntercept = function(item) {
        var self = this, responseProductId = null, jsonItem = null, productId, currentPrice = null, title = null, qty = 1, itemStockQty = 0,
          isNotAvailable = false;

        if (self.type !== TYPE_KNIGOFAN) {
            var itemIdProperty = item.querySelector(self.getFindingProperty());
        }

        switch (self.type) {
            case TYPE_KNIGOFAN:
                responseProductId = item.getAttribute('data-id');
                break;
            case TYPE_CHITAI_GOROD:
                responseProductId = itemIdProperty.getAttribute('href').split('/').pop().split('-').pop();
                break;
            case TYPE_WILDBERRIES:
                if (itemIdProperty) {
                    responseProductId = itemIdProperty.getAttribute('data-nm');
                } else {
                    responseProductId = item.querySelector('.good-info__title').getAttribute('href').split('/')[2];
                    isNotAvailable = true;
                }
                break;
            case TYPE_OZON:
                // поиск по imageId
                /*
                if (item.querySelector('.'+self.selectors.itemImage)) {
                    responseProductId = formatNumber(item.querySelector('.'+self.selectors.itemImage).querySelector('img').src.split('/').pop().split('.')[0]);
                } else {
                    responseProductId = formatNumber(item.querySelector('img[alt=productImage]').src.split('/').pop().split('.')[0]);
                }
                */

                responseProductId = formatNumber(item.__vue__.$options.propsData.item.id);
                break;
            default:
                return;
        }

        if (!responseProductId) {
            console.log('Not found jsonItem responseProductId ', item);
            return;
        }

        jsonItem = self.getJsonItemByCode(formatNumber(responseProductId));

        if (!jsonItem) {
            console.log('Not found jsonItem for ' + responseProductId, item);
            return;
        }

        self.tEventListener.afterFoundJsonItemByCode(item, jsonItem);

        // Заменяем позиции ozon с imageId на productId
        /*
        var pr = self.tProductRepository.getProductBySavingId(self.type+'-'+jsonItem.imageId);
        if (pr) {
            pr.id = jsonItem.id;
            GM_setValue(self.type+'-'+jsonItem.id, JSON.stringify(pr));
            GM.deleteValue(self.type+'-'+jsonItem.imageId);
        }
        return;
        */

        productId = jsonItem.product_id;
        currentPrice = jsonItem.price;
        qty = jsonItem.qty;
        itemStockQty = jsonItem.itemStockQty;
        title = jsonItem.title;

        if (qty > 1) {
            // Цена всегда приходит на 1 позицию.
            // currentPrice = currentPrice / qty;
        }

        if (!currentPrice || !itemStockQty) {
            isNotAvailable = true;
        }

        if (currentPrice) {
            self.afterSuccessInitOneProduct(productId, item, currentPrice, title, itemStockQty);
        } else if (isNotAvailable) {
            self.afterNotAvailableInitOneProduct(productId, item);
        }
    };
    this.afterSuccessInitOneProduct = function(productId, item, currentPrice, title, itemStockQty) {
        var self = this;

        var product = self.tProductRepository.initProduct(productId, currentPrice, title, itemStockQty);
        self.appendOldMinPrice(product, item);
        self.appendMaxQty(product, item, itemStockQty);

        self.tEventListener.afterSuccessInitProduct(product, item, self);

        var className = '';

        self.productsCount++;
        if (itemStockQty < 5) {
            className = 't-limit-count-5';
            self.qtyLimit[5]++;
        } else if (itemStockQty < 10) {
            className = 't-limit-count-10';
            self.qtyLimit[10]++;
        } else if (itemStockQty < 20) {
            className = 't-limit-count-20';
            self.qtyLimit[20]++;
        } else if (itemStockQty < 50) {
            className = 't-limit-count-50';
            self.qtyLimit[50]++;
        }

        if (className) {
            item.classList.add(className)
        }
    }
    this.afterNotAvailableInitOneProduct = function (productId, item) {
        var self = this;
        var product = self.tProductRepository.getProductById(productId);
        if (product && (typeof product.available === 'undefined' || product.available === true)) {
            self.tProductRepository.saveAvailableStatus(productId, false);
        }

        if (!product) {
            console.log('Not found product for afterNotAvailableInitOneProduct', productId, item);
            return;
        }

        self.appendOldMinPrice(product, item);
        self.appendNotAvailableMaxQty(product, item);
    }
    // Добавляем html элемент цены
    this.appendOldMinPrice = function(product, itemElement) {
        if (!product) {
            console.log('Not found product for appendOldMinPrice', itemElement);
            return;
        }
        var priceEl = itemElement.querySelector('.'+this.selectors.itemPrice);
        if(!priceEl) {return;}
        priceEl.classList.add('t-position-relative');
        priceEl.appendChild(this.getPriceElement(product, itemElement));
    };
    this.appendMaxQty = function(product, itemElement, maxQty = null) {
        if(!maxQty) {
            return;
        }

        var qtyEl = itemElement.querySelector('.'+this.selectors.itemQuantity);
        qtyEl.appendChild(this.tHtml.getQtyElement(maxQty, product));
    };
    this.appendNotAvailableMaxQty = function(product, item) {
        if(!isExists(product.maxQty)) {
            return;
        }

        item.querySelector('.' + this.selectors.itemPrice).appendChild(this.tHtml.getQtyElement(0, product));
    }
    this.appendHeadElement = function() {
        if (!this.addBasketHead) {return;}
        var self = this;

        var toRemove = document.querySelector('.t-head-result');
        if(toRemove) {
            this.priceUpChanged += toRemove.getAttribute('data-price-up');
            this.priceDownChanged += toRemove.getAttribute('data-price-down');

            toRemove.remove();
        }

        var div = document.createElement('div');
        div.className = 't-head-result';

        var divInfo = document.createElement('div');
        divInfo.className = this.selectors.headInfo;
        div.appendChild(divInfo);

        var divSort = document.createElement('div');
        divSort.className = 't-head-sort';
        div.appendChild(divSort);

        var divSearch = document.createElement('div');
        divSearch.className = 't-head-search';
        var inputSearch = document.createElement('input');
        inputSearch.type = 'text';
        inputSearch.placeholder = 'Поиск товара';
        inputSearch.className = 'search-input';
        inputSearch.id = 'search-input';
        divSearch.appendChild(inputSearch);
        var inputSearcReset = document.createElement('input');
        inputSearcReset.type = 'button';
        inputSearcReset.className = 'search-reset';
        inputSearcReset.value = '✖';
        divSearch.appendChild(inputSearcReset);
        div.appendChild(divSearch);
        inputSearch.addEventListener("keyup", function (event) {
            if (event.isComposing || event.keyCode === 229) {
                return;
            }

            // escape
            if (event.keyCode === 27 && event.target.value) {
                event.target.value = '';
                self.searchProductsByTitle('up');
                return;
            }

            self.searchProductsByTitle(event.target.value);
        });
        inputSearcReset.addEventListener("click", function (event, a, b) {
            self.searchProductsByTitle('up');
            document.querySelector('#search-input').value = '';
        });

        document.querySelector('.'+this.selectors.basketHead).position = 'relative';
        document.querySelector('.'+this.selectors.basketHead).appendChild(div);
    };
    this.appendPriceChangedInfo = function() {
        if(this.priceUpChanged > 0) {
            document.querySelector('.'+this.selectors.headInfo).appendChild(this.tHtml.getPriceChangedInfo(this.priceUpChanged, 'up'));
            document.querySelector('.'+this.selectors.headInfo).setAttribute('data-price-up', this.priceUpChanged);
        }

        if(this.priceDownChanged > 0) {
            document.querySelector('.'+this.selectors.headInfo).appendChild(this.tHtml.getPriceChangedInfo(this.priceDownChanged, 'down'));
            document.querySelector('.'+this.selectors.headInfo).setAttribute('data-price-down', this.priceDownChanged);
        }
    };
    // Добавляем элемент checkbox по типу
    this.appendCheckerElement = function (type, count) {
        if (count <= 0) {
            return;
        }

        var self = this;

        document.querySelector('.t-head-result').appendChild(this.tHtml.getCheckerElement(type, count));
        document.querySelector('#' + this.tHtml.getCheckerElementId(type)).addEventListener('change', function (event) {
            self.showProductsByDomProperty('data-product-' + type, event);
        });
    }
    // Добавляем блок показа оставшегося лимита по кол-ву
    this.appendQtyLimitInfo = function() {
        document.querySelector('.t-head-result').appendChild(this.tHtml.getQtyLimitInfo(this.productsCount, this.qtyLimit));
    };
    // сортировка
    this.appendSortControls = function() {
        var self = this;
        var items = document.querySelectorAll('.'+self.selectors.listItem);
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

        var buttonSortTitlePrce = this.tHtml.getButtonSortTitlePrice();
        buttonSortTitlePrce.addEventListener("click", function (event) {
            event.preventDefault();
            self.sort(event.target, 'title_price');
        });

        document.querySelector('.t-head-sort').appendChild(buttonSortQty);
        document.querySelector('.t-head-sort').appendChild(buttonSortPrce);
        document.querySelector('.t-head-sort').appendChild(buttonSortTitlePrce);

        //self.sort(buttonSortQty, 'qty');
    };
    // Поиск в корзине по названию.
    this.searchProductsByTitle = function (value) {
        if (typeof value === 'undefined') {return;}
        var self = this, items;

        if (value.length < 3) {
            items = document.querySelectorAll('.'+self.selectors.listItem+'[style="display: none;"],.'+self.selectors.listItemNotAvailable+'[style="display: none;"]');
            items.forEach(function(item) {
                item.style.display = 'block';
            });
            return;
        }
        value = formatProductTitle(value).toLowerCase();
        //var searchTimeout = null;
        items = document.querySelectorAll('.'+self.selectors.listItem+ ',.'+self.selectors.listItemNotAvailable);
        window.scrollTo(0, 0);

        items.forEach(function(item) {
            if (!isEmpty(item.getAttribute('data-product-title')) && item.getAttribute('data-product-title').toLowerCase().includes(value)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    };
    // Показать/скрыть позиции по свойству
    this.showProductsByDomProperty = function (property, event) {
        var self = this;

        window.scrollTo(0, 0);

        if (!event.target.checked) {
            var items = document.querySelectorAll('.'+self.selectors.listItem+'[style="display: none;"]');
            items.forEach(function(item) {
                item.style.display = 'block';
            });
            return;
        }

        items = document.querySelectorAll('.'+self.selectors.listItem);
        items.forEach(function(item) {
            if (item.getAttribute(property)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
    this.sort = function(button, sortType) {
        window.scrollTo(0, 0);

        var self = this;
        // сброc другим кнопкам up, down
        document.querySelectorAll('.t-sort-button').forEach(function(button) {
            button.classList.remove(SORT_UP);
            button.classList.remove(SORT_DOWN);
        });

        var items = $('.'+this.selectors.listItem);
        //var items = document.querySelectorAll('.'+this.selectors.listItem);

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

        items.sort(function(a,b) {
            var an, bn, cn, dn, twoFieldsSort = false;
            switch(sortType) {
                case 'qty':
                    if (self.isResponseInterceptEnabled()) {
                        an = a.getAttribute('data-product-qty');
                        bn = b.getAttribute('data-product-qty');
                    } else {
                        an = a.querySelector('.'+self.selectors.itemQty).getAttribute('data-qty');
                        bn = b.querySelector('.'+self.selectors.itemQty).getAttribute('data-qty');
                    }
                    break;
                case 'price':
                    if (self.isResponseInterceptEnabled()) {
                        an = a.getAttribute('data-product-price');
                        bn = b.getAttribute('data-product-price');
                    } else {
                        an = a.querySelector('.t-price-arrow').getAttribute('data-price');
                        bn = b.querySelector('.t-price-arrow').getAttribute('data-price');
                    }
                    break;
                case 'title_price':
                    twoFieldsSort = true;

                    an = a.getAttribute('data-product-price');
                    bn = b.getAttribute('data-product-price');

                    cn = a.getAttribute('data-product-title');
                    dn = b.getAttribute('data-product-title');

                    break;
            }

            if (twoFieldsSort) {
                if(cn === dn) {
                    return (an < bn) ? -1 : (an > bn) ? 1 : 0;
                } else {
                    return (an < bn) ? -1 : 1;
                }
            } else {
                if(direction === SORT_UP) {
                    return bn*1 - an*1;
                } else {
                    return an*1 - bn*1;
                }
            }
        }).each(function(i) {
            this.parentNode.appendChild(this);
        });

        //.appendTo(items.parent())

        //items.parent().appendChild(newItems);
    };
    //get html elements
    this.getPriceElement = function(product, itemElement) {
        var self = this;
        var oldMinPrice = product.oldCurrentPrice;
        var currentPrice = product.price;
        var checkPrice = product.checkPrice ?? null;

        var colorClassName = 'not-changed';
        if (currentPrice > oldMinPrice) {
            //colorClassName = 'up';
            this.tEventListener.whenFoundPriceUp(product, itemElement, self);
        } else if(currentPrice < oldMinPrice) {
            //colorClassName = 'down';
            this.tEventListener.whenFoundPriceDown(product, itemElement, self);
        } else {
            this.tEventListener.whenPriceIsNotChanged(product, itemElement, self);
        }

        if (product.isPriceDown === true) {
            colorClassName = 'down';
            oldMinPrice = product.oldCurrentPrice;
        } else if(product.isPriceUp === true) {
            colorClassName = 'up';
        } else {
            oldMinPrice = '';
        }

        // сравнение с пред ценой из истории
        var oldPriceForElement = oldMinPrice;

        var div = document.createElement("div");
        div.className = self.selectors.oldPrice;

        if (product.available === false && typeof product.not_available_date_from === 'string') {
            var divNotAvailableInfo = document.createElement("span");
            divNotAvailableInfo.className = 'unavailable-info';
            divNotAvailableInfo.textContent = 'Недоступно с ' + formatDate(new Date(product.not_available_date_from), true);
            div.append(divNotAvailableInfo);
        }

        var oldPricePercentDiv = document.createElement("div");
        oldPricePercentDiv.className = self.selectors.oldPricePercent;

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
        if (checkPrice && checkPrice >= currentPrice && product.available === true) {
            tCheckPriceClassNames += ' t-check-price-available';
            this.checkPriceCount++;
            self.tEventListener.whenFoundPriceCheck(product, itemElement);
        }

        var spanCheckPrice = document.createElement("button");
        spanCheckPrice.className = tCheckPriceClassNames;
        spanCheckPrice.setAttribute('title', 'Set Check Price');
        spanCheckPrice.addEventListener("click", function (event) {
            event.preventDefault();
            self.openEditCheckPriceWindow(event.target, product.id);
        });
        oldPricePercentDiv.append(spanCheckPrice);

        var removeButton = self.tHtml.createElement('button', {
            title: 'Remove from storage',
            class: 'remove-from-storage-button t-button'
        });
        removeButton.addEventListener('click', function(event) {
            event.preventDefault();

            var element = self.tProduct.isAvailable(product) ? event.target.closest('.' + self.selectors.listItem) : event.target.closest('.' + self.selectors.listItemNotAvailable);

            self.tEventListener.whenRemoveFromStorage(element);
        });
        oldPricePercentDiv.append(removeButton);

        div.append(oldPricePercentDiv);

        this.appendHoverElements(div, product.id);

        return div;
    };
    this.appendHoverElements = function(parentEl, productId) {
        var self = this;

        var hoverField = document.createElement("div");
        hoverField.className = 't-hover-field';

        this.appendPriceDates(hoverField, productId, parentEl);

        if (self.type !== TYPE_KNIGOFAN) {
            parentEl.addEventListener('mouseover', function(event) {
                if (parentEl.querySelector('.t-price-same-products-icon')) {return;}

                var tOldPriceField = event.target.classList.contains('t-old-price') ? event.target: event.target.closest('.t-old-price');
                self.appendSameProducts(tOldPriceField.querySelector('.t-hover-field'), productId, parentEl);
            });
        }

        parentEl.append(hoverField);
    };
    this.appendSameProducts = function(hoverField, productId, parentEl) {
        var product = this.tProductRepository.getProductById(productId);
        if (!product) {return;}
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
        document.querySelector('body').append(this.tHtml.openCheckPriceWindow(productId, this, el));
    };
}