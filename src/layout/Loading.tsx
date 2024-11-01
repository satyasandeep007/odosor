"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const icon = {
  hidden: {
    opacity: 0,
    pathLength: 0,
    fill: "rgba(255, 255, 255, 0)",
  },
  visible: {
    opacity: 1,
    pathLength: 1,
    fill: "rgba(255, 255, 255, 1)",
  },
};

export const Loading = ({ children }: any) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return !loading ? (
    <div>{children}</div>
  ) : (
    <div className="bg-gradient-to-r  from-blue-700 to-[#0052FF]    w-full min-h-[100vh] flex justify-center items-center">
      <div className="flex overflow-hidden rounded-2xl">
        <AnimatePresence>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 146 146"
            // className="h-96 w-96"
            width={146}
            height={146}
          >
            <motion.path
              transform="translate(20, 20)"
              d="M73.323 123.729C101.617 123.729 124.553 100.832 124.553 72.5875C124.553 44.343 101.617 21.4463 73.323 21.4463C46.4795 21.4463 24.4581 42.0558 22.271 68.2887H89.9859V76.8864H22.271C24.4581 103.119 46.4795 123.729 73.323 123.729Z"
              variants={icon}
              strokeWidth="0.7"
              stroke="rgba(255, 255, 255, 1)"
              strokeLinecap="round"
              initial={{
                opacity: 0,
                pathLength: 0,
                fill: "rgba(255, 255, 255, 0)",
              }}
              animate={{
                opacity: 1,
                pathLength: 1,
                fill: "rgba(255, 255, 255, 1)",
              }}
              transition={{
                default: { duration: 2, yoyo: Infinity, ease: "easeInOut" },
                fill: { duration: 2, ease: "easeInOut" },
              }}
            />
          </svg>
        </AnimatePresence>
      </div>
    </div>
  );
};
