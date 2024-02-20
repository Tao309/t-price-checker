function tHtml(type, tPriceChecker) {
    this.type = type;
    this.tEventListener = new tEventListener(type);
    this.tPriceChecker = tPriceChecker;
    this.tProductRepository = new tProductRepository(type);
    this.checkerElements = {
        'check-price': {label: 'отслеживаемые'},
        'price-decrease': {label: 'понижение'},
        'returns': {label: 'снова в продаже'}
    };

    this.createElement = function (type, data = {}) {
        if (!isExists(type)) {
            console.log('Create element type {' + type + '} is not exists');
            return;
        }

        if (!['div', 'span', 'a', 'button'].includes(type)) {
            console.log('Create element type {' + type + '} is not available');
            return;
        }

        var el = document.createElement(type);

        if (isExists(data.class)) {el.className = data.class;}
        if (isExists(data.className)) {el.className = data.className;}
        if (isExists(data.id)) {el.id = data.id;}
        if (isExists(data.type)) {el.type = data.type;}
        if (isExists(data.placeholder)) {el.placeholder = data.placeholder;}
        if (isExists(data.value)) {el.value = data.value;}
        if (isExists(data.src)) {el.src = data.src;}
        if (isExists(data.name)) {el.name = data.name;}
        if (isExists(data.textContent)) {el.textContent = data.textContent;}
        if (isExists(data.content)) {el.content = data.textContent;}
        if (isExists(data.title)) {el.title = data.title;}

        return el;
    };
    this.getShopLinkForProduct = function(productModel) {
        var productId = productModel.getProductId();

        switch(productModel.getType()) {
            case TYPE_KNIGOFAN:
                return 'https://knigofan.ru/catalog/horus-heresy/primarkhi/929/';
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
    this.getQtyElement = function(productModel) {
        var self = this;
        var currentQty = productModel.getCurrentQty();

        var itemQtyDiv = this.createElement('div', {
            className: this.tPriceChecker.selectors.itemQty
        });

        itemQtyDiv.setAttribute('data-qty', currentQty);

        var currentQtyDiv = this.createElement('div', {
            className: 't-item-current-qty'
        });

        var textContent;
        if (!currentQty) {
            if (productModel.getLastQty()) {
                textContent = 'Было: ' + productModel.getLastQty();
            }
        } else {
            textContent = currentQty;
            textContent += ' / ' + productModel.getLastQty();
        }

        currentQtyDiv.textContent = textContent;

        itemQtyDiv.append(currentQtyDiv);

        if (productModel.getLastQtyDate()) {
            var dateDiv = this.createElement('div', {
                textContent: 'Доступно с ' + tProduct.convertDateToString(productModel.getLastQtyDate()),
                className: 't-item-max-qty-date'
            });

            itemQtyDiv.append(dateDiv);
        }

        var stocks = productModel.getStocks();
        if (stocks.length > 0) {
            var stockDiv = this.createElement('div', {
                className: 't-item-stocks'
            });

            var stockDivRow = self.createElement('div', {
                textContent: 'Всего: ' + productModel.getStockQty(),
                className: 't-item-stock-qty-row'
            });

            stockDiv.append(stockDivRow);

            stocks.forEach(function (stock) {
                stockDivRow = self.createElement('div', {
                    textContent: tProduct.convertDateToString(stock.date) + ': ' + stock.qty,
                    className: 't-item-stock-row'
                });

                stockDiv.append(stockDivRow);
            });

            itemQtyDiv.append(stockDiv);
        }

        return itemQtyDiv;
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
    this.getQtyLimitInfo = function(productsCount, qtyLimit) {
        var div = document.createElement('div');
        div.className = 't-changed-result products-count';
        div.innerHTML = '<p>Products: '+productsCount+'</p>';
        if (qtyLimit[5] > 0) {
            div.innerHTML += '<p>< 5: '+qtyLimit[5]+'</p>';
        }
        if (qtyLimit[10] > 0) {
            div.innerHTML += '<p>< 10: '+qtyLimit[10]+'</p>';
        }
        if (qtyLimit[20] > 0) {
            div.innerHTML+= '<p>< 20: '+qtyLimit[20]+'</p>';
        }
        if (qtyLimit[50] > 0) {
            div.innerHTML += '<p>< 50: '+qtyLimit[50]+'</p>';
        }
        if (qtyLimit[100] > 0) {
            div.innerHTML += '<p>< 100: '+qtyLimit[100]+'</p>';
        }

        return div;
    };

    this.getCheckerElementId = function (type) {
        return 'show_' + type.replaceAll('-', '_');
    }
    this.getCheckerElement = function (type, count) {
        var elementProp = this.checkerElements[type];

        if (typeof elementProp === 'undefined' || !elementProp) {
            console.log('Not found checkerElement properties for ' + type);
            return;
        }

        var checkboxId = this.getCheckerElementId(type);

        var div = document.createElement('div');
        div.className = 't-changed-result products-' + type;
        div.innerHTML += '<label for="' + checkboxId + '">' +
          '<input type="checkbox" id="' + checkboxId + '" /> '
          + elementProp.label + ' (' + count + ')</label>';

        return div;
    }

    this.getButtonSortQty = function() {
        var buttonSortQty = document.createElement('button');
        buttonSortQty.textContent = 'sort by qty';
        buttonSortQty.className = 't-sort-button t-sort-qty';

        return buttonSortQty;
    };
    this.getButtonSortPrice = function() {
        var buttonSortPrice = document.createElement('button');
        buttonSortPrice.textContent = 'sort by price';
        buttonSortPrice.className = 't-sort-button t-sort-price';

        return buttonSortPrice;
    };
    this.getButtonSortTitlePrice = function() {
        var buttonSortTitlePrice = document.createElement('button');
        buttonSortTitlePrice.textContent = 'sort by title/price';
        buttonSortTitlePrice.className = 't-sort-button t-sort-title-price';

        return buttonSortTitlePrice;
    };
    this.getSameProduct = function(foundProduct, product) {
        var productDiv = document.createElement("div");
        productDiv.className = 't-same-product';

        var link = document.createElement("a");
        link.textContent = foundProduct.getType() + ': ' + foundProduct.getCurrentPrice();
        link.href = this.getShopLinkForProduct(foundProduct);
        link.setAttribute('target','_blank');
        if(product.getCurrentPrice() > foundProduct.getCurrentPrice()) {
            link.className = 'down';
        } else if(product.getCurrentPrice() < foundProduct.getCurrentPrice()) {
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

        var productModel = tProductLocal.get(this.type + '-' + productId);

        editForm.addEventListener('submit', function(event) {
            event.preventDefault();

            productModel.setTitle(event.target.querySelector('input[type=text]').value);
            productModel.save();

            self.closeEditWindow();
        })

        if (productModel) {
            editInput.value = productModel.getTitle();
            productInfo.textContent = this.type + '-' + productId;
        }

        editForm.append(editInput);
        editForm.append(editSumbitButton);
        editBody.append(productInfo);
        editBody.append(editForm);
        editWindow.append(editBody);

        return editWindow;
    };
    this.openCheckPriceWindow = function(productId, tPriceChecker, buttonElement) {
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

        var productModel = tProductLocal.get(this.type + '-' + productId);

        editForm.addEventListener('submit', function(event) {
            event.preventDefault();

            productModel.setListenPriceValue(event.target.querySelector('input[type=text]').value);
            productModel.save();

            self.closeEditWindow();
        });

        editInput.addEventListener('keyup', function() {
            this.value = this.value.replace(/[^0-9\.]/g, '');
        });

        if (productModel.getListenPriceValue() > 0) {
            var resetButton = document.createElement("button");
            resetButton.className = 't-button t-button-reset';
            resetButton.textContent = 'Reset CheckPrice';

            resetButton.addEventListener('click', function(event) {
                event.preventDefault();

                productModel.setListenPriceValue(null);
                productModel.save();

                buttonElement.classList.remove('t-check-price-available');
                self.closeEditWindow();
            });
        }

        if (productModel) {
            editInput.value = productModel.getListenPriceValue() ?? '';
            productInfo.textContent = 'Set CheckPrice for: ' + this.type + '-' + productId;
        }

        editForm.append(editInput);
        editForm.append(editSumbitButton);
        editBody.append(productInfo);
        editBody.append(editForm);
        if (productModel.getListenPriceValue() > 0) {
            editBody.append(resetButton);
        }
        editWindow.append(editBody);

        return editWindow;
    };
    this.getPriceElement = function(productModel, itemElement) {
        var self = this;
        var oldMinPrice = productModel.getLastPrice();
        var currentPrice = productModel.getCurrentPrice();
        var checkPrice = productModel.getListenPriceValue();

        var colorClassName = 'not-changed';
        if (currentPrice > oldMinPrice) {
            //colorClassName = 'up';
            this.tEventListener.whenFoundPriceUp(productModel, itemElement, this.tPriceChecker);
        } else if(currentPrice < oldMinPrice) {
            //colorClassName = 'down';
            this.tEventListener.whenFoundPriceDown(productModel, itemElement, this.tPriceChecker);
        } else {
            this.tEventListener.whenPriceIsNotChanged(productModel, itemElement, this.tPriceChecker);
        }

        if (productModel.getFlag(tProduct.FLAG_IS_PRICE_DOWN)) {
            colorClassName = 'down';
        } else if(productModel.getFlag(tProduct.FLAG_IS_PRICE_UP)) {
            colorClassName = 'up';
        } else {
            oldMinPrice = '';
        }

        // сравнение с предыдущей ценой из истории
        var oldPriceForElement = oldMinPrice;

        var div = document.createElement("div");
        div.className = this.tPriceChecker.selectors.oldPrice;

        if (!productModel.isAvailable() && productModel.getNotAvailableDateFrom()) {
            var divNotAvailableInfo = document.createElement("span");
            divNotAvailableInfo.className = 'unavailable-info';
            divNotAvailableInfo.textContent = 'Недоступно с ' + tProduct.convertDateToString(productModel.getNotAvailableDateFrom());
            div.append(divNotAvailableInfo);
        }

        var oldPricePercentDiv = document.createElement("div");
        oldPricePercentDiv.className = this.tPriceChecker.selectors.oldPricePercent;

        var span = document.createElement("span");
        span.className = 't-price-arrow '+colorClassName;
        span.textContent = oldPriceForElement;
        span.setAttribute('data-price', currentPrice);
        oldPricePercentDiv.append(span);

        var percentText;
        if (oldPriceForElement > 0 && oldPriceForElement != currentPrice) {
            var abs = Math.abs(oldPriceForElement - currentPrice);
            var sign = (oldPriceForElement > currentPrice) ? '-' : '+';
            percentText = sign + (Math.round((abs/currentPrice)*100)) + '%';
        }

        if (percentText) {
            var spanPercent = document.createElement("span");
            spanPercent.className = 't-price-percent';
            spanPercent.textContent = percentText;
            oldPricePercentDiv.append(spanPercent);
        }

        if (productModel.getLastDate()) {
            var spanDate = document.createElement("span");
            spanDate.className = 't-price-old-date';
            spanDate.textContent = tProduct.convertDateToString(productModel.getLastDate());
            div.append(spanDate);
        }

        var spanEdit = document.createElement("button");
        spanEdit.className = 't-title-edit t-button';
        spanEdit.setAttribute('title', 'Edit title');
        spanEdit.addEventListener("click", function (event) {
            event.preventDefault();
            self.openEditTitleWindow(event.target, productModel.getProductId());
        });
        oldPricePercentDiv.append(spanEdit);

        var tCheckPriceClassNames = 't-check-price t-button';
        if (checkPrice && checkPrice >= currentPrice && productModel.isAvailable()) {
            tCheckPriceClassNames += ' t-check-price-available';
            this.checkPriceCount++;
            self.tEventListener.whenFoundPriceCheck(productModel, itemElement);
        }

        var spanCheckPrice = document.createElement("button");
        spanCheckPrice.className = tCheckPriceClassNames;
        spanCheckPrice.setAttribute('title', 'Set Check Price');
        spanCheckPrice.addEventListener("click", function (event) {
            event.preventDefault();
            self.openEditCheckPriceWindow(event.target, productModel.getProductId());
        });
        oldPricePercentDiv.append(spanCheckPrice);

        var removeButton = self.createElement('button', {
            title: 'Remove from storage',
            class: 'remove-from-storage-button t-button'
        });
        removeButton.addEventListener('click', function(event) {
            event.preventDefault();

            var element = productModel.isAvailable() ? event.target.closest('.' + self.tPriceChecker.selectors.listItem) : event.target.closest('.' + self.tPriceChecker.selectors.listItemNotAvailable);

            self.tEventListener.whenRemoveFromStorage(element);
        });

        oldPricePercentDiv.append(removeButton);

        div.append(oldPricePercentDiv);

        this.appendHoverElements(div, productModel);

        return div;
    };
    this.appendHoverElements = function(parentEl, productModel) {
        var self = this;

        var hoverField = document.createElement("div");
        hoverField.className = 't-hover-field';

        this.appendPriceDates(hoverField, productModel, parentEl);

        if (self.type !== TYPE_KNIGOFAN) {
            parentEl.addEventListener('mouseover', function(event) {
                if (parentEl.querySelector('.t-price-same-products-icon')) {return;}

                var tOldPriceField = event.target.classList.contains('t-old-price') ? event.target: event.target.closest('.t-old-price');
                self.appendSameProducts(tOldPriceField.querySelector('.t-hover-field'), productModel, parentEl);
            });
        }

        parentEl.append(hoverField);
    };
    this.appendPriceDates = function(hoverField, productModel, parentEl) {
        if(!productModel.getPriceDateForViewCount()) {return;}

        var divDates = document.createElement("div");
        divDates.className = 't-price-dates';

        productModel.getPriceDatesForView().forEach(function(priceDate) {
            var priceDateDiv = document.createElement("div");
            priceDateDiv.className = 't-price-date';
            priceDateDiv.textContent = tProduct.convertDateToString(priceDate.date) + ': ' + priceDate.price;

            divDates.appendChild(priceDateDiv);
        });

        var dateIconSpan = document.createElement("span");
        dateIconSpan.className = 't-price-dates-icon';
        parentEl.append(dateIconSpan);

        hoverField.append(divDates);
    };
    this.appendSameProducts = function(hoverField, productModel, parentEl) {
        if (!productModel) {return;}
        var foundProducts = this.tProductRepository.getProductsBySameTitle(productModel);
        if (!foundProducts.length) {return;}
        var el = this.getSameProducts(foundProducts, productModel);

        var dateIconSpan = document.createElement("span");
        dateIconSpan.className = 't-price-same-products-icon';
        parentEl.append(dateIconSpan);

        hoverField.append(el);
    };
    this.openEditTitleWindow = function(el, productId) {
        this.closeEditWindow();
        document.querySelector('body').append(this.getWindowShadow());
        document.querySelector('body').append(this.getEditWindow(productId, this));
    };
    this.openEditCheckPriceWindow = function(el, productId) {
        this.closeEditWindow();
        document.querySelector('body').append(this.getWindowShadow());
        document.querySelector('body').append(this.openCheckPriceWindow(productId, this, el));
    };
}