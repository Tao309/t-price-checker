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

    .t-price-arrow {font-size: 18px; font-weight:bold;}
    .t-price-arrow.not-changed {color: #0395c1;}
    .t-price-arrow.not-changed:before {content: '✓';}
    .t-price-arrow.up {color: red;}
    .t-price-arrow.up:before {content: '↑';}
    .t-price-arrow.down {color: green;}
    .t-price-arrow.down:before {content: '↓';}
    .t-price-arrow.up:before, .t-price-arrow.down:before {padding-right: 4px;}
    .t-old-price-percent {text-align:left;width:100px;}
    .t-price-percent {font-size:14px;padding-left: 5px;color:#707070;}

    .t-old-price {position: absolute; top:0; cursor:default; width: 140px; padding-left: 35px;}
    .t-old-price > span {display:block;text-align:left;}
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

    .t-head-result {font-size: 16px; margin: 4px 8px; border: 1px solid #edf3f7; padding: 10px 12px; z-index: 5; background: #fff; position: absolute; left: 24%; width: 340px;}
    .t-head-info {cursor:default;}
    .t-head-result > div {margin:4px 0;}
    .t-changed-result {padding-left: 4px;color:#bf10b9; font-weight:bold; display: inline-block;}
    .t-changed-result.min-price {color: #4fc78a; margin-left:8px;}
    .t-changed-result.price-up {color: red;}
    .t-changed-result.price-up:before {content:'↑';}
    .t-changed-result.price-down {color: green;}
    .t-changed-result.price-down:before {content:'↓';}
    .t-changed-result.price-up:before,
    .t-changed-result.price-down:before {padding-right: 6px;}

    .t-product-not-found {font-size: 24px; color:#f97d12;}

    .t-position-relative {position: relative;}
    .t-item-qty {color: #af07af; margin:8px 0 0 4px;}

    .t-sort-button {font-size: 16px; color: #707783; margin: 0 4px; border: 1px solid #edf3f7; border-radius: 4px; background: white; padding: 4px 8px;}
    .t-sort-button:hover {cursor: pointer; background: #828997; color: #edf3f7;}
    .t-sort-button.up,.t-sort-button.down {background: #707783; color: #edf3f7;}
    .t-sort-button:before {padding-right: 6px;}
    .t-sort-button.up {}
    .t-sort-button.up:before {content: '↑';}
    .t-sort-button.down {}
    .t-sort-button.down:before {content: '↓'; }
    .t-sort-button.t-sort-qty {}
    .t-sort-button.t-sort-price {}
    </style>`;
        this.addTypeStyles();
    };
    this.addTypeStyles = function() {
        switch(this.type) {
            case TYPE_OZON:
                this.appendCssStyles(`<style>
                    .t-old-price {position: relative; left: -40px; top: 10px;}
                    .t-head-result {left:150px; top:-20px;}
                </style>`);
                break;
            case TYPE_WILDBERRIES:
                this.appendCssStyles(`<style>
                   .t-head-result {left: 190px; width: 260px; top: -20px;}
                </style>`);
                break;
            case TYPE_CHITAI_GOROD:
                this.appendCssStyles(`<style>
                   .t-head-result {left:300px;}
                   .t-old-price {position: relative; left: 40px; top:4px;}

                   .cart-item__content-right .cart-item__actions {right: -50px!important; top:125px!important;}
                   .product-price__value--discount {color: #424242!important;}
                   .t-item-qty {margin: 20px 0 0 4px;}
                </style>`);
                break;
            case TYPE_FFAN:
                this.appendCssStyles(`<style>
                    .t-head-result {left: 180px;top: -25px;}
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