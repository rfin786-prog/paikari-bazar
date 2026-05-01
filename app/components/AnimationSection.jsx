'use client';

import { motion } from 'framer-motion';

export default function HeroWholesale() {
  return (
    <section className="w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

        {/* LEFT SIDE */}
        <div>
          <p className="inline-block bg-orange-500/20 text-orange-300 px-4 py-1 rounded-full text-sm font-semibold mb-4">
            রেজিস্টার্ড দোকানদারদের জন্য
          </p>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            বাজারে না গিয়েও <br />
            <span className="text-orange-400">পাইকারি মাল নিন</span>
          </h1>

          <p className="mt-5 text-lg md:text-xl text-blue-100 leading-relaxed max-w-xl">
            আপনার দোকানের প্রয়োজনীয় পণ্য এখন মোবাইলেই অর্ডার করুন।
            দ্রুত সরবরাহ, সহজ অর্ডার, নির্ভরযোগ্য সেবা।
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-4">
            <button className="bg-orange-500 hover:bg-orange-600 transition px-7 py-4 rounded-xl text-lg font-bold shadow-lg">
              আজই অর্ডার করুন
            </button>

            <button className="border border-white/30 hover:bg-white/10 transition px-7 py-4 rounded-xl text-lg font-semibold">
              দাম দেখুন
            </button>
          </div>

          <div className="mt-7 space-y-2 text-blue-100 text-sm md:text-base">
            <p>✔ দ্রুত সরবরাহ</p>
            <p>✔ সহজ পুনরায় অর্ডার</p>
            <p>✔ নির্ভরযোগ্য পাইকারি সেবা</p>
          </div>
        </div>

        {/* RIGHT SIDE ANIMATION */}
        <div className="relative h-[420px] md:h-[500px] w-full">

          {/* shop */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="absolute bottom-0 left-6 w-48 h-44 bg-yellow-100 rounded-t-xl shadow-2xl border-4 border-yellow-200"
          >
            <div className="bg-red-500 text-center py-2 font-bold text-white text-sm rounded-t-lg">
              আপনার দোকান
            </div>

            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="h-12 bg-white rounded"></div>
              <div className="h-12 bg-white rounded"></div>
              <div className="h-12 bg-white rounded"></div>

              <div className="h-12 bg-white rounded"></div>
              <div className="h-12 bg-white rounded"></div>
              <div className="h-12 bg-white rounded"></div>
            </div>
          </motion.div>

          {/* worried owner */}
          <motion.div
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.6,
            }}
            className="absolute bottom-10 left-56 text-5xl"
          >
            😟
          </motion.div>

          {/* mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: [0, 0, 1, 1],
              scale: [0.6, 0.6, 1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className="absolute top-8 left-24 w-28 h-48 bg-white rounded-3xl shadow-2xl border-4 border-gray-200 p-3 text-black"
          >
            <div className="text-xs font-bold mb-2 text-center">অর্ডার</div>

            <div className="space-y-2 text-[10px]">
              <div className="bg-gray-100 rounded p-1">সিগারেট</div>
              <div className="bg-gray-100 rounded p-1">বিস্কুট</div>
              <div className="bg-gray-100 rounded p-1">নুডলস</div>
              <div className="bg-gray-100 rounded p-1">পানীয়</div>
            </div>

            <div className="mt-3 bg-green-500 text-white text-center text-[10px] py-1 rounded">
              অর্ডার সম্পন্ন
            </div>
          </motion.div>

          {/* truck */}
          <motion.div
            animate={{
              x: [-250, 0, 240],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute bottom-6 left-0 flex items-end"
          >
            <div className="w-28 h-16 bg-gray-200 rounded-t-lg border-2 border-gray-300"></div>
            <div className="w-16 h-12 bg-orange-500 rounded-t-lg border-2 border-orange-600"></div>

            <div className="absolute -bottom-4 left-4 w-6 h-6 bg-black rounded-full"></div>
            <div className="absolute -bottom-4 left-24 w-6 h-6 bg-black rounded-full"></div>
            <div className="absolute -bottom-4 left-36 w-6 h-6 bg-black rounded-full"></div>
          </motion.div>

          {/* route dots */}
          <div className="absolute bottom-20 left-48 right-10 border-t-4 border-dashed border-white/30"></div>

          {/* texts */}
          <motion.div
            animate={{ opacity: [1, 0, 0, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-2 right-2 bg-black/40 px-4 py-2 rounded-xl text-sm"
          >
            মাল শেষ হয়ে গেছে?
          </motion.div>

          <motion.div
            animate={{ opacity: [0, 1, 0, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-2 right-2 bg-black/40 px-4 py-2 rounded-xl text-sm"
          >
            মোবাইলেই অর্ডার করুন
          </motion.div>

          <motion.div
            animate={{ opacity: [0, 0, 1, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-2 right-2 bg-black/40 px-4 py-2 rounded-xl text-sm"
          >
            দ্রুত ডেলিভারি
          </motion.div>
        </div>
      </div>
    </section>
  );
}
