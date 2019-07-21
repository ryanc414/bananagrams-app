import React from 'react';
import './App.css';

const App: React.FC = () => {
  const size = 10;

  return (
    <div className="App">
      <Grid width={size} height={size} />
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
      {props.position[0]}
    </button>
  );
}

export default App;
