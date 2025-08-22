import Foundation
import FMDB

class DBManager {
    static let shared = DBManager()
    let databaseFileName = "products.sqlite"
    var database: FMDatabase!

    private init() {
        let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let databaseURL = documentsDirectory.appendingPathComponent(databaseFileName)
        database = FMDatabase(url: databaseURL)
        createTable()
    }

    func createTable() {
        database.open()
        let createTableQuery = """
        CREATE TABLE IF NOT EXISTS Products (
            prodID INTEGER PRIMARY KEY AUTOINCREMENT,
            prodName TEXT,
            prodPrice INTEGER
        );
        """
        database.executeUpdate(createTableQuery, withArgumentsIn: [])
        database.close()
    }

    func insertProduct(name: String, price: Int) {
        database.open()
        let query = "INSERT INTO Products (prodName, prodPrice) VALUES (?, ?)"
        database.executeUpdate(query, withArgumentsIn: [name, price])
        database.close()
    }

    func updateProduct(id: Int, name: String, price: Int) {
        database.open()
        let query = "UPDATE Products SET prodName = ?, prodPrice = ? WHERE prodID = ?"
        database.executeUpdate(query, withArgumentsIn: [name, price, id])
        database.close()
    }

    func deleteProduct(id: Int) {
        database.open()
        let query = "DELETE FROM Products WHERE prodID = ?"
        database.executeUpdate(query, withArgumentsIn: [id])
        database.close()
    }

    func fetchProducts(keyword: String = "") -> [Product] {
        var products: [Product] = []
        database.open()
        let query: String
        let args: [Any]
        if keyword.isEmpty {
            query = "SELECT * FROM Products"
            args = []
        } else {
            query = "SELECT * FROM Products WHERE prodName LIKE ?"
            args = ["%\(keyword)%"]
        }
        let results = try! database.executeQuery(query, values: args)
        while results.next() {
            let product = Product(
                prodID: Int(results.int(forColumn: "prodID")),
                prodName: results.string(forColumn: "prodName") ?? "",
                prodPrice: Int(results.int(forColumn: "prodPrice"))
            )
            products.append(product)
        }
        database.close()
        return products
    }
}
