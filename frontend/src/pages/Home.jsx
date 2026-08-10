import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <div className=" bg-cover bg-center bg-[url(https://images.unsplash.com/photo-1527603815363-e79385e0747e?q=80&w=676&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] h-screen pt-9  w-full flex justify-between flex-col ">
        <img
          className="w-30 ml-8"
          src="/public/images-removebg-preview.png"
          alt="Uber"
        />
        <div className="bg-white  pb-7 py-4 px-4">
          <h2 className="text-3xl font-bold">Get Started With Uber</h2>
          <Link
            to="/login"
            className=" flex justify-center items-center bg-black w-full   text-white py-2 px-4 rounded mt-4"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
