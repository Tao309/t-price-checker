class tEditWindow {
    tHtml = null;

    productModel = null; // Модель продукта.
    buttonElement = null; // Элемент кнопки нажатия Сохранить.
    itemElement = null; // Элемент продукты в корзине

    keyUpFunc = null; // Функция проверки ввода текста в поле. (targetInput, sumbitButton)
    submitFunc = null; // Функция сохранения, после нажатия Сохранить. (editInput)
    resetFunc = null; // Функция сброса. (this)

    productInfoTitle = null; // Надпись перед ид продукта.
    resetButtonTitle = null; // Надпись кнопки сброса.

    editInputValue = null; // Значение поля.
    editInputLength = 150; // Длина поля.

    constructor(
        productModel, // Модель продукта.
        buttonElement, // Элемент кнопки нажатия Сохранить.
        itemElement, // Элемент продукты в DOM
    ) {
        this.productModel = productModel;
        this.buttonElement = buttonElement;
        this.itemElement = itemElement;
        this.tHtml = new tHtml(productModel.getType());
    };

    getSubmitFunction() {
        return (typeof this.submitFunc === 'function') ? this.submitFunc : null;
    };

    setSubmitFunction(func) {
        this.submitFunc = func;
        return this;
    };

    getResetFunction() {
        return (typeof this.resetFunc === 'function') ? this.resetFunc : null;
    };

    setResetFunction(func) {
        this.resetFunc = func;
        return this;
    };

    getKeyUpFunc() {
        return (typeof this.keyUpFunc === 'function') ? this.keyUpFunc : null;
    };

    setKeyUpFunc(func) {
        this.keyUpFunc = func;
        return this;
    };

    getProductInfoTitle() {
        return this.productInfoTitle ?? '';
    };

    setProductInfoTitle(preTitle) {
        this.productInfoTitle = preTitle;
        return this;
    };

    getResetButtonTitle() {
        return this.resetButtonTitle ?? '';
    };

    setResetButtonTitle(resetButtonTitle) {
        this.resetButtonTitle = resetButtonTitle;
        return this;
    };

    getEditInputValue() {
        return this.editInputValue;
    };

    setEditInputValue(value) {
        if (typeof value === 'undefined' || !value) {
            return this;
        }

        this.editInputValue = value;
        return this;
    };

    getEditInputLength() {
        return this.editInputLength;
    };

    setEditInputLength(value) {
        this.editInputLength = value;
        return this;
    };

    initEditWindow() {
        this.closeEditWindow();

        let body = document.querySelector('body');
        body.append(this.getWindowShadow());
        body.append(this.getEditWindow());
    }

    getEditWindow() {
        let self = this;
        let productModel = this.productModel;

        let editWindow = this.tHtml.createElement('div', {className: 't-window-edit', id: 't-window-edit' });
        let editBody = this.tHtml.createElement('div', {className: 't-window-body'});
        let productIdInfo = this.tHtml.createElement('div', {
            className: 't-window-info',
            textContent: this.getProductInfoTitle() + productModel.getType() + '-' + productModel.getProductId()
        });
        let productTitleInfo = this.tHtml.createElement('div', {
            className: 't-window-info',
            textContent: productModel.getTitle()
        });
        let editForm = this.tHtml.createElement('form');
        let editInput = this.tHtml.createElement('input', {
            type: 'text',
            name: 'editInput',
            value: this.getEditInputValue()
        }, {maxlength: this.getEditInputLength()});
        let sumbitButton = this.tHtml.createElement('button', {
            className: 't-button t-button-submit tfl_nm-button size-small type-save',
            type: 'submit',
            textContent: 'Save',
            disabled: true
        });

        if (self.getSubmitFunction()) {
            editForm.addEventListener('submit', function(event) {
                event.preventDefault();

                self.getSubmitFunction()(self, productModel, event.target.editInput);

                self.closeEditWindow();
            })
        }

        if (this.getEditInputValue()) {
            sumbitButton.disabled = false;
        }

        if (this.getKeyUpFunc()) {
            editInput.addEventListener('keyup', function() {
                self.getKeyUpFunc()(this, sumbitButton);

                // this.value = this.value.replace(/[^0-9\.]/g, '');
                // sumbitButton.disabled = !tProduct.isStringDateMatch(this.value);
            });
        }

        editForm.append(editInput);
        editForm.append(sumbitButton);

        editBody.append(productIdInfo);
        editBody.append(productTitleInfo);
        editBody.append(editForm);

        if (self.getResetFunction() && this.getEditInputValue()) {
            var resetButton = document.createElement("button");
            resetButton.className = 't-button t-button-reset tfl_nm-button size-small type-delete';
            resetButton.textContent = this.getResetButtonTitle() ?? 'Reset';

            resetButton.addEventListener('click', function(event) {
                event.preventDefault();

                self.getResetFunction()(self, productModel);
                self.closeEditWindow();
            });

            editBody.append(resetButton);
        }

        editWindow.append(editBody);

        return editWindow;
    }

    closeEditWindow() {
        if (document.getElementById('t-window-edit')) {document.getElementById('t-window-edit').remove();}
        if (document.getElementById('t-window-shadow')) {document.getElementById('t-window-shadow').remove();}
    };

    getWindowShadow() {
        let self = this;
        let editWindowShadow = this.tHtml.createElement('div', {
            id: 't-window-shadow',
            className: 't-window-shadow'
        });

        editWindowShadow.addEventListener("click", function (event) {
            event.preventDefault();
            self.closeEditWindow();
        });

        return editWindowShadow;
    };
}