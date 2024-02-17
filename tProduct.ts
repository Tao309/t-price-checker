// tProduct.ts BEGIN
// https://transform.tools/typescript-to-javascript
// https://playcode.io/new

interface tProductInterface {
    getId(): number;
    // get(id: number): tProduct;
    save();
    delete();
}

interface tProductOriginalData {
    type: string,
    title: string,
    available: boolean,
    available_date_from: Date,
    not_available_date_from: Date,
    price: number,
    price_date: Date,
    // old_current_price: number,
    // last_date: string,
    price_dates: PriceDate[],
    stock_qty: number,
    stocks: Stock[],
}

interface tProductData extends tProductOriginalData{
    id: number,
}

interface PriceDate {
    date: Date,
    price: number
}

interface Stock {
    date: Date,
    qty: number
}

abstract class tProduct {
    static readonly PARAM_ID = 'id';
    static readonly PARAM_PRODUCT_ID = 'product_id';
    static readonly PARAM_TITLE = 'title';
    static readonly PARAM_AVAILABLE = 'available';
    static readonly PARAM_AVAILABLE_DATE_FROM = 'available_date_from';
    static readonly PARAM_NOT_AVAILABLE_DATE_FROM = 'not_available_date_from';
    static readonly PARAM_PRICE = 'price';
    static readonly PARAM_OLD_CURRENT_PRICE = 'old_current_price';
    // static readonly PARAM_LAST_DATE = 'last_date';
    static readonly PARAM_PRICE_DATES = 'price_dates';
    // static readonly PARAM_STOCK_QTY = 'stock_qty';
    static readonly PARAM_STOCKS = 'stocks';

    // Текущие данные модели.
    data = {};
    // Изначальные данные модели.
    originalData = {};

    abstract getId(): number;

    constructor() {

    };

    getData(name: string|null): any|tProductData {
        if (name) {
            return this.data[name] !== 'undefined' ? this.data[name] : null;
        }

        return this.data;
    };

    setData(name: string, value: any) {
        // if (this.data[name] === 'undefined') {
        //     return;
        // }

        this.data[name] = value;
    };

    getOriginalData(name: string|null): any {
        return (name && this.originalData[name] !== 'undefined') ? this.originalData[name] : this.originalData;
    };

    getLastPrice(): number {
        return this.getData(tProduct.PARAM_PRICE_DATES).slice(-1).pop().price;
    };

    getLastDate(): Date {
        return this.getData(tProduct.PARAM_PRICE_DATES).slice(-1).pop().date;
    };

    getStockQty(): number {
        let qty = 0;

        this.getData(tProduct.PARAM_STOCKS).forEach(function(stock: Stock) {
            qty += stock.qty;
        });

        return qty;
    };

    appendNewMinPrice(price: number, date: Date|null) {
        let newPriceDate: PriceDate = {
            date: date ? date : new Date(),
            price: price
        };

        var priceDates = this.getData(tProduct.PARAM_PRICE_DATES) ?? [];
        priceDates.push(newPriceDate)

        this.setData(tProduct.PARAM_PRICE_DATES, priceDates);
    };

    appendNewStock(qty: number, date: Date|null) {
        let newStock: Stock = {
            date: date ? date : new Date(),
            qty: qty
        };


        var stocks = this.getData(tProduct.PARAM_STOCKS) ?? [];
        stocks.push(newStock)

        this.setData(tProduct.PARAM_STOCKS, stocks);
    };

    changeLastStockQty(qty: number) {
        // @todo проверить как будет сетиться данные через объекты
        let stocks = this.getData(tProduct.PARAM_STOCKS);
        var lastKey = stocks.length ? stocks.length - 1 : 0;
        stocks[lastKey] = {
            qty: qty,
            date: new Date()
        };

        this.setData(tProduct.PARAM_STOCKS, stocks);
    };

}

// class tProductApi extends tProduct implements tProductInterface {

class tProductLocal extends tProduct implements tProductInterface {
    constructor(data: Object|undefined) {
        super();

        this.importData(data);
    };

    // Импорт данных с json массива TamperMonkey.
    importData(data: Object|undefined) {
        if (typeof data === 'undefined') {
            return;
        }

        var self = this;

        if (typeof data.id !== 'undefined') {
            this.setData(tProduct.PARAM_PRODUCT_ID, data.id);
        }

        if (typeof data.title !== 'undefined') {
            this.setData(tProduct.PARAM_TITLE, data.title);
        }

        if (typeof data.available !== 'undefined') {
            this.setData(tProduct.PARAM_AVAILABLE, data.available);
        }

        if (typeof data.available_date_from !== 'undefined') {
            this.setData(tProduct.PARAM_AVAILABLE_DATE_FROM, data.available_date_from);
        }

        if (typeof data.not_available_date_from !== 'undefined') {
            this.setData(tProduct.PARAM_NOT_AVAILABLE_DATE_FROM, data.not_available_date_from);
        }

        if (typeof data.dates === 'object') {
            data.dates.forEach(function(row) {
                let splitDate = row.date.split('.');

                self.appendNewMinPrice(row.price, new Date(splitDate[1] + '-' + splitDate[0] + '-' + splitDate[2]));
            });
        } else if (typeof data.price !== 'undefined') {
            this.appendNewMinPrice(
                data.price,
                data.lastDate !== 'undefined' ? data.lastDate : null
            );
        }

        if (typeof data.maxQty !== 'undefined') {
            this.appendNewStock(
                data.maxQty,
                data.maxQtyDate !== 'undefined' ? data.maxQtyDate : null
            );
        }

        this.applyDataToOriginalData();
    };

    applyDataToOriginalData() {
        this.originalData = this.data;
    };

    getId(): number {
        return this.getData(tProduct.PARAM_ID);
    };

    // get(id: number): tProduct {
    //
    // };

    save() {

    };

    delete() {

    };
}

// tProduct.ts END