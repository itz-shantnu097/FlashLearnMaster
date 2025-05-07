import { db } from "./index";
import * as schema from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  try {
    console.log("Seeding database...");
    
    // Seed categories
    console.log("Seeding categories...");
    const categories = [
      {
        name: "Programming",
        description: "Learn programming languages and computer science concepts",
        iconName: "Code",
        slug: "programming"
      },
      {
        name: "Mathematics",
        description: "Explore mathematical concepts from basic to advanced",
        iconName: "Calculator",
        slug: "mathematics"
      },
      {
        name: "Science",
        description: "Discover scientific principles and theories",
        iconName: "Flask",
        slug: "science"
      },
      {
        name: "Languages",
        description: "Study various human languages and linguistics",
        iconName: "Languages",
        slug: "languages"
      },
      {
        name: "Arts & Humanities",
        description: "Explore art, history, philosophy, and culture",
        iconName: "Palette",
        slug: "arts-humanities"
      },
      {
        name: "Business & Economics",
        description: "Learn about business, economics, and finance",
        iconName: "TrendingUp",
        slug: "business-economics"
      }
    ];
    
    for (const category of categories) {
      // Check if category already exists
      const existingCategory = await db.query.categories.findFirst({
        where: (c, { eq }) => eq(c.slug, category.slug)
      });
      
      if (!existingCategory) {
        await db.insert(schema.categories).values({
          ...category,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Created category: ${category.name}`);
      } else {
        console.log(`Category already exists: ${category.name}`);
      }
    }
    
    // Get programming category ID for reference
    const programmingCategory = await db.query.categories.findFirst({
      where: (c, { eq }) => eq(c.slug, "programming")
    });
    
    if (!programmingCategory) {
      console.log("Programming category not found, skipping topics and paths");
    } else {
      // Seed topics
      console.log("Seeding topics...");
      const programmingTopics = [
        {
          name: "Python Fundamentals",
          description: "Learn the basics of Python programming language",
          categoryId: programmingCategory.id,
          difficulty: "beginner",
          keywords: "python,programming,basics,beginner"
        },
        {
          name: "JavaScript Essentials",
          description: "Core concepts of JavaScript for web development",
          categoryId: programmingCategory.id,
          difficulty: "beginner",
          keywords: "javascript,web,frontend,programming"
        },
        {
          name: "Data Structures",
          description: "Fundamental data structures in computer science",
          categoryId: programmingCategory.id,
          difficulty: "intermediate",
          keywords: "data structures,algorithms,computer science"
        },
        {
          name: "Object-Oriented Programming",
          description: "Learn OOP principles and patterns",
          categoryId: programmingCategory.id,
          difficulty: "intermediate",
          keywords: "oop,object-oriented,design patterns"
        }
      ];
      
      for (const topic of programmingTopics) {
        // Check if topic already exists
        const existingTopic = await db.query.topics.findFirst({
          where: (t, { eq }) => eq(t.name, topic.name)
        });
        
        if (!existingTopic) {
          await db.insert(schema.topics).values({
            ...topic,
            createdAt: new Date()
          });
          console.log(`Created topic: ${topic.name}`);
        } else {
          console.log(`Topic already exists: ${topic.name}`);
        }
      }
      
      // Seed a learning path
      console.log("Seeding learning paths...");
      const pythonPathName = "Python Developer Path";
      const existingPath = await db.query.learningPaths.findFirst({
        where: (p, { eq }) => eq(p.name, pythonPathName)
      });
      
      if (!existingPath) {
        // Create Python learning path
        const [pythonPath] = await db.insert(schema.learningPaths).values({
          name: pythonPathName,
          description: "A comprehensive path to becoming a Python developer - from basics to advanced concepts",
          difficulty: "beginner",
          estimatedHours: 40,
          categoryId: programmingCategory.id,
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        console.log(`Created learning path: ${pythonPathName}`);
        
        // Add steps to the path
        const pathSteps = [
          {
            pathId: pythonPath.id,
            title: "Python Basics",
            description: "Learn the fundamentals of Python language",
            topicName: "Python Fundamentals",
            stepOrder: 1,
            isRequired: true,
            estimatedMinutes: 120
          },
          {
            pathId: pythonPath.id,
            title: "Data Structures in Python",
            description: "Learn lists, dictionaries, sets, and tuples",
            topicName: "Data Structures in Python",
            stepOrder: 2,
            isRequired: true,
            estimatedMinutes: 180
          },
          {
            pathId: pythonPath.id,
            title: "Object-Oriented Programming",
            description: "Learn classes, objects, inheritance and polymorphism",
            topicName: "Object-Oriented Programming in Python",
            stepOrder: 3,
            isRequired: true,
            estimatedMinutes: 240
          },
          {
            pathId: pythonPath.id,
            title: "File Handling and Modules",
            description: "Work with files and use Python modules",
            topicName: "Python File Handling",
            stepOrder: 4,
            isRequired: true,
            estimatedMinutes: 120
          },
          {
            pathId: pythonPath.id,
            title: "Error Handling",
            description: "Learn about exceptions and error handling",
            topicName: "Python Error Handling",
            stepOrder: 5,
            isRequired: false,
            estimatedMinutes: 90
          }
        ];
        
        for (const step of pathSteps) {
          await db.insert(schema.pathSteps).values(step);
        }
        console.log(`Added ${pathSteps.length} steps to the Python learning path`);
      } else {
        console.log(`Learning path already exists: ${pythonPathName}`);
      }
    }

    // Sample learning session with flashcards and MCQs for Python
    const sessionId = uuidv4();
    
    // Create learning session
    await db.insert(schema.learningSessions).values({
      id: sessionId,
      topic: "Introduction to Python Programming",
      createdAt: new Date()
    });

    // Sample flashcards
    const sampleFlashcards = [
      {
        id: uuidv4(),
        sessionId: sessionId,
        title: "Variables and Data Types",
        content: `<p>In Python, variables are created when you assign a value to them using the equal sign (=):</p>
<pre class="bg-neutral-100 p-3 rounded text-left overflow-x-auto mt-4 mb-4"><code>name = "John"  # String
age = 25      # Integer
height = 1.85  # Float
is_student = True  # Boolean</code></pre>
<p>Unlike some other programming languages, Python is dynamically typed, which means you don't need to declare the type of a variable when you create it.</p>`
      },
      {
        id: uuidv4(),
        sessionId: sessionId,
        title: "Control Flow",
        content: `<p>Python uses indentation (whitespace) to define blocks of code:</p>
<pre class="bg-neutral-100 p-3 rounded text-left overflow-x-auto mt-4 mb-4"><code>if condition:
    # code block
elif another_condition:
    # code block
else:
    # code block</code></pre>
<p>Loops in Python:</p>
<pre class="bg-neutral-100 p-3 rounded text-left overflow-x-auto mt-4 mb-4"><code># For loop
for item in sequence:
    # code block
    
# While loop
while condition:
    # code block</code></pre>`
      },
      {
        id: uuidv4(),
        sessionId: sessionId,
        title: "Functions",
        content: `<p>Functions in Python are defined using the <code>def</code> keyword:</p>
<pre class="bg-neutral-100 p-3 rounded text-left overflow-x-auto mt-4 mb-4"><code>def greet(name):
    return f"Hello, {name}!"
    
# Function call
message = greet("Alice")
print(message)  # Outputs: Hello, Alice!</code></pre>
<p>Python functions can have default parameters and can return multiple values.</p>`
      }
    ];

    // Insert flashcards
    await db.insert(schema.flashcards).values(sampleFlashcards);

    // Sample MCQs
    const sampleMCQs = [
      {
        id: uuidv4(),
        sessionId: sessionId,
        question: "Which of the following is NOT a built-in data type in Python?",
        options: ["Array", "Dictionary", "List", "Tuple"],
        correctAnswer: "A"
      },
      {
        id: uuidv4(),
        sessionId: sessionId,
        question: "What will be the output of the following code: print(3 * 'abc')?",
        options: ["9", "abcabcabc", "Error", "abc3"],
        correctAnswer: "B"
      },
      {
        id: uuidv4(),
        sessionId: sessionId,
        question: "Which of the following is a valid way to comment in Python?",
        options: ["/* comment */", "// comment", "# comment", "<!-- comment -->"],
        correctAnswer: "C"
      },
      {
        id: uuidv4(),
        sessionId: sessionId,
        question: "What does the 'len()' function do in Python?",
        options: [
          "Returns the length of a string, list, or other sequence", 
          "Calculates the absolute value of a number", 
          "Returns the largest number in a list", 
          "Rounds a floating-point number"
        ],
        correctAnswer: "A"
      },
      {
        id: uuidv4(),
        sessionId: sessionId,
        question: "How do you create a list in Python?",
        options: [
          "list = (1, 2, 3)", 
          "list = [1, 2, 3]", 
          "list = {1, 2, 3}", 
          "list = <1, 2, 3>"
        ],
        correctAnswer: "B"
      }
    ];

    // Insert MCQs
    await db.insert(schema.mcqs).values(sampleMCQs);
    
    // Seed a test learning digest
    console.log("Seeding test learning digest...");
    const testDigestExists = await db.query.learningDigests.findFirst({
      where: (d, { eq }) => eq(d.userId, 1)
    });
    
    if (!testDigestExists) {
      await db.insert(schema.learningDigests).values({
        userId: 1,
        weekStartDate: new Date('2025-05-01'),
        weekEndDate: new Date('2025-05-07'),
        totalSessions: 5,
        completedSessions: 3,
        averageScore: 75,
        totalTimeSpentMinutes: 45,
        topCategory: 'Programming',
        topPerformingTopic: 'Python Fundamentals',
        streak: 3,
        pointsEarned: 50,
        insights: JSON.stringify([
          {
            type: 'performance',
            title: 'Good Progress',
            description: 'You\'re making steady progress in your learning journey. Keep it up!'
          },
          {
            type: 'streak',
            title: '3-Day Streak',
            description: 'You\'ve been learning consistently for 3 days in a row!'
          },
          {
            type: 'learning_pattern',
            title: 'Topic Diversity',
            description: 'You\'ve explored multiple programming topics. Expanding your knowledge across different areas can strengthen your overall skills.'
          }
        ]),
        recommendations: JSON.stringify([
          'Try more advanced Python concepts',
          'Practice building a small project with Python',
          'Explore JavaScript to complement your Python knowledge',
          'Consider taking a course on data structures'
        ]),
        createdAt: new Date()
      });
      console.log("Created test learning digest for user ID 1");
    } else {
      console.log("Test learning digest already exists for user ID 1");
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
