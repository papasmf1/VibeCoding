import Foundation

class ProductViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var searchKeyword: String = ""

    func fetchProducts() {
        products = DBManager.shared.fetchProducts(keyword: searchKeyword)
    }

    func addProduct(name: String, price: Int) {
        DBManager.shared.insertProduct(name: name, price: price)
        fetchProducts()
    }

    func updateProduct(product: Product) {
        DBManager.shared.updateProduct(id: product.prodID, name: product.prodName, price: product.prodPrice)
        fetchProducts()
    }

    func deleteProduct(id: Int) {
        DBManager.shared.deleteProduct(id: id)
        fetchProducts()
    }
}
