import { useBingoGame } from './hooks/useBingoGame';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { BingoModal } from './components/BingoModal';
import { CardDeckScreen } from './components/CardDeckScreen';

function App() {
  const {
    gameState,
    board,
    winningLines,
    winningSquareIds,
    showBingoModal,
    mascotLine,
    mascotKey,
    soundOn,
    currentCard,
    cardKey,
    deckSize,
    deckDone,
    foundCards,
    foundCount,
    skippedCount,
    startGame,
    startDeck,
    drawCard,
    resolveCard,
    handleSquareClick,
    resetGame,
    dismissModal,
    toggleSound,
  } = useBingoGame();

  if (gameState === 'start') {
    return <StartScreen onStart={startGame} onStartDeck={startDeck} />;
  }

  if (gameState === 'deck') {
    return (
      <CardDeckScreen
        currentCard={currentCard}
        cardKey={cardKey}
        deckSize={deckSize}
        deckDone={deckDone}
        foundCards={foundCards}
        foundCount={foundCount}
        skippedCount={skippedCount}
        mascotLine={mascotLine}
        mascotKey={mascotKey}
        onDraw={drawCard}
        onResolve={resolveCard}
        onReshuffle={startDeck}
        onBack={resetGame}
      />
    );
  }

  return (
    <>
      <GameScreen
        board={board}
        winningSquareIds={winningSquareIds}
        hasBingo={gameState === 'bingo'}
        mascotLine={mascotLine}
        mascotKey={mascotKey}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        onSquareClick={handleSquareClick}
        onReset={resetGame}
      />
      {showBingoModal && winningLines.length > 0 && (
        <BingoModal
          lineType={winningLines[0].type}
          onDismiss={dismissModal}
          onNewCard={startGame}
        />
      )}
    </>
  );
}

export default App;
