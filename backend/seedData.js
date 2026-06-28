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
    const cityData = {
      Delhi: {
        colleges: ['Delhi University', 'JNU', 'IIT Delhi'],
        localities: ['Saket', 'Karol Bagh', 'Hauz Khas', 'Rajouri Garden', 'Kamla Nagar', 'GTB Nagar', 'Dwarka', 'Lajpat Nagar', 'Vasant Kunj']
      },
      Mumbai: {
        colleges: ['Mumbai University', 'IIT Bombay'],
        localities: ['Andheri West', 'Powai', 'Bandra West', 'Juhu', 'Dadar', 'Borivali', 'Chembur', 'Goregaon']
      },
      Bangalore: {
        colleges: ['Bangalore University', 'IISc Bangalore', 'PES University'],
        localities: ['Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'BTM Layout', 'Jayanagar', 'Electronic City']
      },
      Pune: {
        colleges: ['Pune University', 'COEP Pune', 'Symbiosis International'],
        localities: ['Kothrud', 'Viman Nagar', 'Hinjewadi', 'Koregaon Park', 'Baner', 'Wakad', 'Shivajinagar']
      },
      Hyderabad: {
        colleges: ['IIT Hyderabad', 'Osmania University', 'IIIT Hyderabad'],
        localities: ['Gachibowli', 'Madhapur', 'Jubilee Hills', 'Banjara Hills', 'Kondapur', 'Kukatpally', 'Ameerpet']
      }
    };

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

    const propertyDescriptions = {
      PG: [
        "A fully furnished PG ideal for students and young professionals. Located in a safe and gated society with 24/7 security. Includes high-speed WiFi, daily room cleaning, laundry facility, and three home-cooked meals (North & South Indian veg food) served daily. Zero hassle living close to top colleges and metro stations.",
        "Modern co-living space designed for students. Offers spacious single and double sharing rooms. Facilities include air conditioning, high-speed internet, power backup, and filtered drinking water. Wardrobes, study tables, and comfortable beds are provided in every room. Safe environment with biometric entry.",
        "Cozy PG accommodation for girls/boys with all modern amenities. Located in a peaceful residential area. Comes with attached bathrooms, geyser, refrigerator, and a common lounge area. Close to local markets, shopping complexes, and public transport. Home-like food is cooked in a clean kitchen.",
        "Affordable student PG offering comfortable double and triple sharing rooms. Located within walking distance of the college campus. Rent includes WiFi, cleaning services, and electricity backup. CCTV surveillance and a warden are present on-site 24/7 to ensure complete safety."
      ],
      Apartment: [
        "Beautiful and spacious apartment in a premium high-rise society. Features semi-furnished rooms with wardrobes, modular kitchen, and private balconies. The society has excellent amenities including a gym, swimming pool, club house, and landscaped gardens. Perfect for students looking to share a flat.",
        "Conveniently located apartment in a vibrant neighborhood. Close to colleges, restaurants, and shopping complexes. Comes with split air conditioners, geysers, modular kitchen cabinets, and parking space. Highly secure building with gated access and security guards. Rent is negotiable for long-term stays.",
        "Spacious flat available for rent, ideal for group sharing among students or working professionals. Located in a quiet locality with easy access to metro and bus stops. Features large airy bedrooms, a commodious living room, and a fully functional kitchen area. 24/7 water supply and low maintenance charges."
      ],
      Hostel: [
        "Premium student hostel featuring modern dormitory-style and private rooms. Equipped with study desks, study lamps, individual wardrobes, and high-speed internet. Common areas include a recreation room, TV lounge, and a rooftop cafe. Strict security with biometric access and CCTV coverage.",
        "Clean and disciplined student hostel near major colleges. Offers spacious rooms with neat beds, study tables, and adequate ventilation. Dining hall serves healthy, hygienic meals three times a day. Facilities include laundry machines, water coolers, and recreation zones. Perfect environment for focused study."
      ],
      'Shared Room': [
        "Cozy shared room in a well-maintained apartment. Ideal for budget-conscious students. Shared kitchen facilities available for self-cooking. High-speed internet and electricity bills are split among roommates. Located in a friendly neighborhood with easy access to transport.",
        "Comfortable shared living space in a premium PG. Offers shared double room with all amenities included in rent. Friendly roommates, quiet study hours, and home-like atmosphere. Close to local cafes, food stalls, and public library. Weekly cleaning included."
      ]
    };

    const studentReviews = [
      "The PG is extremely clean and rooms are very spacious. The food quality is much better than other PGs in this area. Highly recommended for students!",
      "Great place to stay. Very close to the metro station which makes commuting to college super easy. Security is good and the warden is helpful.",
      "Owner is very friendly and resolves issues quickly. The WiFi speed is decent. Only downside is the strict gate timing (10:30 PM), but otherwise it's perfect.",
      "Excellent flatmates and a very peaceful study environment. The society amenities like the gym and park are great additions. Worth the rent!",
      "Living here for a year now. The laundry service is a life saver. The rooms are well-ventilated and get good sunlight. Satisfied with the service.",
      "Very safe PG for girls. Biometric entry and CCTV cameras make us feel secure. The rent is slightly high but the facilities justify the cost.",
      "Awesome hostel life. Met some great friends here. The common area and rooftop are nice places to hang out after classes. Food is decent.",
      "Nice and quiet room, perfect for exam preparation. The kitchen facility is clean, and we can cook our own meals if needed. Great value for money."
    ];

    const inquiryChatTemplates = [
      [
        { sender: 'student', text: "Hi, I am interested in this property. Is the sharing room still available?" },
        { sender: 'owner', text: "Yes, it is available. Would you like to come for a visit tomorrow?" },
        { sender: 'student', text: "Sure! What is the security deposit and is food included in the rent?" },
        { sender: 'owner', text: "Deposit is two months rent. Yes, breakfast and dinner are included in the package." },
        { sender: 'student', text: "Great. Can you share the exact location? I will visit around 4 PM." },
        { sender: 'owner', text: "Sure, sending the location pin. See you tomorrow!" }
      ],
      [
        { sender: 'student', text: "Hello, what are the gate timings for this PG? Is there any restriction on entry?" },
        { sender: 'owner', text: "Hello! The main gate closes at 10 PM for safety. Late entries are allowed with prior permission." },
        { sender: 'student', text: "Okay, that works. Are visitors allowed inside the room?" },
        { sender: 'owner', text: "Parents are allowed in the room during daytime. Friends are allowed only in the visitor lounge." },
        { sender: 'student', text: "Got it, thank you for the information. I'll get back to you." }
      ],
      [
        { sender: 'student', text: "Hi! Is the flat semi-furnished or fully furnished? Are AC and geyser installed?" },
        { sender: 'owner', text: "Hi! It is semi-furnished with modular kitchen, wardrobes, and geyser. AC can be installed on request." },
        { sender: 'student', text: "Understood. How are electricity and water charges calculated?" },
        { sender: 'owner', text: "Water is free. Electricity is as per the sub-meter reading of your room." }
      ]
    ];

    const colleges = [
      'Delhi University', 'Mumbai University', 'Bangalore University', 'Pune University', 'JNU', 'IIT Delhi', 'IIT Bombay',
      'IISc Bangalore', 'PES University', 'COEP Pune', 'Symbiosis International', 'IIT Hyderabad', 'Osmania University', 'IIIT Hyderabad'
    ];
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

      const chosenCity = faker.helpers.arrayElement(cities);
      const cityDetails = cityData[chosenCity] || cityData['Delhi'];
      const locality = faker.helpers.arrayElement(cityDetails.localities);
      const nearestCollege = faker.helpers.arrayElement(cityDetails.colleges);
      const propertyType = faker.helpers.arrayElement(propTypes);

      const nameList = indianPropertyNames[propertyType] || indianPropertyNames['PG'];
      const baseName = faker.helpers.arrayElement(nameList);
      const title = `${baseName}, ${locality}`;

      let cityLat, cityLng;
      if (chosenCity === 'Delhi') {
        cityLat = faker.location.latitude({ max: 28.7, min: 28.5 });
        cityLng = faker.location.longitude({ max: 77.3, min: 77.1 });
      } else if (chosenCity === 'Mumbai') {
        cityLat = faker.location.latitude({ max: 19.2, min: 18.9 });
        cityLng = faker.location.longitude({ max: 73.0, min: 72.8 });
      } else if (chosenCity === 'Bangalore') {
        cityLat = faker.location.latitude({ max: 13.1, min: 12.9 });
        cityLng = faker.location.longitude({ max: 77.7, min: 77.5 });
      } else if (chosenCity === 'Pune') {
        cityLat = faker.location.latitude({ max: 18.6, min: 18.4 });
        cityLng = faker.location.longitude({ max: 74.0, min: 73.8 });
      } else if (chosenCity === 'Hyderabad') {
        cityLat = faker.location.latitude({ max: 17.5, min: 17.3 });
        cityLng = faker.location.longitude({ max: 78.6, min: 78.4 });
      } else {
        cityLat = 20.5937;
        cityLng = 78.9629;
      }

      fakeProperties.push({
        ownerId: owner._id,
        title: title,
        description: faker.helpers.arrayElement(propertyDescriptions[propertyType] || propertyDescriptions['PG']),
        rent: faker.number.int({ min: 5000, max: 40000 }),
        deposit: faker.number.int({ min: 5000, max: 80000 }),
        city: chosenCity,
        locality: locality,
        nearestCollege: nearestCollege,
        propertyType: propertyType,
        sharingType: faker.helpers.arrayElement(sharingTypes),
        vacancyStatus: faker.datatype.boolean({ probability: 0.8 }) ? 'available' : 'full',
        isVerified: faker.datatype.boolean({ probability: 0.7 }),
        amenities: propertyAmenities,
        images: images,
        latitude: cityLat,
        longitude: cityLng
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

      const template = faker.helpers.arrayElement(inquiryChatTemplates);
      const numMessages = faker.number.int({ min: 1, max: template.length });
      const messages = template.slice(0, numMessages).map((msg, index) => ({
        sender: msg.sender,
        text: msg.text,
        timestamp: new Date(Date.now() - (numMessages - index) * 3600000 - faker.number.int({ min: 1000, max: 1800000 }))
      }));

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
        comment: faker.helpers.arrayElement(studentReviews)
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
