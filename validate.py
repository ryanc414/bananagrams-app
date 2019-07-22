"""POC: validate a banangrams board."""
import json
import string
import pprint


class Grid(object):
    """Represents a 2D grid."""

    def __init__(self, size):
        self._grid = [[None for _ in range(size)] for _ in range(size)]

    def __getitem__(self, key):
        x, y = key
        return self._grid[y][x]

    def __setitem__(self, key, value):
        x, y = key
        self._grid[y][x] = value

    def __repr__(self):
        return pprint.pformat(self._grid)


class Tile(object):
    """Represents a letter tile."""

    def __init__(self, value, position):
        self.value = value
        self.position = position
        self.visited = False

    def __repr__(self):
        return "|{}|".format(self.value)


class Board(object):

    DICTIONARY = "dictionary.json"
    SIZE = 10

    def __init__(self):
        self._grid = Grid(self.SIZE)
        self._tiles = []
        self._dictionary = self._load_dictionary()

    def __repr__(self):
        return repr(self._grid)

    def _load_dictionary(self):
        with open(self.DICTIONARY) as f:
            words = json.load(f)

        return set(word.upper() for word in words)

    def add_tile(self, value, position):
        """Place a tile on the board."""
        tile = Tile(value, position)
        self._grid[position] = tile
        self._tiles.append(tile)

    @classmethod
    def from_file(cls, filename):
        board = cls()

        with open(filename) as f:
            lines = f.read().split('\n')

        for col, l in enumerate(lines):
            for row, tile in  enumerate(l.split(' ')):
                if tile and tile in string.ascii_uppercase:
                    board.add_tile(tile, (row, col))

        print(board)
        return board

    def validate(self):
        """
        A board is valid if all tiles are connected and all words formed are
        valid.
        """
        return self._all_tiles_connected() and self._all_words_valid()

    def _all_tiles_connected(self):
        """
        Check if all tiles are connected, by performing a depth-first
        traversal.
        """
        if not self._tiles:
            return True

        self._clear_marks()
        start_tile = self._tiles[0]
        self._traverse_recur(start_tile)
        return self._check_marks()

    def _clear_marks(self):
        for tile in self._tiles:
            tile.visited = False

    def _check_marks(self):
        for tile in self._tiles:
            if not tile.visited:
                return False

        return True

    def _traverse_recur(self, curr_tile):
        assert not curr_tile.visited
        curr_tile.visited = True
        for tile in self._neighbours(curr_tile):
            if not tile.visited:
                self._traverse_recur(tile)

    def _neighbours(self, tile):
        x, y = tile.position
        neighbour_indices = [(x + 1, y),  # right
                             (x, y + 1),  # up
                             (x - 1, y),  # left
                             (x, y - 1)]  # down

        for xx, yy in neighbour_indices:
            try:
                tile = self._grid[xx, yy]
            except IndexError:
                pass
            else:
                if tile is not None:
                    yield tile

    def _all_words_valid(self):
        for i in range(self.SIZE):
            if not self._validate_row(i):
                return False
            if not self._validate_col(i):
                return False

        return True

    def _validate_row(self, row_ix):
        row = (self._grid[x, row_ix] for x in range(self.SIZE))
        words = self._split_words(row)
        res = all(word in self._dictionary for word in words)
        if not res:
            print("Row not valid: {}".format(words))
        return res

    def _validate_col(self, col_ix):
        col = (self._grid[col_ix, y] for y in range(self.SIZE))
        words = self._split_words(col)
        res = all(word in self._dictionary for word in words)
        if not res:
            print("Col not valid: {}".format(words))
        return res

    def _split_words(self, tile_seq):
        words = []
        curr_word = None

        for tile in tile_seq:
            if curr_word is None and tile is not None:
                curr_word = [tile.value]
            elif curr_word is not None:
                if tile is not None:
                    curr_word.append(tile.value)
                else:
                    words.append(''.join(curr_word))
                    curr_word = None

        return [word for word in words if len(word) > 1]


def main():
    valid_board = Board.from_file("valid_boards/hello_world.txt")
    assert valid_board.validate()

    invalid1 = Board.from_file("invalid_boards/hello_world.txt")
    assert not invalid1.validate()

    invalid2 = Board.from_file("invalid_boards/hello_wrold.txt")
    assert not invalid2.validate()

    print("Passed!")


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import pdb; pdb.post_mortem()

