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
    <div className="bg-gradient-to-r  from-[#ff5100] to-[#953913]    w-full min-h-[100vh] flex justify-center items-center">
      <div className="flex overflow-hidden rounded-2xl">
        <AnimatePresence>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 146 146"
            width={146}
            height={146}
          >
            <motion.path
              transform="translate(20, 20)"
              d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 15c19.3 0 35 15.7 35 35S69.3 85 50 85 15 69.3 15 50s15.7-35 35-35zm-25 35l25-25 25 25-25 25-25-25z"
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
