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

  it('disables UK and US buttons without selecting a word', async () => {
    const onSelectWord = jest.fn();
    const screen = await render(
      <WordList
        words={WORDS}
        selectedWord={WORDS[0]}
        onSelectWord={onSelectWord}
      />,
    );

    const ukButton = screen.getByLabelText(
      'UK pronunciation unavailable for example',
    );
    const usButton = screen.getByLabelText(
      'US pronunciation unavailable for example',
    );

    expect(ukButton).toBeDisabled();
    expect(ukButton).toHaveProp('accessibilityState', { disabled: true });
    expect(usButton).toBeDisabled();
    expect(usButton).toHaveProp('accessibilityState', { disabled: true });

    await fireEvent.press(ukButton);
    await fireEvent.press(usButton);

    expect(onSelectWord).not.toHaveBeenCalled();
  });
});
