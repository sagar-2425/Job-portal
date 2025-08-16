// server/seed/seed.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

// Import models
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

const MONGO_URI =
  'mongodb+srv://yadam:Banti1298@jobportal.uzlewft.mongodb.net/';

const skillsArray = [
  'JavaScript',
  'Python',
  'Java',
  'C#',
  'React',
  'Node.js',
  'MongoDB',
  'SQL',
  'AWS',
  'Docker',
  'Kubernetes',
  'TypeScript',
  'HTML',
  'CSS',
  'Angular',
  'Vue.js',
  'Express',
  'GraphQL',
  'SASS',
  'Redux',
  'REST API',
  'CI/CD',
];

const jobTypes = ['Full-time', 'Part-time', 'Remote'];
const statuses = ['Applied'];
const locations = [
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Mumbai',
  'Delhi',
  'Chennai',
  'Gurgaon',
  'Noida',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Chandigarh',
  'Indore',
  'Kochi',
  'Remote',
];
const indianCompanies = [
  'Tata Consultancy Services',
  'Infosys',
  'Wipro',
  'HCL Technologies',
  'Tech Mahindra',
  'Larsen & Toubro Infotech',
  'Mindtree',
  'Mphasis',
  'Persistent Systems',
  'Cognizant India',
  'Accenture India',
  'Capgemini India',
  'IBM India',
  'Amazon India',
  'Flipkart',
  'Zomato',
  'Swiggy',
  'Paytm',
  'Ola Cabs',
  "BYJU'S",
  'Freshworks',
];

const customQuestionsPool = [
  {
    label: 'Why are you interested in this job?',
    type: 'text',
    required: true,
  },
  {
    label: 'Describe a challenging project you worked on.',
    type: 'textarea',
    required: false,
  },
  { label: 'What is your expected salary?', type: 'text', required: false },
  {
    label: 'Are you willing to relocate?',
    type: 'select',
    required: true,
    options: ['Yes', 'No', 'Maybe'],
  },
  {
    label: 'How many years of experience do you have?',
    type: 'text',
    required: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
    ]);
    console.log('Cleared User, Job, and Application collections');

    // --- 1. Create Recruiters (with Indian companies) ---
    const recruiterInfos = [];
    for (let i = 0; i < 5; i++) {
      const company = indianCompanies[i % indianCompanies.length];
      recruiterInfos.push({
        name: faker.person.fullName(),
        email: `recruiter${i + 1}@jobnest.com`,
        password: await bcrypt.hash('password123', 10),
        role: 'recruiter',
        company,
        location: faker.helpers.arrayElement(locations),
        website: faker.internet.url(),
        bio: faker.lorem.sentence(),
      });
    }
    const recruiters = await User.insertMany(recruiterInfos);
    console.log('Created 5 recruiters');

    // --- 2. Create Seekers ---
    const seekerPromises = [];
    for (let i = 0; i < 20; i++) {
      const passwordHash = await bcrypt.hash('password123', 10);
      const skills = faker.helpers.arrayElements(
        skillsArray,
        faker.number.int({ min: 3, max: 8 })
      );
      seekerPromises.push(
        User.create({
          name: faker.person.fullName(),
          email: `seeker${i + 1}@jobnest.com`,
          password: passwordHash,
          role: 'seeker',
          location: faker.helpers.arrayElement(locations),
          bio: faker.lorem.sentence(),
          skills,
        })
      );
    }
    const seekers = await Promise.all(seekerPromises);
    console.log('Created 20 job seekers');

    // --- 3. Create Jobs (with custom questions and requirements) ---
    const jobPromises = [];
    for (let i = 0; i < 30; i++) {
      const recruiter = recruiters[i % recruiters.length];
      const customQuestions = faker.helpers.arrayElements(
        customQuestionsPool,
        faker.number.int({ min: 1, max: 3 })
      );
      jobPromises.push(
        Job.create({
          title: faker.person.jobTitle(),
          description: faker.lorem.paragraphs(2),
          requirements: faker.helpers
            .arrayElements(skillsArray, faker.number.int({ min: 2, max: 5 }))
            .join(', '),
          company: recruiter.company, // Always set to an Indian company
          recruiterId: recruiter._id,
          location: faker.helpers.arrayElement(locations),
          type: faker.helpers.arrayElement(jobTypes),
          salaryRange: {
            min: faker.number.int({ min: 400000, max: 1200000 }), // INR per annum
            max: faker.number.int({ min: 1200001, max: 3500000 }),
          },
          tags: faker.helpers.arrayElements(
            skillsArray,
            faker.number.int({ min: 2, max: 5 })
          ),
          isActive: true,
          customQuestions,
        })
      );
    }
    const jobs = await Promise.all(jobPromises);
    console.log('Created 30 jobs with custom questions');

    // --- 4. Create Applications (with custom answers) ---
    const usedPairs = new Set();
    const applicationPromises = [];
    while (applicationPromises.length < 50) {
      const seeker = faker.helpers.arrayElement(seekers);
      const job = faker.helpers.arrayElement(jobs);
      const pairKey = `${seeker._id}_${job._id}`;
      if (usedPairs.has(pairKey)) continue;
      usedPairs.add(pairKey);

      // Generate custom answers as an array (index matches job.customQuestions)
      const customAnswers = (job.customQuestions || []).map((q) => {
        if (q.type === 'select' && q.options) {
          return faker.helpers.arrayElement(q.options);
        }
        return faker.lorem.sentence();
      });

      applicationPromises.push(
        Application.create({
          seekerId: seeker._id,
          jobId: job._id,
          name: seeker.name,
          email: seeker.email,
          resumeUrl: faker.internet.url(),
          coverLetter: faker.lorem.paragraph(),
          status: faker.helpers.arrayElement(statuses),
          customAnswers,
        })
      );
    }
    const applications = await Promise.all(applicationPromises);
    console.log('Created 50 applications with custom answers');

    // --- 5. Link applications to jobs' applicants array ---
    for (const app of applications) {
      await Job.findByIdAndUpdate(app.jobId, {
        $addToSet: { applicants: app._id },
      });
    }
    console.log('Linked applications to jobs (applicants array)');

    console.log('\n--- SEEDING COMPLETE ---');
    console.log(
      'Recruiter logins: recruiter1@jobnest.com ... recruiter5@jobnest.com'
    );
    console.log('Seeker logins: seeker1@jobnest.com ... seeker20@jobnest.com');
    console.log('Password for all: password123');
    console.log('Use any generated email with password123 to login');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
