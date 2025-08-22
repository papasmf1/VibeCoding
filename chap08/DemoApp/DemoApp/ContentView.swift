//
//  ContentView.swift
//  DemoApp
//
//  Created by 유저 on 7/22/25.
//

import SwiftUI

struct ContentView: View {
    @StateObject var viewModel = ProductViewModel()
    @State private var name = ""
    @State private var price = ""
    @State private var editingProduct: Product?

    var body: some View {
        NavigationView {
            VStack {
                HStack {
                    TextField("제품명", text: $name)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    TextField("가격", text: $price)
                        .keyboardType(.numberPad)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    Button(editingProduct == nil ? "추가" : "수정") {
                        if let edit = editingProduct {
                            var updated = edit
                            updated.prodName = name
                            updated.prodPrice = Int(price) ?? 0
                            viewModel.updateProduct(product: updated)
                            editingProduct = nil
                        } else {
                            viewModel.addProduct(name: name, price: Int(price) ?? 0)
                        }
                        name = ""
                        price = ""
                    }
                }
                .padding()

                HStack {
                    TextField("검색어", text: $viewModel.searchKeyword)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    Button("검색") {
                        viewModel.fetchProducts()
                    }
                }
                .padding([.leading, .trailing, .bottom])

                List {
                    ForEach(viewModel.products) { product in
                        HStack {
                            VStack(alignment: .leading) {
                                Text(product.prodName)
                                Text("가격: \(product.prodPrice)원")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                            }
                            Spacer()
                            Button("수정") {
                                name = product.prodName
                                price = "\(product.prodPrice)"
                                editingProduct = product
                            }
                            .buttonStyle(BorderlessButtonStyle())
                            Button("삭제") {
                                viewModel.deleteProduct(id: product.prodID)
                            }
                            .foregroundColor(.red)
                            .buttonStyle(BorderlessButtonStyle())
                        }
                    }
                }
                .onAppear {
                    viewModel.fetchProducts()
                }
            }
            .navigationTitle("전자제품 관리")
        }
    }
}

#Preview {
    ContentView()
}
