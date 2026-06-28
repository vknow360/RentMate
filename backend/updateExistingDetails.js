const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Property = require('./src/models/Property');
const Review = require('./src/models/Review');
const Inquiry = require('./src/models/Inquiry');

dotenv.config();

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

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const updateDetails = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for migration of details...');

    // 1. Update Property Descriptions
    const properties = await Property.find({});
    console.log(`Updating descriptions for ${properties.length} properties...`);
    let propCount = 0;
    for (const property of properties) {
      const type = property.propertyType || 'PG';
      const descList = propertyDescriptions[type] || propertyDescriptions['PG'];
      property.description = getRandomElement(descList);
      await property.save();
      propCount++;
    }
    console.log(`Successfully updated descriptions for ${propCount} properties.`);

    // 2. Update Reviews
    const reviews = await Review.find({});
    console.log(`Updating comments for ${reviews.length} reviews...`);
    let reviewCount = 0;
    for (const review of reviews) {
      review.comment = getRandomElement(studentReviews);
      await review.save();
      reviewCount++;
    }
    console.log(`Successfully updated comments for ${reviewCount} reviews.`);

    // 3. Update Inquiries
    const inquiries = await Inquiry.find({});
    console.log(`Updating chat messages for ${inquiries.length} inquiries...`);
    let inquiryCount = 0;
    for (const inquiry of inquiries) {
      const template = getRandomElement(inquiryChatTemplates);
      const numMessages = Math.min(inquiry.messages.length || 1, template.length);
      
      inquiry.messages = template.slice(0, numMessages).map((msg, index) => ({
        sender: msg.sender,
        text: msg.text,
        timestamp: new Date(Date.now() - (numMessages - index) * 3600000 - Math.floor(Math.random() * 1800000))
      }));
      
      await inquiry.save();
      inquiryCount++;
    }
    console.log(`Successfully updated chat messages for ${inquiryCount} inquiries.`);

    console.log('\n--- Migration of Details Complete ---');
    process.exit(0);
  } catch (error) {
    console.error('Error migrating details:', error);
    process.exit(1);
  }
};

updateDetails();
