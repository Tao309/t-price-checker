const CONNECT_TYPE_GM = 'gm';
const CONNECT_TYPE_API = 'api';

interface Product {
    id: Number,
    type: String,
    title: String,
    price: Number,
    oldCurrentPrice: Number,
    lastDate: String,
    dates: Date[],
}

interface Date {
    date: String,
    price: Number
}

class tGmProductRepositoryAdapter {
    constructor(type) {
        this.type = type;
    }
    save(id, product: Object) {
        GM_setValue(id, JSON.stringify(product));
    };
    get(id): Product|null {
        if (typeof GM_getValue(id) !== 'undefined') {
            return JSON.parse(GM_getValue(id));
        }

        return null;
    };
}

class tApiProductRepositoryAdapter extends tGmProductRepositoryAdapter {
    save(id, product: Object) {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://okrugin.ru/api/post', true);
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.send(JSON.stringify(product));
        xhr.onload = function() {
            console.log(`Загружено: ${xhr.status} ${xhr.response}`);
        };
        xhr.onerror = function() {
            console.log(`Ошибка соединения`);
        };
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);
                console.log('response', response);
            }
        };

        var data = Object.keys(product).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(product[key]);
        }).join('&');

        GM_xmlhttpRequest({
            method: "POST",
            url: 'https://tao309.ru/api/post.php',
            headers: {
                "Accept": "application/json",
                'Content-Type': 'application/x-www-form-urlencoded',
                //"Content-Type": "application/json",
                //"Authorization": "Basic sdasd23ds2",
                //"User-Agent": "t-price-checker"
            },
            dataType: 'json',
            contentType: 'application/json',
            overrideMimeType: 'application/json',
            responseType: 'json',
            data: data,
            onload: function(response) {
                console.log(response.response);
            }
        });
    };
    get(id): Product|null {

    };
}