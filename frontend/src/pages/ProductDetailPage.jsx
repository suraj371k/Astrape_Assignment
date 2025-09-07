import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductDetail from "../components/ProductDetail";
import { useProductStore } from "../store/productStore";
import { useCartStore } from "../store/cartStore";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { currentProduct, fetchProductById, loading, error } = useProductStore();
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id, fetchProductById]);

  const handleAddToCart = async () => {
    if (!currentProduct?._id) return;
    try {
      await addToCart(currentProduct._id, 1);
      navigate("/cart");
    } catch (e) {
      // no-op; error handled in store
    }
  };

  if (loading && !currentProduct) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <ProductDetail product={currentProduct} onAddToCart={handleAddToCart} />
    </div>
  );
};

export default ProductDetailPage;


