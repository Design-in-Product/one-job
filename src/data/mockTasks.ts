import { Task } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';

// Realistic demo tasks that showcase the One Job experience
export const mockTasks: Task[] = [
  {
    id: uuidv4(),
    title: "Fix the login bug on staging",
    description: "Users can't log in with special characters in passwords. Check the auth validation logic and add proper escaping.",
    completed: false,
    status: 'todo',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    sortOrder: 1,
    source: 'Demo',
    substacks: [
      {
        id: uuidv4(),
        name: "Backend fixes",
        tasks: [
          {
            id: uuidv4(),
            title: "Review password validation regex",
            description: "Check if special characters are being escaped properly",
            completed: false,
            createdAt: new Date(),
            sortOrder: 1
          },
          {
            id: uuidv4(),
            title: "Add unit tests for edge cases",
            description: "Test passwords with @, #, $, % symbols",
            completed: false,
            createdAt: new Date(),
            sortOrder: 2
          }
        ]
      }
    ]
  },
  {
    id: uuidv4(),
    title: "Write documentation for the new API endpoints",
    description: "Document the user management endpoints we added last sprint. Include examples and error codes.",
    completed: false,
    status: 'todo',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    sortOrder: 2,
    source: 'Demo'
  },
  {
    id: uuidv4(),
    title: "Review Sarah's pull request",
    description: "She added the dark mode toggle. Need to test it on different browsers and provide feedback.",
    completed: false,
    status: 'todo',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    sortOrder: 3,
    source: 'Demo'
  },
  {
    id: uuidv4(),
    title: "Buy groceries for weekend",
    description: "Need milk, eggs, bread, and ingredients for pasta dinner with friends on Saturday.",
    completed: false,
    status: 'todo',
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    sortOrder: 4,
    source: 'Demo',
    substacks: [
      {
        id: uuidv4(),
        name: "Shopping list",
        tasks: [
          {
            id: uuidv4(),
            title: "Dairy: Milk, eggs, cheese",
            description: "Get the organic stuff from the back",
            completed: false,
            createdAt: new Date(),
            sortOrder: 1
          },
          {
            id: uuidv4(),
            title: "Pasta ingredients: tomatoes, basil, garlic",
            description: "Fresh basil from the herb section",
            completed: false,
            createdAt: new Date(),
            sortOrder: 2
          },
          {
            id: uuidv4(),
            title: "Wine for dinner",
            description: "Something Italian to pair with pasta",
            completed: false,
            createdAt: new Date(),
            sortOrder: 3
          }
        ]
      }
    ]
  },
  {
    id: uuidv4(),
    title: "Prepare presentation for Monday's meeting",
    description: "Create slides about Q1 performance metrics and Q2 goals. Include the new user acquisition charts.",
    completed: false,
    status: 'todo',
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    sortOrder: 5,
    source: 'Demo'
  },
  // Some completed tasks to show the completed view
  {
    id: uuidv4(),
    title: "Update Node.js to latest version",
    description: "Upgrade from v16 to v18 and test all dependencies",
    completed: true,
    status: 'done',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    sortOrder: 0,
    source: 'Demo'
  },
  {
    id: uuidv4(),
    title: "Call mom for her birthday",
    description: "Don't forget to wish her happy birthday and ask about the garden",
    completed: true,
    status: 'done',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    sortOrder: 0,
    source: 'Demo'
  },
  {
    id: uuidv4(),
    title: "Set up CI/CD pipeline for new project",
    description: "Configure GitHub Actions for automated testing and deployment",
    completed: true,
    status: 'done',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    completedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
    sortOrder: 0,
    source: 'Demo'
  }
];

// Demo messages to show when certain actions are performed
export const demoMessages = {
  taskCompleted: [
    "Great job! 🎉 In a real app, this would sync to your backend.",
    "Task completed! ✅ This is how satisfying it feels to finish something.",
    "Nice work! 👏 One less thing on your mind.",
    "Completed! 🚀 Ready for the next challenge?"
  ],
  taskDeferred: [
    "Task moved to bottom of stack. 📚 It'll come back when you're ready.",
    "No worries! 🌸 Sometimes later is better than never.",
    "Deferred successfully. ⏰ Focus on what's urgent first.",
    "Task postponed. 🔄 You can tackle it when the time is right."
  ],
  taskAdded: [
    "New task added! 📝 It's been queued up for you.",
    "Task created! ✨ Ready to tackle it?",
    "Added to your stack! 📋 One more step toward your goals.",
    "New task ready! 🎯 You've got this!"
  ],
  substackCreated: [
    "Substack created! 📚 Break big tasks into smaller wins.",
    "Great way to organize! 🗂️ Substacks make complex work manageable.",
    "Substack ready! 📋 Divide and conquer approach activated.",
    "Perfect! 🎯 Breaking it down makes it less overwhelming."
  ]
};

// Get random message for demo feedback
export const getRandomDemoMessage = (type: keyof typeof demoMessages): string => {
  const messages = demoMessages[type];
  return messages[Math.floor(Math.random() * messages.length)];
};