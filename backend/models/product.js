export default class Product {
  constructor(
    id,
    name,
    description,
    categoryId,
    price,
    salesType,
    dateOfCreation,
    prodavacId,
    ponude = [],
    reviewByBuyer = false,
    reviewBySeller = false,
    status = "Processing", 
    location = "",
    isDeleted = false,
    image = null
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.categoryId = categoryId; 
    this.price = price;
    this.salesType = salesType;
    this.dateOfCreation = dateOfCreation;
    this.prodavacId = prodavacId;
    this.ponude = ponude;
    this.reviewByBuyer = reviewByBuyer; 
    this.reviewBySeller = reviewBySeller; 
    this.status = status;
    this.location = location;
    this.isDeleted = isDeleted;
    this.image = image;
  }
}
