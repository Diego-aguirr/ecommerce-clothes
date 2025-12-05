"use client";

interface Props {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    images: string[];
    sizes: string[]; // Mock sizes
  };
}

export const AddToCart = ({ product }: Props) => {
  return (
    <div>
      <h3>AddToCart Component (Basic)</h3>
      <p>Product: {product.title}</p>
      <button>Add to Cart</button>
    </div>
  );
};