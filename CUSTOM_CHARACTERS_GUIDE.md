# Custom Characters & Picture Guessing Guide

This guide explains how to build, edit, and configure custom picture guessing items for the **Dichotomy Picture Guessing Game**.

---

## 1. Quick Overview

In this game, the player is presented with a **single picture** and must decide between **Option A** and **Option B**.

Immediately upon guessing, the game provides:
1. **Accuracy feedback**: Instant correct/incorrect status with custom feedback text.
2. **Post-Guess Backstory**: Comprehensive background information explaining the truth behind the picture.
3. **Fun Facts**: Additional trivia or context clues.

---

## 2. In-App Item Editor (Zero Code Required)

The application includes an in-app **"Manage & Edit Items"** button on the main screen:
- **Edit Existing Items**: Click the edit button on any item card to change prompt text, image URL, Option A/B text, and the revealed backstory.
- **Add New Characters**: Click **"Add New Picture Item"**, fill in the form fields, and click Save.
- **Instant Persistence**: Your edits are stored locally and will be used immediately during gameplay.
- **Reset to Default**: A one-click button restores default items if needed.

---

## 3. Code-Based Configuration (`src/data/pictureGameData.ts`)

You can also customize or batch-import items directly in the code by opening:
`src/data/pictureGameData.ts`

### Data Structure Schema

```typescript
export interface PictureItem {
  id: string;                          // Unique identifier (e.g., 'character-01')
  imageUrl: string;                    // HTTPS URL pointing to the image
  prompt: string;                      // Question or prompt above the picture
  category: string;                    // Category label (e.g. 'Historical Figures')
  optionA: {
    label: string;                     // Text displayed on Option A button
    description?: string;              // Optional short subtitle for Option A
  };
  optionB: {
    label: string;                     // Text displayed on Option B button
    description?: string;              // Optional short subtitle for Option B
  };
  correctAnswer: 'A' | 'B';            // Which option is the correct answer
  correctFeedbackMessage?: string;    // Custom message shown on a CORRECT guess
  incorrectFeedbackMessage?: string;  // Custom message shown on an INCORRECT guess
  informationBehindPicture: string;   // The full backstory revealed after guessing
  funFact?: string;                   // Optional trivia note shown after guessing
  globalAccuracy?: number;            // Community accuracy benchmark percentage (e.g. 85)
}
```

---

## 4. Copy-and-Paste Template for a New Character

Copy this template into `DEFAULT_PICTURE_ITEMS` in `src/data/pictureGameData.ts`:

```typescript
{
  id: 'custom-char-01',
  prompt: 'Who is this famous inventor or historical icon?',
  category: 'Famous Inventors',
  imageUrl: 'https://example.com/your-image-url.jpg',
  optionA: {
    label: 'Nikola Tesla',
    description: 'Pioneer of Alternating Current',
  },
  optionB: {
    label: 'Thomas Edison',
    description: 'Prolific American Inventor',
  },
  correctAnswer: 'A',
  correctFeedbackMessage: 'Brilliant deduction! You correctly identified Nikola Tesla.',
  incorrectFeedbackMessage: 'Not quite! This is Nikola Tesla, not Thomas Edison.',
  informationBehindPicture: 'Nikola Tesla (1856–1943) was a Serbian-American engineer known for his contributions to the design of the modern alternating current (AC) electricity supply system.',
  funFact: 'Tesla had an eidetic (photographic) memory and could visualize complex machinery in three dimensions before building prototypes.',
  globalAccuracy: 78,
}
```

---

## 5. Customizing Feedback Text

| Field | When It Appears | Purpose |
| :--- | :--- | :--- |
| `correctFeedbackMessage` | Player selects the **correct** option | Congratulates the player and highlights what made the deduction right. |
| `incorrectFeedbackMessage` | Player selects the **incorrect** option | Gently corrects the player and reinforces the true answer. |
| `informationBehindPicture` | **Always displayed** immediately after guessing | In-depth context, history, or breakdown explaining the picture. |
| `funFact` | Optional trivia box | Extra memorable detail or trivia point. |

---

## 6. Image Best Practices

- **Aspect Ratio**: Landscape (`16:9` or `4:3`) and square (`1:1`) images look best.
- **Protocols**: Always use secure `https://` URLs.
- **Resilience**: The app includes automatic fallback containers if an image fails to load.
