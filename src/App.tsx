import React from 'react';
import './App.css';
import dictionary from './dictionary.json';

class PlacedTile {
  public value: string;
  public position: Array<number>;
  public visited: boolean;

  constructor(value: string, position: Array<number>) {
    this.value = value;
    this.position = position;
    this.visited = false;
  }
}

interface AppState {
  gridSize: number,
  grid: Array<Array<PlacedTile | null>>,
  rackTiles: Array<string>,
  placedTiles: Array<PlacedTile>,
  selectedTile: number | null,
  gameWon: boolean,
  dictionary: Set<string>;
}

// Top-level App component. Maintains game state and renders sub-components.
class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    const gridSize = 10;

    const grid = new Array(gridSize).fill(new Array(gridSize).fill(null));
    const tiles = ["H", "E", "L", "L", "O", "W", "R", "L", "D"];

    this.state = {
      gridSize: 10,
      grid: grid,
      rackTiles: tiles,
      placedTiles: [],
      selectedTile: null,
      gameWon: false,
      dictionary: new Set(dictionary.map((word) => word.toUpperCase())),
    };

    this.handleTileClick = this.handleTileClick.bind(this);
    this.handleGridClick = this.handleGridClick.bind(this);
  }

  handleTileClick(pos: number) {
    console.log("Tile " + this.state.rackTiles[pos] + " clicked.");
    this.setState({...this.state, selectedTile: pos});
  }

  handleGridClick(x: number, y: number) {
    console.log("Grid clicked at (", + x + ", " + y + ").");

    if (this.state.selectedTile === null) {
      return;
    }

    const tile_index: number = this.state.selectedTile;
    const placedTile = new PlacedTile(this.state.rackTiles[tile_index],
                                      [x, y]);
    const grid = this.insertTile(x, y, placedTile);
    const placedTiles = [...this.state.placedTiles, placedTile];
    const tiles = this.updateTiles(this.state.grid[y][x], tile_index);

    let gameWon: boolean;
    if (tiles.length === 0) {
      gameWon = this.validateBoard(grid, placedTiles);
    } else {
      gameWon = false;
    }

    this.setState({
      gridSize: this.state.gridSize,
      grid: grid,
      rackTiles: tiles,
      placedTiles: placedTiles,
      selectedTile: null,
      gameWon: gameWon,
      dictionary: this.state.dictionary,
    });
  }

  insertTile(x: number,
             y: number,
             tile: PlacedTile): Array<Array<PlacedTile | null>> {
    return [...this.state.grid].map(
      (row, i) => row.map(
        (el, j) => {
          if ((i === y) && (j === x)) {
            return tile;
          } else {
            return this.state.grid[i][j];
          }
        }
      )
    );
  }

  updateTiles(replaceTile: PlacedTile | null,
              removedIndex: number): Array<string> {
    let tiles = this.state.rackTiles.filter(
      (_, i) => i !== removedIndex
    );

    if (replaceTile !== null) {
      tiles.push(replaceTile.value);
    }

    return tiles;
  }

  // A board is valid when all tiles are connected and all words formed are
  // valid.
  validateBoard(grid: Array<Array<PlacedTile | null>>,
                placedTiles: Array<PlacedTile>): boolean {
    return (
      this.allTilesConnected(grid, placedTiles) && this.allWordsValid(grid)
    );
  }

  allTilesConnected(grid: Array<Array<PlacedTile | null>>,
                    placedTiles: Array<PlacedTile>): boolean {
    this.clearMarks(placedTiles);
    const startTile = placedTiles[0];
    this.traverseRecur(startTile, grid);
    const res = this.checkMarks(placedTiles);
    if (!res) {
      console.log("Tiles aren't connected");
    }
    return res;
  }

  clearMarks(placedTiles: Array<PlacedTile>): void {
    placedTiles.forEach((tile) => tile.visited = false);
  }

  traverseRecur(currTile: PlacedTile,
                grid: Array<Array<PlacedTile | null>>): void {
    if (currTile.visited) {
      throw new Error("Tile already visited");
    }

    currTile.visited = true;

    this.neighbours(currTile, grid).forEach((tile) => {
      if (!tile.visited) {
        this.traverseRecur(tile, grid);
      }
    });
  }

  neighbours(tile: PlacedTile,
             grid: Array<Array<PlacedTile | null>>): Array<PlacedTile> {
    const x = tile.position[0];
    const y = tile.position[1];

    const height = grid.length;
    const width = grid[0].length;

    const neighbourIndices = [[x + 1, y],  // right
                              [x, y + 1],  // up
                              [x - 1, y],  // left
                              [x, y - 1]]  // down

    const neighbourTiles = neighbourIndices.filter(
      (pos) => (
        (pos[0] >= 0) &&
        (pos[0] < width) &&
        (pos[1] >= 0) &&
        (pos[1] < height)
      )
    ).map(
      (pos) => grid[pos[1]][pos[0]]
    );

    return neighbourTiles.filter((tile): tile is PlacedTile => tile !== null);
  }

  checkMarks(placedTiles: Array<PlacedTile>): boolean {
    return placedTiles.every((tile) => tile.visited);
  }

  allWordsValid(grid: Array<Array<PlacedTile | null>>): boolean {
    for (let i = 0; i < this.state.gridSize; i++) {
      if (!this.validateRow(grid, i)) {
        console.log("row " + i + " is not valid");
        return false;
      }
      if (!this.validateCol(grid, i)) {
        console.log("col " + i + " is not valid");
        return false;
      }
    }

    console.log("All words valid.");
    return true;
  }

  validateRow(grid: Array<Array<PlacedTile | null>>, row_ix: number): boolean {
    const row = grid[row_ix];
    const words = this.splitWords(row);

    const res = words.every((word) => this.state.dictionary.has(word));
    if (!res) {
      console.log("Row not valid: " + words);
    }

    return res;
  }

  validateCol(grid: Array<Array<PlacedTile | null>>, col_ix: number): boolean {
    const col = grid.map((row) => row[col_ix]);
    const words = this.splitWords(col);

    const res = words.every((word) => this.state.dictionary.has(word));
    if (!res) {
      console.log("Row not valid: " + words);
    }

    return res;
  }

  splitWords(tileSeq: Array<PlacedTile | null>): Array<string> {
    let words: Array<string> = [];
    let currWord: Array<string> | null = null;

    tileSeq.forEach((tile) => {
      if ((currWord === null) && (tile !== null)) {
        currWord = [tile.value];
      } else if (currWord !== null) {
        if (tile !== null) {
          currWord.push(tile.value);
        } else {
          words.push(currWord.join(''));
          currWord = null;
        }
      }
    });

    // Ignore any "words" that are only 1 character long.
    return words.filter((word) => word.length > 1);
  }

  render() {
    let winMsg;
    if (this.state.gameWon) {
      winMsg = (
        <>
          <p>All tiles connected</p>
        </>
      );
    } else {
      winMsg = null;
    }

    return (
      <div className="App">
        <Grid grid_values={this.state.grid} onClick={this.handleGridClick} />
        <br />
        <TileRack
          tiles={this.state.rackTiles}
          onClick={this.handleTileClick}
          selectedTile={this.state.selectedTile}
        />
        {winMsg}
      </div>
    );
  }
}

interface GridProps {
  grid_values: Array<Array<PlacedTile | null>>,
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
  row_values: Array<PlacedTile | null>,
  onClick: (x: number) => void,
}

// Single row of letters within the Grid.
function GridRow(props: GridRowProps) {
  const grid_row = props.row_values.map(
    (tile, i) => <GridElement
      tile={tile}
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
  tile: PlacedTile | null,
  onClick: () => void,
}

// Render a single element in the grid. A grid may have a letter value if a
// tile is placed, an empty space has a null value.
function GridElement(props: GridElementProps) {
  let value: string;
  if (props.tile === null) {
    value = "";
  } else {
    value = props.tile.value;
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

