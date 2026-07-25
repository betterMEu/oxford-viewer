import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { CoreWordListSelector } from './CoreWordListSelector';

describe('CoreWordListSelector', () => {
  it('shows Oxford 3000 as the selected default value', async () => {
    const screen = await render(
      <CoreWordListSelector
        value="ox3000"
        disabled={false}
        onChange={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Oxford 3000' }),
    ).toHaveProp('accessibilityState', {
      disabled: false,
      selected: true,
    });
  });

  it('selects Oxford 5000', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <CoreWordListSelector
        value="ox3000"
        disabled={false}
        onChange={onChange}
      />,
    );

    await fireEvent.press(
      screen.getByRole('button', { name: 'Oxford 5000' }),
    );

    expect(onChange).toHaveBeenCalledWith('ox5000');
  });

  it('selects Oxford 5000 excluding Oxford 3000', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <CoreWordListSelector
        value="ox3000"
        disabled={false}
        onChange={onChange}
      />,
    );

    await fireEvent.press(
      screen.getByRole('button', {
        name: 'Oxford 5000 excluding Oxford 3000',
      }),
    );

    expect(onChange).toHaveBeenCalledWith('ox5000Diff');
  });

  it('does not change while disabled', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <CoreWordListSelector
        value="ox3000"
        disabled
        onChange={onChange}
      />,
    );

    await fireEvent.press(
      screen.getByRole('button', { name: 'Oxford 5000' }),
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not report the already selected option again', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <CoreWordListSelector
        value="ox3000"
        disabled={false}
        onChange={onChange}
      />,
    );

    await fireEvent.press(
      screen.getByRole('button', { name: 'Oxford 3000' }),
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps every option at least 44 points high', async () => {
    const screen = await render(
      <CoreWordListSelector
        value="ox3000"
        disabled={false}
        onChange={jest.fn()}
      />,
    );

    for (const option of screen.getAllByRole('button')) {
      expect(option).toHaveStyle({ minHeight: 44 });
    }
  });
});
