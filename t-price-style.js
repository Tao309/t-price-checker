function tPriceStyle(initType) {
    this.type = initType;
    this.addCssStyles = function() {
        // var head = document.querySelector("head");
        // head.innerHTML += `<style></style>`;
        this.addTypeStyles();
    };
    this.addTypeStyles = function() {
        switch(this.type) {
            case TYPE_KNIGOFAN:
                this.appendCssStyles(`<style>
                    .t-head-result {left: 800px; position: absolute; top: -45px;}
                    .t-old-price {position: relative; top: 5px; padding-left: 0;}
                    .t-old-price .remove-from-storage-button {right: -10px;}
                    .t-list-item > td {padding: 22px 0 14px 0!important;}
                    .t-list-item > td.basket-items-list-item-price {padding: 22px 0 14px 20px!important;}
                    .t-changed-result.products-count p {line-height: 1.4rem;}                  
                </style>`);
                break;
            case TYPE_OZON:
                this.appendCssStyles(`<style>
                    .t-list-item {margin: 2px 0;}
                    .t-old-price {position: relative; left: -8px; top: 10px;}
                    .t-head-result {}
                    .t-item-qty {margin-left: 6px;}
                    .t-old-price .remove-from-storage-button {right: 30px;}
                    .t-old-price-actions > button {margin-right: 0;}
                    .t-old-price-percent {padding-left: 6px;}
                    .t-old-price .t-price-dates-icon, 
                    .t-old-price .t-price-same-products-icon {padding-left: 6px;}
                    .t-old-price .t-price-old-date {padding-left: 4px;}
                </style>`);
                break;
            case TYPE_WILDBERRIES:
                this.appendCssStyles(`<style>
                   .t-list-item {margin: 4px 0;}
                   .t-head-result {}
                   .t-item-qty {margin-left: 8px;}
                   .t-list-item-not-available .t-item-qty {margin-left: 10px;}
                   .t-old-price .remove-from-storage-button {right: 28px;}
                </style>`);
                break;
            case TYPE_CHITAI_GOROD:
                this.appendCssStyles(`<style>
                   .t-head-result {left: 16px; top: 210px;}
                   .t-old-price {position: relative; left: 40px; top:4px;}
                   .t-old-price .remove-from-storage-button {right: -5px;}

                   .cart-item__content-right .cart-item__actions {right: -50px!important; top:125px!important;}
                   .product-price__value--discount {color: #424242!important;}
                   .t-item-qty {margin: 20px 0 0 4px;}
                   
                   .t-list-item {margin-bottom: 6px!important;}
                   
                   .show_available_to_buy:hover {cursor: pointer;}
                </style>`);
                break;
            case TYPE_FFAN:
                this.appendCssStyles(`<style>
                    .t-head-result {}
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