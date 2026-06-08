export function createMockStream(data: unknown): ReadableStream<Uint8Array> {
  const text = JSON.stringify(data);
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}
