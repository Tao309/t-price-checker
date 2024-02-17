// tProduct.ts BEGIN

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
    old_current_price: number,
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

    // Параметры, которые можно подставлять в модель при её создания.
    static readonly PARAMS_FOR_CREATE = [
        tProduct.PARAM_TITLE,
        tProduct.PARAM_AVAILABLE,
        tProduct.PARAM_PRICE,
        tProduct.PARAM_OLD_CURRENT_PRICE,
        // tProduct.PARAM_LAST_DATE,
        tProduct.PARAM_PRICE_DATES
    ];

    // Текущие данные модели.
    data: tProductData;
    // Изначальные данные модели.
    originalData: tProductOriginalData;

    abstract getId(): number;

    constructor(data: Object) {
        var self = this;

        Object.keys(data).forEach(function(key) {
            if (tProduct.PARAMS_FOR_CREATE[key]) {
                self.data[key] = data[key];
                self.originalData[key] = data[key];
            }
        });
    };

    getData(name: String|null): any {
        return (name && this.data[name]) ? this.data[name] : this.data;
    };

    // setData(name: string, value: any) {
    //     if (!this.data[name]) {
    //         return;
    //     }
    //
    //     this.data[name] = value;
    // };

    getOriginalData(name: String|null): any {
        return (name && this.originalData[name]) ? this.originalData[name] : this.originalData;
    };

    getLastPriceDate(): PriceDate {
        return this.getData(tProduct.PARAM_PRICE_DATES).slice(-1);
    };

    getStockQty(): number {
        let qty = 0;

        this.getData(tProduct.PARAM_STOCKS).forEach(function(stock: Stock) {
            qty += stock.qty;
        });

        return qty;
    };

    appendNewMinPrice(price: number) {
        let newPriceDate: PriceDate = {
            date: new Date(),
            price: price
        };

        // @todo проверь что сработает без сета в data.stocks
        this.data.price_dates = this.getData(tProduct.PARAM_PRICE_DATES).push(newPriceDate);
    };

    appendNewStock(qty: number) {
        let newStock: Stock = {
            date: new Date(),
            qty: qty
        };

        // @todo проверь что сработает без сета в data.stocks
        this.data.stocks = this.getData(tProduct.PARAM_STOCKS).push(newStock);
    };

    changeLastStockQty(qty: number) {
        // @todo проверить как будет сетиться данные через объекты
        var lastStock: Stock = this.getData(tProduct.PARAM_STOCKS).slice(-1);

        lastStock.qty = qty;
        lastStock.date = new Date();
    };

}

// class tProducApi extends tProduct implements tProductInterface {

class tProductLocal extends tProduct implements tProductInterface {
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