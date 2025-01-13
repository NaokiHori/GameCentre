########################################################################################
`Sudoku Assistant <https://naokihori.github.io/Trash/sudoku_assistant/index.html>`_
########################################################################################

|License|_

.. |License| image:: https://img.shields.io/github/license/NaokiHori/Trash
.. _License: https://opensource.org/license/MIT

*****
Usage
*****

.. list-table::
   :header-rows: 1

   * - Trigger
     - Event
   * - E / Edit
     - Reset board and change to edit mode (to configure board)
   * - N / Normal
     - Change to normal mode (to assign numbers)
   * - M / Memo
     - Change to memo mode (to assign memos)
   * - S (keyboard only)
     - Solve the puzzle automatically (it may take a few seconds)
   * - 0, Backspace, Space
     - Remove numbers under cursor
   * - 1-9
     - Input numbers under cursor or highlight numbers
   * - Arrow keys (keyboard only)
     - Move selected cell

Bluish colors are used to highlight the selected values, while reddish colors indicate that the value is the only candidate of the cell.

******
Option
******

With a URL parameter `create`, it creates a random puzzle presumably having a unique solution.
The Sudoku maker adopts `backtracking algorithm <https://en.wikipedia.org/wiki/Sudoku_solving_algorithms#Backtracking>` and it may take a few seconds.

