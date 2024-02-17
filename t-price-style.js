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
    
    .t-old-price .remove-from-storage-button {display:none;position:absolute;font-size: 18px; font-weight:bold;color:red;margin-left:14px;}
    .t-old-price .remove-from-storage-button:before {content: '✖';}
    .t-old-price:hover .remove-from-storage-button {display:inline-block;}
    
    .t-list-item {position: relative; margin: 4px 0;}
    .t-list-item::before {content:''; width: 4px; height: 100%; position: absolute; left: -8px; top: 0;background-color: #028502;opacity: 0.7;}
    .t-list-item.t-limit-count-5::before {background-color: #e50303;}
    .t-list-item.t-limit-count-10::before {background-color: #e53803;}
    .t-list-item.t-limit-count-20::before {background-color: #e56103;}
    .t-list-item.t-limit-count-50::before {background-color: #008062;}

    .t-list-item-not-available .t-old-price {position: relative;}
    .t-list-item-not-available .t-item-qty {padding-left: 20px;}
    
    .t-price-arrow {font-size: 18px; font-weight:bold;}
    .t-price-arrow.not-changed {color: #0395c1;}
    .t-price-arrow.not-changed:before {content: '✓';}
    .t-price-arrow.up {color: red;}
    .t-price-arrow.up:before {content: '↑';}
    .t-price-arrow.down {color: green;}
    .t-price-arrow.down:before {content: '↓';}
    .t-price-arrow.up:before, .t-price-arrow.down:before {padding-right: 4px;}
    .t-old-price-percent {text-align:left;width:100px;position:relative;}
    .t-price-percent {font-size:14px;padding-left: 5px;color:#707070;}

    .t-old-price {position: absolute; top:0; cursor:default; width: 140px; padding-left: 35px;}
    .t-old-price > span {display:block;text-align:left;}
    .t-old-price > .unavailable-info {font-size: 10px; margin-bottom: 4px; width: 140px;font-size: 12px;color: #a92424;}
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

    .t-head-result {font-size: 16px; border: 1px solid #edf3f7; padding: 4px; z-index: 5; background: #fff; position: fixed; left: 0; top: 136px;
        width: 220px;
        border-radius: 8px;
    }
    .t-head-result > div {margin:8px 0;}
    .t-changed-result {color: #707783; padding-left: 4px; margin-right: 4px;}
    .t-changed-result.min-price {color: #4fc78a; margin-left:8px;}
    .t-changed-result.price-up {color: red; font-weight: bold;}
    .t-changed-result.price-up:before {content:'↑';}
    .t-changed-result.price-down {color: green; font-weight: bold;}
    .t-changed-result.price-down:before {content:'↓';}
    .t-changed-result.price-up:before,
    .t-changed-result.price-down:before {padding-right: 6px;}
    .t-changed-result.check-price {color: #08d106;}
    .t-changed-result.products-count {color: #c2c2c2;}
    .t-changed-result.products-count {margin: 0; color: #727272; font-size: 0.9rem; font-weight: normal;}
    .t-changed-result.products-count > p {margin: 0;}
    .t-changed-result > label:hover {cursor: pointer;}

    .t-product-not-found {font-size: 24px; color:#f97d12;}

    .t-position-relative {position: relative;}
    .t-item-qty {color: #af07af; margin:8px 0 0 10px;}
    .t-item-qty .t-item-max-qty-date {color: #707070; font-size: 0.8rem; margin-top: 2px;}

    .t-sort-button {font-size: 16px; color: #707783; margin: 0 2px; border: 1px solid #edf3f7; border-radius: 4px; background: white; padding: 4px; line-height: normal;}
    .t-sort-button:hover {cursor: pointer; background: #828997; color: #edf3f7;}
    .t-sort-button.up,.t-sort-button.down {background: #707783; color: #edf3f7;}
    .t-sort-button:before {padding-right: 6px;}
    .t-sort-button.up {}
    .t-sort-button.up:before {content: '↑';}
    .t-sort-button.down {}
    .t-sort-button.down:before {content: '↓'; }
    .t-sort-button.t-sort-qty {}
    .t-sort-button.t-sort-price {}
    
    .t-head-search {
        border: 1px solid #edf3f7;
        border-radius: 4px;
        width: 200px;
        position: relative;
        overflow: hidden;
        padding: 4px 0;
    }
    .t-head-search .search-input {
        border: none;
        width: 178px;
        display: inline-block;
        padding: 2px 8px;
    }
    .t-head-search .search-reset {
        color: #707783;
        width: 29px;
        position: absolute;
        top: 0;
        right: 0;
        border: 0;
        height: 100%;
    }
    .t-head-search .search-reset:hover {color: #edf3f7;background: #707783;cursor:pointer;}
        
    
    </style>`;
        this.addTypeStyles();
    };
    this.addTypeStyles = function() {
        switch(this.type) {
            case TYPE_KNIGOFAN:
                this.appendCssStyles(`<style>
                    .t-old-price {position: relative; top: 5px; padding-left: 0;}
                    .t-list-item > td {padding: 22px 0 14px 0!important;}
                    .t-list-item > td.basket-items-list-item-price {padding: 22px 0 14px 20px!important;}
                </style>`);
                break;
            case TYPE_OZON:
                this.appendCssStyles(`<style>
                    .t-list-item {margin: 2px 0;}
                    .t-old-price {position: relative; left: -40px; top: 10px;}
                    .t-head-result {}
                    .t-item-qty {margin-left: 35px;}
                </style>`);
                break;
            case TYPE_WILDBERRIES:
                this.appendCssStyles(`<style>
                   .t-list-item {margin: 4px 0;}
                   .t-head-result {}
                   .t-item-qty {margin-left: 18px;}
                </style>`);
                break;
            case TYPE_CHITAI_GOROD:
                this.appendCssStyles(`<style>
                   .t-head-result {left: 16px; top: 210px;}
                   .t-old-price {position: relative; left: 40px; top:4px;}

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