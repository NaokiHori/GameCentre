<!DOCTYPE html>
<html lang="en-US">

  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width"/>
    <link rel="icon" href="img/icon.png"/>
    <title>
      Code description
    </title>
  </head>

  <body>
  </body>

  <h1>Structure of the board</h1>

  The board includes the following structure which consists of several <b>div</b> tags:

  <ul>
    <li>div (id: board, storing 9 rows)</li>
    <ul>
      <li>div (storing single row = 9 "cell"s side-by-side)</li>
      <ul>
        <li>div (class: cell, which contains two div tags)</li>
        <ul>
          <li>div (class: text, whose textContent contains a number: [ 1-9])</li>
          <ul>
            <li>div (class: memo, storing 3 rows)</li>
            <ul>
              <li>div (storing 3 "memotext"s)</li>
              <ul>
                <li>div (class: memotext, whose text content contains a number: [ 1-9])</li>
              </ul>
            </ul>
          </ul>
        </ul>
      </ul>
    </ul>
  </ul>

</html>
