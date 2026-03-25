import type {PreparedSseConnection} from './sseClient';

export interface SseStreamEvent {
  data?: string;
  event: string;
  id?: string;
  retry?: number;
}

export interface SseStreamCallbacks {
  onClosed?: () => void;
  onError?: (error: Error) => void;
  onEvent?: (event: SseStreamEvent) => void;
  onOpen?: () => void;
}

export interface SseStreamConnection {
  close: () => void;
}

const normalizeBuffer = (value: string) =>
  value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const parseSseEvent = (rawEvent: string): SseStreamEvent | null => {
  const lines = rawEvent.split('\n');
  const dataLines: string[] = [];
  let eventName = 'message';
  let id: string | undefined;
  let retry: number | undefined;

  lines.forEach(line => {
    if (!line || line.startsWith(':')) {
      return;
    }

    const separatorIndex = line.indexOf(':');
    const field =
      separatorIndex >= 0 ? line.slice(0, separatorIndex) : line.trim();
    let value =
      separatorIndex >= 0 ? line.slice(separatorIndex + 1) : '';

    if (value.startsWith(' ')) {
      value = value.slice(1);
    }

    switch (field) {
      case 'data':
        dataLines.push(value);
        break;
      case 'event':
        eventName = value || eventName;
        break;
      case 'id':
        id = value;
        break;
      case 'retry': {
        const parsedRetry = Number(value);

        if (Number.isFinite(parsedRetry) && parsedRetry >= 0) {
          retry = parsedRetry;
        }
        break;
      }
    }
  });

  if (!id && dataLines.length === 0 && retry === undefined) {
    return null;
  }

  return {
    data: dataLines.length > 0 ? dataLines.join('\n') : undefined,
    event: eventName,
    id,
    retry,
  };
};

export const createXhrSseStream = (
  options: PreparedSseConnection,
  callbacks: SseStreamCallbacks = {},
): SseStreamConnection => {
  const xhr = new XMLHttpRequest();
  let buffer = '';
  let closed = false;
  let didOpen = false;
  let processedLength = 0;

  const emitError = (error: Error) => {
    if (closed) {
      return;
    }

    callbacks.onError?.(error);
  };

  const emitClosed = () => {
    if (closed) {
      return;
    }

    closed = true;
    callbacks.onClosed?.();
  };

  const consumeResponse = () => {
    const nextChunk = xhr.responseText.slice(processedLength);

    if (!nextChunk) {
      return;
    }

    processedLength = xhr.responseText.length;
    buffer = normalizeBuffer(buffer + nextChunk);

    let boundaryIndex = buffer.indexOf('\n\n');

    while (boundaryIndex >= 0) {
      const rawEvent = buffer.slice(0, boundaryIndex);
      buffer = buffer.slice(boundaryIndex + 2);
      boundaryIndex = buffer.indexOf('\n\n');

      const parsedEvent = parseSseEvent(rawEvent);

      if (parsedEvent) {
        callbacks.onEvent?.(parsedEvent);
      }
    }
  };

  xhr.open('GET', options.url, true);
  Object.entries(options.headers).forEach(([key, value]) => {
    xhr.setRequestHeader(key, value);
  });

  xhr.onreadystatechange = () => {
    if (closed) {
      return;
    }

    if (
      !didOpen &&
      xhr.readyState >= XMLHttpRequest.HEADERS_RECEIVED &&
      xhr.status >= 200 &&
      xhr.status < 300
    ) {
      didOpen = true;
      callbacks.onOpen?.();
    }

    if (
      xhr.readyState === XMLHttpRequest.LOADING ||
      xhr.readyState === XMLHttpRequest.DONE
    ) {
      consumeResponse();
    }

    if (xhr.readyState !== XMLHttpRequest.DONE) {
      return;
    }

    if (xhr.status >= 200 && xhr.status < 300) {
      emitClosed();
      return;
    }

    emitError(new Error(`SSE request failed with status ${xhr.status}.`));
    emitClosed();
  };

  xhr.onerror = () => {
    emitError(new Error('SSE request failed.'));
    emitClosed();
  };

  xhr.onabort = () => {
    emitClosed();
  };

  xhr.send();

  return {
    close: () => {
      if (closed) {
        return;
      }

      closed = true;
      xhr.abort();
      callbacks.onClosed?.();
    },
  };
};
