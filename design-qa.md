# Design QA

Reference: Midnight concert control room direction selected by the user.

Checked:
- Desktop first screen matches the selected dark concert reference more closely: stage background image with truss/LED/stage lighting, red LED accents, tilted layered left photo card, large wheel, and dark editor panel.
- Mobile first screen prioritizes the wheel and keeps the editor/photo content below.
- Result dialog remains readable on the dark blurred backdrop.
- Existing wheel interactions, editable probabilities, save, shuffle, and reset remain functional.

Known simplification:
- The generated background is a stage asset; foreground UI and photo layering remain CSS/HTML for responsiveness.

Final result: passed
