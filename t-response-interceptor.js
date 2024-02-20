function tResponseInterceptor(type, tPriceChecker) {
  this.type = type;
  this.tPriceChecker = tPriceChecker;
  this.items = [];
  this.jsonItems = [];
  // Кол-во позиций.
  this.count = 0;
  // Позиции, доступные к покупке
  this.canBuyCount = 0;
  // Динамическое свойство для URL.pathname, подставляется для проверки response по url
  this.requestPathName = null;
  // Текущая страница в браузере.
  this.currentPathName = null;
  // Перехватчик отработан в первый раз.
  this.isInited = false;
  // Это первый запуск
  this.isFirstInit = false;

  this.init = function() {
    var self = this;
    self.jsonItems = [];

    this.initPathListener();

    switch (this.type) {
      case TYPE_KNIGOFAN:
        document.addEventListener("DOMContentLoaded", (event) => {
          self.jsonItems = unsafeWindow.BX.Sale.BasketComponent.items;
          self.parseItems();
        });
        break;
      case TYPE_CHITAI_GOROD:
        self.scriptWrapper(self.type);
        break;
      case TYPE_WILDBERRIES:
        self.scriptWrapperPromise(self.type);
        break;
      case TYPE_OZON:
        window.addEventListener('DOMContentLoaded',function () {
          return;
          var els = document.querySelectorAll('div[id^="state-split-"]');
          els.forEach(function(el) {
            self.jsonItems = [].concat(
                self.jsonItems,
                JSON.parse(el.getAttribute('data-state')).items
            );
          });

          self.parseItems();
        });

        self.scriptWrapperPromise(self.type);
        break;
    }

    self.scrollDownAndUp();
  };
  this.initPathListener = function() {
    var self = this;
    var pushState = history.pushState;
    self.currentPathName = window.location.pathname;
    //console.log('init page', self.currentPathName);

    history.pushState = function () {
      pushState.apply(history, arguments);

      if (typeof arguments[2] === 'undefined') {
        return;
      }

      try {
        self.currentPathName = (new URL(arguments[2])).pathname;
      } catch(e) {
        self.currentPathName = arguments[2];
      }

      self.scrollDownAndUp();
    };
  }
  this.scrollDownAndUp = function() {
    var self = this;
    if (this.type === TYPE_OZON && self.currentPathName === '/cart') {
      console.log('scrollDownAndUp by', window.innerHeight);
      startTimeout(function() {
        unsafeWindow.scrollTo(0, window.innerHeight);// || document.body.scrollHeight  || window.innerHeight
        setTimeout(function() {
          unsafeWindow.scrollTo(0, 0);
        }, 2);
      }, 1);
    }
  }
  this.isBasketPage = function() {
    var self = this;

    switch (self.type) {
      case TYPE_CHITAI_GOROD:
        return self.currentPathName === '/cart' && (self.requestPathName === '/api/v1/cart' || self.requestPathName.match('/autocomplete/template.html'));
        break;
      case TYPE_WILDBERRIES:
        return self.currentPathName === '/lk/basket' && [
          '/lk/basket/spa/refresh',
          '/webapi/lk/basket/data'
        ].includes(self.requestPathName);
        break;
      case TYPE_OZON:
        return self.currentPathName === '/cart' && self.requestPathName === '/api/entrypoint-api.bx/page/json/v2';
        break;
      default:
        return false;
    }
  };
  this.isBookmarkPage = function() {
    var self = this;

    switch (self.type) {
      case TYPE_CHITAI_GOROD:
        return (self.currentPathName === '/profile/bookmarks' || self.currentPathName === '/profile/bookmarks?tab=favorite') && self.requestPathName === '/api/v1/bookmarks';
        break;
      case TYPE_WILDBERRIES:
        return self.currentPathName === '/lk/favorites';
        break;
      case TYPE_OZON:
        return self.currentPathName === '/my/favorites';
        break;
      default:
        return false;
    }
  };
  this.isSubscriptionkPage = function() {
    var self = this;

    switch (self.type) {
      case TYPE_CHITAI_GOROD:
        return (self.currentPathName === '/profile/bookmarks' || self.currentPathName === '/profile/bookmarks?tab=subscriptions') && self.requestPathName === '/api/v1/subscriptions';
        break;
      default:
        return false;
    }
  };
  this.addJS_Node = function(id, funcToRun, type) {
    var target = document.getElementsByTagName('head')[0] || document.body || document.documentElement;
    var textContent = '(' + funcToRun.toString() + ')("'+this.type+'")';

    GM_addElement(target, 'script', {
      id: id,
      type: "text/javascript",
      textContent: textContent,
      async: true
    });
  };
  this.assembleOneItem = function(id, title, price, qty, itemStockQty, imageId, url) {
    return {
      product_id: id,
      title: title,
      price: price,
      qty: qty,// Тут сколько в корзине выбрал
      itemStockQty: itemStockQty, // Доступное сейчас кол-во
      imageId: isExists(imageId) ? imageId : imageId,
      url: isExists(url) ? url : null
    };
  };
  this.parseItems = function() {
    //console.log('parseItems', this.jsonItems);

    var self = this;
    this.items[self.type] = this.items[self.type] ?? [];

    switch (this.type) {
      case TYPE_KNIGOFAN:
        Object.keys(self.jsonItems).forEach(key => {
          var product = self.jsonItems[key];

          var item = self.assembleOneItem(
              parseInt(product.PRODUCT_ID),
              product.NAME,
              formatNumber(product.FULL_PRICE),
              formatNumber(product.QUANTITY),
              formatNumber(product.AVAILABLE_QUANTITY),
              product.IMAGE_URL,
              product.DETAIL_PAGE_URL
          );

          item.id = parseInt(product.ID);

          self.items[self.type].push(item);
        });
        break;
      case TYPE_CHITAI_GOROD:
        this.jsonItems.forEach(function(product) {
          self.items[self.type].push(self.assembleOneItem(
              product.goodsId,
              product.title,
              formatNumber(product.price),
              formatNumber(product.quantity),
              formatNumber(product.stock)
          ));
        });
        break;
      case TYPE_WILDBERRIES:
        this.jsonItems.forEach(function(product) {
          if (isExists(product.impossibleDeliveryMsg) && product.impossibleDeliveryMsg !== null) {
            return;
          }

          var maxQty = 0;
          product.stocks.forEach(function(stock) {
            maxQty += stock.qty;
          });

          self.items[self.type].push(self.assembleOneItem(
              product.cod1S,
              product.goodsName,
              formatNumber(product.priceWithCouponAndDiscount),
              formatNumber(product.quantity),
              formatNumber(maxQty)
          ));
        });
        break;
      case TYPE_OZON:
        this.jsonItems.forEach(function(product) {
          //console.log(product);

          var qty = 0, maxQty = 0, price = 0;
          if (typeof product.quantity !== 'undefined') {
            qty = product.quantity.quantity;
            maxQty = product.quantity.maxQuantity;

            if (typeof product.products[0].priceColumn[0].priceWithTitle !== 'undefined') {
              price = product.products[0].priceColumn[0].priceWithTitle.price;
            } else {
              price = product.products[0].priceColumn[0].price.price;;
            }
          }

          self.items[self.type].push(self.assembleOneItem(
              formatNumber(product.id),
              product.products[0].titleColumn[1].actionText.text.text,
              formatNumber(price),
              formatNumber(qty),
              formatNumber(maxQty),
              formatNumber(product.products[0].image.split('/').pop().split('.')[0])
          ));
        });
        break;
    }

    self.tPriceChecker.responseItems[self.type] = self.items[self.type];
    setTimeout(function() {
      self.tPriceChecker.launch();
      self.isInited = true;
    }, 1);
  };
  this.handleBookmarkProducts = function (products, isSubscriptionPage = false) {
    var self = this;
    //console.log(products);
    self.count = self.canBuyCount = 0;

    products.forEach(function(product) {
      self.count++;

      var item = document.querySelector('article[data-chg-product-id="'+product.id+'"]');
      var productTitle = item.querySelector('.product-card__text');

      if (product.status === 'canBuy') {
        //console.log(product);
        self.canBuyCount++;

        item.parentNode.setAttribute('data-product-available', 1);
      }

      var div = document.createElement('div');
      div.style = 'padding-top: 8px; font-size: 0.8rem;';
      if (product.startSaleDesc !== '01.1900' && product.startSaleDesc !== '') {
        div.innerHTML += '<p>Старт продаж: ' + product.startSaleDesc + '</p>';
      }

      if (product.yearPublishing) {
        div.innerHTML += '<p>Год издания: ' + product.yearPublishing + '</p>';
      }

      if (product.price) {
        div.innerHTML += '<p>Цена: ' + product.price + '</p>';
      }

      if (product.pages) {
        div.innerHTML += '<p>Страниц: ' + product.pages + '</p>';
      }

      if (product.preOrderDate) {
        //var date = new Date(product.preOrderDate);
        //div.innerHTML += '<br/>Предзаказ: ' + date.getDay() + '.'+date.getMonth()+'.'+date.getFullYear();
      }

      productTitle.appendChild(div);
    });

    if (self.canBuyCount > 0) {
      //canBuyCount = '<span style="color: green;">' + canBuyCount + '</span>';
    }

    var elementId = isSubscriptionPage ? 'show_available_for_subcription' : 'show_available_for_bookmark';

    if (document.getElementById(elementId)) {
      document.getElementById(elementId).remove();
    }

    document.querySelector('.content-tabs__item.content-tabs__item--active').innerHTML += '<span id='+elementId+'>(' + self.count + ' | ' + self.canBuyCount + ')</span>';

    elementId = 'show_available_to_buy_element';
    if (document.getElementById(elementId)) {
      document.getElementById(elementId).remove();
    }

    if (!self.canBuyCount) {
      return;
    }

    if (!isSubscriptionPage) {
      var div = document.createElement('div');
      div.id = elementId;
      div.innerHTML += '<label for="show_available_to_buy" class="show_available_to_buy"><input type="checkbox" id="show_available_to_buy" /> доступные к заказу</label>';
    }

    document.querySelector('.profile-bookmarks > .content-tabs').appendChild(div);

    document.querySelector('#show_available_to_buy').addEventListener('change', function (event) {
      self.showAvailableToBuyProducts(event.target.checked);
    });
  }
  this.showAvailableToBuyProducts = function(shown) {
    var displayShownValue = 'flex';

    if (!shown) {
      var items = document.querySelectorAll('.profile-bookmarks__products > .profile-bookmarks__product[style*="display: none"]');
      items.forEach((item) => item.style.display = displayShownValue);
      return;
    }

    items = document.querySelectorAll('.profile-bookmarks__products > .profile-bookmarks__product');
    items.forEach((item) => item.style.display = item.getAttribute('data-product-available') ? displayShownValue: 'none');
  }
  this.scriptWrapper = function(type) {
    var self = this;
    //console.log(type, 'self.tPriceChecker', self.tPriceChecker, this);

    var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      this.addEventListener('load', function() {
        var r = this;
        //console.log('xhr url: ', url);
        try {
          self.requestPathName = (new URL(url)).pathname;
        } catch(e) {
          self.requestPathName = url;
        }
        console.log('requestPathName: ', self.requestPathName, self.currentPathName);

        if (self.isBasketPage()) {
          //console.log(r.responseTextr);
          var response = JSON.parse(r.responseText);
          self.jsonItems = [].concat(
              self.jsonItems,
              response.products,
              response.disabledProducts
          );
          startTimeout(self.parseItems.bind(self));
          return;
        } else if (self.isBookmarkPage()) {
          setTimeout(function() {
            self.handleBookmarkProducts(JSON.parse(r.responseText).data);
          }, 1);
          return;
        } else if(self.isSubscriptionkPage()) {
          setTimeout(function() {
            self.handleBookmarkProducts(JSON.parse(r.responseText).data, true);
          }, 1);
        }
      });
      origOpen.apply(this, arguments);
    };
  };
  this.scriptWrapperPromise = function(type) {
    var self = this;
    //console.log(type, 'self.tPriceChecker', self.tPriceChecker, this.tInterceptor);

    unsafeWindow.fetch = (function (origFetch) {
      //console.log('fetch');
      return function myFetch(req) {
        var result = origFetch.apply(this, arguments);
        result.then(function(response) {
          //console.log('fetch url: ', response.url);
          const url = new URL(response.url);
          self.requestPathName = url.pathname;
          if (self.isBasketPage()) {
            return response.clone().json();
          }

          return null;
        }).then(function(response) {
          //console.log(response);
          if (!response) {
            return;
          }

          var responseItems = [];

          if (self.type === TYPE_WILDBERRIES) {
            //console.log(self.currentPathName, self.requestPathName, response);
            switch (self.requestPathName) {
              case '/webapi/lk/basket/data':
                responseItems = response.value.data.basket.basketItems;
                break;
              case '/lk/basket/spa/refresh':
                responseItems = response.value.basket.basketItems;
                break;
            }

            self.jsonItems = responseItems;
            startTimeout(self.parseItems.bind(self));
            return;
          }

          //console.log(JSON.parse(response.layoutTrackingInfo));

          if (self.type === TYPE_OZON
              //&& JSON.parse(response.layoutTrackingInfo).layoutContainer === 'SplitInCartPaginator'
              && JSON.parse(response.layoutTrackingInfo).pageType === 'cart'
          ) {
            var urlParams = parseUrlParams(response.pageInfo.url);
            //console.log('init', parseUrlParams(response.pageInfo.url), response.pageInfo, JSON.parse(response.layoutTrackingInfo));

            var layoutContainer = JSON.parse(response.layoutTrackingInfo).layoutContainer;

            if (typeof layoutContainer === 'undefined' && response.pageInfo.pageType === 'cart' && response.pageInfo.pageTypeTracking === 'cart') {
              if (typeof urlParams.pos === 'string' && (typeof urlParams.check === 'string' || typeof urlParams.uncheck === 'string' || typeof urlParams.delete === 'string')) {
                self.tPriceChecker.reInit();
                return;
              }
            }

            switch(layoutContainer) {
              case 'SplitInCartPaginator':
                self.isFirstInit = true;
                var firstKey = Object.keys(response.widgetStates)[0]; // в наличии
                var secondKey = Object.keys(response.widgetStates)[1]; // недоступны

                if (firstKey.split('-').pop() > 1) {
                  firstKey = Object.keys(response.widgetStates)[1];
                  secondKey = Object.keys(response.widgetStates)[0];
                }

                if (document.querySelector('div[id^="state-split"]')) {
                  self.jsonItems = JSON.parse(document.querySelector('div[id^="state-split"]').getAttribute('data-state')).items;
                }

                responseItems = [].concat(
                    self.jsonItems,
                    JSON.parse(response.widgetStates[firstKey]).items,
                    JSON.parse(response.widgetStates[secondKey]).items
                );

                self.jsonItems = responseItems;

                startTimeout(self.parseItems.bind(self));

                //console.log('ozon layoutContainer', layoutContainer, self.isFirstInit, self.jsonItems.length);
                self.isFirstInit = false;
                break;
              case 'RecomsInCartPaginator':
                //console.log('ozon layoutContainer', layoutContainer, self.isFirstInit, self.jsonItems.length);
                //firstKey = Object.keys(response.widgetStates)[3];
                //console.log(firstKey);
                //items = JSON.parse(response.widgetStates[firstKey]).items;
                break;
              default:
                //console.log('ozon layoutContainer', layoutContainer, self.isFirstInit, self.jsonItems.length);
            }

            //console.log('available', JSON.parse(response.widgetStates[firstKey]).items);
            //console.log('unavailable', JSON.parse(response.widgetStates[secondKey]).items);
            //console.log(items, response.widgetStates);

          }
        });

        return result; // or return the result of the `then` call
      };
    })(unsafeWindow.fetch);
  };
}