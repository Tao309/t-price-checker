// tProduct.ts BEGIN
// https://transform.tools/typescript-to-javascript
// https://playcode.io/new

interface tProductInterface {
    // static get(id): tProduct;
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
    /**
     * Номер товара в магазине с учётом типа, по которому сохраняется.
     * Для TamperMonkey: wildberries-13425
     * Для API: 32 (id в таблице товаров)
     */
    static readonly PARAM_ID = 'id';
    // Номер товара в магазине.
    static readonly PARAM_PRODUCT_ID = 'product_id';
    static readonly PARAM_TYPE = 'type';
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
    static readonly PARAM_LISTEN_PRICE_VALUE = 'listen_price_value';

    static readonly PARAM_CURRENT_PRICE = 'current_price';
    static readonly PARAM_CURRENT_QTY = 'current_qty';

    static readonly FLAG_IS_PRICE_UP = 'is_price_up';
    static readonly FLAG_IS_PRICE_DOWN = 'is_price_down';

    // Текущие данные модели.
    data = {};
    // Изначальные данные модели.
    originalData = {};

    abstract getId(): number|string;
    abstract save();
    abstract getProductId(): number|string;

    constructor() {

    };

    getData(name: string|null): any|tProductData {
        if (name) {
            return typeof this.data[name] !== 'undefined' ? this.data[name] : null;
        }

        return this.data;
    };

    setData(name: string, value: any) {
        this.data[name] = value;
    };

    getOriginalData(name: string|null): any {
        return (name && typeof this.originalData[name] !== 'undefined') ? this.originalData[name] : this.originalData;
    };

    getFlag(name: string): boolean {
        return this.getData(name) ?? false;
    };

    setFlag(name: string, value: boolean) {
        this.setData(name, value);
    };

    getCurrentPrice(): number {
        return this.getData(tProduct.PARAM_CURRENT_PRICE);
    };

    getCurrentQty(): number {
        return this.getData(tProduct.PARAM_CURRENT_QTY) ?? 0;
    };

    isAvailable(): boolean {
        // Может проверять по currentQty?
        return this.getData(tProduct.PARAM_AVAILABLE) ?? false;
    };

    // Недоступен и стал доступен.
    isBecomeAvailable(): boolean {
        return this.isAvailable() && (this.getOriginalData(tProduct.PARAM_AVAILABLE) === false);
    }

    getTitle(): string {
        return this.getData(tProduct.PARAM_TITLE);
    };

    getType(): string {
        return this.getData(tProduct.PARAM_TYPE);
    };

    getAvailableDateFrom() {
        return this.getData(tProduct.PARAM_AVAILABLE_DATE_FROM);
    };

    getNotAvailableDateFrom() {
        return this.getData(tProduct.PARAM_NOT_AVAILABLE_DATE_FROM);
    };

    enableAvailable() {
        this.setData(tProduct.PARAM_AVAILABLE, true);
        this.setData(tProduct.PARAM_AVAILABLE_DATE_FROM, new Date());

        this.save();
    };

    disableAvailable() {
        this.setData(tProduct.PARAM_AVAILABLE, false);
        this.setData(tProduct.PARAM_NOT_AVAILABLE_DATE_FROM, new Date());

        this.save();
    };

    getLastPrice(): number {
        return this.getData(tProduct.PARAM_PRICE_DATES)
            ? this.getData(tProduct.PARAM_PRICE_DATES).slice(-1).pop().price
            : null;
    };

    getLastDate(): Date {
        return this.getData(tProduct.PARAM_PRICE_DATES)
            ? this.getData(tProduct.PARAM_PRICE_DATES).slice(-1).pop().date
            : null;
    };

    // Получаем последний сток.
    getLastStock(): Stock|null {
        return this.getData(tProduct.PARAM_STOCKS) ? this.getData(tProduct.PARAM_STOCKS).slice(-1).pop() : null;
    }

