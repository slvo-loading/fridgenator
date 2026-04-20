'use client'
import { useState, useEffect } from 'react'
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion'


interface FridgeDoorProps {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function FridgeDoor({ children, className, style }: FridgeDoorProps) {
  const [open, setOpen] = useState<boolean>(false);

  useEffect( () => {
    console.log(open)
  }, [open])

  return (
    <div className={`${className} relative drop-shadow-[-12px_8px_2px_rgba(0,0,0,0.15)]`} style={style}>

      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="sidebar"
            className="absolute -left-1/3 top-0 w-1/3 h-[calc(100%-2rem)] mt-[1rem] flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(false)}
          >
            <div className="flex-1 h-full bg-gray-100 rounded-lg border-8 border-gray-300"></div>
            
            {/* hinge */}
            <div className='flex flex-col justify-evenly'>
              <div className='border-4 border-gray-500 h-1/14 rounded-full'></div>
              <div className='border-4 border-gray-500 h-1/14 rounded-full'></div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="overlay"
            className="absolute inset-0 bg-gray-300 w-full rounded-lg h-full 
            flex items-center justify-center flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(true)}
          >

            {/* top handle */}
            <div className='w-full h-1/3 flex items-end justify-start flex-col'>
              <div className="w-full h-2/3"></div>
              <div className='flex w-full justify-end h-full'>
                <div className='border-5 rounded-full border-gray-500 h-1/2 w-0 drop-shadow-[-5px_4px_1px_rgba(0,0,0,0.10)]'></div>
                <div className='w-1/5'></div>
              </div>
            </div>

            <div className='border-2 rounded-full border-gray-400 w-6/7'></div>

            {/* bottom handle */}
            <div className='w-full flex flex-1 items-end justify-start flex-col'>
              <div className="w-full h-1/6"></div>
              <div className='flex w-full justify-end h-full'>
                <div className='border-5 rounded-full border-gray-500 h-1/4 w-0 drop-shadow-[-5px_4px_1px_rgba(0,0,0,0.10)]'></div>
                <div className='w-1/5'></div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>


      {/* feet */}
      <div className='absolute top-full left-0 w-full flex justify-evenly'>
        <div className='w-1/5 rounded-full border-4 border-gray-500'></div>
        <div className='w-1/5 rounded-full border-4 border-gray-500'></div>
      </div>


      {/* the insides of the fridge */}
      <div className='w-full h-full bg-gray-100 rounded-lg border-8 border-gray-300'>

      </div>

    </div>
  )
}