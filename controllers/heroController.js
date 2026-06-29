import Hero from "../models/Hero.js";

/**
 * GET Hero Content
 */
export const getHero = async (req, res) => {
  try {
    let hero = await Hero.findOne();

    if (!hero) {
      hero = await Hero.create({
        slides: [
          {
            image: "/images/slide11.avif",
            titleLine1: "Building Foundations.",
            titleLine2: "Shaping Futures.",
            subline:
              "Holistic, disciplined, and inclusive education for every child.",
            description:
              "A disciplined educational ecosystem nurturing academic excellence, character, and opportunity.",
            primaryButton: {
              text: "Explore Our Institutions",
              link: "#institutions",
            },
            secondaryButton: {
              text: "Admissions Open 2026–27",
              link: "/contact",
            },
          },
          {
            image: "/images/slide2.avif",
            titleLine1: "Multi-Institution.",
            titleLine2: "Educational Ecosystem.",
            subline: "",
            description:
              "ERAM operates an integrated educational ecosystem that supports learners across multiple stages of education.",
            primaryButton: {
              text: "Explore Our Institutions",
              link: "#institutions",
            },
            secondaryButton: {
              text: "Admissions Open 2026–27",
              link: "/contact",
            },
          },
          {
            image: "/images/slide3.avif",
            titleLine1: "India's First School with 100% CPR",
            titleLine2: "Trained Teachers & NSS Volunteers",
            subline: "",
            description:
              "Under the SATYAM (WHO–AIIMS–CCET) School First Aid & CPR Project.",
            primaryButton: {
              text: "Explore Our Institutions",
              link: "#institutions",
            },
            secondaryButton: {
              text: "Admissions Open 2026–27",
              link: "/contact",
            },
          },
          {
            image: "/images/slide4.avif",
            titleLine1: "100% Financial",
            titleLine2: "Literacy Initiative",
            subline: "In association with the State Bank of India",
            description:
              "My First Account in My Life – a 100% Financial Literacy Project",
            primaryButton: {
              text: "Explore Our Institutions",
              link: "#institutions",
            },
            secondaryButton: {
              text: "Admissions Open 2026–27",
              link: "/contact",
            },
          },
        ],
      });
    }

    res.status(200).json({
      success: true,
      data: hero,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPDATE Hero Content
 */
export const updateHero = async (req, res) => {
  try {
    let hero = await Hero.findOne();

    if (!hero) {
      hero = new Hero(req.body);
    } else {
      hero.slides = req.body.slides;
    }

    await hero.save();

    res.status(200).json({
      success: true,
      message: "Hero updated successfully",
      data: hero,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPLOAD Hero Slide Image
 */
export const uploadSlideImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file received.",
      });
    }

    const backendBaseUrl = process.env.BACKEND_URL || "http://localhost:5000";
const imageUrl = `${backendBaseUrl}/uploads/hero/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: { image: imageUrl },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// One-time fix: localhost URLs → production URLs
export const fixImageUrls = async (req, res) => {
  try {
    const hero = await Hero.findOne();
    if (!hero) return res.status(404).json({ message: "Not found" });

    hero.slides = hero.slides.map((slide) => ({
      ...slide.toObject(),
      image: slide.image.replace(
        "http://localhost:5000",
        process.env.BACKEND_URL
      ),
    }));

    await hero.save();
    res.json({ success: true, message: "URLs fixed", data: hero });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

