import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { WORDS } from '../data/words';
import { WordList } from './WordList';

describe('WordList', () => {
  it('reports the selected word when its label is pressed', async () => {
    const onSelectWord = jest.fn();
    const screen = await render(
      <WordList
        words={WORDS}
        selectedWord={WORDS[0]}
        onSelectWord={onSelectWord}
      />,
    );

    await fireEvent.press(screen.getByText('curious'));

    expect(onSelectWord).toHaveBeenCalledWith(WORDS[2]);
  });

  it('keeps UK and US buttons clickable without selecting a word', async () => {
    const onSelectWord = jest.fn();
    const screen = await render(
      <WordList
        words={WORDS}
        selectedWord={WORDS[0]}
        onSelectWord={onSelectWord}
      />,
    );

    await fireEvent.press(
      screen.getByLabelText('UK pronunciation placeholder for example'),
    );
    await fireEvent.press(
      screen.getByLabelText('US pronunciation placeholder for example'),
    );

    expect(onSelectWord).not.toHaveBeenCalled();
  });
});
