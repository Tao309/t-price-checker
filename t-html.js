function tHtml(type) {
    this.type = type;
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
    }

    this.getShopLinkForProduct = function(product) {
        var productId = product.id;

        switch(product.type) {
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
    this.getQtyElement = function(qty, product) {
        var div = this.createElement('div', {
            className: 't-item-qty'
        });
        div.setAttribute('data-qty', qty);

        var span = this.createElement('div');
        var textContent = qty;
        if (!isEmpty(product.maxQty)) {
            textContent += ' / ' + product.maxQty;
        }

        if (qty === 0 && !isEmpty(product.maxQty)) {
            textContent = 'Было: ' + product.maxQty;
        }

        span.textContent = textContent

        div.append(span);

        if (!isEmpty(product.maxQtyDate)) {
            var spanDate = this.createElement('div', {
                textContent: formatDate(new Date(product.maxQtyDate), true),
                className: 't-item-max-qty-date'
            });
            div.append(spanDate);
        }

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
                buttonElement.classList.remove('t-check-price-available');
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