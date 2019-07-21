import React from 'react';
import './App.css';

interface AppState {
  grid_size: number,
  grid: Array<Array<string | null>>,
  tiles: Array<string>,
  selectedTile: number | null,
}

// Top-level App component. Maintains game state and renders sub-components.
class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    const grid_size = 10;
    const aCode = "A".charCodeAt(0);

    let grid = new Array(grid_size).fill(new Array(grid_size).fill(null));
    let tiles = [...Array(21)].map((_, i) => String.fromCharCode(aCode + i));

    this.state = {
      grid_size: 10,
      grid: grid,
      tiles: tiles,
      selectedTile: null,
    };

    this.handleTileClick = this.handleTileClick.bind(this);
    this.handleGridClick = this.handleGridClick.bind(this);
  }

  handleTileClick(pos: number) {
    console.log("Tile " + this.state.tiles[pos] + " clicked.");
    this.setState({...this.state, selectedTile: pos});
  }

  handleGridClick(x: number, y: number) {
    console.log("Grid clicked at (", + x + ", " + y + ").");
  }

  render() {
    return (
      <div className="App">
        <Grid grid_values={this.state.grid} onClick={this.handleGridClick} />
        <br />
        <TileRack
          tiles={this.state.tiles}
          onClick={this.handleTileClick}
          selectedTile={this.state.selectedTile}
        />
      </div>
    );
  }
}

interface GridProps {
  grid_values: Array<Array<string | null>>,
  onClick: (x: number, y: number) => void,
}

// Letter grid that forms the main playing area.
function Grid(props: GridProps) {
    const grid = props.grid_values.map(
      (row, i) => <GridRow
        row_values={row}
        onClick={(x: number) => props.onClick(x, i)}
        key={i}
      />
    );

    return (
      <div className="grid">
        {grid}
      </div>
    );
}

interface GridRowProps {
  row_values: Array<string | null>,
  onClick: (x: number) => void,
}

// Single row of letters within the Grid.
function GridRow(props: GridRowProps) {
  const grid_row = props.row_values.map(
    (value, i) => <GridElement
      value={value}
      onClick={() => props.onClick(i)}
      key={i}
    />
  );

  return (
    <div className="grid-row">
      {grid_row}
    </div>
  );
}

interface GridElementProps {
  value: string | null,
  onClick: () => void,
}

// Render a single element in the grid. A grid may have a letter value if a
// tile is placed, an empty space has a null value.
function GridElement(props: GridElementProps) {
  let value: string;
  if (props.value === null) {
    value = "";
  } else {
    value = props.value;
  }

  return (
    <button className="grid-element" onClick={props.onClick}>
      {value}
    </button>
  );
}

interface TileRackProps {
  tiles: Array<string>,
  onClick: (pos: number) => void,
  selectedTile: number | null,
}

// Render a rack of tiles that can be placed on the grid.
function TileRack(props: TileRackProps) {
  const tile_row = props.tiles.map(
    (letter, i) => <Tile
      letter={letter}
      onClick={() => props.onClick(i)}
      selected={i === props.selectedTile}
    />
  );
  return (
    <div className="tile-row">
      {tile_row}
    </div>
  );
}

interface TileProps {
  letter: string,
  onClick: () => void,
  selected: boolean,
}

// Render a single tile in the rack.
function Tile(props: TileProps) {
  let className: string;
  if (props.selected) {
    className = "selected-tile";
  } else {
    className = "grid-element";
  }

  return (
    <button
      className={className}
      onClick={props.onClick}
    >
      {props.letter}
    </button>
  );
}

export default App;

