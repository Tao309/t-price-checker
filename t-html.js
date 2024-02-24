function tHtml(type, tPriceChecker) {
    this.type = type;
    this.tEventListener = new tEventListener(type);
    this.tPriceChecker = tPriceChecker;
    this.tProductRepository = new tProductRepository(type);
    this.checkerElements = {
        'check-price': {label: 'отслеживаемые'},
        'price-decrease': {label: 'понижение'},
        'returns': {label: 'снова в продаже'},
        'is-available-for-release-date': {label: 'В продаже'},
        'is-waiting-for-release-date': {label: 'Ожидается'}
    };

    this.createElement = function (type, data = {}, attr = {}) {
        if (!isExists(type)) {
            console.error('Create element type {' + type + '} is not exists');
            return;
        }

        if (!['div', 'span', 'a', 'button', 'form', 'input'].includes(type)) {
            console.error('Create element type {' + type + '} is not available');
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
        if (isExists(data.content)) {el.textContent = data.content;}
        if (isExists(data.title)) {el.title = data.title;}
        if (isExists(data.title)) {el.title = data.title;}
        if (isExists(data.disabled)) {el.disabled = data.disabled;}

        Object.keys(attr).forEach(key => {
            el.setAttribute(key, attr[key]);
        });

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
            if (productModel.getLastStockQty()) {
                textContent = 'Было: ' + productModel.getLastStockQty();
            }
        } else {
            textContent = currentQty;
            textContent += ' / ' + productModel.getLastStockQty();
        }

        currentQtyDiv.textContent = textContent;

        itemQtyDiv.append(currentQtyDiv);

        if (productModel.getLastStockDate()) {
            var dateDiv = this.createElement('div', {
                textContent: 'Доступно с ' + tProduct.convertDateToString(productModel.getLastStockDate()),
                className: 't-item-max-qty-date'
            });

            itemQtyDiv.append(dateDiv);
        }

        var stocks = productModel.getStocks();
        if (stocks.length > 1) {
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
    this.getPriceElement = function(productModel, itemElement) {
        var self = this;
        var oldMinPrice = productModel.getLastPrice();
        var currentPrice = productModel.getCurrentPrice();
        var checkPrice = productModel.getListenPriceValue();

        var colorClassName = 'not-changed';
        if (currentPrice > oldMinPrice) {
            this.tEventListener.whenFoundPriceUp(productModel, itemElement, this.tPriceChecker);
        } else if(currentPrice < oldMinPrice) {
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

        // Сравнение с предыдущей ценой из истории
        var oldPriceForElement = oldMinPrice;

        // Главный элемент для всего.
        var div = this.createElement('div', {className: this.tPriceChecker.selectors.oldPrice});

        if (!productModel.isAvailable() && productModel.getNotAvailableDateFrom()) {
            var divNotAvailableInfo = document.createElement("span");
            divNotAvailableInfo.className = 'unavailable-info';
            divNotAvailableInfo.textContent = 'Недоступно с ' + tProduct.convertDateToString(productModel.getNotAvailableDateFrom());
            div.append(divNotAvailableInfo);
        }

        // Последняя цена (галочка, стрелка, цена, процент) BEGIN
        var oldPricePercentDiv = this.createElement('div', {className: this.tPriceChecker.selectors.oldPricePercent});

        var span = this.createElement(
            'span',
            {className: 't-price-arrow ' + colorClassName, textContent: oldPriceForElement},
            {'data-price': currentPrice}
        );
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
        // Последняя цена END

        // Дата последней низкой цены.
        if (productModel.getLastDate()) {
            var spanDate = this.createElement('span', {
                className: 't-price-old-date',
                textContent: tProduct.convertDateToString(productModel.getLastDate())
            });
            div.append(spanDate);
        }

        // Кнопки действий BEGIN
        var actionsDiv = this.createElement('div', {className: 't-old-price-actions'})

        // Редактировать название продукта.
        var spanEdit = this.createElement('button', {className: 't-title-edit t-button'}, {title: 'Edit title'});
        spanEdit.addEventListener("click", function (event) {
            event.preventDefault();
            self.openEditTitleWindow(productModel, event.target, itemElement);
        });
        actionsDiv.append(spanEdit);

        // Редактировать отслеживание цены.
        var tCheckPriceClassNames = 't-check-price t-button';
        if (checkPrice && checkPrice >= currentPrice && productModel.isAvailable()) {
            tCheckPriceClassNames += ' t-check-price-available';
            this.tPriceChecker.checkPriceCount++;
            self.tEventListener.whenFoundPriceCheck(productModel, itemElement);
        }

        var spanCheckPrice = this.createElement('button', {className: tCheckPriceClassNames}, {title: 'Set Check Price'});
        spanCheckPrice.addEventListener("click", function (event) {
            event.preventDefault();
            self.openEditCheckPriceWindow(productModel, event.target, itemElement);
        });
        actionsDiv.append(spanCheckPrice);

        // Установка даты релиза
        var releaseDateButton = self.createElement('button', {
            title: 'Set Release Date',
            class: 'set-release-date-button t-button'
        });
        releaseDateButton.addEventListener('click', function(event) {
            event.preventDefault();
            self.openEditReleaseDateWindow(productModel, event.target, itemElement);
        });
        actionsDiv.append(releaseDateButton);

        // Удаление товара.
        var removeButton = self.createElement('button', {
            title: 'Remove from storage',
            class: 'remove-from-storage-button t-button'
        });
        removeButton.addEventListener('click', function(event) {
            event.preventDefault();

            var element = productModel.isAvailable() ? event.target.closest('.' + self.tPriceChecker.selectors.listItem) : event.target.closest('.' + self.tPriceChecker.selectors.listItemNotAvailable);

            self.tEventListener.whenRemoveFromStorage(element);
        });
        actionsDiv.append(removeButton);
        // Кнопки действий END

        div.append(oldPricePercentDiv);
        div.append(actionsDiv);

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
        var self = this;

        var divDates = this.createElement('div', {className: 't-price-dates'});

        productModel.getPriceDatesForView().forEach(function(priceDate) {
            divDates.appendChild(
                self.createElement('div', {
                    className: 't-price-date',
                    textContent: tProduct.convertDateToString(priceDate.date) + ': ' + priceDate.price
                })
            );
        });

        parentEl.append(this.createElement('span', {className: 't-price-dates-icon'}));

        hoverField.append(divDates);
    };
    this.appendSameProducts = function(hoverField, productModel, parentEl) {
        if (!productModel) {return;}
        var foundProducts = this.tProductRepository.getProductsBySameTitle(productModel);
        if (!foundProducts.length) {return;}
        var el = this.getSameProducts(foundProducts, productModel);

        parentEl.append(this.createElement('span', {className: 't-price-same-products-icon'}));

        hoverField.append(el);
    };
    this.appendReleaseDate = function (el, productModel) {
        let oldEl = el.querySelector('.t-release-date');
        if (oldEl) {
            oldEl.remove();
        }

        if (!productModel.getReleaseDate()) {
            return;
        }

        let elToAppend = el.querySelector('.t-item-title-column') ? el.querySelector('.t-item-title-column') : el;

        let isAlreadyAvailable = productModel.isAvailableForReleaseDate();
        let isWaiting = productModel.isWaitingForReleaseDate();

        if (isAlreadyAvailable || isWaiting) {
            let releaseDateDiv = this.createElement('div', {
                class: 't-release-date ' + ((isWaiting) ? 'is-waiting' : 'is-available'),
                textContent: isWaiting
                    ? 'Осталось дней: ' + productModel.getWaitingForReleaseDays()
                    : 'Уже в продаже дней: ' +  productModel.getAvailableForReleaseDays()
            });

            elToAppend.append(releaseDateDiv);
        }
    }

    this.openEditTitleWindow = function(productModel, button, itemElement) {
        (new tEditWindow(
            productModel, button, itemElement
        ))
            .setSubmitFunction(function (tEditWindow, productModel, editInput) {
                productModel.setTitle(editInput.value);
                productModel.save();
            })
            .setKeyUpFunc(function (targetInput, sumbitButton) {
                sumbitButton.disabled = !targetInput.value;
            })
            .setEditInputValue(productModel.getTitle())
            .setEditInputLength(100)
            .initEditWindow();
    };
    this.openEditCheckPriceWindow = function(productModel, button, itemElement) {
        (new tEditWindow(
            productModel, button, itemElement
        ))
            .setSubmitFunction(function (tEditWindow, productModel, editInput) {
                productModel.setListenPriceValue(editInput.value);
                productModel.save();

                // buttonElement.classList.remove('t-check-price-available');
            })
            .setResetFunction(function (tEditWindow, productModel) {
                productModel.setListenPriceValue(null);
                productModel.save();
            })
            .setKeyUpFunc(function (targetInput, sumbitButton) {
                targetInput.value = targetInput.value.replace(/[^0-9\.]/g, '');
                sumbitButton.disabled = !targetInput.value;
            })
            .setProductInfoTitle('Set CheckPrice for: ')
            .setResetButtonTitle('Reset CheckPrice')
            .setEditInputValue(productModel.getListenPriceValue())
            .setEditInputLength(5)
            .initEditWindow();
    };
    this.openEditReleaseDateWindow = function(productModel, button, itemElement) {
        (new tEditWindow(
            productModel, button, itemElement
        ))
            .setSubmitFunction(function (tEditWindow, productModel, editInput) {
                productModel.setReleaseDate(editInput.value);
                productModel.save();
                tEditWindow.tHtml.appendReleaseDate(itemElement, productModel);
            })
            .setResetFunction(function (tEditWindow, productModel) {
                productModel.setReleaseDate(null);
                productModel.save();
                tEditWindow.tHtml.appendReleaseDate(itemElement, productModel);
            })
            .setKeyUpFunc(function (targetInput, sumbitButton) {
                targetInput.value = targetInput.value.replace(/[^0-9\.]/g, '');
                sumbitButton.disabled = !tProduct.isStringDateMatch(targetInput.value);
            })
            .setProductInfoTitle('Set Release Date for: ')
            .setResetButtonTitle('Reset Release Date')
            .setEditInputValue(
                productModel.getReleaseDate()
                ? tProduct.convertDateToString(productModel.getReleaseDate())
                : null
            )
            .setEditInputLength(10)
            .initEditWindow();
    };

}