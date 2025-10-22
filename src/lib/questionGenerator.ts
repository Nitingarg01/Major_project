// Question Generator Service for DSA and Aptitude rounds
export interface DSAProblem {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  examples: Array<{
    input: string
    output: string
    explanation?: string
  }>
  testCases: Array<{
    id: string
    input: string
    expectedOutput: string
    description?: string
    hidden?: boolean
  }>
  constraints: string[]
  topics: string[]
  hints?: string[]
}

export interface AptitudeQuestion {
  id: string
  type: 'verbal' | 'numerical' | 'logical' | 'spatial' | 'abstract'
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit?: number
  image?: string
}

export class QuestionGenerator {
  private static instance: QuestionGenerator

  public static getInstance(): QuestionGenerator {
    if (!QuestionGenerator.instance) {
      QuestionGenerator.instance = new QuestionGenerator();
    }
    return QuestionGenerator.instance;
  }

  // DSA Problem databases by difficulty and company
  private dsaProblems: { [key: string]: DSAProblem[] } = {
    easy: [
      {
        id: 'two-sum',
        title: 'Two Sum',
        difficulty: 'easy',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
        examples: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].';
          },
          {
            input: 'nums = [3,2,4], target = 6',
            output: '[1,2]'
          }
        ],
        testCases: [
          { id: '1', input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
          { id: '2', input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
          { id: '3', input: '[3,3]\n6', expectedOutput: '[0,1]' },
          { id: '4', input: '[1,2,3,4,5]\n8', expectedOutput: '[2,4]', hidden: true }
        ],
        constraints: [
          '2 <= nums.length <= 10^4',
          '-10^9 <= nums[i] <= 10^9',
          '-10^9 <= target <= 10^9',
          'Only one valid answer exists.'
        ],
        topics: ['Array', 'Hash Table'],
        hints: [
          'Try using a hash map to store the numbers you\'ve seen',
          'For each number, check if target - number exists in your hash map',
          'The time complexity can be O(n) with proper use of hash table'
        ]
      },
      {
        id: 'palindrome-number',
        title: 'Palindrome Number',
        difficulty: 'easy',
        description: 'Given an integer x, return true if x is palindrome integer. An integer is a palindrome when it reads the same backward as forward.',
        examples: [
          {
            input: 'x = 121',
            output: 'true',
            explanation: '121 reads as 121 from left to right and from right to left.'
          },
          {
            input: 'x = -121',
            output: 'false',
            explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.'
          }
        ],
        testCases: [
          { id: '1', input: '121', expectedOutput: 'true' },
          { id: '2', input: '-121', expectedOutput: 'false' },
          { id: '3', input: '10', expectedOutput: 'false' },
          { id: '4', input: '0', expectedOutput: 'true' }
        ],
        constraints: [
          '-2^31 <= x <= 2^31 - 1';
        ],
        topics: ['Math'],
        hints: [
          'Could you solve it without converting the integer to a string?',
          'Try reversing half of the number'
        ]
      }
    ],
    medium: [
      {
        id: 'add-two-numbers',
        title: 'Add Two Numbers',
        difficulty: 'medium',
        description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.',
        examples: [
          {
            input: 'l1 = [2,4,3], l2 = [5,6,4]',
            output: '[7,0,8]',
            explanation: '342 + 465 = 807.';
          }
        ],
        testCases: [
          { id: '1', input: '[2,4,3]\n[5,6,4]', expectedOutput: '[7,0,8]' },
          { id: '2', input: '[0]\n[0]', expectedOutput: '[0]' },
          { id: '3', input: '[9,9,9,9,9,9,9]\n[9,9,9,9]', expectedOutput: '[8,9,9,9,0,0,0,1]' }
        ],
        constraints: [
          'The number of nodes in each linked list is in the range [1, 100].',
          '0 <= Node.val <= 9',
          'It is guaranteed that the list represents a number that does not have leading zeros.'
        ],
        topics: ['Linked List', 'Math', 'Recursion'],
        hints: [
          'Keep track of the carry using a variable',
          'Handle the case where one list is longer than the other',
          'Don\'t forget about the final carry'
        ]
      },
      {
        id: 'longest-substring',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'medium',
        description: 'Given a string s, find the length of the longest substring without repeating characters.',
        examples: [
          {
            input: 's = "abcabcbb"',
            output: '3',
            explanation: 'The answer is "abc", with the length of 3.'
          },
          {
            input: 's = "bbbbb"',
            output: '1',
            explanation: 'The answer is "b", with the length of 1.'
          }
        ],
        testCases: [
          { id: '1', input: '"abcabcbb"', expectedOutput: '3' },
          { id: '2', input: '"bbbbb"', expectedOutput: '1' },
          { id: '3', input: '"pwwkew"', expectedOutput: '3' },
          { id: '4', input: '""', expectedOutput: '0' }
        ],
        constraints: [
          '0 <= s.length <= 5 * 10^4',
          's consists of English letters, digits, symbols and spaces.'
        ],
        topics: ['Hash Table', 'String', 'Sliding Window'],
        hints: [
          'Use a sliding window approach',
          'Keep track of character positions using a hash map',
          'When you find a duplicate, move the left pointer'
        ]
      }
    ],
    hard: [
      {
        id: 'median-sorted-arrays',
        title: 'Median of Two Sorted Arrays',
        difficulty: 'hard',
        description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
        examples: [
          {
            input: 'nums1 = [1,3], nums2 = [2]',
            output: '2.0',
            explanation: 'merged array = [1,2,3] and median is 2.';
          },
          {
            input: 'nums1 = [1,2], nums2 = [3,4]',
            output: '2.5',
            explanation: 'merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.';
          }
        ],
        testCases: [
          { id: '1', input: '[1,3]\n[2]', expectedOutput: '2.0' },
          { id: '2', input: '[1,2]\n[3,4]', expectedOutput: '2.5' },
          { id: '3', input: '[]\n[1]', expectedOutput: '1.0' }
        ],
        constraints: [
          'nums1.length == m',
          'nums2.length == n',
          '0 <= m <= 1000',
          '0 <= n <= 1000',
          '1 <= m + n <= 2000',
          '-10^6 <= nums1[i], nums2[i] <= 10^6';
        ],
        topics: ['Array', 'Binary Search', 'Divide and Conquer'],
        hints: [
          'Use binary search to find the correct partition',
          'Ensure the left half has the same or one more element than the right half',
          'Check if the partition is correct by comparing boundary elements'
        ]
      }
    ]
  }

  private aptitudeQuestions: { [key: string]: AptitudeQuestion[] } = {
    verbal: [
      {
        id: 'verbal-1',
        type: 'verbal',
        question: 'Choose the word that best completes the sentence: "The new policy will _____ significant changes in the workflow."',
        options: ['necessitate', 'alleviate', 'deteriorate', 'fabricate'],
        correctAnswer: 0,
        explanation: 'Necessitate means to make necessary as a result or consequence, which fits the context.',
        difficulty: 'medium',
        timeLimit: 60
      },
      {
        id: 'verbal-2',
        type: 'verbal',
        question: 'Select the antonym of "Benevolent":',
        options: ['Kind', 'Malevolent', 'Generous', 'Charitable'],
        correctAnswer: 1,
        explanation: 'Malevolent is the opposite of benevolent (kind/generous).',
        difficulty: 'easy',
        timeLimit: 45
      },
      {
        id: 'verbal-3',
        type: 'verbal',
        question: 'Choose the correct word: "The team\'s performance was _____ despite the challenging circumstances."',
        options: ['exemplary', 'exemplarary', 'examplary', 'exemplery'],
        correctAnswer: 0,
        explanation: 'Exemplary is the correct spelling meaning serving as a desirable model.',
        difficulty: 'medium',
        timeLimit: 50
      }
    ],
    numerical: [
      {
        id: 'numerical-1',
        type: 'numerical',
        question: 'If a product costs $80 after a 20% discount, what was the original price?',
        options: ['$96', '$100', '$104', '$120'],
        correctAnswer: 1,
        explanation: 'If $80 is 80% of the original price, then original price = $80 ÷ 0.8 = $100',
        difficulty: 'medium',
        timeLimit: 90
      },
      {
        id: 'numerical-2',
        type: 'numerical',
        question: 'A train travels 240 miles in 4 hours. What is its average speed in miles per hour?',
        options: ['55 mph', '60 mph', '65 mph', '70 mph'],
        correctAnswer: 1,
        explanation: 'Average speed = Total distance ÷ Total time = 240 ÷ 4 = 60 mph',
        difficulty: 'easy',
        timeLimit: 60
      },
      {
        id: 'numerical-3',
        type: 'numerical',
        question: 'If 3x + 7 = 22, what is the value of x?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 2,
        explanation: '3x + 7 = 22, so 3x = 15, therefore x = 5',
        difficulty: 'easy',
        timeLimit: 75
      }
    ],
    logical: [
      {
        id: 'logical-1',
        type: 'logical',
        question: 'All roses are flowers. Some flowers fade quickly. Therefore:',
        options: [
          'All roses fade quickly',
          'Some roses fade quickly',
          'No roses fade quickly',
          'Cannot be determined'
        ],
        correctAnswer: 3,
        explanation: 'We cannot determine if roses specifically fade quickly based on the given information.',
        difficulty: 'medium',
        timeLimit: 75
      },
      {
        id: 'logical-2',
        type: 'logical',
        question: 'If all A are B, and all B are C, then:',
        options: [
          'All A are C',
          'Some A are C',
          'No A are C',
          'Cannot be determined'
        ],
        correctAnswer: 0,
        explanation: 'By transitive property, if all A are B and all B are C, then all A are C.',
        difficulty: 'easy',
        timeLimit: 60
      }
    ],
    spatial: [
      {
        id: 'spatial-1',
        type: 'spatial',
        question: 'Which shape comes next in the sequence: Circle, Square, Triangle, Circle, Square, ?',
        options: ['Circle', 'Square', 'Triangle', 'Pentagon'],
        correctAnswer: 2,
        explanation: 'The pattern repeats every 3 shapes: Circle, Square, Triangle.',
        difficulty: 'easy',
        timeLimit: 45
      },
      {
        id: 'spatial-2',
        type: 'spatial',
        question: 'How many cubes are there in a 3×3×3 arrangement?',
        options: ['9', '18', '27', '36'],
        correctAnswer: 2,
        explanation: '3 × 3 × 3 = 27 cubes in total.',
        difficulty: 'easy',
        timeLimit: 60
      }
    ]
  }

  // Generate DSA problems based on company and difficulty
  generateDSAProblems(
    companyName: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 1;
  ): DSAProblem[] {
    const problems = this.dsaProblems[difficulty] || this.dsaProblems.medium;

    // Company-specific problem selection
    let selectedProblems = [...problems]
    
    if (companyName.toLowerCase() === 'google' || companyName.toLowerCase() === 'meta') {
      // Prefer algorithm-heavy problems
      selectedProblems = problems.filter(p => 
        p.topics.includes('Array') || p.topics.includes('Hash Table') || p.topics.includes('Binary Search')
      )
    } else if (companyName.toLowerCase() === 'amazon') {
      // Prefer practical problems
      selectedProblems = problems.filter(p => 
        p.topics.includes('String') || p.topics.includes('Array') || p.topics.includes('Linked List')
      )
    }

    // Fallback to all problems if no specific matches
    if (selectedProblems.length === 0) {
      selectedProblems = problems;
    }

    // Shuffle and select
    const shuffled = selectedProblems.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  // Generate aptitude questions based on types and difficulty
  generateAptitudeQuestions(
    types: ('verbal' | 'numerical' | 'logical' | 'spatial' | 'abstract')[],
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    questionsPerType: number = 2;
  ): AptitudeQuestion[] {
    const questions: AptitudeQuestion[] = []

    types.forEach(type => {
      const typeQuestions = this.aptitudeQuestions[type] || []
      const filteredQuestions = typeQuestions.filter(q =>;
        q.difficulty === difficulty || difficulty === 'medium';
      )
      
      const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
      questions.push(...shuffled.slice(0, questionsPerType))
    })

    return questions.sort(() => Math.random() - 0.5);
  }

  // Generate company-specific questions mix
  generateCompanySpecificQuestions(
    companyName: string,
    jobLevel: 'entry' | 'mid' | 'senior',
    interviewType: 'technical' | 'behavioral' | 'aptitude' | 'dsa' | 'mixed'
  ): {
    dsaProblems: DSAProblem[]
    aptitudeQuestions: AptitudeQuestion[]
  } {
    let dsaDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
    let aptitudeDifficulty: 'easy' | 'medium' | 'hard' = 'medium';

    // Adjust difficulty based on job level
    switch (jobLevel) {
      case 'entry':
        dsaDifficulty = 'easy';
        aptitudeDifficulty = 'easy';
        break
      case 'senior':
        dsaDifficulty = 'hard';
        aptitudeDifficulty = 'hard';
        break
    }

    // Company-specific adjustments
    const companyLower = companyName.toLowerCase();
    if (['google', 'meta', 'apple'].includes(companyLower)) {
      // Top tech companies are generally harder
      if (dsaDifficulty === 'easy') dsaDifficulty = 'medium';
      if (dsaDifficulty === 'medium') dsaDifficulty = 'hard';
    }

    const dsaProblems = this.generateDSAProblems(companyName, dsaDifficulty, 2);
    
    const aptitudeTypes: ('verbal' | 'numerical' | 'logical' | 'spatial')[] = []
    
    // Different companies focus on different aptitude types
    if (['google', 'microsoft', 'apple'].includes(companyLower)) {
      aptitudeTypes.push('logical', 'numerical', 'spatial')
    } else if (['amazon', 'uber', 'airbnb'].includes(companyLower)) {
      aptitudeTypes.push('logical', 'verbal', 'numerical')
    } else {
      aptitudeTypes.push('verbal', 'numerical', 'logical', 'spatial')
    }

    const aptitudeQuestions = this.generateAptitudeQuestions(
      aptitudeTypes, 
      aptitudeDifficulty, 
      2
    )

    return {
      dsaProblems,
      aptitudeQuestions
    }
  }
}

export default QuestionGenerator;