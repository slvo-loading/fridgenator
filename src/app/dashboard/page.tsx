"use client";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from "../lib/supabaseClient";


export default function Dashboard() {
  const timerRef = React.useRef(0);

  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [date, setDate] = useState<Date | undefined>(
    new Date()
  )

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);


  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantity(value ? parseInt(value, 10) : 1);
  };

  const calculateDaysUntilExpiration = (expirationDate: Date): number => {
    const today = new Date();
    const timeDifference = expirationDate.getTime() - today.getTime();
    return Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  };

  const handleSubmit = async() => {
    if (!date || !foodName) {
      toast('Please enter both item name and expiration date.');
      return;
    }

    const daysUntilExpiration = calculateDaysUntilExpiration(date);
    const { data, error } = await supabase.auth.getUser();

    if (error || !data) {
        toast('Error fetching user information.');
        return;
    }

    console.log(data)

    try {
        await supabase.from("fridge").insert([
            {
                user_id: data.user.id,
                name: foodName,
                quantity: quantity,
                expiring_in: daysUntilExpiration,
            },
        ]);
    } catch (error) {
        console.error("Error adding item to fridge:", error);
        toast('Error adding item to fridge.');
        return;
    }

    toast('✨ Added to Fridge!');
    setFoodName("");
    setQuantity(1);
    setDate(new Date());
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = e.target.value;
    const dateParts = inputDate.split("/");
    if (dateParts.length === 3) {
      const [month, day, year] = dateParts.map((part) => parseInt(part, 10));
      if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
        setDate(new Date(2000 + year, month - 1, day)); // Adjust for 2-digit year
      }
    }
  };


  return (
    <div>
        <div>
            <input
            id="name"
            type="text"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            placeholder="Enter Item Name"
            className="border px-2 py-1 rounded"
            />

            <input
            id="date"
            type="date"
            value={date ? date.toISOString().split("T")[0] : ""}
            onChange={handleDateChange}
            placeholder="Enter Expiration Date"
            className="border px-2 py-1 rounded"
            />

            <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            placeholder="Enter Amount"
            className="border px-2 py-1 rounded"
            />

            <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            >
            Add Item
            </button>
            <Toaster />

      </div>
      
    </div>
  );
}