import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";

export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      stock,
      isFeatured,
      isActive,
    } = req.body;

    // Normalize and validate required fields robustly
    const normalizedTitle = typeof title === "string" ? title.trim() : "";
    const normalizedDescription =
      typeof description === "string" ? description.trim() : "";
    const normalizedCategory =
      typeof category === "string" ? category.trim() : "";
    const parsedPrice = typeof price === "string" ? Number(price) : price;
    const parsedStock = typeof stock === "string" ? Number(stock) : stock;

    const missingFields = [];
    if (!normalizedTitle) missingFields.push("title");
    if (!normalizedDescription) missingFields.push("description");
    if (!normalizedCategory) missingFields.push("category");
    if (
      parsedPrice === undefined ||
      parsedPrice === null ||
      Number.isNaN(parsedPrice)
    )
      missingFields.push("price");
    if (
      parsedStock === undefined ||
      parsedStock === null ||
      Number.isNaN(parsedStock)
    )
      missingFields.push("stock");

    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
    }

    // Handle images
    let images = [];
    if (req.files && req.files.length > 0) {
      // Multiple images
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        images.push({
          url: result.secure_url,
          alt: file.originalname || "Product image",
        });
      }
    } else if (req.file) {
      // Single image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });
      images.push({
        url: result.secure_url,
        alt: req.file.originalname || "Product image",
      });
    }

    // Create product
    const product = new Product({
      title: normalizedTitle,
      description: normalizedDescription,
      price: parsedPrice,
      category: normalizedCategory,
      stock: parsedStock,
      images,
      isFeatured: isFeatured || false,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id, // Set from authenticated user
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create product", error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      isFeatured,
      inStock,
    } = req.query;

    // Build filter object
    let filter = {};

    // Category filter
    if (category) {
      filter.category = category.toLowerCase();
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        filter.price.$lte = parseFloat(maxPrice);
      }
    }

    // Search filter (searches in title and description)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Featured products filter
    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === "true";
    }

    // In stock filter
    if (inStock !== undefined) {
      if (inStock === "true") {
        filter.stock = { $gt: 0 };
      } else if (inStock === "false") {
        filter.stock = { $lte: 0 };
      }
    }

    // Build sort object
    let sort = {};
    const validSortFields = ["title", "price", "createdAt", "ratings", "stock"];

    if (validSortFields.includes(sortBy)) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort
    }

    // Pagination setup
    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 items per page
    const skip = (pageNumber - 1) * pageSize;

    // Execute queries
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .select("-__v") // Exclude version field
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean(), // Use lean() for better performance
      Product.countDocuments(filter),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalProducts / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    // Build response
    const response = {
      success: true,
      message: "Products fetched successfully",
      data: {
        products,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalProducts,
          pageSize,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? pageNumber + 1 : null,
          prevPage: hasPrevPage ? pageNumber - 1 : null,
        },
        filters: {
          category: category || null,
          priceRange: {
            min: minPrice ? parseFloat(minPrice) : null,
            max: maxPrice ? parseFloat(maxPrice) : null,
          },
          search: search || null,
          isFeatured: isFeatured !== undefined ? isFeatured === "true" : null,
          inStock: inStock !== undefined ? inStock === "true" : null,
          sortBy,
          sortOrder,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const products = await Product.find({
      isFeatured: true,
      stock: { $gt: 0 }, // Only in-stock featured products
    })
      .select("-__v")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      message: "Featured products fetched successfully",
      data: { products },
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
      error: error.message,
    });
  }
};

// Get product search suggestions
export const getProductSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long",
      });
    }

    const suggestions = await Product.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    })
      .select("title category")
      .limit(10)
      .lean();

    // Extract unique suggestions
    const titleSuggestions = suggestions.map((product) => product.title);
    const categorySuggestions = [
      ...new Set(suggestions.map((product) => product.category)),
    ];

    res.status(200).json({
      success: true,
      message: "Search suggestions fetched successfully",
      data: {
        titles: titleSuggestions.slice(0, 5),
        categories: categorySuggestions.slice(0, 3),
      },
    });
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch search suggestions",
      error: error.message,
    });
  }
};

// Get all products created by the authenticated user
export const getUserProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Extract query parameters for pagination
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // Build sort object
    let sort = {};
    const validSortFields = ["title", "price", "createdAt", "ratings", "stock"];
    
    if (validSortFields.includes(sortBy)) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort
    }

    // Pagination setup
    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNumber - 1) * pageSize;

    // Execute queries
    const [products, totalProducts] = await Promise.all([
      Product.find({ createdBy: userId })
        .select("-__v")
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Product.countDocuments({ createdBy: userId })
    ]);


    // Calculate pagination metadata
    const totalPages = Math.ceil(totalProducts / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    res.status(200).json({
      success: true,
      message: "User's products fetched successfully",
      data: {
        products,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalProducts,
          pageSize,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? pageNumber + 1 : null,
          prevPage: hasPrevPage ? pageNumber - 1 : null,
        }
      },
    });
  } catch (error) {
    console.error("Error fetching user products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user's products",
      error: error.message,
    });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
};

// Update product
// Test endpoint to check authentication
export const testAuth = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Authentication working",
      user: req.user,
      userId: req.user.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Test failed",
      error: error.message
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // Only update fields that are present in the request body
    const updateData = { ...req.body };

    // Handle images if provided (optional, adjust as needed)
    if (req.files && req.files.length > 0) {
      // Multiple images
      let images = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        images.push({
          url: result.secure_url,
          alt: file.originalname || "Product image",
        });
      }
      updateData.images = images;
    } else if (req.file) {
      // Single image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });
      updateData.images = [
        {
          url: result.secure_url,
          alt: req.file.originalname || "Product image",
        },
      ];
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update product", error: error.message });
  }
};
