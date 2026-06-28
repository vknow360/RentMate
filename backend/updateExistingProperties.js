const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Property = require('./src/models/Property');

dotenv.config();

const indianPropertyNames = {
  PG: [
    "Sai Ram PG", "Krishna PG for Boys", "Radha Krishna Girls PG", "Ganesh Residency PG", "Balaji Luxury PG",
    "Sri Venkateswara PG", "Laxmi PG for Women", "Saraswati Sadan PG", "Shiva PG", "Om PG Accommodation",
    "Homely PG for Students", "Comfort Stay PG", "Happy Home PG", "Gurukrupa PG", "Durga PG for Girls",
    "Tirupati Executive PG", "Kaveri PG", "Narmada Student PG", "Godavari Co-living PG", "Ganga Boys PG"
  ],
  Apartment: [
    "Gulmohar Heights", "Shanti Niwas Apartments", "Greenwood Residency", "Royal Palms Apartment", "Mayur Vihar Apartments",
    "Skyline Apartments", "Royal Orchid Residency", "Signature Heights", "Vrindavan Gardens", "Swastik Apartments",
    "Tulsi Niwas", "Aditya Residency", "Aniket Apartments", "Elite Homes", "Silver Oak Apartments", "Maple Wood Residency"
  ],
  Hostel: [
    "St. Xavier's Student Hostel", "Yamuna Girls Hostel", "Saraswati Boys Hostel", "Vidya Student Hostel", "Elite Student Hostel",
    "Shivaji Boys Hostel", "Nehru Student Hostel", "Vivekananda Boys Hostel", "Tagore Girls Hostel", "Oxford Student Hostel"
  ],
  'Shared Room': [
    "Cozy Nest Stays", "Divine Co-living", "Homely Co-living Space", "Urban Nest Shared Room", "Comfort Co-living",
    "Swastik Shared Living", "Tulsi Homestay", "Safe Haven Shared Room", "Friends Co-living", "Smart Co-living"
  ]
};

// Helper function to pick a random element from an array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const updateProperties = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for migration...');

    const properties = await Property.find({});
    console.log(`Found ${properties.length} properties in the database.`);

    let updatedCount = 0;
    for (const property of properties) {
      const type = property.propertyType || 'PG';
      const nameList = indianPropertyNames[type] || indianPropertyNames['PG'];
      const baseName = getRandomElement(nameList);
      
      // Combine with existing locality if present, otherwise just the base name
      const locality = property.locality ? property.locality.trim() : '';
      const newTitle = locality ? `${baseName}, ${locality}` : baseName;

      const oldTitle = property.title;
      property.title = newTitle;
      await property.save();

      console.log(`[UPDATED] ID: ${property._id} | "${oldTitle}" -> "${newTitle}"`);
      updatedCount++;
    }

    console.log(`Successfully updated ${updatedCount} properties in the database.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

updateProperties();
