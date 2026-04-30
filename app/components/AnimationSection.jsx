useEffect(() => {
  const width = containerRef.current.offsetWidth;

  const tl = gsap.timeline({ repeat: -1 });

  // 🚚 আসবে
  tl.fromTo(vanRef.current,
    { x: -150 },
    {
      x: width / 2 - 60,
      duration: 3,
      ease: "power2.out"
    }
  )

  // ⏸️ pause
  .to({}, { duration: 0.5 })

  // 📦 box drop
  .fromTo(".box",
    { y: -40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: "bounce.out"
    }
  )

  // ⏸️ pause
  .to({}, { duration: 1 })

  // 🚚 চলে যাবে
  .to(vanRef.current, {
    x: width + 150,
    duration: 3,
    ease: "power2.in"
  })

  // reset
  .set(".box", { opacity: 0, y: -40 })
  .set(vanRef.current, { x: -150 });

}, []);