    // Получаем кол-во последнего стока.
    getLastQty(): number {
        return this.getLastStock() ? this.getLastStock().qty : null;
    };

    // Получаем дату последнего стока.
    getLastQtyDate(): Date {
        return this.getLastStock() ? this.getLastStock().date : null;
    };

    // Получаем общее кол-во товаров за всё время.
    getStockQty(): number {
        let qty = 0;

        this.getData(tProduct.PARAM_STOCKS).forEach(function(stock: Stock) {
            qty += stock.qty;
        });

        return qty;
    };

    // Получаем стоки
    getStocks(): Stock[] {
        return this.getData(tProduct.PARAM_STOCKS) ?? [];
    };

    getPriceDates(): PriceDate[] {
        return this.getData(tProduct.PARAM_PRICE_DATES) ? this.getData(tProduct.PARAM_PRICE_DATES) : [];
    };

    getPriceDatesForView(): PriceDate[] {
        if (this.getPriceDateCount() < 2) {
            return [];
        }

        var priceDates  = this.getData(tProduct.PARAM_PRICE_DATES);
        priceDates.slice(0, -1);

        return priceDates;
    };

    getPriceDateCount(): number {
        return this.getData(tProduct.PARAM_PRICE_DATES) ? this.getData(tProduct.PARAM_PRICE_DATES).length : 0;
    };

    getPriceDateForViewCount(): number {
        return this.getPriceDateCount() - 1;
    };

    appendCurrentPriceAndQty(currentPrice: number, currentQty: number) {
        this.setData(tProduct.PARAM_CURRENT_PRICE, currentPrice);
        this.setData(tProduct.PARAM_CURRENT_QTY, currentQty);
        this.setData(tProduct.PARAM_AVAILABLE, currentQty > 0);
    };

    appendNewMinPrice(price: number, date?: Date|null) {
        let newPriceDate: PriceDate = {
            date: date ? date : new Date(),
            price: price
        };

        var priceDates = this.getData(tProduct.PARAM_PRICE_DATES) ?? [];
        priceDates.push(newPriceDate)

        this.setData(tProduct.PARAM_PRICE_DATES, priceDates);
        this.setData(tProduct.PARAM_CURRENT_PRICE, price);
    };

    appendNewStock(qty: number, date?: Date) {
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

    // New set value to model BEGIN
    setTitle(title: string) {
        if(typeof title === 'undefined') {
            console.log('Title is undefined for ' + this.getId());
            return;
        }

        this.setData(tProduct.PARAM_TITLE, title);
    };

    getListenPriceValue(): number|null {
        return this.getData(tProduct.PARAM_LISTEN_PRICE_VALUE);
    };

    setListenPriceValue(price: number|null) {
        this.setData(
            tProduct.PARAM_LISTEN_PRICE_VALUE,
            typeof price !== 'undefined' ? price : null
        )
    };
    // New set value to model END

    // Tools methods BEGIN
    static convertDateToString(date: Date): string {
        return date.toJSON().slice(0,10).split('-').reverse().join('.');
    };
    // Tools methods END
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

        if (typeof data.type !== 'undefined') {
            this.setData(tProduct.PARAM_TYPE, data.type);
        }

        if (typeof data.title !== 'undefined') {
            this.setData(tProduct.PARAM_TITLE, data.title);
        }

        if (typeof data.available !== 'undefined') {
            this.setData(tProduct.PARAM_AVAILABLE, data.available);
        } else {
            this.setData(tProduct.PARAM_AVAILABLE, true);
        }

        if (typeof data.available_date_from !== 'undefined') {
            this.setData(tProduct.PARAM_AVAILABLE_DATE_FROM, new Date(data.available_date_from));
        }

        if (typeof data.not_available_date_from !== 'undefined') {
            this.setData(tProduct.PARAM_NOT_AVAILABLE_DATE_FROM, new Date(data.not_available_date_from));
        }

        if (typeof data.checkPrice !== 'undefined') {
            this.setData(tProduct.PARAM_LISTEN_PRICE_VALUE, data.checkPrice);
        }

        if (typeof data.dates === 'object') {
            data.dates.forEach(function(row) {
                let splitDate = row.date.split('.');

                self.appendNewMinPrice(row.price, new Date(splitDate[1] + '-' + splitDate[0] + '-' + splitDate[2]));
            });
        } else if (typeof data.price !== 'undefined') {
            this.appendNewMinPrice(
                data.price,
                typeof data.lastDate !== 'undefined' ? data.lastDate : null
            );
        }

        if (typeof data.stock !== 'undefined') {
            data.stock.forEach(function(row) {
                self.appendNewStock(row.qty, new Date(row.date))
            });
        } else if (typeof data.maxQty !== 'undefined') {
            this.appendNewStock(
                data.maxQty,
                typeof data.maxQtyDate !== 'undefined' ? new Date(data.maxQtyDate) : null
            );
        }

        this.applyDataToOriginalData();
    };

