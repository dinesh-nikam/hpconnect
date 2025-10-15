'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import VisitorForm from "./form/page";


function Welcome() {
  return (
    <main className="min-w-full  flex flex-col items-center">
      <section className=" rounded-lg  shadow-xl/30  bg-white   max-w-6xl flex flex-col items-center">
       
        <div className="w-full  flex justify-between px-28 gap-4  ">
          
          <Image src="/images/1.png" alt="HP Connect" width={200} height={100} />
          <Image src="/images/2.png" alt="Innovative Group" width={200} height={100} />
        </div>
         <div className="w-full flex flex-col items-center">
        <h2 className="text-4xl font-extrabold text-center mb-4">Welcome to the HP Store!</h2>
       
            <div className="relative  flex flex-col items-center  overflow-hidden">
             <Image
              src="/images/hp_products.png"
              alt="Laptops"
              fill
              style={{ objectFit: "none", opacity: 0.9 }}
              className="absolute  inset-0 z-0"
              priority
            />
            <div className="relative z-10 bg-white bg-opacity-80  p-6 w-full flex flex-col items-center">
              <p className="font-semibold text-lg text-center mb-2">We appreciate your visit.</p>
              <p className="font-semibold text-center mb-2">
              Your feedback helps us improve and ensures we continue to deliver the best in technology and service.
              </p>
              <p className="font-semibold text-center mb-4">
              Please take a moment to share your thoughts with us.
              </p>
            </div>
            </div></div>
          {/* <Link href="/user/form" className="w-full flex justify-center">
          <button
  className="w-64 py-3 bg-blue-600 text-white font-bold text-lg rounded-full mt-2 hover:bg-blue-700 transition flex items-center justify-between  px-8"
>
  NEXT <FontAwesomeIcon icon={faArrowRight} />
</button>

          </Link> */}

<VisitorForm />



        
        
        <div className="w-full bg-gray-200 text-center text-sm text-gray-700 mt-8 p-3  ">
          <h1>HP Connect Centre</h1>
          4th Floor, Innovative Tower, opp. Zensar Technologies, near Eon School, Rakshak Nagar, Kharadi, Pune, Maharashtra 411014
        <p >Email: <a href="mailto:gayatri.shebekar@ithpl.com">gayatri.shebekar@ithpl.com</a> | Website: <a href="https://ithpl.com">ithpl.com</a>
<br></br>
Contact No.: +91 9699766932</p>
        </div>
      </section>
    </main>
  );
}

export default Welcome;