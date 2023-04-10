import React, { useState, useEffect } from "react";
import "./App.css";

async function loadFiveLetterWords() {
  try {
    const response = await fetch(process.env.PUBLIC_URL + "/sowpods.txt");
    const text = await response.text();
    const words = text
      .split("\n")
      .filter((word) => word.length === 5)
      .map((word) => word.toLowerCase());
    return words;
  } catch (error) {
    console.error("Error loading word list:", error);
    return [];
  }
}

function App() {
  const [startingWord] = useState("state");
  const [endingWord] = useState("leash");
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [step, setStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [previousWord, setPreviousWord] = useState(startingWord);

  const [hasWon, setHasWon] = useState(false);
  const [justWon, setJustWon] = useState(false);

  const [fiveLetterWords, setFiveLetterWords] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const words = await loadFiveLetterWords();
      setFiveLetterWords(words);
    }

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setGuess(e.target.value.toLowerCase());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isValidWord(guess)) {
      setErrorMessage("Not a valid word.");
      return;
    }

    if (guess.length !== 5) {
      setErrorMessage("Please enter a 5-letter word.");
      return;
    }

    console.log("Submitted guess:", guess);

    // Update the steps counter for every submitted guess
    setStep(step + 1);

    // Add your game logic here
    if (!isValidTransformation(guess, previousWord)) {
      setErrorMessage("Invalid transformation.");
      return;
    }

    if (guess === endingWord) {
      // Handle the win condition here, e.g., show a message or perform some action
      console.log("User has won!");
      setHasWon(true);
      setJustWon(true);
    }

    // Update guesses only when the transformation is valid
    setGuesses([...guesses, guess]);
    setPreviousWord(guess);

    // Reset the input field
    setGuess("");
    setErrorMessage("");
  };

  const isValidWord = (word) => {
    return fiveLetterWords.includes(word);
  };

  const isValidTransformation = (currentWord, previousWord) => {
    if (currentWord.length !== previousWord.length) {
      return false;
    }

    const letterCount = (word) => {
      const count = {};
      for (let letter of word) {
        count[letter] = (count[letter] || 0) + 1;
      }
      return count;
    };

    const currentWordCount = letterCount(currentWord);
    const previousWordCount = letterCount(previousWord);

    let commonLettersCount = 0;

    for (let letter in currentWordCount) {
      if (previousWordCount[letter]) {
        commonLettersCount += Math.min(
          currentWordCount[letter],
          previousWordCount[letter]
        );
      }
    }

    console.log("Common letters count:", commonLettersCount);

    return currentWord.length - commonLettersCount === 1;
  };

  const getWinMessage = (steps) => {
    if (steps <= 5) {
      return "You're a genius!";
    } else if (steps <= 10) {
      return "Great job!";
    } else if (steps <= 15) {
      return "Nice work!";
    } else {
      return "You did it!";
    }
  };

  const highlightedText = (guess, index) => {
    const correctLetters = [];
    const presentLetters = [];
    const usedLetters = new Set();

    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === endingWord[i]) {
        correctLetters.push(i);
        usedLetters.add(i);
      }
    }

    for (let i = 0; i < guess.length; i++) {
      if (!correctLetters.includes(i) && endingWord.includes(guess[i])) {
        const letterCountInEndingWord = endingWord.split(guess[i]).length - 1;
        const letterCountInGuess =
          guess.slice(0, i + 1).split(guess[i]).length - 1;
        const letterCountInUsedLetters = [...usedLetters].filter(
          (index) => guess[index] === guess[i]
        ).length;

        if (
          letterCountInGuess <= letterCountInEndingWord &&
          letterCountInUsedLetters < letterCountInEndingWord
        ) {
          presentLetters.push(i);
          usedLetters.add(i);
        }
      }
    }

    return (
      <div className="highlighted-text">
        {guess.split("").map((letter, idx) => (
          <span
            key={idx}
            className={`tile-letter ${
              correctLetters.includes(idx)
                ? "correct-letter"
                : presentLetters.includes(idx)
                ? "present-letter"
                : ""
            } ${justWon && index === guesses.length - 1 ? "winning" : ""}`}
            style={
              justWon && index === guesses.length - 1
                ? { animationDelay: `${idx * 0.1}s` }
                : {}
            }
          >
            {letter}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="App">
      <header>
        <h1>LetterLeap</h1>
      </header>
      <main>
        <div className="word-pair">
          <h2>{startingWord}</h2>
          <h2> {endingWord}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={guess}
            onChange={handleInputChange}
            maxLength="5"
          />
          <button type="submit">Submit</button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {hasWon && <p className="win-message">{getWinMessage(step)}</p>}
        <div className="progress-counter">
          <p>Steps: {step}</p>
        </div>
        <div className="guess-history">
          {guesses.map((guess, index) => (
            <div className="guess-item" key={index}>
              {highlightedText(guess, index)}
            </div>
          ))}
        </div>
      </main>
      <footer>
        <p>Created by Tobi</p>
      </footer>
    </div>
  );
}

export default App;
