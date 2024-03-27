/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import "./Addproduct.css";
import upload_image from "../../assets/upload_area.svg";

const Addproduct = () => {
  const [image, setImage] = useState(false);
  const [productdetails, setProductdetails] = useState({
    name: "",
    image: "",
    category: "women",
    new_price: "",
    old_price: "",
  });

  const ImageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
    setProductdetails({ ...productdetails, [e.target.name]: e.target.value });
  };

  const Add_product = async () => {
    console.log(productdetails);
    let responseData;
    let product = productdetails;

    let formData = new FormData();
    formData.append("product", image);

    await fetch("http://localhost:4000/upload", {
      method: "Post",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    })
      .then((resp) => resp.json())
      .then((data) => {
        responseData = data;
      });

    if (responseData.success) {
      product.image = responseData.image_url;
      console.log(product);

      await fetch("http://localhost:4000/addproduct", {
        method: "Post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })
        .then((resp) => {
          const data = resp.json;
          return data;
        })
        .then((dat) => {
          dat.suc ? alert("Product added") : alert("Product Added ");
        });
    }
  };

  return (
    <div className="add-product">
      <div className="addproduct-itemfield">
        <p>product title</p>
        <input
          value={productdetails.name}
          onChange={changeHandler}
          type="text"
          name="name"
          placeholder="Type Here"
        />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input
            value={productdetails.old_price}
            onChange={changeHandler}
            type="number"
            name="old_price"
            placeholder="Type Here"
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input
            value={productdetails.new_price}
            onChange={changeHandler}
            type="number"
            name="new_price"
            placeholder="Type Here"
          />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select
          value={productdetails.category}
          onChange={changeHandler}
          name="category"
          className="add-product-selector"
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kids">Kid</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_image}
            alt=""
            className="addproduct-thumnail-img"
          />
        </label>
        <input
          onChange={ImageHandler}
          type="file"
          name="image"
          id="file-input"
          hidden
        />
      </div>
      <button
        onClick={() => {
          Add_product();
        }}
        className="addproduct-btn"
      >
        ADD
      </button>
    </div>
  );
};

export default Addproduct;
