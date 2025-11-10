// Add Sample Courses Script
require("dotenv").config();
const pool = require("./db");

async function addSampleCourses() {
  try {
    console.log("🎓 Adding sample courses...");

    // Get instructor ID
    const instructorResult = await pool.query(
      "SELECT user_id FROM users WHERE role = $1 LIMIT 1",
      ["instructor"]
    );

    if (instructorResult.rows.length === 0) {
      console.log("❌ No instructor found. Run createTestUsers.js first.");
      process.exit(1);
    }

    const instructorId = instructorResult.rows[0].user_id;

    // Sample courses with real-looking data
    const courses = [
      {
        title: "Complete Web Development Bootcamp 2025",
        description:
          "Master web development from scratch! Learn HTML5, CSS3, JavaScript, React, Node.js, Express, MongoDB and become a full-stack developer. Build 15+ real-world projects.",
        price: 99.99,
        category: "Web Development",
        level: "Beginner",
        duration: 40,
        thumbnail_url:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
      },
      {
        title: "Python for Data Science & Machine Learning",
        description:
          "Learn Python programming for data analysis, visualization, and machine learning. Master pandas, NumPy, Matplotlib, scikit-learn and TensorFlow with hands-on projects.",
        price: 89.99,
        category: "Data Science",
        level: "Intermediate",
        duration: 35,
        thumbnail_url:
          "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
      },
      {
        title: "Digital Marketing Masterclass 2025",
        description:
          "Complete guide to digital marketing! Master SEO, Google Ads, Facebook Ads, Instagram marketing, email marketing, content marketing and analytics.",
        price: 79.99,
        category: "Marketing",
        level: "Beginner",
        duration: 25,
        thumbnail_url:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
      },
      {
        title: "UI/UX Design Fundamentals",
        description:
          "Learn user interface and user experience design from scratch. Master design thinking, wireframing, prototyping with Figma, Adobe XD and build a professional portfolio.",
        price: 94.99,
        category: "Design",
        level: "Beginner",
        duration: 30,
        thumbnail_url:
          "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
      },
      {
        title: "Machine Learning A-Z: Hands-On Python",
        description:
          "Build powerful machine learning models with Python. Learn supervised & unsupervised learning, neural networks, deep learning with TensorFlow and deploy ML models.",
        price: 109.99,
        category: "Data Science",
        level: "Advanced",
        duration: 45,
        thumbnail_url:
          "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800",
      },
      {
        title: "React Native - Build Mobile Apps",
        description:
          "Build iOS and Android apps with one codebase using React Native. Learn navigation, APIs, authentication, push notifications and publish to App Store & Play Store.",
        price: 99.99,
        category: "Mobile Development",
        level: "Intermediate",
        duration: 38,
        thumbnail_url:
          "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
      },
      {
        title: "AWS Certified Solutions Architect",
        description:
          "Prepare for AWS certification! Master EC2, S3, RDS, Lambda, CloudFormation, VPC and deploy scalable applications on Amazon Web Services cloud platform.",
        price: 119.99,
        category: "Cloud Computing",
        level: "Intermediate",
        duration: 42,
        thumbnail_url:
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
      },
      {
        title: "Complete Graphic Design Course",
        description:
          "Master graphic design with Photoshop, Illustrator, InDesign. Learn typography, color theory, branding, logo design and create stunning visual content.",
        price: 84.99,
        category: "Design",
        level: "Beginner",
        duration: 28,
        thumbnail_url:
          "https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=800",
      },
    ];

    // Check if courses already exist
    const existingCourses = await pool.query(
      "SELECT COUNT(*) FROM courses WHERE instructor_id = $1",
      [instructorId]
    );

    if (parseInt(existingCourses.rows[0].count) > 0) {
      console.log(
        `ℹ️  Found ${existingCourses.rows[0].count} existing courses. Skipping...`
      );
      process.exit(0);
    }

    // Insert courses
    for (const course of courses) {
      await pool.query(
        `INSERT INTO courses (
          instructor_id, title, description, price, category, 
          level, duration_hours, thumbnail_url, status, is_public, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'approved', true, NOW())`,
        [
          instructorId,
          course.title,
          course.description,
          course.price,
          course.category,
          course.level,
          course.duration,
          course.thumbnail_url,
        ]
      );
    }

    console.log(`✅ Successfully added ${courses.length} sample courses!`);
    console.log("\n📚 Courses added:");
    courses.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title} - $${course.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding courses:", error.message);
    process.exit(1);
  }
}

addSampleCourses();
