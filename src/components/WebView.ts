import type { ComponentType, RefAttributes } from 'react';
import {
  WebView as NativeWebView,
  type WebViewProps,
} from 'react-native-webview';

/**
 * react-native-webview 14 declares `WebView<P = undefined>`, so its
 * `Component<WebViewProps & P>` resolves to `Component<never>` and strict
 * TypeScript rejects every prop. Re-type the component with the real props
 * until the upstream declaration is fixed (15.x is still affected).
 */
export type WebView = NativeWebView;

export const WebView = NativeWebView as unknown as ComponentType<
  WebViewProps & RefAttributes<NativeWebView>
>;

export type { WebViewMessageEvent, WebViewProps } from 'react-native-webview';
