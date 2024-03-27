/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import "./Listproduct.css";
import remove_icon from "../../assets/cross_icon.png";

const Listproduct = () => {
  const [allproducts, setAllproducts] = useState([]);

  const fetchInfo = () => {
    fetch("http://localhost:4000/allproducts")
      .then((resp) => {
        const data = resp.json();
        return data;
      })
      .then((data) => {
        console.log(data);
        setAllproducts(data);
      });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const remove_product = async (id) => {
    await fetch("http://localhost:4000/removeproduct", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });
    await fetchInfo();
  };

  return (
    <div className="list-product">
      <h1>All Product List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts &&
          allproducts.map((product, index) => {
            return (
              <>
                <div
                  key={index}
                  className="listproduct-format-main listproduct-format"
                >
                  <img
                    src={product.image}
                    alt=""
                    className="listproduct-product-icon"
                  />
                  <p>{product.name}</p>
                  <p>${product.old_prices}</p>
                  <p>${product.new_prices}</p>
                  <p>${product.category}</p>
                  <img
                    src={remove_icon}
                    alt=""
                    className="listproduct-remove-icon"
                    onClick={() => {
                      remove_product(product.id);
                    }}
                  />
                </div>
                <hr />
              </>
            );
          })}
      </div>
    </div>
  );
};

export default Listproduct;
