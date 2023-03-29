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
}