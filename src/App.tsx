import { useBingoGame } from './hooks/useBingoGame';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { BingoModal } from './components/BingoModal';
import { CardDeckScreen } from './components/CardDeckScreen';

function App() {
  const {
    gameState,
    board,
    winningSquareIds,
    showBingoModal,
    mascotLine,
    mascotKey,
    soundOn,
    currentCard,
    cardKey,
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
        foundCount={foundCount}
        skippedCount={skippedCount}
        onDraw={drawCard}
        onResolve={resolveCard}
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
      {showBingoModal && (
        <BingoModal onDismiss={dismissModal} />
      )}
    </>
  );
}

export default App;
