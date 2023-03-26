# t-price-checker

Плагин для [tampermonkey](https://www.tampermonkey.net)

- фиксация минимальной цены товаров в корзине
- ведение истории понижения цен
- сравнение с товарами из других магазинов, которые проверяются
- внедрённые магазины: www.wildberries.ru, www.ozon.ru, www.chitai-gorod.ru, ffan.ru
- сортировка товаров по остатку, цене
- изменение названия товара, для совпадения с таким же товаров из другого магазина
- показ изменения цены (повышение, понижение) от минимальной, с выводом в процентном виде

## Установка
1. Установить tampermonkey в браузер
2. Создать новый скрипт в tampermonkey в и добавить туда код
```
  // ==UserScript==
  // @name         [ALL] baskets
  // @namespace    basket
  // @version      0.1
  // @description  Basket min price checker
  // @author       You
  // @icon         https://www.google.com/s2/favicons?sz=64&domain=www.tfl-nm.ru

  // @require      https://code.jquery.com/jquery-3.6.3.slim.min.js
  {place_1}

  // @match        https://www.ozon.ru/cart
  // @match        https://ffan.ru/personal/basket.php
  // @match        https://www.wildberries.ru/*
  // @match        https://www.chitai-gorod.ru/*

  // @grant    GM_getValue
  // @grant    GM_setValue
  // @grant    GM_deleteValue
  // @grant    GM_listValues
  // @grant    GM_getTab
  // @grant    GM_saveTab
  // @grant    GM_getTabs
  // @grant    GM_cookie
  // ==/UserScript==
  {place_2}
```
3. Возможные варианты добавления кода:
  - вместо {place_1} добавить ссылки на каждый файл, по типу
```
// @require      {url}/t-config.js
// @require      {url}/t-price-checker.js
// @require      {url}/t-html.js
// @require      {url}/t-price-style.js
// @require      {url}/t-product-repository.js
// @require      {url}/index.js
```
  - вместо {place_2} добавить весь код из всех файлов, последовательно

### Wildberries example
[![tPriceChecker - wildberries](https://img.youtube.com/vi/qVBeH79EhiQ/maxresdefault.jpg)](https://www.youtube.com/watch?v=qVBeH79EhiQ)


### Ozon example
[![tPriceChecker - ozon](https://img.youtube.com/vi/wdzN5YciVZw/maxresdefault.jpg)](https://www.youtube.com/watch?v=wdzN5YciVZw)

### Chitai-gorod example
[![tPriceChecker - chitai-gorod](https://img.youtube.com/vi/idn_Li0Hwfw/maxresdefault.jpg)](https://www.youtube.com/watch?v=idn_Li0Hwfw)

