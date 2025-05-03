import React from 'react'
import { useParams } from 'react-router-dom'
import products from '../data/products'

export default function ProductDetails() {
  const { id } = useParams();
  const product = products.find(p => p.id == id);
  if (!product) {
    <div className="p-6">Product not found.</div>
  }
  return (
    <div>ProductDetails</div>
  )
}
