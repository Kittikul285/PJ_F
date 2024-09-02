import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Payment = () => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [location, setAddresses] = useState([]);
  const [selectedLocation, setSelectedAddress] = useState(null); // Add state for selected location
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/cart/showidcart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCart(response.data);
      } catch (err) {
        console.error('Error fetching cart data', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://localhost:8000/cart/user', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/locations/getlocation', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAddresses(response.data);
      } catch (err) {
        console.error('Error fetching location', err);
        setError(err.message || 'Unknown error');
      }
    };
    fetchAddresses();
  }, []);

  const calculateTotalPrice = () => {
    return cart.reduce((total, cartItem) => total + cartItem.all_price, 0);
  };

  const handleCheckout = async () => {
    if (!selectedLocation) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'กรุณาเลือกที่อยู่จัดส่ง',
        showConfirmButton: true
      });
      return;
    }

    try {
      const cartcloneResponses = await Promise.all(
        cart.map(item => axios.post('http://localhost:8000/cart/cartclone/', { id: item.id }))
      );

      const rs1 = await axios.post('http://localhost:8000/orders/create', {
        cartcloneId: cartcloneResponses.map(i => i.data.cartclone.id),
        date: new Date(),
        userId: user.id,
        status: 'ชำระแล้ว'
      });

      await Promise.all(cart.map(item => updatestatus(item.id)));
      cart.forEach(item => updateProductStore(item));
      console.log(111,selectedLocation)

      const paymentData = {
        date: new Date(),
        userId: user.id,
        status: 'กำลังดำเนินการ',
        all_price: calculateTotalPrice(),
        orderId: rs1.data.id,
        locationId: selectedLocation.id 
      };
      await axios.post('http://localhost:8000/payment/payments', paymentData);

      setSuccess(true);
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Your work has been saved",
        showConfirmButton: false,
        timer: 1500
      });
      navigate('/');

    } catch (error) {
      console.error('Error creating order or payment:', error.response ? error.response.data : error.message);
      setError('Error creating order or payment. Please try again.');
    }
  };

  const updatestatus = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/cart/deletecart/${id}`);
    } catch (err) {
      console.error("UpdateStatus Error:", err.response ? err.response.data : err.message);
    }
  };

  const updateProductStore = async (products) => {
    try {
      const updatedStore = products.product.store - products.total;
      await axios.put(`http://localhost:8000/product/productstore/${products.product.id}`, {
        store: updatedStore
      });
    } catch (err) {
      console.error('เกิดข้อผิดพลาด', err);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // const handleLocationSubmit = () => {
  //   fetchAddresses(); // Refresh location after adding a location
  // };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center">หน้าชำระเงิน</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">ลำดับ</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">รูปภาพ</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">สินค้า</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">ประเภท</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">ราคา</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((cartItem, index) => (
              <tr key={cartItem.id} className="hover:bg-gray-100">
                <td className="px-6 py-4 border-b border-gray-300">{index + 1}</td>
                <td className="px-6 py-4 border-b border-gray-300">
                  <img
                    src={cartItem.product.image}
                    alt={cartItem.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 border-b border-gray-300">{cartItem.product.name}</td>
                <td className="px-6 py-4 border-b border-gray-300">{cartItem.product.category}</td>
                <td className="px-6 py-4 border-b border-gray-300">{cartItem.all_price} บาท</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      

      {/* <div className="mt-5 flex justify-between"> */}
      <div className='mt-5'>
      <button 
          type="button" 
          onClick={openModal}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center"
        >
          เพิ่มที่อยู่
        </button>
      </div>
        
        <div className=' flex justify-end'>
          <h1 className="text-2xl font-bold">ราคารวม: {calculateTotalPrice()} บาท</h1>
          
        </div>
        <div className=' flex justify-end'>
        <button
            type="button"
            className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mt-2"
            onClick={handleCheckout}
          >
            ชำระเงิน
          </button>
        </div>
        
      {/* </div> */}
      
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4">เลือกที่อยู่การจัดส่ง</h3>
        <ul className="list-disc list-inside">
          {location.map((location, index) => (
            <li key={index} className="mb-2">
              <label>
                <input
                  type="radio"
                  name="location"
                  value={index}
                  checked={selectedLocation === location} // Check if this location is selected
                  onChange={() => setSelectedAddress(location)} // Set the selected location
                  className="mr-2"
                />
                {`${location.house_number} ${location.village}, ${location.road}, ${location.districts}, ${location.amphures}, ${location.provinces}, ${location.zip_code}`}
                <button className='ml-5 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition'>แก้ไขที่อยู่</button>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {error && <div className="text-red-500 mt-4">{error}</div>}
      {success && <div className="text-green-500 mt-4">คำสั่งซื้อและการชำระเงินสำเร็จ!</div>}

      <LocationModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        // onSubmit={handleLocationSubmit} 
        userId={user?.id} // Pass userId as a prop to the modal
      />
    </div>
  );
};

const LocationModal = ({ isOpen, onClose, onSubmit, userId }) => {
  const [formData, setFormData] = useState({
    provinces: '',
    amphures: '',
    districts: '',
    zip_code: '',
    road: '',
    village: '',
    house_number: '',
    other: '',
    usersId: userId  // Use the passed user ID
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/locations/location', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // onSubmit();
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error adding location:', error);
    }
  };

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      usersId: userId,
    }));
  }, [userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">เพิ่มที่อยู่ใหม่</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="provinces"
            placeholder="จังหวัด"
            value={formData.provinces}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <input
            type="text"
            name="amphures"
            placeholder="อำเภอ"
            value={formData.amphures}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <input
            type="text"
            name="districts"
            placeholder="ตำบล"
            value={formData.districts}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <input
            type="text"
            name="zip_code"
            placeholder="รหัสไปรษณีย์"
            value={formData.zip_code}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <input
            type="text"
            name="road"
            placeholder="ถนน"
            value={formData.road}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <input
            type="text"
            name="village"
            placeholder="หมู่บ้าน"
            value={formData.village}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <input
            type="text"
            name="house_number"
            placeholder="บ้านเลขที่"
            value={formData.house_number}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <textarea
            name="other"
            placeholder="ข้อมูลเพิ่มเติม"
            value={formData.other}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mt-4"
          >
            บันทึก
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mt-4 ml-2"
          >
            ยกเลิก
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
