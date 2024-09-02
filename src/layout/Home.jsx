import axios from "axios";
import { useEffect, useState } from "react";

export default function Product() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
          const response = await axios.get('http://localhost:8000/auth/getproductuser', {
            
          });
          setProducts(response.data.getproduct);
        
      } catch (error) {
        console.log(error.message);
      }
    };
    getProducts();
  }, []);


  return (
    <div className="flex grid-cols-4 grid-rows-4 gap-4 pt-12 ">
      {products.map((product) => (
        <div key={product.id}>
          <div className="card w-96 bg-base-100 shadow-xl">
            <figure className="px-10 pt-10">
              <img src={product.image} alt={product.name} className="rounded-xl" />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title">{product.name}</h2>
              <p>ประเภท {product.category}</p>
              <p>จำนวนสินค้าคงเหลือ: {product.store} จำนวน</p>
              <p>{product.price} บาท</p>
              <div className="card-actions">
                {product.store > 0 ? (
                  <button className="btn btn-primary" onClick={() => addCart(product.id, product.price)}>
                    เพิ่มใส่ตะกร้า
                  </button>
                ) : (
                  <p className="text-red-500">สินค้าหมดแล้ว</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
