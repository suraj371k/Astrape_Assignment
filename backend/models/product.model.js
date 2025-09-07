import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
      lowercase: true, // Automatically convert to lowercase
      enum: {
        values: [
          "electronics",
          "clothing",
          "books",
          "home",
          "sports",
          "accessories",
        ],
        message: "{VALUE} is not a valid category",
      },
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    images: [
      {
        url: {
          type: String,
          required: true
        },
        alt: {
          type: String,
          default: "Product image",
        },
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Optional: Track who created the product
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Uncomment if you want this to be required
      // required: [true, "Creator is required"],
    },
    // Optional: Track product status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true,
    // Add indexes for better query performance
    indexes: [
      { category: 1 },
      { price: 1 },
      { isFeatured: 1 },
      { isActive: 1 },
    ]
  }
);

// Add a virtual for calculating average rating
productSchema.virtual('averageRating').get(function() {
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10; // Round to 1 decimal
  }
  return 0;
});

// Update ratings and numReviews when reviews change
productSchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.ratings = Math.round((sum / this.reviews.length) * 10) / 10;
    this.numReviews = this.reviews.length;
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;