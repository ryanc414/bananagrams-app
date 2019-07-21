import React from 'react';
import './App.css';

const App: React.FC = () => {
  const size = 10;
  const aCode = "A".charCodeAt(0);
  const tiles = [...Array(21)].map((_, i) => String.fromCharCode(aCode + i));

  return (
    <div className="App">
      <Grid width={size} height={size} />
      <br />
      <TileRack tiles={tiles} />
    </div>
  );
}

function Grid(props: {width: number, height: number}) {
    const grid = (
      [...Array(props.height)]
        .map((_, y) => <GridRow width={props.width} y={y} key={y} />
        )
      );

    console.log(grid);

    return (
      <div className="grid">
        {grid}
      </div>
    );
}

function GridRow(props: {y: number, width: number}) {
  const grid_row = (
    [...Array(props.width)]
      .map((_, x) => <GridElement position={[x, props.y]} key={x} />)
  );

  return (
    <div className="grid-row">
      {grid_row}
    </div>
  );
}

function GridElement(props: {position: Array<number>}) {
  return (
    <button className="grid-element" onClick={() => console.log("click")}>
    </button>
  );
}

function TileRack(props: {tiles: Array<string>}) {
  const tile_row = props.tiles.map((letter) => <Tile letter={letter} />);
  return (
    <div className="tile-row">
      {tile_row}
    </div>
  );
}

function Tile(props: {letter: string}) {
  return (
    <button
      className="grid-element"
      onClick={() => console.log("clicked " + props.letter)}
    >
      {props.letter}
    </button>
  );
}

export default App;

