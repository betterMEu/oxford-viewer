import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { AlphabetIndexPlugin } from './AlphabetIndexPlugin';

describe('AlphabetIndexPlugin', () => {
  it('renders the complete A-Z index', async () => {
    const screen = await render(
      <AlphabetIndexPlugin disabled={false} onSelectLetter={jest.fn()} />,
    );

    expect(screen.getAllByRole('button')).toHaveLength(26);
    expect(screen.getByRole('button', { name: 'A' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Z' })).toBeOnTheScreen();
  });

  it('reports the selected letter', async () => {
    const onSelectLetter = jest.fn();
    const screen = await render(
      <AlphabetIndexPlugin
        disabled={false}
        onSelectLetter={onSelectLetter}
      />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'B' }));

    expect(onSelectLetter).toHaveBeenCalledWith('B');
  });

  it('keeps X visible but disabled', async () => {
    const onSelectLetter = jest.fn();
    const screen = await render(
      <AlphabetIndexPlugin
        disabled={false}
        onSelectLetter={onSelectLetter}
      />,
    );
    const xButton = screen.getByRole('button', { name: 'X' });

    expect(xButton).toBeDisabled();
    await fireEvent.press(xButton);
    expect(onSelectLetter).not.toHaveBeenCalled();
  });

  it('disables every available letter while the word list is not ready', async () => {
    const onSelectLetter = jest.fn();
    const screen = await render(
      <AlphabetIndexPlugin
        disabled
        onSelectLetter={onSelectLetter}
      />,
    );
    const bButton = screen.getByRole('button', { name: 'B' });

    expect(bButton).toBeDisabled();
    await fireEvent.press(bButton);
    expect(onSelectLetter).not.toHaveBeenCalled();
  });
});
