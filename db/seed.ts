import { db } from "./index";
import * as schema from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  try {
    console.log("Seeding database...");

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

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
