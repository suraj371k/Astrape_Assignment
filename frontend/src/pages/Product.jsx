import React from "react";
import ProductsPage from "../components/AllProducts";
import Filters from "../components/Filters";

const Product = () => {
  return (
    <div className="flex container mx-auto gap-10">
      <div>
        <Filters />
      </div>
      <ProductsPage />
    </div>
  );
};

export default Product;
