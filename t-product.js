function tProductModel() {
    this.isAvailable = function (product) {
        return product.available === true || !isExists(product.available);
    }
}