    applyDataToOriginalData() {
        this.originalData = this.data;
    };

    getId(): number|string {
        return this.getData(tProduct.PARAM_TYPE) + '-' + this.getProductId();
    };

    getProductId(): number|string {
        return this.getData(tProduct.PARAM_PRODUCT_ID);
    };

    static create(data: Object, currentPrice: number, currentQty: number): tProduct {
        var productModel = new tProductLocal(data);

        productModel.appendCurrentPriceAndQty(currentPrice, currentQty);

        if (currentPrice > 0) {
            productModel.appendNewMinPrice(currentPrice);
        }

        if (currentQty > 0) {
            productModel.appendNewStock(currentQty);
        }

        return productModel;
    };

    // id - type + product_id
    static get(id): tProduct {
        var gmValue = GM_getValue(id);
        if (typeof gmValue === 'undefined') {
            return null;
        }

        return new tProductLocal(JSON.parse(gmValue));
    };

    static removeById(id) {
        var gmValue = GM_getValue(id);
        if (typeof gmValue === 'undefined') {
            console.log('Product {' + id + '} not found for remove');
            return false;
        }

        GM_deleteValue(id);

        console.log('Product {' + id + '} is removed');

        return true;
    };

    save() {
        var self = this;

        var product = {
            id: this.getData(tProduct.PARAM_PRODUCT_ID),
            title: this.getData(tProduct.PARAM_TITLE),
            price: this.getLastPrice(),
            lastDate: tProduct.convertDateToString(this.getLastDate()),
            type: this.getData(tProduct.PARAM_TYPE),
            maxQty: this.getLastQty(),
            maxQtyDate: this.getLastQtyDate(),
            stock: this.getData(tProduct.PARAM_STOCKS),
            available: this.getData(tProduct.PARAM_AVAILABLE) ?? false,
            not_available_date_from: this.getData(tProduct.PARAM_NOT_AVAILABLE_DATE_FROM),
            available_date_from: this.getData(tProduct.PARAM_AVAILABLE_DATE_FROM),
            checkPrice: this.getData(tProduct.PARAM_LISTEN_PRICE_VALUE)
        };

        var dates  = [];
        this.getData(tProduct.PARAM_PRICE_DATES).forEach(function (priceDate: PriceDate) {
            dates.push({
                date: tProduct.convertDateToString(priceDate.date),
                price: priceDate.price
            });
        });

        product.dates = dates;

        // return product;

        GM_setValue(this.getId(), JSON.stringify(product));
    };

    delete() {
        var product = this.get(this.getId());
        if (!product) {
            console.log('Can not remove cause product #{' + this.getId() + '} is not found');

            return false;
        }

        GM_deleteValue(this.getId());

        console.log('Product {' + this.getId() + '} is removed');

        return true;
    };
}

// tProduct.ts END