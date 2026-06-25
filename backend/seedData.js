const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const User = require('./src/models/User');
const Property = require('./src/models/Property');
const Inquiry = require('./src/models/Inquiry');
const Expense = require('./src/models/Expense');
const Review = require('./src/models/Review');
const Wishlist = require('./src/models/Wishlist');
const Notification = require('./src/models/Notification');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Mass Data Seeding');

    // Clean existing data except admin
    await User.deleteMany({ role: { $ne: 'admin' } });
    await Property.deleteMany({});
    await Inquiry.deleteMany({});
    await Expense.deleteMany({});
    await Review.deleteMany({});
    await Wishlist.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data (except admin)');

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // ============================================
    // 1. Seed Base Hardcoded Users
    // ============================================
    const hardcodedOwners = [
      { name: 'Rahul Sharma', email: 'rahul.owner@rentmate.com', password, role: 'owner', phone: '9876543210', isVerified: true, profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' },
      { name: 'Priya Patel', email: 'priya.owner@rentmate.com', password, role: 'owner', phone: '8765432109', isVerified: true, profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
      { name: 'Unverified Owner', email: 'unverified.owner@rentmate.com', password, role: 'owner', phone: '1111111111', isVerified: false },
      { name: 'Suspended Owner', email: 'suspended.owner@rentmate.com', password, role: 'owner', phone: '2222222222', isVerified: true, isSuspended: true }
    ];

    const hardcodedStudents = [
      {
        name: 'Aarav Gupta', email: 'aarav.student@rentmate.com', password, role: 'student', phone: '7654321098', college: 'Delhi University', isVerified: true,
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav', isLookingForRoommate: true, preferredCity: 'Delhi',
        preferences: { sleepSchedule: 'night_owl', studyHabits: 'quiet_focused', foodPreference: 'veg', smoking: false, cleanliness: 4, socialType: 'introvert', noiseTolerance: 2, budget: 15000, bio: "I like to keep things quiet." }
      },
      {
        name: 'Neha Singh', email: 'neha.student@rentmate.com', password, role: 'student', phone: '6543210987', college: 'Mumbai University', isVerified: true,
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha', isLookingForRoommate: true, preferredCity: 'Mumbai',
        preferences: { sleepSchedule: 'early_bird', studyHabits: 'group_study', foodPreference: 'non_veg', smoking: false, cleanliness: 5, socialType: 'extrovert', noiseTolerance: 4, budget: 18000, bio: "Always up for a chat." }
      },
      { name: 'Rohan Verma', email: 'rohan.student@rentmate.com', password, role: 'student', phone: '5432109876', college: 'Delhi University', isVerified: false, profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan', isLookingForRoommate: false, preferredCity: 'Delhi' },
      { name: 'Empty Prefs Student', email: 'empty.student@rentmate.com', password, role: 'student', phone: '4444444444', college: 'Unknown College', isVerified: true, isLookingForRoommate: true, preferredCity: 'Delhi' },
      { name: 'Suspended Student', email: 'suspended.student@rentmate.com', password, role: 'student', phone: '5555555555', isVerified: true, isSuspended: true, preferredCity: 'Delhi' }
    ];

    // ============================================
    // 2. Generate Random Owners (Total 25)
    // ============================================
    const fakeOwners = [];
    for (let i = 0; i < 21; i++) {
      fakeOwners.push({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password,
        role: 'owner',
        phone: faker.phone.number({ style: 'national' }).replace(/[^0-9]/g, '').slice(0, 10),
        isVerified: faker.datatype.boolean({ probability: 0.8 }),
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.uuid()}`
      });
    }

    const owners = await User.insertMany([...hardcodedOwners, ...fakeOwners]);
    console.log(`Seeded ${owners.length} Owners`);

    // ============================================
    // 3. Generate Random Students (Total 80)
    // ============================================
    const colleges = ['Delhi University', 'Mumbai University', 'Bangalore University', 'Pune University', 'JNU', 'IIT Delhi', 'IIT Bombay'];
    const sleepOptions = ['early_bird', 'night_owl', 'flexible'];
    const studyOptions = ['quiet_focused', 'group_study', 'flexible'];
    const foodOptions = ['veg', 'non_veg', 'vegan', 'eggetarian'];
    const socialOptions = ['introvert', 'extrovert', 'balanced'];

    const fakeStudents = [];
    for (let i = 0; i < 75; i++) {
      fakeStudents.push({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password,
        role: 'student',
        phone: faker.phone.number({ style: 'national' }).replace(/[^0-9]/g, '').slice(0, 10),
        college: faker.helpers.arrayElement(colleges),
        isVerified: faker.datatype.boolean({ probability: 0.85 }),
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.uuid()}`,
        isLookingForRoommate: faker.datatype.boolean({ probability: 0.7 }),
        preferredCity: faker.helpers.arrayElement(['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad']),
        preferences: {
          sleepSchedule: faker.helpers.arrayElement(sleepOptions),
          studyHabits: faker.helpers.arrayElement(studyOptions),
          foodPreference: faker.helpers.arrayElement(foodOptions),
          smoking: faker.datatype.boolean({ probability: 0.2 }),
          cleanliness: faker.number.int({ min: 1, max: 5 }),
          socialType: faker.helpers.arrayElement(socialOptions),
          noiseTolerance: faker.number.int({ min: 1, max: 5 }),
          budget: faker.number.int({ min: 5000, max: 30000 }),
          bio: faker.person.bio()
        }
      });
    }

    const students = await User.insertMany([...hardcodedStudents, ...fakeStudents]);
    console.log(`Seeded ${students.length} Students`);

    // ============================================
    // 4. Generate Random Properties (Total 60)
    // ============================================
    const propTypes = ['PG', 'Apartment', 'Hostel', 'Shared Room'];
    const sharingTypes = ['single', 'double', 'triple', 'dormitory'];
    const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad'];
    const allAmenities = ['WiFi', 'AC', 'Food Included', 'Laundry', 'Cleaning', 'Kitchen', 'Power Backup', 'Parking', 'Washing Machine', 'Security', 'Gym', 'TV'];

    const apartmentImages = ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80', 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80', 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&q=80', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80', 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', 'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?w=800&q=80', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80', 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=800&q=80', 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&q=80', 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=800&q=80', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80', 'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&q=80', 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80'];

    const fakeProperties = [];
    for (let i = 0; i < 60; i++) {
      // Pick a random owner (give higher chance to hardcoded owners so they have properties)
      const isHardcodedOwner = faker.datatype.boolean({ probability: 0.3 });
      const owner = isHardcodedOwner ? faker.helpers.arrayElement(owners.slice(0, 2)) : faker.helpers.arrayElement(owners);

      const numImages = faker.number.int({ min: 1, max: 4 });
      const images = faker.helpers.arrayElements(apartmentImages, numImages);

      const numAmenities = faker.number.int({ min: 2, max: 8 });
      const propertyAmenities = faker.helpers.arrayElements(allAmenities, numAmenities);

      fakeProperties.push({
        ownerId: owner._id,
        title: faker.lorem.words({ min: 3, max: 7 }),
        description: faker.lorem.paragraph(),
        rent: faker.number.int({ min: 5000, max: 40000 }),
        deposit: faker.number.int({ min: 5000, max: 80000 }),
        city: faker.helpers.arrayElement(cities),
        locality: faker.location.street(),
        nearestCollege: faker.helpers.arrayElement(colleges),
        propertyType: faker.helpers.arrayElement(propTypes),
        sharingType: faker.helpers.arrayElement(sharingTypes),
        vacancyStatus: faker.datatype.boolean({ probability: 0.8 }) ? 'available' : 'full',
        isVerified: faker.datatype.boolean({ probability: 0.7 }),
        amenities: propertyAmenities,
        images: images,
        latitude: faker.location.latitude({ max: 28.7, min: 28.5 }),
        longitude: faker.location.longitude({ max: 77.3, min: 77.1 })
      });
    }

    const properties = await Property.insertMany(fakeProperties);
    console.log(`Seeded ${properties.length} Properties`);

    // ============================================
    // 5. Generate Random Inquiries
    // ============================================
    const statuses = ['pending', 'responded', 'closed'];
    const fakeInquiries = [];

    // Generate ~50 inquiries randomly connecting students and properties
    for (let i = 0; i < 50; i++) {
      const student = faker.helpers.arrayElement(students);
      const property = faker.helpers.arrayElement(properties);
      const status = faker.helpers.arrayElement(statuses);

      const numMessages = faker.number.int({ min: 1, max: 6 });
      const messages = [];
      let currentSender = 'student';

      for (let m = 0; m < numMessages; m++) {
        messages.push({
          sender: currentSender,
          text: faker.lorem.sentence(),
          timestamp: new Date(Date.now() - faker.number.int({ min: 1000, max: 10000000 }))
        });
        currentSender = currentSender === 'student' ? 'owner' : 'student';
      }

      // Sort messages by timestamp
      messages.sort((a, b) => a.timestamp - b.timestamp);

      fakeInquiries.push({
        studentId: student._id,
        ownerId: property.ownerId,
        propertyId: property._id,
        status: status,
        messages: messages
      });
    }
    const inquiries = await Inquiry.insertMany(fakeInquiries);
    console.log(`Seeded ${inquiries.length} Inquiries`);

    // ============================================
    // 6. Generate Random Reviews
    // ============================================
    const fakeReviews = [];
    for (let i = 0; i < 80; i++) {
      fakeReviews.push({
        propertyId: faker.helpers.arrayElement(properties)._id,
        studentId: faker.helpers.arrayElement(students)._id,
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentences({ min: 1, max: 3 })
      });
    }
    await Review.insertMany(fakeReviews);
    console.log(`Seeded ${fakeReviews.length} Reviews`);

    // ============================================
    // 7. Seed Wishlists
    // ============================================
    const fakeWishlists = [];
    for (let i = 0; i < 40; i++) {
      fakeWishlists.push({
        studentId: faker.helpers.arrayElement(students)._id,
        propertyId: faker.helpers.arrayElement(properties)._id
      });
    }
    await Wishlist.insertMany(fakeWishlists);
    console.log(`Seeded ${fakeWishlists.length} Wishlists`);

    // ============================================
    // 8. Generate Random Expenses & Groups
    // ============================================
    const householdGroups = ['Delhi Apartment A', 'Mumbai Flatmates', 'Bangalore PG Boys'];
    const fakeExpenses = [];
    const expenseCategories = ['Rent', 'Electricity', 'Water', 'Internet', 'Groceries', 'Other'];

    // We will select a small subset of students to be in groups so we can easily test
    for (const group of householdGroups) {
      // Pick 3-4 random students for this group
      const groupStudents = faker.helpers.arrayElements(students, faker.number.int({ min: 3, max: 5 }));

      const numExpenses = faker.number.int({ min: 5, max: 15 });
      for (let i = 0; i < numExpenses; i++) {
        const paidBy = faker.helpers.arrayElement(groupStudents)._id;
        // Splitting between 2 to all members
        const splitBetween = faker.helpers.arrayElements(groupStudents, faker.number.int({ min: 2, max: groupStudents.length })).map(s => s._id);
        if (!splitBetween.includes(paidBy)) splitBetween.push(paidBy); // Make sure payer is in split

        fakeExpenses.push({
          groupId: group,
          createdBy: faker.helpers.arrayElement(groupStudents)._id,
          category: faker.helpers.arrayElement(expenseCategories),
          amount: faker.number.int({ min: 500, max: 25000 }),
          description: faker.lorem.words(3),
          splitBetween: splitBetween,
          paidBy: paidBy
        });
      }
    }
    await Expense.insertMany(fakeExpenses);
    console.log(`Seeded ${fakeExpenses.length} Expenses across ${householdGroups.length} Groups`);

    // ============================================
    // 9. Generate Random Notifications
    // ============================================
    const fakeNotifications = [];
    const notifTypes = ['new_listing', 'price_drop', 'vacancy', 'roommate_match', 'inquiry'];
    for (let i = 0; i < 100; i++) {
      fakeNotifications.push({
        userId: faker.datatype.boolean() ? faker.helpers.arrayElement(owners)._id : faker.helpers.arrayElement(students)._id,
        type: faker.helpers.arrayElement(notifTypes),
        message: faker.lorem.sentence(),
        isRead: faker.datatype.boolean({ probability: 0.4 }),
        relatedId: faker.datatype.boolean() ? faker.helpers.arrayElement(properties)._id : undefined
      });
    }
    await Notification.insertMany(fakeNotifications);
    console.log(`Seeded ${fakeNotifications.length} Notifications`);

    const { recomputeAllMatches } = require('./src/services/roommateService');
    await recomputeAllMatches();
    console.log('Pre-computed roommate matches');

    console.log('\n--- Seeding Complete ---');
    console.log('Use the hardcoded accounts to login easily, or check MongoDB for the generated users.');
    console.log('Owner 1: rahul.owner@rentmate.com (password123)');
    console.log('Student 1: aarav.student@rentmate.com (password123)');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
