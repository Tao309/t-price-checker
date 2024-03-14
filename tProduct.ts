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
    static readonly PARAM_DATE_CREATED = 'date_created';
    static readonly PARAM_DATE_UPDATED = 'date_updated';
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
    static readonly PARAM_RELEASE_DATE = 'release_date';

    static readonly PARAM_CURRENT_PRICE = 'current_price';
    static readonly PARAM_CURRENT_QTY = 'current_qty';

    static readonly FLAG_IS_PRICE_UP = 'is_price_up';
    static readonly FLAG_IS_PRICE_DOWN = 'is_price_down';
    static readonly FLAG_TO_SAVE_PRICE_DATES = 'flag_to_save_price_dates';
    static readonly FLAG_TO_SAVE_STOCKS = 'flag_to_save_stocks';

    // Текущие данные модели.
    data = {};
    // Изначальные данные модели.
    originalData = {};

    abstract getId(): number|string;
    abstract save();
    abstract getProductId(): number|string;

    constructor() {

    };

    getData(name?: string|null): any|tProductData {
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

    unsetFlag(name: string) {
        if (this.getFlag(name)) {
            delete this.data[name];
        }
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

    getDateCreated(): Date|null {
        return this.getData(tProduct.PARAM_DATE_CREATED) ? new Date(this.getData(tProduct.PARAM_DATE_CREATED)) : null;
    };

    setDateCreated(date: Date) {
        this.setData(tProduct.PARAM_DATE_CREATED, date);
    };

    getDateUpdated(): Date|null {
        return this.getData(tProduct.PARAM_DATE_UPDATED) ? new Date(this.getData(tProduct.PARAM_DATE_UPDATED)) : null;
    };

    setDateUpdated(date: Date) {
        this.setData(tProduct.PARAM_DATE_UPDATED, date);
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

    // Получаем последний блок цены.
    getLastPriceDate(): PriceDate|null {
        return this.getData(tProduct.PARAM_PRICE_DATES) ? this.getData(tProduct.PARAM_PRICE_DATES).slice(-1).pop() : null;
    }

    getLastPrice(): number {
        return this.getLastPriceDate() ? this.getLastPriceDate().price : null;
    };

    getLastDate(): Date {
        return this.getLastPriceDate() ? this.getLastPriceDate().date : null;
    };

    // Получаем пред последний блок цены, который была ранее текущей, т.к. текущая это последняя цена
    getPrevLastPriceDate(): PriceDate|null {
        if (!this.getData(tProduct.PARAM_PRICE_DATES)) {
            return null;
        }

        if (this.getData(tProduct.PARAM_PRICE_DATES).length === 1) {
            return this.getLastPriceDate();
        }

        return this.getData(tProduct.PARAM_PRICE_DATES).slice(-2).shift();
    }

    // Получаем пред последнюю цену
    getPrevLastPrice(): number {
        return this.getPrevLastPriceDate() ? this.getPrevLastPriceDate().price : null;
    };

    // Получаем пред последнюю дату
    getPrevLastDate(): Date {
        return this.getPrevLastPriceDate() ? this.getPrevLastPriceDate().date : null;
    };

    // Получаем последний сток.
    getLastStock(): Stock|null {
        return this.getData(tProduct.PARAM_STOCKS) ? this.getData(tProduct.PARAM_STOCKS).slice(-1).pop() : null;
    }

    // Получаем кол-во последнего стока.
    getLastStockQty(): number {
        return this.getLastStock() ? this.getLastStock().qty : null;
    };

    // Получаем дату последнего стока.
    getLastStockDate(): Date {
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

    getPriceDateCount(): number {
        return this.getData(tProduct.PARAM_PRICE_DATES) ? this.getData(tProduct.PARAM_PRICE_DATES).length : 0;
    };

    getPriceDatesForView(): PriceDate[] {
        var priceDates  = this.getData(tProduct.PARAM_PRICE_DATES);
        priceDates.slice(0, -1);

        return priceDates;
    };

    getPriceDateForViewCount(): boolean {
        return this.getCurrentPrice() > this.getPrevLastPrice() || this.getPriceDateCount() >= 2;
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
        let stocks = this.getStocks();
        if (!stocks.length) {
            return;
        }

        let lastStockDate = this.getLastStockDate();

        var lastKey = stocks.length - 1;
        stocks[lastKey] = {
            qty: qty,
            date: lastStockDate
        };

        this.setData(tProduct.PARAM_STOCKS, stocks);
    };

    toJson() {
        return JSON.stringify(this.getData());
    };

    // New get/set value to model BEGIN
    setTitle(title: string) {
        if(typeof title === 'undefined') {
            console.log('Title is undefined for ' + this.getId());
            return;
        }

        this.setData(tProduct.PARAM_TITLE, title.trim());
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

    getReleaseDate(): Date {
        return this.getData(tProduct.PARAM_RELEASE_DATE) ? new Date(this.getData(tProduct.PARAM_RELEASE_DATE)) : null;
    };

    // Переводим из строки только при сете, потому что вводим dd.mm.YYYY
    setReleaseDate(releaseDate?: string) {
        this.setData(
            tProduct.PARAM_RELEASE_DATE,
            releaseDate ? tProduct.convertStringToDate(releaseDate) : null
        )
    };

    // Ожидается в продаже.
    isWaitingForReleaseDate() {
        return this.getWaitingForReleaseDays() > 0;
    };

    // Оставшиеся кол-во дней до релиза, если меньше дня, то день.
    getWaitingForReleaseDays(): number {
        let currentDate = new Date();
        if (!this.getReleaseDate() || this.getReleaseDate() < currentDate) {
            return 0;
        }

        let daysDiff = tProduct.getDiffDateDays(new Date(), this.getReleaseDate());

        return daysDiff > 0 ? daysDiff : 1;
    };

    // Доступен к продаже.
    isAvailableForReleaseDate() {
        return this.getAvailableForReleaseDays() > 0;
    };

    // Сколько дней уже доступен к покупке после дня релиза.
    getAvailableForReleaseDays(): number {
        if (!this.getReleaseDate()) {
            return 0;
        }

        let showForDays = 5;
        let limitDate = this.getReleaseDate();
        let currentDate = new Date();

        if (limitDate > currentDate) {
            return 0;
        }

        limitDate.setHours(limitDate.getHours() + showForDays * 24);

        if (limitDate < currentDate) {
            return 0;
        }

        let daysDiff = tProduct.getDiffDateDays(this.getReleaseDate(), new Date());

        return daysDiff > 0 ? daysDiff : 1;
    };
    // New get/set value to model END

    // Tools methods BEGIN
    static convertDateToString(date: Date): string {
        return date.toJSON().slice(0,10).split('-').reverse().join('.');
    };

    static convertStringToDate(dateString: string): Date {
        let splitDate = dateString.split('.');
        let date = new Date(splitDate[1] + '-' + splitDate[0] + '-' + splitDate[2]);
        let hours = 3; // Текущий часовой пояс.
        date.setHours(date.getHours() + hours);

        return date;
    };

    // Получаем разницу между датами в днях
    static getDiffDateDays(fromDate: Date, toDate: Date): number {
        return Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24));
    }

    // Строка соответствует дате формата dd.mm.YYYY
    static isStringDateMatch(value: string): boolean {
        return !!value.match(/^(0[1-9]|[12][0-9]|3[01])[.](0[1-9]|1[012])[.](19|20)\d\d$/);
    }
    // Tools methods END
}

// class tProductApi extends tProduct implements tProductInterface {

class tProductLocal extends tProduct implements tProductInterface {
    constructor(data: Object|undefined, typeProductId?: string|undefined) {
        super();

        this.importData(data, typeProductId);
    };

    // Импорт данных с json массива TamperMonkey.
    importData(data: Object|undefined, typeProductId?: string|undefined) {
        if (typeof data === 'undefined') {
            return;
        }

        if (!tConfig.isApiEnabled()) {
            this.importTamperData(data, typeProductId);
        } else {
            this.importApiData(data, typeProductId);
        }

        this.applyDataToOriginalData();
    };

    // Импорт данных с json TamperMonkey
    importTamperData(data: Object|undefined, typeProductId?: string|undefined) {
        var self = this;

        if (typeof data.id !== 'undefined') {
            this.setData(tProduct.PARAM_PRODUCT_ID, data.id);
        } else if(typeProductId !== 'undefined') {
            this.setData(tProduct.PARAM_PRODUCT_ID, typeProductId.split('-').pop());
        }

        if (typeof data.type !== 'undefined') {
            this.setData(tProduct.PARAM_TYPE, data.type);
        } else if(typeProductId !== 'undefined') {
            this.setData(tProduct.PARAM_TYPE, typeProductId.split('-').shift());
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

        if (typeof data.releaseDate !== 'undefined') {
            this.setData(tProduct.PARAM_RELEASE_DATE, data.releaseDate);
        }

        if (typeof data.dateCreated !== 'undefined') {
            this.setDateCreated(data.dateCreated);
        }

        if (typeof data.dateUpdated !== 'undefined') {
            this.setDateUpdated(data.dateUpdated);
        }

        if (typeof data.dates === 'object') {
            data.dates.forEach(function(row) {
                var date;
                if (tProduct.isStringDateMatch(row.date)) {
                    date = tProduct.convertStringToDate(row.date);
                } else {
                    date = new Date(row.date);
                }

                self.appendNewMinPrice(row.price, date);
            });
        } else if (typeof data.price !== 'undefined') {
            var date;
            if (data.lastDate !== 'undefined') {
                if (tProduct.isStringDateMatch(data.lastDate)) {
                    date = tProduct.convertStringToDate(data.lastDate);
                } else {
                    date = new Date(data.lastDate);
                }
            }

            this.appendNewMinPrice(
                data.price,
                date
            );
        }

        if (typeof data.stocks !== 'undefined') {
            data.stocks.forEach(function(row) {
                self.appendNewStock(row.qty, new Date(row.date))
            });
        } else if (typeof data.maxQty !== 'undefined') {
            this.appendNewStock(
                data.maxQty,
                typeof data.maxQtyDate !== 'undefined' ? new Date(data.maxQtyDate) : null
            );
        }
    };

    // Импорт данных с API
    importApiData(data: Object|undefined, typeProductId?: string|undefined) {
        var self = this;

        this.setData(tProduct.PARAM_PRODUCT_ID, data.product_id);
        this.setData(tProduct.PARAM_TYPE, data.shop_type);
        this.setData(tProduct.PARAM_TITLE, data.title);

        if (typeof data.available_date_from !== 'undefined') {
            this.setData(tProduct.PARAM_AVAILABLE_DATE_FROM, data.available_date_from);
        }

        if (typeof data.not_available_date_from !== 'undefined') {
            this.setData(tProduct.PARAM_NOT_AVAILABLE_DATE_FROM, data.not_available_date_from);
        }

        if (typeof data.listen_price_value !== 'undefined') {
            this.setData(tProduct.PARAM_LISTEN_PRICE_VALUE, data.listen_price_value);
        }

        if (typeof data.release_date !== 'undefined') {
            this.setData(tProduct.PARAM_RELEASE_DATE, data.release_date);
        }

        this.setDateCreated(data.date_created);
        this.setDateUpdated(data.date_updated);

        if (typeof data.price_dates !== 'undefined') {
            data.price_dates.forEach(function (row) {
                self.appendNewMinPrice(row.price, row.date);
            });
        }

        if (typeof data.stocks !== 'undefined') {
            data.stocks.forEach(function (row) {
                self.appendNewStock(row.qty, row.date)
            });
        }
    };

    applyDataToOriginalData() {
        this.originalData = this.data;
    };

    getId(): string {
        return this.getData(tProduct.PARAM_TYPE) + '-' + this.getProductId();
    };

    getProductId(): number|string {
        return this.getData(tProduct.PARAM_PRODUCT_ID);
    };

    static create(data: Object, currentPrice: number, currentQty: number): tProductLocal {
        var productModel = new tProductLocal(data);

        productModel.appendCurrentPriceAndQty(currentPrice, currentQty);

        if (currentPrice > 0) {
            productModel.appendNewMinPrice(currentPrice);
        }

        if (currentQty > 0) {
            productModel.appendNewStock(currentQty);
        }

        productModel.setDateCreated(new Date());

        return productModel;
    };

    static get(typeProductId): tProductLocal {
        return tProductRepository.getProduct(typeProductId);
    };

    save(toMassSave: boolean = false) {
        if (toMassSave === true) {
            tProductRepository.addProductToMassSave(this);
            return;
        }

        tProductRepository.saveProduct(this);
    };

    delete() {
        return tProductRepository.removeProduct(this);
    };
}

// tProduct.ts END