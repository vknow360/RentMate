const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Expense = require('./src/models/Expense');
const Notification = require('./src/models/Notification');

dotenv.config();

const indianFirstNames = [
  "Aarav", "Amit", "Raj", "Sanjay", "Vikram", "Sunil", "Ramesh", "Anil", "Mahesh", "Suresh", "Vijay", 
  "Deepak", "Sandeep", "Karan", "Rahul", "Neha", "Priya", "Anjali", "Ritu", "Sneha", "Kriti", "Pooja", 
  "Kiran", "Geeta", "Sunita", "Rohan", "Aditya", "Ishaan", "Dev", "Arjun", "Kabir", "Meera"
];
const indianLastNames = [
  "Sharma", "Verma", "Gupta", "Singh", "Patel", "Kumar", "Joshi", "Mehta", "Reddy", "Rao", "Nair", 
  "Iyer", "Choudhury", "Das", "Sen", "Roy", "Mishra", "Pandey", "Trivedi", "Gill", "Bahl", "Kapoor"
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateIndianName = () => {
  return `${getRandomElement(indianFirstNames)} ${getRandomElement(indianLastNames)}`;
};

const studentBios = [
  "Final year student. Looking for a neat and clean roommate. Non-smoker and vegetarian preferred.",
  "Engineering student. Night owl, loves playing football. Quite chilled out.",
  "Preparing for exams. Need a quiet environment. Early bird, mostly keeps to myself.",
  "First year student. Extrovert, loves exploring cafes. Looking for a friendly roommate.",
  "Looking for a roommate to share an apartment. Chilled out person, loves cooking.",
  "Medical student. Mostly busy with studies. Cleanliness is a top priority for me.",
  "Postgrad student. Respectful of privacy, looking for a similar flatmate.",
  "Commerce student, extrovert. Love listening to music. Very clean and organized."
];

const expenseDescriptions = {
  Rent: ["Monthly room rent share", "PG rent payment", "Apartment rent share"],
  Electricity: ["AC electricity bill share", "Electricity bill for June", "Room sub-meter reading charge"],
  Water: ["Drinking water cans supply", "Water tanker charges", "Monthly water bill"],
  Internet: ["Broadband WiFi monthly recharge", "Airtel fiber subscription", "JioFi router balance"],
  Groceries: ["Groceries from local Kirana store", "Milk and egg supplies", "Vegetables and cooking essentials"],
  Other: ["Maid salary share", "Cook salary share", "New room cleaning supplies", "Gas cylinder refilling charges"]
};

const notificationTemplates = [
  "New PG listing 'Sai Ram PG' added near your college",
  "Price dropped for Balaji Luxury PG, check it out now!",
  "Aarav Gupta sent you a roommate compatibility request",
  "New inquiry received for your listing 'Gulmohar Heights'",
  "Your student profile verification is complete and approved",
  "Price dropped by 10% on Krishna PG for Boys",
  "Vacancy status updated for Sai Residency: 1 room available",
  "New review posted for Om PG Accommodation",
  "Neha Singh accepted your roommate invitation",
  "New message received from owner Rahul Sharma"
];

const updateUsersAndExpenses = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for migration of users and expenses...');

    // 1. Update User Names and Bios (excluding hardcoded ones)
    const hardcodedEmails = [
      'rahul.owner@rentmate.com', 'priya.owner@rentmate.com', 'aarav.student@rentmate.com', 
      'neha.student@rentmate.com', 'rohan.student@rentmate.com', 'empty.student@rentmate.com', 
      'suspended.student@rentmate.com', 'suspended.owner@rentmate.com', 'unverified.owner@rentmate.com', 
      'admin@rentmate.com'
    ];
    
    const users = await User.find({ email: { $nin: hardcodedEmails } });
    console.log(`Updating names and bios for ${users.length} random users...`);
    let userCount = 0;
    for (const user of users) {
      user.name = generateIndianName();
      if (user.role === 'student' && user.preferences) {
        user.preferences.bio = getRandomElement(studentBios);
      }
      await user.save();
      userCount++;
    }
    console.log(`Successfully updated ${userCount} users.`);

    // 2. Update Expense Descriptions
    const expenses = await Expense.find({});
    console.log(`Updating descriptions for ${expenses.length} expenses...`);
    let expenseCount = 0;
    for (const exp of expenses) {
      const category = exp.category || 'Other';
      const descList = expenseDescriptions[category] || expenseDescriptions['Other'];
      exp.description = getRandomElement(descList);
      await exp.save();
      expenseCount++;
    }
    console.log(`Successfully updated ${expenseCount} expenses.`);

    // 3. Update Notification Messages
    const notifications = await Notification.find({});
    console.log(`Updating messages for ${notifications.length} notifications...`);
    let notifCount = 0;
    for (const notif of notifications) {
      notif.message = getRandomElement(notificationTemplates);
      await notif.save();
      notifCount++;
    }
    console.log(`Successfully updated ${notifCount} notifications.`);

    console.log('\n--- Users, Expenses & Notifications Migration Complete ---');
    process.exit(0);
  } catch (error) {
    console.error('Error migrating users and expenses:', error);
    process.exit(1);
  }
};

updateUsersAndExpenses();
