class tConfig {
    static readonly TYPE_OZON = 'ozon';//www.ozon.ru
    static readonly TYPE_WILDBERRIES = 'wildberries';//www.wildberries.ru
    static readonly TYPE_CHITAI_GOROD = 'chitai-gorod';//www.chitai-gorod.ru
    static readonly TYPE_FFAN = 'ffan';//ffan.ru
    static readonly TYPE_KNIGOFAN = 'knigofan';//knigofan.ru

    static readonly CONFIG_DEBUG_ENABLED = 'debug.enabled';
    static readonly CONFIG_API_ENABLED = 'api.enabled';
    static readonly CONFIG_API_USE_TIMEZZONE = 'api.use_timezone';
    static readonly CONFIG_SHOP_TYPE = 'shop.type';
    static readonly CONFIG_INIT_TIMEOUT = 'init.timeout';
    static readonly CONFIG_API_TOKEN = 'api.token';

    static config = {
        [tConfig.CONFIG_DEBUG_ENABLED]: false,
        [tConfig.CONFIG_API_ENABLED]: false,
        [tConfig.CONFIG_API_USE_TIMEZZONE]: false,
        [tConfig.CONFIG_SHOP_TYPE]: '',
        [tConfig.CONFIG_INIT_TIMEOUT]: 200,
        [tConfig.CONFIG_API_TOKEN]: '',
    };

    static setApiEnabled(value: boolean) {
        tConfig.config[tConfig.CONFIG_API_ENABLED] = value;
    }

    static isApiEnabled(): boolean {
        return tConfig.config[tConfig.CONFIG_API_ENABLED];
    }

    static setUseTimezone(value: boolean) {
        tConfig.config[tConfig.CONFIG_API_USE_TIMEZZONE] = value;
    }

    // Использовать при импорте с локального хранилища
    static isUseTimezone(): boolean {
        return tConfig.config[tConfig.CONFIG_API_USE_TIMEZZONE];
    }

    static setDebugEnabled(value: boolean) {
        tConfig.config[tConfig.CONFIG_DEBUG_ENABLED] = value;
    }

    static isDebugEnabled(): boolean {
        return tConfig.config[tConfig.CONFIG_DEBUG_ENABLED];
    }

    static setShopType(shopType: string) {
        if (!shopType || typeof shopType === 'undefined' || ![
            tConfig.TYPE_OZON,
            tConfig.TYPE_WILDBERRIES,
            tConfig.TYPE_CHITAI_GOROD,
            tConfig.TYPE_KNIGOFAN,
        ].includes(shopType)) {
            throw new Error('ShopType is not correct');
        }

        tConfig.config[tConfig.CONFIG_SHOP_TYPE] = shopType;
    };

    static getShopType(): string {
        if (!tConfig.config[tConfig.CONFIG_SHOP_TYPE] || typeof tConfig.config[tConfig.CONFIG_SHOP_TYPE] === 'undefined') {
            throw new Error('ShopType is not defined');
        }

        return tConfig.config[tConfig.CONFIG_SHOP_TYPE];
    };

    static setInitTimeout(timeout: number) {
        tConfig.config[tConfig.CONFIG_INIT_TIMEOUT] = timeout;
    };

    static getInitTimeout(): number {
        return tConfig.config[tConfig.CONFIG_INIT_TIMEOUT];
    };

    static setApiToken(token) {
        tConfig.config[tConfig.CONFIG_API_TOKEN] = token;
    };

    static getApiToken() {
        if (!tConfig.config[tConfig.CONFIG_API_TOKEN] || typeof tConfig.config[tConfig.CONFIG_API_TOKEN] === 'undefined') {
            throw new Error('API token is not defined');
        }

        return tConfig.config[tConfig.CONFIG_API_TOKEN];
    };

    static getCurrentDate() {
        let date = new Date();
        let hours = 3; // Текущий часовой пояс.
        // date.setHours(date.getHours() - hours);

        return date;
    };

    static setTimezoneToDate(value: string) {
        let date = new Date(value);

        if (tConfig.isUseTimezone()) {
            let hours = 3; // Текущий часовой пояс.
            date.setHours(date.getHours() - hours);
        }

        return date;
    }

    static isExists(field): boolean {
        return typeof field !== 'undefined';
    };

    static isEmpty(field): boolean {
        return !tConfig.isExists(field) || field === null;
    };

}