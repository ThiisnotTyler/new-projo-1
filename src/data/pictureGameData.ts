/**
 * ==============================================================================
 * PICTURE GUESSING GAME DATA CONFIGURATION
 * ==============================================================================
 * This file contains all items used in the picture-based "A or B" guessing game.
 * 
 * To add a new character or picture to guess:
 * 1. Duplicate one of the objects inside DEFAULT_PICTURE_ITEMS below.
 * 2. Provide a unique `id` (e.g. 'char-01', 'item-02').
 * 3. Set `imageUrl` to the web image URL.
 * 4. Fill in `prompt`, `optionA`, `optionB`, and `correctAnswer` ('A' or 'B').
 * 5. Write the `informationBehindPicture` that reveals who or what they are!
 * 6. Optionally customize `correctFeedbackMessage` and `incorrectFeedbackMessage`.
 * ==============================================================================
 */

import { PictureItem } from '../types/game';

export const DEFAULT_PICTURE_ITEMS: PictureItem[] = [
  {
    id: 'pic-1',
    prompt: 'Who is depicted in this historical portrait?',
    category: 'Historical Figures',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/640px-Albert_Einstein_Head.jpg',
    optionA: {
      label: 'Albert Einstein',
      description: 'Theoretical Physicist',
    },
    optionB: {
      label: 'Niels Bohr',
      description: 'Quantum Pioneer',
    },
    correctAnswer: 'A',
    correctFeedbackMessage: 'Spot on! You identified the father of general relativity.',
    incorrectFeedbackMessage: 'Not quite! This is Albert Einstein, not Niels Bohr.',
    informationBehindPicture: 'Albert Einstein (1879–1955) developed the theory of relativity, which revolutionized theoretical physics and astronomy. He received the 1921 Nobel Prize in Physics for his discovery of the law of the photoelectric effect.',
    funFact: 'He did not wear socks because he found they frequently developed holes and were unnecessary.',
    globalAccuracy: 92,
  },
  {
    id: 'pic-2',
    prompt: 'Identify this iconic architectural wonder:',
    category: 'World Landmarks',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/640px-Taj_Mahal_%28Edited%29.jpeg',
    optionA: {
      label: 'Bibi Ka Maqbara',
      description: 'The "Tomb of the Lady"',
    },
    optionB: {
      label: 'Taj Mahal',
      description: 'Mausoleum in Agra',
    },
    correctAnswer: 'B',
    correctFeedbackMessage: 'Correct! An indisputable architectural masterpiece.',
    incorrectFeedbackMessage: 'Incorrect! This is the famed Taj Mahal in Agra, India.',
    informationBehindPicture: 'Commissioned in 1631 by Mughal Emperor Shah Jahan to house the tomb of his favorite wife, Mumtaz Mahal. The ivory-white marble mausoleum on the Yamuna river attracts millions of travelers annually.',
    funFact: 'Over 20,000 artisans and 1,000 elephants were used to construct the monument complex.',
    globalAccuracy: 88,
  },
  {
    id: 'pic-3',
    prompt: 'Which rare creature is shown in this wildlife capture?',
    category: 'Creatures & Wildlife',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Red_Panda_%282519107245%29.jpg/640px-Red_Panda_%282519107245%29.jpg',
    optionA: {
      label: 'Red Panda',
      description: 'Arboreal mammal of the Himalayas',
    },
    optionB: {
      label: 'Ring-Tailed Lemur',
      description: 'Primate native to Madagascar',
    },
    correctAnswer: 'A',
    correctFeedbackMessage: 'Excellent eye! You recognized the Red Panda.',
    incorrectFeedbackMessage: 'Fooled you! It is a Red Panda, not a Ring-Tailed Lemur.',
    informationBehindPicture: 'The Red Panda (Ailurus fulgens) is native to the eastern Himalayas and southwestern China. Despite its name, it is not closely related to the giant panda, belonging instead to its own unique taxonomic family, Ailuridae.',
    funFact: 'Red Pandas have a modified wrist bone that acts like a "false thumb" to grip bamboo stalks.',
    globalAccuracy: 74,
  },
  {
    id: 'pic-4',
    prompt: 'Which famous painting from the Louvre is this masterpiece?',
    category: 'Fine Art',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/640px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    optionA: {
      label: 'Mona Lisa',
      description: 'Painted by Leonardo da Vinci',
    },
    optionB: {
      label: 'Lady with an Ermine',
      description: 'Portrait of Cecilia Gallerani',
    },
    correctAnswer: 'A',
    correctFeedbackMessage: 'Classic! The most famous portrait in human history.',
    incorrectFeedbackMessage: 'Incorrect! This is the legendary Mona Lisa (La Gioconda).',
    informationBehindPicture: 'Painted by Leonardo da Vinci between 1503 and 1519, the Mona Lisa depicts Lisa Gherardini. Famous for her subtle, enigmatic smile and revolutionary use of sfumato shading.',
    funFact: 'In 1911, the painting was stolen from the Louvre by an employee who hid it in his coat, making it a worldwide sensation.',
    globalAccuracy: 95,
  },
  {
    id: 'pic-5',
    prompt: 'Is this vehicle an authentic rover on Mars or the Moon?',
    category: 'Space Exploration',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/NASA_Mars_Rover.jpg/640px-NASA_Mars_Rover.jpg',
    optionA: {
      label: 'Lunar Roving Vehicle (Moon)',
      description: 'Apollo 15-17 Moon Buggy',
    },
    optionB: {
      label: 'Curiosity / Perseverance (Mars)',
      description: 'Robotic Mars Surface Explorer',
    },
    correctAnswer: 'B',
    correctFeedbackMessage: 'Right on! That is NASA\'s Martian exploration rover.',
    incorrectFeedbackMessage: 'Not quite! This robotic rover explores the surface of Mars.',
    informationBehindPicture: 'NASA\'s robotic Mars rovers (like Curiosity and Perseverance) are car-sized robotic laboratories designed to seek signs of ancient habitability and gather core samples on the Red Planet.',
    funFact: 'Curiosity sang "Happy Birthday" to itself in 2013 by vibrating its soil analysis instrument.',
    globalAccuracy: 81,
  },
  {
    id: 'pic-6',
    prompt: 'Which celestial body captured by NASA is shown here?',
    category: 'Astronomy',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/640px-The_Blue_Marble_%28remastered%29.jpg',
    optionA: {
      label: 'Planet Earth ("The Blue Marble")',
      description: 'Apollo 17 iconic view',
    },
    optionB: {
      label: 'Neptune',
      description: 'The outermost ice giant',
    },
    correctAnswer: 'A',
    correctFeedbackMessage: 'Well done! That is our home planet from space.',
    incorrectFeedbackMessage: 'Incorrect! This is the famous "Blue Marble" photograph of Earth.',
    informationBehindPicture: 'Taken on December 7, 1972, by the crew of Apollo 17 at a distance of about 29,000 kilometers (18,000 miles), showing Africa, Antarctica, and the Arabian Peninsula.',
    funFact: 'It is one of the most widely reproduced images in human history.',
    globalAccuracy: 96,
  },
];

const STORAGE_ITEMS_KEY = 'picture_game_custom_items';

/**
 * Retrieves the active list of picture items (from localStorage or defaults).
 */
export function getPictureItems(): PictureItem[] {
  if (typeof window === 'undefined') return DEFAULT_PICTURE_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_ITEMS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(DEFAULT_PICTURE_ITEMS));
      return DEFAULT_PICTURE_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PICTURE_ITEMS;
  } catch {
    return DEFAULT_PICTURE_ITEMS;
  }
}

/**
 * Saves modified or newly added picture items into persistent storage.
 */
export function savePictureItems(items: PictureItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage issues
  }
}

/**
 * Resets picture items back to default starters.
 */
export function resetToDefaultItems(): PictureItem[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(DEFAULT_PICTURE_ITEMS));
  }
  return DEFAULT_PICTURE_ITEMS;
}
